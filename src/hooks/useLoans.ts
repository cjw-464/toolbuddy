"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import type { ActiveLoan } from "@/types";

export function useLoans() {
	const { user, loading: authLoading } = useAuth();
	const [lentOut, setLentOut] = useState<ActiveLoan[]>([]); // Tools I've lent to others
	const [borrowed, setBorrowed] = useState<ActiveLoan[]>([]); // Tools I've borrowed
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchLoans = useCallback(async () => {
		if (!user) {
			setLentOut([]);
			setBorrowed([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		const supabase = createClient();

		// Get all active loans (approved or active status)
		const { data, error: fetchError } = await supabase
			.from("borrow_requests")
			.select("*")
			.or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
			.in("status", ["approved", "active"])
			.order("requested_at", { ascending: false });

		if (fetchError) {
			setError(fetchError.message);
			setLoading(false);
			return;
		}

		if (!data || data.length === 0) {
			setLentOut([]);
			setBorrowed([]);
			setLoading(false);
			return;
		}

		// Separate lent out (as lender) and borrowed (as borrower)
		const lentOutRequests = data.filter((r) => r.lender_id === user.id);
		const borrowedRequests = data.filter((r) => r.borrower_id === user.id);

		// Get all tool IDs
		const toolIds = [...new Set(data.map((r) => r.tool_id))];

		// Get all user IDs we need profiles for (both borrowers and lenders)
		const allUserIds = [
			...lentOutRequests.map((r) => r.borrower_id),
			...borrowedRequests.map((r) => r.lender_id),
			user.id, // Include current user
		];
		const userIds = [...new Set(allUserIds)];

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
			.in("id", userIds);

		if (profilesError) {
			setError(profilesError.message);
			setLoading(false);
			return;
		}

		const toolMap = new Map(tools?.map((t) => [t.id, t]) || []);
		const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

		const createUnknownUser = (id: string) => ({
			id,
			email: "",
			display_name: "Unknown User",
			avatar_url: null,
			location: null,
			zip_code: null,
			latitude: null,
			longitude: null,
			created_at: "",
		});

		// Map lent out loans with full details
		const lentOutWithDetails: ActiveLoan[] = lentOutRequests
			.map((r) => {
				const tool = toolMap.get(r.tool_id);
				if (!tool) return null;
				return {
					...r,
					tool,
					borrower: profileMap.get(r.borrower_id) || createUnknownUser(r.borrower_id),
					lender: profileMap.get(r.lender_id) || createUnknownUser(r.lender_id),
				};
			})
			.filter(Boolean) as ActiveLoan[];

		// Map borrowed loans with full details
		const borrowedWithDetails: ActiveLoan[] = borrowedRequests
			.map((r) => {
				const tool = toolMap.get(r.tool_id);
				if (!tool) return null;
				return {
					...r,
					tool,
					borrower: profileMap.get(r.borrower_id) || createUnknownUser(r.borrower_id),
					lender: profileMap.get(r.lender_id) || createUnknownUser(r.lender_id),
				};
			})
			.filter(Boolean) as ActiveLoan[];

		setLentOut(lentOutWithDetails);
		setBorrowed(borrowedWithDetails);
		setLoading(false);
	}, [user]);

	useEffect(() => {
		if (authLoading) return;
		fetchLoans();
	}, [authLoading, fetchLoans]);

	// Total counts
	const lentOutCount = lentOut.length;
	const borrowedCount = borrowed.length;
	const totalActiveLoans = lentOutCount + borrowedCount;

	return {
		lentOut,
		borrowed,
		lentOutCount,
		borrowedCount,
		totalActiveLoans,
		loading: loading || authLoading,
		error,
		refetch: fetchLoans,
	};
}
