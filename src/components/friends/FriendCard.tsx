import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FriendProfile } from "@/types";

interface FriendCardProps {
	friend: FriendProfile;
	className?: string;
}

export function FriendCard({ friend, className }: FriendCardProps) {
	return (
		<Link
			href={`/friends/${friend.id}`}
			className={cn(
				"flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5",
				"transition-colors hover:bg-neutral-50 active:bg-neutral-100",
				"min-h-[48px]",
				className
			)}
		>
			<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100">
				{friend.avatar_url ? (
					<img
						src={friend.avatar_url}
						alt={friend.display_name || "Friend"}
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
					{friend.display_name || friend.email}
				</h3>
				{friend.location && (
					<p className="text-sm text-neutral-500 truncate">{friend.location}</p>
				)}
				<p className="text-sm text-neutral-600">
					{friend.lendable_tools_count || 0} tools available
				</p>
			</div>

			<svg
				className="h-5 w-5 flex-shrink-0 text-neutral-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M9 5l7 7-7 7"
				/>
			</svg>
		</Link>
	);
}
