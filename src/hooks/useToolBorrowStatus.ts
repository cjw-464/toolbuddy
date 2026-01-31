"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import type { BorrowRequest, BorrowRequestStatus } from "@/types";

interface ToolBorrowStatus {
	canRequest: boolean; // Can the current user request to borrow this tool?
	canJoinWaitlist: boolean; // Can the current user join the waitlist?
	existingRequest: BorrowRequest | null; // User's existing request for this tool
	isCurrentlyBorrowed: boolean; // Is the tool currently borrowed by anyone?
	currentBorrowerId: string | null; // Who currently has the tool?
	waitlistPosition: number | null; // User's position in waitlist (if waitlisted)
	waitlistCount: number; // Total people in waitlist
}

export function useToolBorrowStatus(toolId: string | undefined, ownerId: string | undefined) {
	const { user, loading: authLoading } = useAuth();
	const [status, setStatus] = useState<ToolBorrowStatus>({
		canRequest: false,
		canJoinWaitlist: false,
		existingRequest: null,
		isCurrentlyBorrowed: false,
		currentBorrowerId: null,
		waitlistPosition: null,
		waitlistCount: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchStatus = useCallback(async () => {
		if (!user || !toolId || !ownerId) {
			setStatus({
				canRequest: false,
				canJoinWaitlist: false,
				existingRequest: null,
				isCurrentlyBorrowed: false,
				currentBorrowerId: null,
				waitlistPosition: null,
				waitlistCount: 0,
			});
			setLoading(false);
			return;
		}

		// User can't borrow their own tools
		if (user.id === ownerId) {
			setStatus({
				canRequest: false,
				canJoinWaitlist: false,
				existingRequest: null,
				isCurrentlyBorrowed: false,
				currentBorrowerId: null,
				waitlistPosition: null,
				waitlistCount: 0,
			});
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		const supabase = createClient();

		// Get all borrow requests for this tool (including waitlisted)
		const { data, error: fetchError } = await supabase
			.from("borrow_requests")
			.select("*")
			.eq("tool_id", toolId)
			.in("status", ["pending", "approved", "active", "waitlisted"])
			.order("requested_at", { ascending: true });

		console.log("[useToolBorrowStatus] toolId:", toolId, "ownerId:", ownerId);
		console.log("[useToolBorrowStatus] borrow_requests data:", data);
		console.log("[useToolBorrowStatus] fetchError:", fetchError, "code:", fetchError?.code, "message:", fetchError?.message, "details:", fetchError?.details, "hint:", fetchError?.hint);

		if (fetchError) {
			console.error("[useToolBorrowStatus] error:", JSON.stringify(fetchError, null, 2));
			setError(fetchError.message);
			setLoading(false);
			return;
		}

		// Find user's existing request (any status)
		const userRequest = data?.find((r) => r.borrower_id === user.id) || null;

		// Check if tool is currently borrowed (active status)
		const activeRequest = data?.find((r) => r.status === "active");
		const approvedRequest = data?.find((r) => r.status === "approved");
		const isCurrentlyBorrowed = !!activeRequest || !!approvedRequest;

		console.log("[useToolBorrowStatus] activeRequest:", activeRequest);
		console.log("[useToolBorrowStatus] approvedRequest:", approvedRequest);
		console.log("[useToolBorrowStatus] isCurrentlyBorrowed:", isCurrentlyBorrowed);
		const currentBorrowerId = activeRequest?.borrower_id || approvedRequest?.borrower_id || null;

		// Get waitlist info
		const waitlistedRequests = data?.filter((r) => r.status === "waitlisted") || [];
		const waitlistCount = waitlistedRequests.length;
		const userWaitlistIndex = waitlistedRequests.findIndex((r) => r.borrower_id === user.id);
		const waitlistPosition = userWaitlistIndex >= 0 ? userWaitlistIndex + 1 : null;

		// User can request if:
		// 1. They don't have an existing pending/approved/active/waitlisted request
		// 2. The tool isn't currently approved/active for someone else
		const canRequest = !userRequest && !isCurrentlyBorrowed;

		// User can join waitlist if:
		// 1. They don't have an existing request
		// 2. The tool IS currently borrowed
		const canJoinWaitlist = !userRequest && isCurrentlyBorrowed;

		setStatus({
			canRequest,
			canJoinWaitlist,
			existingRequest: userRequest,
			isCurrentlyBorrowed,
			currentBorrowerId,
			waitlistPosition,
			waitlistCount,
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
