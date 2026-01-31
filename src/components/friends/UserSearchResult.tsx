"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { FriendProfile } from "@/types";

interface UserSearchResultProps {
	user: FriendProfile;
	onSendRequest: (userId: string) => Promise<{ error: string | null }>;
	className?: string;
}

export function UserSearchResult({
	user,
	onSendRequest,
	className,
}: UserSearchResultProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSendRequest = async () => {
		setLoading(true);
		setError(null);
		const result = await onSendRequest(user.id);
		if (result.error) {
			setError(result.error);
		}
		setLoading(false);
	};

	const getStatusButton = () => {
		if (user.friendship_status === "accepted") {
			return (
				<span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600">
					Friends
				</span>
			);
		}

		if (user.friendship_status === "pending") {
			if (user.i_requested) {
				return (
					<span className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-600">
						Pending
					</span>
				);
			}
			return (
				<span className="rounded-full bg-[#FFCC00]/20 px-3 py-1.5 text-sm font-medium text-[#333333]">
					Respond
				</span>
			);
		}

		if (user.friendship_status === "blocked") {
			return null;
		}

		return (
			<Button
				onClick={handleSendRequest}
				isLoading={loading}
				className="text-sm"
			>
				Add Friend
			</Button>
		);
	};

	return (
		<div
			className={cn(
				"flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5",
				className
			)}
		>
			<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100">
				{user.avatar_url ? (
					<img
						src={user.avatar_url}
						alt={user.display_name || "User"}
						className="h-12 w-12 rounded-full object-cover"
					/>
				) : (
					<svg
						className="h-6 w-6 text-neutral-400"
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

			<div className="flex-1 min-w-0">
				<h3 className="font-medium text-neutral-900 truncate">
					{user.display_name || user.email}
				</h3>
				{user.display_name && <p className="text-sm text-neutral-500 truncate">{user.email}</p>}
				{error && <p className="text-sm text-red-600 mt-1">{error}</p>}
			</div>

			{getStatusButton()}
		</div>
	);
}
