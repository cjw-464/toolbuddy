-- Add waitlisted status to borrow_request_status enum and update RLS policies

-- Add 'waitlisted' to the enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'waitlisted'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'borrow_request_status')
  ) THEN
    ALTER TYPE borrow_request_status ADD VALUE 'waitlisted';
  END IF;
END$$;

-- Drop the old DELETE policy
DROP POLICY IF EXISTS "Users can delete their cancelled/declined requests" ON borrow_requests;

-- Create updated DELETE policy that includes waitlisted status
-- Borrowers can delete their own waitlisted requests
-- Lenders can remove people from their waitlist
CREATE POLICY "Users can delete cancelled/declined/waitlisted requests"
  ON borrow_requests FOR DELETE
  USING (
    (auth.uid() = borrower_id OR auth.uid() = lender_id)
    AND status IN ('cancelled', 'declined', 'waitlisted')
  );

-- Add comment for documentation
COMMENT ON POLICY "Users can delete cancelled/declined/waitlisted requests" ON borrow_requests IS
'Allows users to delete requests that are cancelled, declined, or waitlisted. Borrowers can leave the waitlist, lenders can remove people from their tool waitlist.';
