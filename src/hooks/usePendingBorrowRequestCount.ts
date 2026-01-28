"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export function usePendingBorrowRequestCount() {
	const { user, loading: authLoading } = useAuth();
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCount = useCallback(async () => {
		if (!user) {
			setCount(0);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		const supabase = createClient();

		// Count pending borrow requests where user is the lender
		const { count: pendingCount, error: countError } = await supabase
			.from("borrow_requests")
			.select("*", { count: "exact", head: true })
			.eq("lender_id", user.id)
			.eq("status", "pending");

		if (countError) {
			setError(countError.message);
			setLoading(false);
			return;
		}

		setCount(pendingCount || 0);
		setLoading(false);
	}, [user]);

	useEffect(() => {
		if (authLoading) return;
		fetchCount();
	}, [authLoading, fetchCount]);

	return {
		count,
		loading: loading || authLoading,
		error,
		refetch: fetchCount,
	};
}
