"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import type { BorrowRequest, BorrowRequestStatus } from "@/types";

interface ToolBorrowStatus {
	canRequest: boolean; // Can the current user request to borrow this tool?
	existingRequest: BorrowRequest | null; // User's existing request for this tool
	isCurrentlyBorrowed: boolean; // Is the tool currently borrowed by anyone?
	currentBorrowerId: string | null; // Who currently has the tool?
}

export function useToolBorrowStatus(toolId: string | undefined, ownerId: string | undefined) {
	const { user, loading: authLoading } = useAuth();
	const [status, setStatus] = useState<ToolBorrowStatus>({
		canRequest: false,
		existingRequest: null,
		isCurrentlyBorrowed: false,
		currentBorrowerId: null,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchStatus = useCallback(async () => {
		if (!user || !toolId || !ownerId) {
			setStatus({
				canRequest: false,
				existingRequest: null,
				isCurrentlyBorrowed: false,
				currentBorrowerId: null,
			});
			setLoading(false);
			return;
		}

		// User can't borrow their own tools
		if (user.id === ownerId) {
			setStatus({
				canRequest: false,
				existingRequest: null,
				isCurrentlyBorrowed: false,
				currentBorrowerId: null,
			});
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		const supabase = createClient();

		// Get all active borrow requests for this tool
		const { data, error: fetchError } = await supabase
			.from("borrow_requests")
			.select("*")
			.eq("tool_id", toolId)
			.in("status", ["pending", "approved", "active"]);

		if (fetchError) {
			setError(fetchError.message);
			setLoading(false);
			return;
		}

		// Find user's existing request
		const userRequest = data?.find((r) => r.borrower_id === user.id) || null;

		// Check if tool is currently borrowed (active status)
		const activeRequest = data?.find((r) => r.status === "active");
		const approvedRequest = data?.find((r) => r.status === "approved");
		const isCurrentlyBorrowed = !!activeRequest || !!approvedRequest;
		const currentBorrowerId = activeRequest?.borrower_id || approvedRequest?.borrower_id || null;

		// User can request if:
		// 1. They don't have an existing pending/approved/active request
		// 2. The tool isn't currently approved/active for someone else
		const canRequest = !userRequest && !isCurrentlyBorrowed;

		setStatus({
			canRequest,
			existingRequest: userRequest,
			isCurrentlyBorrowed,
			currentBorrowerId,
		});
		setLoading(false);
	}, [user, toolId, ownerId]);

	useEffect(() => {
		if (authLoading) return;
		fetchStatus();
	}, [authLoading, fetchStatus]);

	return {
		...status,
		loading: loading || authLoading,
		error,
		refetch: fetchStatus,
	};
}
