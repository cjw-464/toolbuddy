"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export function usePendingFriendRequestCount() {
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

		try {
			const supabase = createClient();

			const { count: pendingCount, error: queryError } = await supabase
				.from("friendships")
				.select("*", { count: "exact", head: true })
				.eq("addressee_id", user.id)
				.eq("status", "pending");

			if (queryError) {
				console.error("Error fetching pending request count:", queryError);
				setError(queryError.message);
				setCount(0);
			} else {
				setError(null);
				setCount(pendingCount ?? 0);
			}
		} catch (err) {
			console.error("Error in usePendingFriendRequestCount:", err);
			setError("Failed to fetch count");
			setCount(0);
		}

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
