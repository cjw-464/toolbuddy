"use client";

import Link from "next/link";
import { usePendingFriendRequestCount } from "@/hooks/usePendingFriendRequestCount";

interface FriendRequestBadgeProps {
	className?: string;
}

export function FriendRequestBadge({ className }: FriendRequestBadgeProps) {
	const { count, loading, error } = usePendingFriendRequestCount();

	// Hide when loading, error, or count is 0
	if (loading || error || count === 0) {
		return null;
	}

	return (
		<Link
			href="/friends/requests"
			className={className}
			aria-label={`${count} pending friend request${count === 1 ? "" : "s"}`}
		>
			<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
				{count > 99 ? "99+" : count}
			</span>
		</Link>
	);
}
