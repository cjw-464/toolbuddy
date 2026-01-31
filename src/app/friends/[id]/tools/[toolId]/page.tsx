"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToolBorrowStatus } from "@/hooks/useToolBorrowStatus";
import { AppShell } from "@/components/layout/AppShell";
import { BorrowRequestButton } from "@/components/borrow/BorrowRequestButton";
import { cn } from "@/lib/utils";
import { calculateDistance, formatDistance } from "@/lib/distance";
import type { ToolWithImages } from "@/types";

const categoryLabels: Record<string, string> = {
	"power-tools": "Power Tools",
	"hand-tools": "Hand Tools",
	"measuring": "Measuring",
	"electrical": "Electrical",
	"plumbing": "Plumbing",
	"automotive": "Automotive",
	"gardening": "Gardening",
	"safety": "Safety",
	"other": "Other",
};

const conditionLabels: Record<string, { label: string; color: string }> = {
	excellent: { label: "Excellent", color: "text-green-600 bg-green-50" },
	good: { label: "Good", color: "text-blue-600 bg-blue-50" },
	fair: { label: "Fair", color: "text-yellow-600 bg-yellow-50" },
	"needs-repair": { label: "Needs Repair", color: "text-red-600 bg-red-50" },
};

interface FriendInfo {
	id: string;
	display_name: string | null;
	avatar_url: string | null;
	location: string | null;
	latitude: number | null;
	longitude: number | null;
}

export default function FriendToolDetailPage() {
	const params = useParams();
	const friendId = params.id as string;
	const toolId = params.toolId as string;

	const { user, loading: authLoading } = useAuth();
	const { profile } = useProfile();
	const [tool, setTool] = useState<ToolWithImages | null>(null);
	const [friend, setFriend] = useState<FriendInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedImage, setSelectedImage] = useState(0);

	const {
		isCurrentlyBorrowed,
		canJoinWaitlist,
		existingRequest,
		waitlistCount,
		loading: statusLoading,
	} = useToolBorrowStatus(toolId, friendId);

	// Calculate distance between current user and tool owner
	const distance =
		profile?.latitude &&
		profile?.longitude &&
		friend?.latitude &&
		friend?.longitude
			? calculateDistance(
					profile.latitude,
					profile.longitude,
					friend.latitude,
					friend.longitude
			  )
			: null;

	const fetchToolAndFriend = useCallback(async () => {
		if (!user) {
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		const supabase = createClient();

		// Verify friendship
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
			.select("id, display_name, avatar_url, location, latitude, longitude")
			.eq("id", friendId)
			.single();

		if (profileError) {
			setError("Could not load friend info");
			setLoading(false);
			return;
		}

		setFriend(profile);

		// Get the tool with images
		const { data: toolData, error: toolError } = await supabase
			.from("tools")
			.select(
				`
				*,
				images:tool_images(*)
			`
			)
			.eq("id", toolId)
			.eq("owner_id", friendId)
			.eq("is_lendable", true)
			.single();

		if (toolError || !toolData) {
			setError("Tool not found or not available");
			setLoading(false);
			return;
		}

		setTool(toolData);
		setLoading(false);
	}, [user, friendId, toolId]);

	useEffect(() => {
		if (authLoading) return;
		fetchToolAndFriend();
	}, [authLoading, fetchToolAndFriend]);

	if (loading || authLoading) {
		return (
			<AppShell>
				<div className="animate-pulse space-y-4">
					<div className="h-6 w-32 rounded bg-neutral-200" />
					<div className="aspect-[4/3] rounded-2xl bg-neutral-200" />
					<div className="h-8 w-48 rounded bg-neutral-200" />
					<div className="h-4 w-32 rounded bg-neutral-200" />
				</div>
			</AppShell>
		);
	}

	if (error || !tool || !friend) {
		return (
			<AppShell>
				<div className="text-center">
					<h1 className="text-xl font-semibold text-neutral-900">
						{error || "Tool not found"}
					</h1>
					<p className="mt-2 text-neutral-600">
						This tool may not be available or you don&apos;t have access to it.
					</p>
					<Link
						href={`/friends/${friendId}`}
						className="mt-4 inline-block text-[#333333] underline"
					>
						Back to friend&apos;s tools
					</Link>
				</div>
			</AppShell>
		);
	}

	const condition = conditionLabels[tool.condition] || conditionLabels["good"];
	const primaryImage = tool.images?.[selectedImage] || tool.images?.[0];

	return (
		<AppShell>
			<header className="mb-6">
				<Link
					href={`/friends/${friendId}`}
					className="mb-4 inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
				>
					<svg
						className="mr-1 h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back to {friend.display_name || "buddy"}&apos;s tools
				</Link>
			</header>

			{/* Image Gallery */}
			<div className="mb-6">
				<div className="aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
					{primaryImage ? (
						<Image
							src={primaryImage.url}
							alt={tool.name}
							width={800}
							height={600}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<svg
								className="h-16 w-16 text-neutral-300"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
								/>
							</svg>
						</div>
					)}
				</div>

				{/* Thumbnails */}
				{tool.images && tool.images.length > 1 && (
					<div className="mt-3 flex gap-2 overflow-x-auto">
						{tool.images.map((image, index) => (
							<button
								key={image.id}
								onClick={() => setSelectedImage(index)}
								className={cn(
									"h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg",
									selectedImage === index
										? "ring-2 ring-[#FFCC00]"
										: "ring-1 ring-black/10"
								)}
							>
								<Image
									src={image.url}
									alt={`${tool.name} - ${index + 1}`}
									width={64}
									height={64}
									className="h-full w-full object-cover"
								/>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Tool Info */}
			<div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
				<div className="mb-4">
					<p className="text-sm font-medium text-neutral-500">
						{categoryLabels[tool.category] || tool.category}
					</p>
					<h1 className="mt-1 text-2xl font-semibold text-neutral-900">
						{tool.name}
					</h1>
					{(tool.brand || tool.model) && (
						<p className="mt-1 text-neutral-600">
							{[tool.brand, tool.model].filter(Boolean).join(" ")}
						</p>
					)}
				</div>

				<div className="flex flex-wrap gap-2">
					<span
						className={cn(
							"inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
							condition.color
						)}
					>
						{condition.label}
					</span>
					{statusLoading ? (
						<span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-500">
							Checking availability...
						</span>
					) : isCurrentlyBorrowed ? (
						<span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-600">
							Currently on loan{waitlistCount > 0 ? ` · ${waitlistCount} waiting` : ""}
						</span>
					) : existingRequest?.status === "pending" ? (
						<span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">
							Request pending
						</span>
					) : existingRequest?.status === "waitlisted" ? (
						<span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
							On waitlist
						</span>
					) : (
						<span className="inline-flex items-center rounded-full bg-[#FFCC00]/20 px-3 py-1 text-sm font-medium text-[#333333]">
							Available to borrow
						</span>
					)}
				</div>

				{tool.notes && (
					<div className="mt-4">
						<h2 className="text-sm font-medium text-neutral-700">Notes</h2>
						<p className="mt-1 whitespace-pre-wrap text-neutral-600">
							{tool.notes}
						</p>
					</div>
				)}

				{/* Owner info */}
				<div className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
						{friend.avatar_url ? (
							<img
								src={friend.avatar_url}
								alt={friend.display_name || "Buddy"}
								className="h-10 w-10 rounded-full object-cover"
							/>
						) : (
							<svg
								className="h-5 w-5 text-neutral-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
								/>
							</svg>
						)}
					</div>
					<div className="flex-1">
						<p className="text-sm font-medium text-neutral-900">
							Owned by {friend.display_name || "Buddy"}
						</p>
						<p className="text-xs text-neutral-500">
							{friend.location && <span>{friend.location}</span>}
							{friend.location && distance !== null && " · "}
							{distance !== null && <span>{formatDistance(distance)} away</span>}
							{!friend.location && distance === null && "Contact them to arrange borrowing"}
						</p>
					</div>
				</div>

				{/* Borrow Request Button */}
				<div className="mt-6">
					<BorrowRequestButton
						toolId={tool.id}
						toolName={tool.name}
						ownerId={friend.id}
						ownerName={friend.display_name}
					/>
				</div>
			</div>
		</AppShell>
	);
}
