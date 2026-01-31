-- Add handshake confirmation columns to borrow_requests table
-- Both parties must confirm pickup and return for the transaction to complete

-- Pickup handshake columns
ALTER TABLE borrow_requests
ADD COLUMN IF NOT EXISTS borrower_confirmed_pickup_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS lender_confirmed_pickup_at TIMESTAMPTZ DEFAULT NULL;

-- Return handshake columns
ALTER TABLE borrow_requests
ADD COLUMN IF NOT EXISTS borrower_confirmed_return_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS lender_confirmed_return_at TIMESTAMPTZ DEFAULT NULL;

-- QR code columns for future handshake verification
ALTER TABLE borrow_requests
ADD COLUMN IF NOT EXISTS pickup_code TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS return_code TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN borrow_requests.borrower_confirmed_pickup_at IS 'Timestamp when borrower confirmed they picked up the tool';
COMMENT ON COLUMN borrow_requests.lender_confirmed_pickup_at IS 'Timestamp when lender confirmed they handed off the tool';
COMMENT ON COLUMN borrow_requests.borrower_confirmed_return_at IS 'Timestamp when borrower confirmed they returned the tool';
COMMENT ON COLUMN borrow_requests.lender_confirmed_return_at IS 'Timestamp when lender confirmed they received the tool back';
COMMENT ON COLUMN borrow_requests.pickup_code IS 'QR code for pickup verification (future use)';
COMMENT ON COLUMN borrow_requests.return_code IS 'QR code for return verification (future use)';
