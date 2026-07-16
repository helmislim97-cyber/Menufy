-- ============================================================================
-- Slice 2b hardening — at most ONE open (pending) void_payment request per
-- payment. Race-proof backstop to the app-level duplicate guard: two cashiers
-- or a double-click can't both open a void request for the same payment.
--
-- ⚠️  PRE-CHECK — RUN BEFORE APPLYING. If any payment already has more than one
--     pending void_payment request, the unique index creation will FAIL. Resolve
--     those first (reject the extras) so this comes back with ZERO rows:
--
--       select payment_id, count(*)
--       from public.order_change_requests
--       where action = 'void_payment' and status = 'pending'
--       group by payment_id
--       having count(*) > 1;
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS ocr_one_open_void_per_payment
  ON public.order_change_requests (payment_id)
  WHERE action = 'void_payment' AND status = 'pending';
