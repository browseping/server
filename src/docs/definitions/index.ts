/**
 * Index file for all API definitions
 * Aggregates all endpoint and schema definitions for Swagger documentation
 */

import { userDefinitions } from './user.definitions';
import { friendDefinitions } from './friend.definitions';
import { profileDefinitions } from './profile.definitions';
import { analyticsDefinitions } from './analytics.definitions';
import { leaderboardDefinitions } from './leaderboard.definitions';
import { conversationDefinitions } from './conversation.definitions';
import { notificationDefinitions } from './notification.definitions';
import { otpDefinitions } from './otp.definitions';
import { forgotPasswordDefinitions } from './forgotPassword.definitions';

// Aggregate all definitions
const allDefinitions = [
  userDefinitions,
  friendDefinitions,
  profileDefinitions,
  analyticsDefinitions,
  leaderboardDefinitions,
  conversationDefinitions,
  notificationDefinitions,
  otpDefinitions,
  forgotPasswordDefinitions,
];

/**
 * Merge all schemas from definitions into a single object
 */
export function getAllSchemas(): Record<string, object> {
  const schemas: Record<string, object> = {};
  
  for (const def of allDefinitions) {
    if (def.schemas) {
      Object.assign(schemas, def.schemas);
    }
  }
  
  return schemas;
}

/**
 * Merge all endpoint paths from definitions into a single object
 */
export function getAllPaths(): Record<string, object> {
  const paths: Record<string, object> = {};
  
  for (const def of allDefinitions) {
    if (def.endpoints) {
      Object.assign(paths, def.endpoints);
    }
  }
  
  return paths;
}

export {
  userDefinitions,
  friendDefinitions,
  profileDefinitions,
  analyticsDefinitions,
  leaderboardDefinitions,
  conversationDefinitions,
  notificationDefinitions,
  otpDefinitions,
  forgotPasswordDefinitions,
};
