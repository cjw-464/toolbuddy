"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import type { FriendTool, FriendProfile } from "@/types";

export function useFriendTools(friendId?: string) {
	const { user, loading: authLoading } = useAuth();
	const [tools, setTools] = useState<FriendTool[]>([]);
	const [friend, setFriend] = useState<FriendProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchFriendTools = useCallback(async () => {
		if (!user || !friendId) {
			setTools([]);
			setFriend(null);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		const supabase = createClient();

		// Verify this is actually a friend (accepted friendship)
		const { data: friendship, error: friendshipError } = await supabase
			.from("friendships")
			.select("*")
			.eq("status", "accepted")
			.or(
				`and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`
			)
			.single();

		if (friendshipError || !friendship) {
			setError("Not friends with this user");
			setLoading(false);
			return;
		}

		// Get friend's profile
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", friendId)
			.single();

		if (profileError) {
			setError(profileError.message);
			setLoading(false);
			return;
		}

		setFriend({
			...profile,
			friendship_id: friendship.id,
			friendship_status: friendship.status,
		});

		// Get friend's lendable tools with images
		const { data: toolsData, error: toolsError } = await supabase
			.from("tools")
			.select(`
				*,
				images:tool_images(*)
			`)
			.eq("owner_id", friendId)
			.eq("is_lendable", true)
			.order("created_at", { ascending: false });

		if (toolsError) {
			setError(toolsError.message);
			setLoading(false);
			return;
		}

		// Add owner info to tools
		const toolsWithOwner: FriendTool[] = (toolsData || []).map((tool) => ({
			...tool,
			owner_name: profile.display_name,
			owner_avatar: profile.avatar_url,
		}));

		setTools(toolsWithOwner);
		setLoading(false);
	}, [user, friendId]);

	useEffect(() => {
		if (authLoading) return;
		fetchFriendTools();
	}, [authLoading, fetchFriendTools]);

	return {
		tools,
		friend,
		loading: loading || authLoading,
		error,
		refetch: fetchFriendTools,
	};
}
