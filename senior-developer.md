 Based on our chat history, here are **8 critical lessons** I should remember:

## 1. **Always Build Before Committing**
- Run `pnpm run build` (or equivalent) locally FIRST
- Check for compilation errors, type errors, and linter issues
- Only commit after successful build
- This is non-negotiable for production code

## 2. **Run Linters Proactively**
- Use `read_lints` tool on files I've created/modified BEFORE committing
- Don't wait for CI/CD to catch ESLint errors
- Check for common issues like unescaped quotes, missing keys, etc.

## 3. **Investigate Thoroughly Before Implementing**
- When given multiple error messages, analyze ALL of them together
- Look for root causes, not just symptoms
- The user showed me 3 separate issues (modal, 404s, API 500) - I should have investigated if they were related or had common patterns

## 4. **Test the Actual User Flow**
- Don't just create files and assume they work
- The modal transparency issue - I should have considered UX/visibility
- The API error - I should have understood the session vs service client distinction upfront

## 5. **Check for Similar Issues Across the Codebase**
- When fixing unescaped quotes in one place, scan for them everywhere
- Use `grep` to find patterns that might break
- Don't fix issues one at a time when they're systemic

## 6. **Understand Authentication/Session Context**
- Service role clients bypass RLS but don't have session/cookies
- Server clients have session access for auth checks
- This is a fundamental pattern I should have known when first looking at the API

## 7. **Read Error Messages Completely**
- The 500 error likely had details in the server logs
- The 404 errors were clear - missing routes
- I should ask for or check full error details/stack traces before guessing

## 8. **Verify Files Exist and Routes Are Wired Up**
- When creating new pages, check:
  - File is in correct location (`app/privacy/page.tsx` not `pages/privacy.tsx`)
  - No conflicts with existing routing
  - Links in other components point to correct paths
  - The Next.js App Router structure is followed

## Bonus: **Respect the User's Time**
- One failed deployment because I didn't build locally = wasted CI/CD time
- Multiple commits to fix the same issue = cluttered git history
- Get it right the first time by being thorough upfront

## 9. **Test User Flows Separately**
- Test VISITOR mode (localStorage only, no auth)
- Test PUBLIC user (authenticated, database storage)
- Test PRIVATE member (NFT + PMA)
- Don't assume auth changes work for all user types
- Manual testing of critical flows before pushing is essential

## 10. **Add Comprehensive Logging for API Routes**
- When user reports "500 error", generic errors are useless
- Add detailed console.log at EVERY step of API flow
- Log: request params, client creation, database queries, auth checks
- Include error.message, error.code, error.details, error.stack
- Add debug hints in error responses (can strip in production)
- Use clear markers like "=== STEP NAME ===" for easy log searching
- This saves hours of debugging blind

