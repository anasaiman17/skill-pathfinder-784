# IT Career & Job Skills Platform

## User-facing outcome

A polished Skillwise workspace where a signed-in user can complete their profile, manage skills, upload and verify a resume, search a broad IT jobs catalog, compare their skills to jobs, save roles, see career recommendations, and manage their account. User workspace data stays separate by signed-in account and survives refresh, logout, and login again.

## Build scope

1. **Account flow**
   - Expand registration and login forms with full validation, terms acceptance, remember-me behavior, password recovery entry point, duplicate-account handling, and post-registration profile setup.
   - Keep the existing immediate account activation behavior.
   - Use the signed-in account identity to scope all workspace data and prevent signed-out access.

2. **Workspace shell**
   - Replace the single assessment view with functional Dashboard, Jobs, Skills, Resume, Career, Saved Jobs, Profile, and Settings sections.
   - Preserve the current bright editorial Skillwise direction and make all navigation, mobile menu, empty states, notices, and destructive confirmations usable.

3. **Profile and skills**
   - Add editable personal, education, experience, links, and photo fields with validation and completion scoring.
   - Add searchable categorized skills with Beginner/Intermediate/Advanced/Expert proficiency, add/remove actions, and persisted state.

4. **Resume and verification**
   - Support drag/drop and file selection for PDF, DOC, and DOCX within the existing client-side file limit.
   - Extract readable text locally, show file actions, derive skills and profile signals, and compare resume information with the saved profile.
   - Present Verified, Needs Review, or Incomplete results with clear missing/conflicting fields and a reverify action.

5. **Jobs, matching, and career**
   - Create structured records for the requested IT roles with descriptions, skills, tools, certifications, education, experience, responsibilities, growth, and related roles.
   - Implement partial search across job content plus multi-filter search for category, experience, skills, technologies, certifications, and education.
   - Add job details, save/remove, match percentage, matched/missing skills, learning suggestions, and ranked career recommendations.

6. **Settings and persistence**
   - Add account email/password actions, profile management links, logout, and account deletion handling.
   - Persist the complete workspace by account key in browser storage without exposing passwords or implementation details in the UI.

## Technical details

- Keep TanStack Start routing and the existing generated integrations; do not add a second router or edit generated files.
- Use typed client-side helpers and Zod-style validation where forms accept user input.
- Keep resume parsing browser-compatible and avoid server-only dependencies.
- Combine the large catalog and matching helpers in focused modules where practical, then wire the route UI to the persisted account state.
- Validate with strict TypeScript/build checks plus Playwright coverage for registration/login rendering, protected workspace access, profile persistence, resume verification, job search/filtering, matching, saved jobs, logout, and login-again persistence.
