# Secure administrator setup

The admin dashboard is available only to accounts whose database role is \`admin\`. Public registration always creates a normal \`user\` account; a visitor cannot grant themselves administrator access.

## Create or reset the first administrator

1. In the Render dashboard, open the **Milk Record backend** service.
2. Add these environment variables (use your own private values):
   - \`ADMIN_NAME\`: administrator display name.
   - \`ADMIN_MOBILE\`: administrator's 10-digit mobile number.
   - \`ADMIN_MPIN\`: a private 5-digit MPIN.
   - Confirm \`MONGODB_URI\` is already configured for the same database used by the backend.
3. Open the backend service Shell and run:

   \`\`\`bash
   cd server
   npm run create-admin
   \`\`\`

   If the Shell starts in the server directory already, run only \`npm run create-admin\`.

4. Remove \`ADMIN_MPIN\` from the service environment after setup. Keep the admin mobile number and MPIN private.
5. Open the application login page, choose **Owner Login**, and sign in with the administrator mobile number and MPIN.

Running the setup command again for the same admin mobile resets its MPIN. It refuses to promote an existing non-admin account and does not print the MPIN or its hash.

## Admin dashboard capabilities

- Live platform totals for owner accounts, customers, milk entries, recorded milk value and milk quantity.
- Dairy owner list with profile edit, UPI update, optional MPIN reset, account activation/deactivation and guarded deletion.
- Platform-wide customer and milk-entry tables.
- Per-owner statistics and recent milk entries.
- System and transaction statistics endpoints are protected by authenticated admin-role middleware.

All dashboard information is fetched from the MongoDB-backed admin APIs. No sample rows or placeholder business metrics are generated.

## Security notes

- Never commit admin credentials or put them in frontend environment variables.
- Admin APIs require a signed JWT and the server checks the current database role on every request.
- The MPIN is stored as a bcrypt hash. The dashboard never reads or displays an existing MPIN.
- A deleted account with associated customers or milk entries is intentionally not hard-deleted by the admin endpoint.
