# Menufy — security checklist (pre-production)

Running list of security items to resolve before going live. Add as we go.

## Secrets / keys
- [ ] **Rotate/revoke the legacy HS256 JWT secret.** It was pasted into a chat during
      development (test project, low urgency). The project is on the new asymmetric
      (ECC P-256) key system, so the legacy HS256 secret should be revoked anyway.
      Plan B (GoTrue-issued staff sessions) uses NONE of it, so revoking is safe.
- [ ] **`STAFF_PIN_PEPPER`** — keep as an Edge Function secret only; never in DB/repo;
      back it up (password manager). Losing it breaks PIN fingerprint lookups.
- [ ] **`STAFF_AUTH_SECRET`** (Plan B) — derives per-staff auth passwords; same handling
      as the pepper: secret-only, backed up. If it leaks, rotate + reset staff auth users.

## Auth / access
- [ ] **Login restaurant scoping.** `staff-pin-login` currently trusts a client-supplied
      `restaurantId` (test convenience). Before production, derive it from a device
      account/session server-side so a client can't target another restaurant's PINs.
- [ ] **Rate-limit bucket** is per-restaurant for now; move to per-device once the device
      account model exists (avoids one device's failures locking out the whole restaurant).

## RLS / data exposure (tracked migrations)
- [ ] **M9** — apply the RLS hardening (reconcile both legacy staff policy sets).
- [ ] **M10** — fix the anon `USING(true)` cross-tenant read on orders/order_items
      (any anon can currently read all orders across all restaurants).
- [ ] **M11** — `kitchen_orders` view so kitchen sessions can't see prices/payment columns.

## Cleanup
- [ ] Drop the deprecated `team_members.roles` / `user_id`(legacy) / `email` columns and the
      `current_restaurant_id()` legacy fallback once the PIN frontend fully ships.
