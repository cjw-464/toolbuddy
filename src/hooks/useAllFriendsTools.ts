"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import { calculateDistance } from "@/lib/distance";
import type { FriendTool, ToolCategory } from "@/types";

export type SortOption = "recent" | "distance" | "name";

interface UseAllFriendsToolsOptions {
	search?: string;
	category?: ToolCategory | "";
	sortBy?: SortOption;
	userLatitude?: number | null;
	userLongitude?: number | null;
}

export function useAllFriendsTools(options: UseAllFriendsToolsOptions = {}) {
	const {
		search = "",
		category = "",
		sortBy = "recent",
		userLatitude = null,
		userLongitude = null,
	} = options;
	const { user, loading: authLoading } = useAuth();
	const [tools, setTools] = useState<FriendTool[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchAllFriendsTools = useCallback(async () => {
		if (!user) {
			setTools([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		const supabase = createClient();

		// Get all accepted friendships
		const { data: friendships, error: friendshipsError } = await supabase
			.from("friendships")
			.select("*")
			.eq("status", "accepted")
			.or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

		if (friendshipsError) {
			setError(friendshipsError.message);
			setLoading(false);
			return;
		}

		if (!friendships || friendships.length === 0) {
			setTools([]);
			setLoading(false);
			return;
		}

		// Extract friend IDs
		const friendIds = friendships.map((f) =>
			f.requester_id === user.id ? f.addressee_id : f.requester_id
		);

		// Get all friends' profiles (including location data)
		const { data: profiles, error: profilesError } = await supabase
			.from("profiles")
			.select("*")
			.in("id", friendIds);

		if (profilesError) {
			setError(profilesError.message);
			setLoading(false);
			return;
		}

		const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

		// Build query for tools
		let toolsQuery = supabase
			.from("tools")
			.select(`*, images:tool_images(*)`)
			.in("owner_id", friendIds)
			.eq("is_lendable", true);

		// Apply search filter
		if (search) {
			toolsQuery = toolsQuery.or(
				`name.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`
			);
		}

		// Apply category filter
		if (category) {
			toolsQuery = toolsQuery.eq("category", category);
		}

		const { data: toolsData, error: toolsError } = await toolsQuery.order(
			"created_at",
			{ ascending: false }
		);

		if (toolsError) {
			setError(toolsError.message);
			setLoading(false);
			return;
		}

		// Add owner info and calculate distance
		let toolsWithOwner: FriendTool[] = (toolsData || []).map((tool) => {
			const owner = profileMap.get(tool.owner_id);
			const ownerLat = owner?.latitude || null;
			const ownerLng = owner?.longitude || null;

			// Calculate distance if we have both user and owner coordinates
			let distance: number | null = null;
			if (userLatitude && userLongitude && ownerLat && ownerLng) {
				distance = calculateDistance(
					userLatitude,
					userLongitude,
					ownerLat,
					ownerLng
				);
			}

			return {
				...tool,
				owner_name: owner?.display_name || null,
				owner_avatar: owner?.avatar_url || null,
				owner_latitude: ownerLat,
				owner_longitude: ownerLng,
				distance,
			};
		});

		// Sort based on sortBy option
		if (sortBy === "distance") {
			toolsWithOwner.sort((a, b) => {
				// Tools without distance go to the end
				const aDist = a.distance ?? null;
				const bDist = b.distance ?? null;
				if (aDist === null && bDist === null) return 0;
				if (aDist === null) return 1;
				if (bDist === null) return -1;
				return aDist - bDist;
			});
		} else if (sortBy === "name") {
			toolsWithOwner.sort((a, b) => a.name.localeCompare(b.name));
		}
		// "recent" is already sorted by created_at from the query

		setTools(toolsWithOwner);
		setLoading(false);
	}, [user, search, category, sortBy, userLatitude, userLongitude]);

	useEffect(() => {
		if (authLoading) return;
		fetchAllFriendsTools();
	}, [authLoading, fetchAllFriendsTools]);

	return {
		tools,
		loading: loading || authLoading,
		error,
		refetch: fetchAllFriendsTools,
	};
}
