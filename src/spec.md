# Specification

## Summary
**Goal:** Fix the 403 authorization error that prevents users from uploading images when creating listings in the vide dressing section.

**Planned changes:**
- Fix blob storage authorization to properly recognize the main canister as an authorized owner
- Ensure the blob storage cashier correctly registers the main canister for user image uploads
- Resolve the "Owner does not have an account with the cashier" error

**User-visible outcome:** Users can successfully upload images when creating listings without encountering authorization errors.
