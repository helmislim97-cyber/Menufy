-- ============================================================================
-- Slice 3 hardening — at most ONE open (pending) cancel request per order.
-- Race-proof backstop: an order moves to 'cancellation_pending' on request and
-- drops off the active screens, so re-clicking is naturally prevented — but two
-- staff clicking in the same second could both insert. This index blocks that.
--
-- ⚠️  PRE-CHECK — RUN BEFORE APPLYING. If any order already has more than one
--     pending cancel request, resolve the extras first so this returns ZERO rows:
--
--       select order_id, count(*)
--       from public.order_change_requests
--       where action = 'cancel' and status = 'pending'
--       group by order_id
--       having count(*) > 1;
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS ocr_one_open_cancel_per_order
  ON public.order_change_requests (order_id)
  WHERE action = 'cancel' AND status = 'pending';
