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

		// Get tool IDs to check loan status
		const toolIds = (toolsData || []).map((t) => t.id);

		// Fetch active loans for these tools
		const { data: activeLoans } = await supabase
			.from("borrow_requests")
			.select("tool_id, status, borrower:profiles!borrow_requests_borrower_id_fkey(display_name, email)")
			.in("tool_id", toolIds.length > 0 ? toolIds : ["no-match"])
			.in("status", ["approved", "active"]);

		// Fetch waitlist counts for these tools
		const { data: waitlistData } = await supabase
			.from("borrow_requests")
			.select("tool_id")
			.in("tool_id", toolIds.length > 0 ? toolIds : ["no-match"])
			.eq("status", "waitlisted");

		// Create maps for quick lookup
		const loanMap = new Map(
			(activeLoans || []).map((loan) => {
				const borrower = Array.isArray(loan.borrower) ? loan.borrower[0] : loan.borrower;
				return [
					loan.tool_id,
					{
						status: loan.status,
						borrower_name: borrower?.display_name || borrower?.email || null,
					},
				];
			})
		);

		const waitlistCounts = new Map<string, number>();
		(waitlistData || []).forEach((w) => {
			waitlistCounts.set(w.tool_id, (waitlistCounts.get(w.tool_id) || 0) + 1);
		});

		// Add owner info to tools
		const toolsWithOwner: FriendTool[] = (toolsData || []).map((tool) => {
			const loan = loanMap.get(tool.id);
			return {
				...tool,
				owner_name: profile.display_name,
				owner_avatar: profile.avatar_url,
				owner_latitude: profile.latitude,
				owner_longitude: profile.longitude,
				is_on_loan: !!loan,
				current_borrower_name: loan?.borrower_name || null,
				waitlist_count: waitlistCounts.get(tool.id) || 0,
			};
		});

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
