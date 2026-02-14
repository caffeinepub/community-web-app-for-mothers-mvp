# Specification

## Summary
**Goal:** Restore the deployed app so it loads reliably, and prevent logged-out/unauthorized browsing from causing blank screens or infinite loading.

**Planned changes:**
- Rebuild and redeploy the most recent stable version so the published URL loads the main UI without uncaught startup errors.
- Frontend: handle authorization failures from public browsing queries by rendering a readable logged-out state with a clear login call-to-action (Home, Forum, Second-hand, and /admin), instead of crashing or blocking render.
- Backend: adjust read APIs (or add dedicated read-only read endpoints) so logged-out users can browse public posts/listings and view post details + replies, while keeping all write actions restricted to authenticated users.

**User-visible outcome:** The app loads normally again after redeploy; logged-out users can browse feeds and open post details without the UI breaking, and pages that require access show a clear prompt to log in rather than a blank screen.
