"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import type { FriendProfile } from "@/types";

export function useUserSearch() {
	const { user } = useAuth();
	const [results, setResults] = useState<FriendProfile[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const search = useCallback(
		async (query: string) => {
			if (!user) {
				setResults([]);
				return;
			}

			if (!query || query.length < 2) {
				setResults([]);
				return;
			}

			setLoading(true);
			setError(null);

			const supabase = createClient();

			// Search profiles by display_name or email
			const { data: profiles, error: searchError } = await supabase
				.from("profiles")
				.select("*")
				.neq("id", user.id)
				.or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
				.limit(20);

			if (searchError) {
				setError(searchError.message);
				setLoading(false);
				return;
			}

			if (!profiles || profiles.length === 0) {
				setResults([]);
				setLoading(false);
				return;
			}

			// Get existing friendships with these users
			const profileIds = profiles.map((p) => p.id);
			const { data: friendships } = await supabase
				.from("friendships")
				.select("*")
				.or(
					profileIds
						.map(
							(id) =>
								`and(requester_id.eq.${user.id},addressee_id.eq.${id}),and(requester_id.eq.${id},addressee_id.eq.${user.id})`
						)
						.join(",")
				);

			// Map friendships to profiles
			const resultsWithStatus: FriendProfile[] = profiles.map((profile) => {
				const friendship = friendships?.find(
					(f) =>
						(f.requester_id === user.id && f.addressee_id === profile.id) ||
						(f.requester_id === profile.id && f.addressee_id === user.id)
				);

				return {
					...profile,
					friendship_id: friendship?.id,
					friendship_status: friendship?.status || null,
					i_requested: friendship?.requester_id === user.id,
				};
			});

			setResults(resultsWithStatus);
			setLoading(false);
		},
		[user]
	);

	const sendRequest = async (addresseeId: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		// Check if blocked by this user or reverse request exists
		const { data: existing } = await supabase
			.from("friendships")
			.select("*")
			.or(
				`and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`
			)
			.single();

		if (existing) {
			if (existing.status === "blocked") {
				return { error: "Cannot send request to this user" };
			}
			if (existing.status === "pending" || existing.status === "accepted") {
				return { error: "Request already exists" };
			}
		}

		// Create the friend request
		const { error } = await supabase.from("friendships").insert({
			requester_id: user.id,
			addressee_id: addresseeId,
			status: "pending",
		});

		if (error) {
			if (error.code === "23505") {
				return { error: "Buddy request already sent" };
			}
			return { error: error.message };
		}

		// Update local state
		setResults((prev) =>
			prev.map((r) =>
				r.id === addresseeId
					? { ...r, friendship_status: "pending", i_requested: true }
					: r
			)
		);

		return { error: null };
	};

	const clearResults = useCallback(() => {
		setResults([]);
	}, []);

	return {
		results,
		loading,
		error,
		search,
		sendRequest,
		clearResults,
	};
}
