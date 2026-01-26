"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export interface ProfileStats {
	totalTools: number;
	lendableTools: number;
	friendsCount: number;
}

export function useProfileStats() {
	const { user, loading: authLoading } = useAuth();
	const [stats, setStats] = useState<ProfileStats>({
		totalTools: 0,
		lendableTools: 0,
		friendsCount: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (authLoading) return;

		if (!user) {
			setStats({ totalTools: 0, lendableTools: 0, friendsCount: 0 });
			setLoading(false);
			return;
		}

		const fetchStats = async () => {
			setLoading(true);
			setError(null);

			const supabase = createClient();

			try {
				// Fetch total tools count
				const { count: totalTools, error: toolsError } = await supabase
					.from("tools")
					.select("*", { count: "exact", head: true })
					.eq("owner_id", user.id);

				if (toolsError) throw toolsError;

				// Fetch lendable tools count
				const { count: lendableTools, error: lendableError } = await supabase
					.from("tools")
					.select("*", { count: "exact", head: true })
					.eq("owner_id", user.id)
					.eq("is_lendable", true);

				if (lendableError) throw lendableError;

				// Fetch accepted friends count
				const { count: friendsCount, error: friendsError } = await supabase
					.from("friendships")
					.select("*", { count: "exact", head: true })
					.eq("status", "accepted")
					.or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

				if (friendsError) throw friendsError;

				setStats({
					totalTools: totalTools || 0,
					lendableTools: lendableTools || 0,
					friendsCount: friendsCount || 0,
				});
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load stats");
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, [user, authLoading]);

	return { stats, loading: loading || authLoading, error };
}
