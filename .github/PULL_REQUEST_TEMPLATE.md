# Pull Request

## Description

Please include a summary of the changes and why these changes were made. Link any related issues.

Fixes #(issue number)

## Type of Change

Please delete options that are not relevant.

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Database migration / schema change
- [ ] Dependency update
- [ ] Performance improvement
- [ ] Test addition / improvement

## Checklist

### Code Quality
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings

### Testing
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested the API endpoints manually (if applicable)
- [ ] I have tested with different data scenarios

### Database Changes (if applicable)
- [ ] I have created a Prisma migration for any schema changes
- [ ] Migration has been tested locally
- [ ] Migration doesn't break existing data
- [ ] I have documented the migration purpose

### API Changes (if applicable)
- [ ] I have documented new/modified endpoints
- [ ] I have updated request/response examples
- [ ] I have considered backward compatibility
- [ ] Error handling is implemented

### Security
- [ ] I have checked for security vulnerabilities in my code
- [ ] I have not hardcoded sensitive information
- [ ] Input validation is properly implemented
- [ ] I have not introduced any new dependencies without review

### Performance
- [ ] I have considered the performance impact of my changes
- [ ] I have optimized database queries (if applicable)
- [ ] I have not introduced memory leaks
- [ ] Performance-critical code has been profiled

## Testing Evidence

Please describe the tests you ran and how to reproduce your test results:

```
Example: 
1. Created unit tests in tests/api/friends.test.ts
2. All tests pass: npm run test
3. Tested manually with Postman collection:
   - GET /api/v1/friends returns 200
   - POST /api/v1/friends/add returns 201
```

## Database Migration Details (if applicable)

```
Migration name: add_user_preferences_table
Status: Tested locally
Rollback tested: Yes / No
Data migration required: Yes / No
```

## API Changes (if applicable)

### New Endpoints
- `POST /api/v1/friends/block` - Block a user

### Modified Endpoints
- `GET /api/v1/friends` - Added `status` filter parameter

### Deprecated Endpoints
- None

## Screenshots / Evidence (if applicable)

If you've made UI/UX related changes or added new features, please include screenshots or recordings.

## Additional Notes

Any additional information that reviewers should know?

---

**Checklist for Reviewers:**
- [ ] Code follows project style guidelines
- [ ] Changes are well-documented
- [ ] Tests are adequate
- [ ] No breaking changes (or breaking change is intentional)
- [ ] Database migrations are safe
- [ ] Performance impact is acceptable
- [ ] Security concerns are addressed
