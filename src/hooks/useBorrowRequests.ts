"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import type {
	IncomingBorrowRequest,
	OutgoingBorrowRequest,
	BorrowRequestStatus,
} from "@/types";

export function useBorrowRequests() {
	const { user, loading: authLoading } = useAuth();
	const [incoming, setIncoming] = useState<IncomingBorrowRequest[]>([]);
	const [outgoing, setOutgoing] = useState<OutgoingBorrowRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchRequests = useCallback(async () => {
		if (!user) {
			setIncoming([]);
			setOutgoing([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		const supabase = createClient();

		// Get all borrow requests where user is borrower or lender
		// Exclude completed statuses (returned, declined, cancelled) unless recent
		const { data, error: fetchError } = await supabase
			.from("borrow_requests")
			.select("*")
			.or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
			.in("status", ["pending", "approved", "active"])
			.order("requested_at", { ascending: false });

		if (fetchError) {
			setError(fetchError.message);
			setLoading(false);
			return;
		}

		if (!data || data.length === 0) {
			setIncoming([]);
			setOutgoing([]);
			setLoading(false);
			return;
		}

		// Separate incoming (as lender) and outgoing (as borrower)
		const incomingRequests = data.filter((r) => r.lender_id === user.id);
		const outgoingRequests = data.filter((r) => r.borrower_id === user.id);

		// Get all tool IDs
		const toolIds = [...new Set(data.map((r) => r.tool_id))];

		// Get all user IDs we need profiles for
		const borrowerIds = incomingRequests.map((r) => r.borrower_id);
		const lenderIds = outgoingRequests.map((r) => r.lender_id);
		const userIds = [...new Set([...borrowerIds, ...lenderIds])];

		// Fetch tools with images
		const { data: tools, error: toolsError } = await supabase
			.from("tools")
			.select("*, images:tool_images(*)")
			.in("id", toolIds);

		if (toolsError) {
			setError(toolsError.message);
			setLoading(false);
			return;
		}

		// Fetch profiles
		const { data: profiles, error: profilesError } = await supabase
			.from("profiles")
			.select("*")
			.in("id", userIds.length > 0 ? userIds : ["no-match"]);

		if (profilesError) {
			setError(profilesError.message);
			setLoading(false);
			return;
		}

		const toolMap = new Map(tools?.map((t) => [t.id, t]) || []);
		const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

		// Map incoming requests with tool and borrower details
		const incomingWithDetails: IncomingBorrowRequest[] = incomingRequests
			.map((r) => {
				const tool = toolMap.get(r.tool_id);
				const borrower = profileMap.get(r.borrower_id);
				if (!tool) return null;
				return {
					...r,
					tool,
					borrower: borrower || {
						id: r.borrower_id,
						email: "",
						display_name: "Unknown User",
						avatar_url: null,
						location: null,
						zip_code: null,
						latitude: null,
						longitude: null,
						created_at: "",
					},
				};
			})
			.filter(Boolean) as IncomingBorrowRequest[];

		// Map outgoing requests with tool and lender details
		const outgoingWithDetails: OutgoingBorrowRequest[] = outgoingRequests
			.map((r) => {
				const tool = toolMap.get(r.tool_id);
				const lender = profileMap.get(r.lender_id);
				if (!tool) return null;
				return {
					...r,
					tool,
					lender: lender || {
						id: r.lender_id,
						email: "",
						display_name: "Unknown User",
						avatar_url: null,
						location: null,
						zip_code: null,
						latitude: null,
						longitude: null,
						created_at: "",
					},
				};
			})
			.filter(Boolean) as OutgoingBorrowRequest[];

		setIncoming(incomingWithDetails);
		setOutgoing(outgoingWithDetails);
		setLoading(false);
	}, [user]);

	useEffect(() => {
		if (authLoading) return;
		fetchRequests();
	}, [authLoading, fetchRequests]);

	// Create a new borrow request
	const createRequest = async (toolId: string, lenderId: string, message?: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		const { error } = await supabase.from("borrow_requests").insert({
			tool_id: toolId,
			borrower_id: user.id,
			lender_id: lenderId,
			message: message || null,
			status: "pending",
		});

		if (error) {
			return { error: error.message };
		}

		await fetchRequests();
		return { error: null };
	};

	// Approve a pending request (as lender)
	const approveRequest = async (requestId: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		const { error } = await supabase
			.from("borrow_requests")
			.update({
				status: "approved" as BorrowRequestStatus,
				responded_at: new Date().toISOString(),
			})
			.eq("id", requestId)
			.eq("lender_id", user.id)
			.eq("status", "pending");

		if (error) {
			return { error: error.message };
		}

		await fetchRequests();
		return { error: null };
	};

	// Decline a pending request (as lender)
	const declineRequest = async (requestId: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		const { error } = await supabase
			.from("borrow_requests")
			.update({
				status: "declined" as BorrowRequestStatus,
				responded_at: new Date().toISOString(),
			})
			.eq("id", requestId)
			.eq("lender_id", user.id)
			.eq("status", "pending");

		if (error) {
			return { error: error.message };
		}

		await fetchRequests();
		return { error: null };
	};

	// Cancel a pending request (as borrower)
	const cancelRequest = async (requestId: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		const { error } = await supabase
			.from("borrow_requests")
			.update({
				status: "cancelled" as BorrowRequestStatus,
			})
			.eq("id", requestId)
			.eq("borrower_id", user.id)
			.eq("status", "pending");

		if (error) {
			return { error: error.message };
		}

		await fetchRequests();
		return { error: null };
	};

	// Mark as picked up (as borrower) - transitions from approved to active
	const markAsPickedUp = async (requestId: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		const { error } = await supabase
			.from("borrow_requests")
			.update({
				status: "active" as BorrowRequestStatus,
				picked_up_at: new Date().toISOString(),
			})
			.eq("id", requestId)
			.eq("borrower_id", user.id)
			.eq("status", "approved");

		if (error) {
			return { error: error.message };
		}

		await fetchRequests();
		return { error: null };
	};

	// Mark as returned (as lender) - transitions from active to returned
	const markAsReturned = async (requestId: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		const { error } = await supabase
			.from("borrow_requests")
			.update({
				status: "returned" as BorrowRequestStatus,
				returned_at: new Date().toISOString(),
			})
			.eq("id", requestId)
			.eq("lender_id", user.id)
			.eq("status", "active");

		if (error) {
			return { error: error.message };
		}

		await fetchRequests();
		return { error: null };
	};

	// Count of pending incoming requests (for badge)
	const pendingIncomingCount = incoming.filter((r) => r.status === "pending").length;

	return {
		incoming,
		outgoing,
		pendingIncomingCount,
		loading: loading || authLoading,
		error,
		refetch: fetchRequests,
		createRequest,
		approveRequest,
		declineRequest,
		cancelRequest,
		markAsPickedUp,
		markAsReturned,
	};
}
