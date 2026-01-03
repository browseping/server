# BrowsePing Server

This repository contains the backend server implementation for **BrowsePing**, an open-source real-time social presence platform that transforms web browsing into a shared social experience. The server handles user authentication, real-time WebSocket connections, friend management, messaging, analytics tracking, and leaderboard functionality.

## Prerequisites

## Installation for Development

### 1. Clone the Repository

```bash
git clone https://github.com/browseping/server.git
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup MySQL and Redis

#### Using Docker (Recommended)

**Start MySQL:**
```bash
docker run --name browseping-mysql -e MYSQL_ROOT_PASSWORD=yourpassword -e MYSQL_DATABASE=browseping -p 3306:3306 -d mysql:8
```

**Start Redis:**
```bash
docker run --name browseping-redis -p 6379:6379 -d redis
```

#### Using Local Installation

Make sure MySQL and Redis services are running on your system:

```bash
# Check MySQL status
mysql --version
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Check Redis status
redis-cli ping  # Should return PONG
sudo systemctl status redis  # Linux
brew services list | grep redis  # macOS
```

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration.

### 5. Setup Database

Generate Prisma Client:
```bash
npm run prisma:generate
```

Run database migrations:
```bash
npm run prisma:migrate
```

### 6. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## Available Scripts

- **`npm run dev`** - Start development server with hot reload (using nodemon)
- **`npm run build`** - Compile TypeScript to JavaScript
- **`npm start`** - Run production server (requires build first)
- **`npm run prisma:generate`** - Generate Prisma Client
- **`npm run prisma:migrate`** - Run database migrations

## Development Workflow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Make changes** to the code in the `src/` directory

3. **Test your changes** using API clients like Postman or Thunder Client

4. **Create database migrations** when changing the schema:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

5. **Follow our [Contributing Guidelines](CONTRIBUTING.md)** when submitting changes

## Contributing

We welcome contributions to the BrowsePing server! Whether it's fixing bugs, improving documentation, or adding new features, your help is appreciated.

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

Join our community on [Discord](https://discord.gg/GdhXuEAZ) to discuss ideas and collaborate with other contributors.

## Community & Links

### Connect With Us

- **Website**: [browseping.com](https://browseping.com)
- **Discord**: [Join our community](https://discord.gg/GdhXuEAZ)
- **Twitter/X**: [@BrowsePing](https://x.com/browseping)
- **LinkedIn**: [BrowsePing Company](https://www.linkedin.com/company/browseping)
- **GitHub**: [github.com/browseping](https://github.com/browseping)

### Related Repositories

- **Browser Extension**: [browseping/browser-extension](https://github.com/browseping/browser-extension)
- **Website**: [browseping/web](https://github.com/browseping/web)

## Support

- **Contact Us**: [browseping.com/contact](https://www.browseping.com/contact)
- **Email**: [support@browseping.com](mailto:support@browseping.com)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
