# Security Policy

## Our Commitment to Security

At BrowsePing, we take the security of our server infrastructure and our users' data very seriously. As the backend server that handles user authentication, personal data, and real-time communications, we are committed to maintaining the highest security standards to protect our community.

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 1.0   | :x:                |

We strongly recommend always using the latest version of the BrowsePing server to ensure you have all security patches and updates.

## Reporting a Vulnerability

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. If you discover a security vulnerability in the BrowsePing server, please help us protect our users by reporting it responsibly.

### For Critical Security Issues

**⚠️ DO NOT create a public GitHub issue for security vulnerabilities.**

If you've found a critical security vulnerability, please report it privately through one of the following methods:

#### Primary Contact
- **Email**: [support@browseping.com](mailto:support@browseping.com)
- **Subject**: "SECURITY: [Brief Description]"

#### Direct Contact with Maintainer
For critical or urgent security issues, you can contact the lead maintainer directly:
- **Email**: [akashkumar.dev00@gmail.com](mailto:akashkumar.dev00@gmail.com)
- **Subject**: "URGENT SECURITY: [Brief Description]"

### What to Include in Your Report

Please provide as much information as possible to help us understand and resolve the issue quickly:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** of the vulnerability
4. **Affected endpoints or components** (if known)
5. **Suggested fix** (if you have one)
6. **Your contact information** for follow-up questions

### Example Security Report

```
Subject: SECURITY: SQL Injection in Friend Search Endpoint

Description:
An SQL injection vulnerability exists in the /api/friends/search endpoint
that could allow attackers to extract sensitive user data.

Steps to Reproduce:
1. Send a POST request to /api/friends/search
2. Use payload: {"query": "' OR 1=1 --"}
3. Observe unauthorized data in response

Impact:
Critical - Could allow attackers to access all user data including
passwords, emails, and private information.

Affected Endpoints:
POST /api/friends/search

Contact:
researcher@example.com
```

## Response Timeline

We are committed to responding promptly to security reports:

- **Initial Response**: Within 24-48 hours of receiving your report
- **Status Update**: Within 5 business days with our assessment and planned action
- **Resolution**: We aim to deploy patches for critical vulnerabilities within 7-14 days

## Our Security Process

1. **Acknowledgment**: We'll acknowledge receipt of your vulnerability report
2. **Investigation**: Our team will investigate and validate the issue
3. **Mitigation**: We'll develop and test a fix
4. **Deployment**: We'll deploy the security patch to production
5. **Disclosure**: After the patch is deployed, we may publicly disclose the vulnerability (with credit to you, if desired)

## Security Best Practices for Contributors

If you're contributing to the BrowsePing server, please follow these security guidelines:

### Code Security

- **Never commit secrets**: No API keys, passwords, database credentials, or tokens in the code
- **Use environment variables**: Store all sensitive configuration in `.env` files
- **Validate all inputs**: Sanitize and validate user inputs to prevent injection attacks
- **Use parameterized queries**: Always use Prisma's parameterized queries, never raw SQL
- **Implement rate limiting**: Protect endpoints from abuse
- **Follow secure coding practices**: Avoid eval(), validate file uploads, sanitize outputs
- **Handle errors securely**: Don't expose sensitive information in error messages

### Authentication & Authorization

- **Secure password storage**: Use bcrypt with appropriate salt rounds
- **JWT best practices**: Implement proper token expiration and refresh mechanisms
- **Validate tokens**: Always verify JWT signatures and expiration
- **Implement RBAC**: Check user permissions for all protected resources
- **Session management**: Properly handle session creation and destruction
- **2FA/MFA**: Consider implementing multi-factor authentication

### Data Privacy

- **Minimize data collection**: Only store data that's necessary
- **Encrypt sensitive data**: Use encryption for sensitive information at rest and in transit
- **Respect privacy settings**: Honor user privacy preferences
- **GDPR compliance**: Follow data protection regulations
- **Data retention**: Implement appropriate data retention policies
- **Secure deletion**: Properly delete user data when requested

### API Security

- **HTTPS only**: All API communications must use HTTPS in production
- **CORS configuration**: Properly configure CORS for allowed origins
- **Rate limiting**: Implement rate limiting on all public endpoints
- **Input validation**: Validate all request bodies and parameters
- **Authentication required**: Protect all sensitive endpoints with authentication
- **API versioning**: Version APIs to handle breaking changes gracefully

### Database Security

- **Principle of least privilege**: Database users should have minimal required permissions
- **Prepared statements**: Always use Prisma's type-safe queries
- **Backup strategy**: Implement regular automated backups
- **Connection pooling**: Use connection pooling to prevent exhaustion
- **Audit logging**: Log database access for security auditing
- **Encryption at rest**: Enable database encryption in production

### WebSocket Security

- **Authentication**: Require authentication for WebSocket connections
- **Message validation**: Validate all incoming WebSocket messages
- **Rate limiting**: Implement rate limiting for WebSocket messages
- **Connection limits**: Limit concurrent connections per user
- **Graceful disconnection**: Handle disconnections properly

## Vulnerability Disclosure Policy

We follow responsible disclosure practices:

- We will work with you to understand and address the vulnerability
- We ask that you give us reasonable time to fix the issue before public disclosure
- We will credit you for the discovery (unless you prefer to remain anonymous)
- We will publicly acknowledge your contribution once the fix is deployed

## Security Features

Our server implements several security measures:

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds for password storage
- **Rate Limiting**: Protection against brute force and DoS attacks
- **CORS Protection**: Configured allowed origins
- **Input Validation**: Middleware for request validation
- **SQL Injection Prevention**: Using Prisma ORM with parameterized queries
- **XSS Protection**: Output sanitization and Content Security Policy
- **Session Management**: Secure session handling with Redis
- **Regular Security Audits**: Periodic code reviews and dependency scanning

## Known Security Considerations

As a backend server handling sensitive data:

- **User authentication**: JWT tokens with expiration
- **Password storage**: Bcrypt hashed passwords
- **Database access**: MySQL with connection pooling
- **Redis sessions**: Session data stored in Redis
- **WebSocket connections**: Real-time bidirectional communication
- **Email notifications**: SMTP for OTP and password reset
- **Third-party dependencies**: Regular dependency updates and audits

## Bug Bounty Program

While we don't currently have a formal bug bounty program, we deeply appreciate security researchers' efforts. We recognize contributors who help us improve security:

- Public acknowledgment (if desired)
- Recognition in our security hall of fame
- Potential rewards for critical vulnerability discoveries

## Security Updates

- **Subscribe to updates**: Watch our [GitHub repository](https://github.com/browseping/server) for security advisories
- **Follow us**: Stay informed through our [Discord community](https://discord.gg/GdhXuEAZ)
- **Check regularly**: Monitor our changelog for security patches

## Contact Information

For general security questions or concerns:

- **Email**: [support@browseping.com](mailto:support@browseping.com)
- **Discord**: [Join our community](https://discord.gg/GdhXuEAZ)
- **Website**: [browseping.com](https://browseping.com)
- **Twitter/X**: [@BrowsePing](https://x.com/browseping)

For critical security vulnerabilities, always use email and mark as "SECURITY" in the subject line.

---

**Thank you for helping keep BrowsePing and our community safe!**

Last Updated: January 4, 2026
