import { WebSocket } from "ws";
import { verifyToken } from "../utils/jwt";
import prisma from "../utils/prisma";
import { setUserOnline, setUserOffline, publishPresence, publishAllTabsUpdtate, setLatestTabData, publishActiveTabUpdate, subscribeToFriendsTabUpdates, setActiveTabData } from "../utils/redis";
export const wsClients: Record<string, WebSocket> = {};

export function handleConnection(ws: WebSocket, req: any) {
    let user: any = null;
    let isAuthenticated = false;
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let lastPing = Date.now();

    function refreshPresence() {
        if (user) {
            setUserOnline(user.id, HEARTBEAT_TTL);
            console.log(`[WS] ${user.id}: Presence refreshed (TTL ${HEARTBEAT_TTL}s)`);
            publishPresence(user.id, 'online');
        }
    }

    const HEARTBEAT_TTL = 15; // seconds
    const HEARTBEAT_EXPECTED = 10 * 1000; // ms

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message.toString());

            // first message must be { type: 'auth', token: '...' }
            if (!isAuthenticated && data.type === "auth" && data.token) {
                try {
                    user = verifyToken(data.token);
                    isAuthenticated = true;
                    wsClients[user.id] = ws;
                    ws.send(JSON.stringify({ type: "auth", success: true, user }));
                    console.log(`[WS] ${user.id}: Authenticated and connected`);

                    setUserOnline(user.id);
                    publishPresence(user.id, 'online');
                    refreshPresence();
                    subscribeToFriendsTabUpdates(user.id);


                    // Start heartbeat interval
                    heartbeatInterval = setInterval(() => {
                        if (Date.now() - lastPing > HEARTBEAT_EXPECTED + 5000) {
                            console.log(`[WS] ${user.id}: Missed heartbeat, closing connection`);
                            ws.send(JSON.stringify({ type: "error", error: "Missed heartbeat, closing connection." }));
                            ws.close();
                        }
                    }, HEARTBEAT_EXPECTED);
                } catch (err) {
                    ws.send(JSON.stringify({ type: "auth", success: false, error: "Invalid token" }));
                    ws.close();
                }
                return;
            }

            if (!isAuthenticated) {
                ws.send(JSON.stringify({ type: "error", error: "Not authenticated" }));
                ws.close();
                return;
            }

            // Handle ping message for heartbeat
            if (data.type === "ping") {
                lastPing = Date.now();
                ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
                refreshPresence();
                console.log(`[WS] ${user.id}: Received ping at ${new Date().toISOString()}`);
                return;

            }

            // Handle Tab Updates
            if (data.type === "all_tabs_update" && isAuthenticated) {
                const tabPayload = {
                    userId: user.id,
                    tabs: data.tabs,
                    updatedAt: new Date().toISOString()
                };
                publishAllTabsUpdtate(user.id, tabPayload);
                setLatestTabData(user.id, data.tabs);
                console.log(`[WS] ${user.id}: Published all tabs update`, data.tabs);
                return;
            }

            if (data.type === "active_tab_update" && isAuthenticated) {
                const tabPayload = {
                    userId: user.id,
                    tab: data.tab,
                    updatedAt: new Date().toISOString()
                };
                publishActiveTabUpdate(user.id, tabPayload);
                setActiveTabData(user.id, data.tab);
                console.log(`[WS] ${user.id}: Published active tab update`, data.tab);
                return;
            }
        } catch (err) {
            console.error(`[WS] Error processing message: ${err}`);
            ws.send(JSON.stringify({ type: "error", error: "Invalid message format" }));
            ws.close();
        }
    });

    ws.on('close', async () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if(isAuthenticated && user) {
            delete wsClients[user.id];
            await setUserOffline(user.id);
            await publishPresence(user.id, 'offline');

            await prisma.user.update({
                where: { id: user.id },
                data: { lastOnlineAt: new Date() }
            });
            console.log(`[WS] ${user.id}: Disconnected and set offline`);
        } else {
            console.log(`[WS] Unauthenticated user disconnected`);
        }
    })
}