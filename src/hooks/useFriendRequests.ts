"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import type { FriendProfile } from "@/types";

interface FriendRequest extends FriendProfile {
	friendship_id: string;
}

export function useFriendRequests() {
	const { user, loading: authLoading } = useAuth();
	const [incoming, setIncoming] = useState<FriendRequest[]>([]);
	const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
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

		// Get pending friendships where user is involved
		const { data, error } = await supabase
			.from("friendships")
			.select("*")
			.eq("status", "pending")
			.or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

		if (error) {
			setError(error.message);
			setLoading(false);
			return;
		}

		if (!data || data.length === 0) {
			setIncoming([]);
			setOutgoing([]);
			setLoading(false);
			return;
		}

		// Separate incoming and outgoing
		const incomingRequests = data.filter((f) => f.addressee_id === user.id);
		const outgoingRequests = data.filter((f) => f.requester_id === user.id);

		// Get all user IDs we need profiles for
		const userIds = [
			...incomingRequests.map((f) => f.requester_id),
			...outgoingRequests.map((f) => f.addressee_id),
		];

		if (userIds.length === 0) {
			setIncoming([]);
			setOutgoing([]);
			setLoading(false);
			return;
		}

		// Get profiles
		const { data: profiles, error: profileError } = await supabase
			.from("profiles")
			.select("*")
			.in("id", userIds);

		if (profileError) {
			setError(profileError.message);
			setLoading(false);
			return;
		}

		const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

		// Map incoming requests with profiles
		const incomingWithProfiles: FriendRequest[] = incomingRequests
			.map((f) => {
				const profile = profileMap.get(f.requester_id);
				if (!profile) return null;
				return {
					...profile,
					friendship_id: f.id,
					friendship_status: f.status,
					i_requested: false,
				};
			})
			.filter(Boolean) as FriendRequest[];

		// Map outgoing requests with profiles
		const outgoingWithProfiles: FriendRequest[] = outgoingRequests
			.map((f) => {
				const profile = profileMap.get(f.addressee_id);
				if (!profile) return null;
				return {
					...profile,
					friendship_id: f.id,
					friendship_status: f.status,
					i_requested: true,
				};
			})
			.filter(Boolean) as FriendRequest[];

		setIncoming(incomingWithProfiles);
		setOutgoing(outgoingWithProfiles);
		setLoading(false);
	}, [user]);

	useEffect(() => {
		if (authLoading) return;
		fetchRequests();
	}, [authLoading, fetchRequests]);

	const acceptRequest = async (friendshipId: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		const { error } = await supabase
			.from("friendships")
			.update({ status: "accepted" })
			.eq("id", friendshipId)
			.eq("addressee_id", user.id); // Only addressee can accept

		if (error) {
			return { error: error.message };
		}

		await fetchRequests();
		return { error: null };
	};

	const declineRequest = async (friendshipId: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		// Delete the request rather than marking as rejected
		const { error } = await supabase
			.from("friendships")
			.delete()
			.eq("id", friendshipId)
			.eq("addressee_id", user.id); // Only addressee can decline

		if (error) {
			return { error: error.message };
		}

		await fetchRequests();
		return { error: null };
	};

	const cancelRequest = async (friendshipId: string) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		const { error } = await supabase
			.from("friendships")
			.delete()
			.eq("id", friendshipId)
			.eq("requester_id", user.id); // Only requester can cancel

		if (error) {
			return { error: error.message };
		}

		await fetchRequests();
		return { error: null };
	};

	const incomingCount = incoming.length;

	return {
		incoming,
		outgoing,
		incomingCount,
		loading: loading || authLoading,
		error,
		refetch: fetchRequests,
		acceptRequest,
		declineRequest,
		cancelRequest,
	};
}
