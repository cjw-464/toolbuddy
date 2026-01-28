-- Borrow Requests / Loans Table
-- Tracks the lifecycle of tool borrowing: request → approval → active loan → return

-- Create enum for borrow request status
CREATE TYPE borrow_request_status AS ENUM (
  'pending',   -- Request submitted, awaiting owner response
  'approved',  -- Owner approved, ready for pickup (becomes 'active' when picked up)
  'declined',  -- Owner declined the request
  'active',    -- Tool is currently borrowed
  'returned',  -- Tool has been returned
  'cancelled'  -- Borrower cancelled the request
);

-- Create the borrow_requests table
CREATE TABLE borrow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  borrower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status borrow_request_status NOT NULL DEFAULT 'pending',
  message TEXT, -- Optional message from borrower when requesting

  -- Timestamps for tracking lifecycle
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ, -- When owner approved/declined
  picked_up_at TIMESTAMPTZ, -- When borrower picked up the tool
  returned_at TIMESTAMPTZ,  -- When tool was returned

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT borrower_not_lender CHECK (borrower_id != lender_id),
  CONSTRAINT valid_response_time CHECK (responded_at IS NULL OR responded_at >= requested_at),
  CONSTRAINT valid_pickup_time CHECK (picked_up_at IS NULL OR picked_up_at >= responded_at),
  CONSTRAINT valid_return_time CHECK (returned_at IS NULL OR returned_at >= picked_up_at)
);

-- Create indexes for common queries
CREATE INDEX idx_borrow_requests_tool_id ON borrow_requests(tool_id);
CREATE INDEX idx_borrow_requests_borrower_id ON borrow_requests(borrower_id);
CREATE INDEX idx_borrow_requests_lender_id ON borrow_requests(lender_id);
CREATE INDEX idx_borrow_requests_status ON borrow_requests(status);
CREATE INDEX idx_borrow_requests_requested_at ON borrow_requests(requested_at DESC);

-- Composite index for checking active loans on a tool
CREATE INDEX idx_borrow_requests_tool_active ON borrow_requests(tool_id)
  WHERE status IN ('pending', 'approved', 'active');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_borrow_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER borrow_requests_updated_at
  BEFORE UPDATE ON borrow_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_borrow_requests_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE borrow_requests ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see requests where they are borrower OR lender
CREATE POLICY "Users can view their own borrow requests"
  ON borrow_requests FOR SELECT
  USING (
    auth.uid() = borrower_id OR auth.uid() = lender_id
  );

-- INSERT: Users can only create requests where they are the borrower
-- Additional checks: must be friends, tool must be lendable, no active request exists
CREATE POLICY "Users can create borrow requests as borrower"
  ON borrow_requests FOR INSERT
  WITH CHECK (
    auth.uid() = borrower_id
    AND auth.uid() != lender_id
    -- Verify the tool belongs to the lender and is lendable
    AND EXISTS (
      SELECT 1 FROM tools
      WHERE tools.id = tool_id
      AND tools.owner_id = lender_id
      AND tools.is_lendable = true
    )
    -- Verify users are friends (accepted friendship)
    AND EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND addressee_id = lender_id)
        OR (addressee_id = auth.uid() AND requester_id = lender_id)
      )
    )
    -- No existing pending/approved/active request for this tool by this borrower
    AND NOT EXISTS (
      SELECT 1 FROM borrow_requests br
      WHERE br.tool_id = borrow_requests.tool_id
      AND br.borrower_id = auth.uid()
      AND br.status IN ('pending', 'approved', 'active')
    )
  );

-- UPDATE: Different rules based on role
CREATE POLICY "Lenders can approve/decline pending requests"
  ON borrow_requests FOR UPDATE
  USING (auth.uid() = lender_id)
  WITH CHECK (
    auth.uid() = lender_id
    -- Can only update status and responded_at for pending requests
    AND (
      -- Approving or declining a pending request
      (status IN ('approved', 'declined') AND responded_at IS NOT NULL)
      -- Marking as returned (lender confirms return)
      OR (status = 'returned' AND returned_at IS NOT NULL)
    )
  );

CREATE POLICY "Borrowers can cancel pending requests"
  ON borrow_requests FOR UPDATE
  USING (auth.uid() = borrower_id)
  WITH CHECK (
    auth.uid() = borrower_id
    -- Borrower can cancel pending request
    AND status = 'cancelled'
  );

CREATE POLICY "Borrowers can mark approved requests as active (picked up)"
  ON borrow_requests FOR UPDATE
  USING (auth.uid() = borrower_id)
  WITH CHECK (
    auth.uid() = borrower_id
    -- Marking as picked up
    AND status = 'active'
    AND picked_up_at IS NOT NULL
  );

-- DELETE: Generally, we don't allow deleting records (keep history)
-- But allow deleting cancelled/declined requests for cleanup
CREATE POLICY "Users can delete their cancelled/declined requests"
  ON borrow_requests FOR DELETE
  USING (
    (auth.uid() = borrower_id OR auth.uid() = lender_id)
    AND status IN ('cancelled', 'declined')
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if a tool is currently available for borrowing
CREATE OR REPLACE FUNCTION is_tool_available_for_borrowing(p_tool_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM borrow_requests
    WHERE tool_id = p_tool_id
    AND status IN ('approved', 'active')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending request count for a user (as lender)
CREATE OR REPLACE FUNCTION get_pending_borrow_request_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM borrow_requests
    WHERE lender_id = p_user_id
    AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
