"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import type { FriendProfile } from "@/types";

export function useFriends() {
	const { user, loading: authLoading } = useAuth();
	const [friends, setFriends] = useState<FriendProfile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchFriends = useCallback(async () => {
		if (!user) {
			setFriends([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		const supabase = createClient();

		// Get accepted friendships and join with profiles
		const { data, error } = await supabase
			.from("friendships")
			.select(`
				id,
				requester_id,
				addressee_id,
				status
			`)
			.eq("status", "accepted")
			.or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

		if (error) {
			setError(error.message);
			setLoading(false);
			return;
		}

		if (!data || data.length === 0) {
			setFriends([]);
			setLoading(false);
			return;
		}

		// Extract friend IDs
		const friendIds = data.map((f) =>
			f.requester_id === user.id ? f.addressee_id : f.requester_id
		);

		// Get friend profiles
		const { data: profiles, error: profileError } = await supabase
			.from("profiles")
			.select("*")
			.in("id", friendIds);

		if (profileError) {
			setError(profileError.message);
			setLoading(false);
			return;
		}

		// Get lendable tools count for each friend
		const { data: toolCounts } = await supabase
			.from("tools")
			.select("owner_id")
			.in("owner_id", friendIds)
			.eq("is_lendable", true);

		const countsMap = new Map<string, number>();
		toolCounts?.forEach((t) => {
			countsMap.set(t.owner_id, (countsMap.get(t.owner_id) || 0) + 1);
		});

		// Combine data
		const friendsWithData: FriendProfile[] = (profiles || []).map((profile) => {
			const friendship = data.find(
				(f) => f.requester_id === profile.id || f.addressee_id === profile.id
			);
			return {
				...profile,
				friendship_id: friendship?.id,
				friendship_status: friendship?.status || null,
				i_requested: friendship?.requester_id === user.id,
				lendable_tools_count: countsMap.get(profile.id) || 0,
			};
		});

		setFriends(friendsWithData);
		setLoading(false);
	}, [user]);

	useEffect(() => {
		if (authLoading) return;
		fetchFriends();
	}, [authLoading, fetchFriends]);

	const unfriend = async (friendshipId: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		const { error } = await supabase
			.from("friendships")
			.delete()
			.eq("id", friendshipId);

		if (error) {
			return { error: error.message };
		}

		await fetchFriends();
		return { error: null };
	};

	return {
		friends,
		loading: loading || authLoading,
		error,
		refetch: fetchFriends,
		unfriend,
	};
}
