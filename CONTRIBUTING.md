# Contributing to BrowsePing Server

Thank you for your interest in contributing to the BrowsePing server! This document provides guidelines for contributing to our Node.js/TypeScript backend. Please read through these guidelines carefully before submitting your contribution.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Database Changes](#database-changes)
- [Testing](#testing)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors. Be professional, considerate, and constructive in all interactions.

## How to Contribute

1. **Fork the repository** to your own GitHub account
2. **Clone your fork** locally
3. **Create a new branch** following our branch naming conventions
4. **Make your changes** with clear, descriptive commits
5. **Test thoroughly** to ensure nothing breaks
6. **Push to your fork** and submit a pull request
7. **Respond to feedback** during the code review process

## Branch Naming Conventions

**⚠️ IMPORTANT**: Always create a new branch for your contribution. Never commit directly to `main`.

Use the following prefixes for your branch names:

- `feature/` - For new features or enhancements
  - Example: `feature/add-group-messaging`
  - Example: `feature/improve-leaderboard-performance`

- `fix/` - For bug fixes
  - Example: `fix/auth-token-expiration`
  - Example: `fix/websocket-connection-leak`

- `hotfix/` - For urgent production fixes
  - Example: `hotfix/critical-security-patch`

- `refactor/` - For code refactoring without changing functionality
  - Example: `refactor/simplify-friend-controller`

- `docs/` - For documentation changes
  - Example: `docs/update-api-documentation`
  - Example: `docs/add-setup-guide`

- `test/` - For adding or updating tests
  - Example: `test/add-integration-tests-for-auth`

- `chore/` - For maintenance tasks, dependency updates, etc.
  - Example: `chore/update-dependencies`
  - Example: `chore/configure-linter`

- `perf/` - For performance improvements
  - Example: `perf/optimize-database-queries`

**Format**: `<type>/<short-description-in-kebab-case>`

## Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Your commit messages must follow this format:

```
<type>(<scope>): <subject>

<body> (optional)

<footer> (optional)
```

### Commit Types

- **feat**: A new feature
  - Example: `feat(messaging): add group chat functionality`
  
- **fix**: A bug fix
  - Example: `fix(auth): resolve JWT token expiration issue`
  
- **docs**: Documentation changes only
  - Example: `docs(readme): update installation instructions`
  
- **style**: Code style changes (formatting, semicolons, etc.) - no logic change
  - Example: `style(controllers): format code with prettier`
  
- **refactor**: Code changes that neither fix bugs nor add features
  - Example: `refactor(services): simplify email service logic`
  
- **perf**: Performance improvements
  - Example: `perf(analytics): optimize hourly presence queries`
  
- **test**: Adding or updating tests
  - Example: `test(friends): add unit tests for friend requests`
  
- **chore**: Maintenance tasks, dependency updates, build configuration
  - Example: `chore(deps): update prisma to version 6.10.0`
  
- **ci**: Changes to CI/CD configuration
  - Example: `ci(github): add automated testing workflow`
  
- **build**: Changes to build system or external dependencies
  - Example: `build(npm): update build scripts`

### Commit Message Examples

✅ **Good commits:**
```
feat(leaderboard): add monthly leaderboard calculations
fix(websocket): prevent memory leak in connection handler
docs(api): add endpoint documentation for messaging
refactor(middleware): extract validation logic to separate file
test(auth): add integration tests for login flow
perf(database): add indexes for frequently queried fields
chore(deps): bump express from 4.18.0 to 4.18.2
```

❌ **Bad commits:**
```
updated stuff
fix bug
WIP
changes
fixed it
```

## Pull Request Process

### Before Submitting a PR

1. **Test your changes** - Ensure all functionality works as expected
2. **Run the build** - Make sure `npm run build` completes without errors
3. **Check for breaking changes** - Your PR should only contain intended changes
4. **Update documentation** - If you've added endpoints or features, update the README
5. **Database migrations** - If you modified the schema, include proper migrations
6. **Self-review your code** - Check for console.logs, commented code, or debug statements
7. **Test with real data** - Verify your changes work with actual database records

### ⚠️ CRITICAL: Review Your Changes Carefully

**Before committing and creating a PR, you MUST:**

- Review every single file you're committing
- Ensure ONLY your intended changes are included
- Remove any accidental changes, debug code, or unrelated modifications
- Verify no breaking changes are introduced to existing functionality
- Test that existing endpoints and features still work correctly
- Ensure database migrations are reversible when possible
- Check that environment variables are documented

**⚠️ WARNING**: Pull requests that include unrelated changes, breaking changes, or modifications beyond the stated purpose will be **immediately closed with an "invalid" tag** and will not be reviewed.

We take code quality seriously. Please respect our codebase and review guidelines.

### PR Title Format

Your PR title should follow the same convention as commit messages:

```
<type>(<scope>): <description>
```

Examples:
- `feat(friends): add friend suggestion algorithm`
- `fix(auth): resolve token refresh issue`
- `docs(readme): improve setup instructions`

### PR Description Template

When creating a pull request, include:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement
- [ ] Database schema change
- [ ] Test addition/update

## Related Issue
Closes #(issue number)

## Changes Made
- List specific changes made
- Be clear and concise
- Include any important details

## Testing Done
- Describe how you tested your changes
- Include test cases if applicable
- Mention API endpoints tested

## Database Changes
- [ ] No database changes
- [ ] New migrations included
- [ ] Migrations are reversible
- [ ] Seed data updated (if applicable)

## Checklist
- [ ] I have read and followed all guidelines in CONTRIBUTING.md
- [ ] My commits follow Conventional Commits format
- [ ] I have tested my changes thoroughly
- [ ] **CRITICAL**: Only my intended changes are included
- [ ] I have updated relevant documentation
- [ ] Database migrations are included (if schema changed)
```

## Code Review Guidelines

### For Contributors

- Be patient during the review process
- Respond to feedback constructively
- Make requested changes promptly
- Ask questions if feedback is unclear
- Be open to suggestions and improvements

### Review Timeline

- Initial review: Within 2-3 business days
- Follow-up reviews: Within 1-2 business days

## Development Setup

Please refer to the [README.md](README.md) for detailed development setup instructions.

Quick start:
```bash
git clone https://github.com/browseping/server.git
cd server
npm install
cp .env.example .env
# Setup MySQL and Redis
docker run --name browseping-mysql -e MYSQL_ROOT_PASSWORD=yourpassword -e MYSQL_DATABASE=browseping -p 3306:3306 -d mysql:8
docker run --name browseping-redis -p 6379:6379 -d redis
# Configure .env file
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type unless absolutely necessary
- Use meaningful variable and function names
- Leverage TypeScript features (enums, generics, etc.)

### Node.js/Express

- Use async/await for asynchronous operations
- Implement proper error handling with try-catch blocks
- Use middleware for cross-cutting concerns
- Keep controllers thin, move business logic to services
- Follow RESTful API conventions

### Database (Prisma)

- Always use Prisma Client for database operations
- Create migrations for schema changes
- Use transactions for related operations
- Implement proper indexes for performance
- Use soft deletes when appropriate

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add meaningful comments for complex logic
- Remove console.logs before committing
- Keep functions small and focused
- Follow DRY (Don't Repeat Yourself) principles

### File Naming

- Use camelCase for file names: `userController.ts`
- Use PascalCase for class names: `EmailService`
- Group related files in directories
- Keep file names descriptive

### Error Handling

- Use try-catch blocks for async operations
- Return appropriate HTTP status codes
- Provide meaningful error messages
- Log errors for debugging
- Don't expose sensitive information in errors

### API Design

- Follow RESTful conventions
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Implement pagination for list endpoints
- Use query parameters for filtering and sorting
- Version APIs when making breaking changes

## Database Changes

### Creating Migrations

When you modify the Prisma schema:

1. Make changes to `prisma/schema.prisma`
2. Create a migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Test the migration thoroughly
4. Ensure migrations are reversible when possible
5. Document any manual steps required

### Schema Best Practices

- Use appropriate field types
- Add indexes for frequently queried fields
- Use relations properly
- Add comments for complex fields
- Consider data migration strategies

## Testing

- Test all new endpoints using API clients (Postman, Thunder Client)
- Test edge cases and error scenarios
- Verify authentication and authorization
- Test with realistic data volumes
- Check for race conditions in concurrent operations
- Test WebSocket connections if applicable

## Questions or Issues?

If you have questions or run into issues:

- **Discord Community**: Join our [Discord server](https://discord.gg/GdhXuEAZ) for real-time discussions and support
- **GitHub Issues**: Check existing issues or create a new one with detailed information
- **Email Support**: Contact us at [support@browseping.com](mailto:support@browseping.com)
- **Follow Us**: Stay updated on [Twitter/X](https://x.com/browseping) and [LinkedIn](https://www.linkedin.com/company/browseping)

## Recognition

All contributors will be recognized in our README and release notes. Thank you for helping make BrowsePing better!

---

**Remember**: Quality over quantity. A well-tested, properly documented small PR is more valuable than a large, rushed contribution.

Thank you for contributing to BrowsePing!
