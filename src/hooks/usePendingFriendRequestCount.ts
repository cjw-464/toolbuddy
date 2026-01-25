"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export function usePendingFriendRequestCount() {
	const { user, loading: authLoading } = useAuth();
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(true);

	const fetchCount = useCallback(async () => {
		if (!user) {
			setCount(0);
			setLoading(false);
			return;
		}

		const supabase = createClient();

		const { count: pendingCount, error } = await supabase
			.from("friendships")
			.select("*", { count: "exact", head: true })
			.eq("addressee_id", user.id)
			.eq("status", "pending");

		if (error) {
			console.error("Error fetching pending request count:", error);
			setCount(0);
		} else {
			setCount(pendingCount ?? 0);
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
		refetch: fetchCount,
	};
}
