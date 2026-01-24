"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { FriendProfile } from "@/types";

interface FriendRequestCardProps {
	user: FriendProfile & { friendship_id: string };
	type: "incoming" | "outgoing";
	onAccept?: (friendshipId: string) => Promise<{ error: string | null }>;
	onDecline?: (friendshipId: string) => Promise<{ error: string | null }>;
	onCancel?: (friendshipId: string) => Promise<{ error: string | null }>;
	className?: string;
}

export function FriendRequestCard({
	user,
	type,
	onAccept,
	onDecline,
	onCancel,
	className,
}: FriendRequestCardProps) {
	const [loading, setLoading] = useState<"accept" | "decline" | "cancel" | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleAccept = async () => {
		if (!onAccept) return;
		setLoading("accept");
		setError(null);
		const result = await onAccept(user.friendship_id);
		if (result.error) {
			setError(result.error);
		}
		setLoading(null);
	};

	const handleDecline = async () => {
		if (!onDecline) return;
		setLoading("decline");
		setError(null);
		const result = await onDecline(user.friendship_id);
		if (result.error) {
			setError(result.error);
		}
		setLoading(null);
	};

	const handleCancel = async () => {
		if (!onCancel) return;
		setLoading("cancel");
		setError(null);
		const result = await onCancel(user.friendship_id);
		if (result.error) {
			setError(result.error);
		}
		setLoading(null);
	};

	return (
		<div
			className={cn(
				"rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5",
				className
			)}
		>
			<div className="flex items-center gap-4">
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
						{user.display_name || "No name"}
					</h3>
					<p className="text-sm text-neutral-500 truncate">
						{type === "incoming"
							? "Wants to be your friend"
							: "Friend request sent"}
					</p>
				</div>
			</div>

			{error && (
				<p className="mt-2 text-sm text-red-600">{error}</p>
			)}

			<div className="mt-4 flex gap-3">
				{type === "incoming" ? (
					<>
						<Button
							variant="secondary"
							onClick={handleDecline}
							isLoading={loading === "decline"}
							disabled={loading !== null}
							className="flex-1"
						>
							Decline
						</Button>
						<Button
							onClick={handleAccept}
							isLoading={loading === "accept"}
							disabled={loading !== null}
							className="flex-1"
						>
							Accept
						</Button>
					</>
				) : (
					<Button
						variant="secondary"
						onClick={handleCancel}
						isLoading={loading === "cancel"}
						className="flex-1"
					>
						Cancel Request
					</Button>
				)}
			</div>
		</div>
	);
}
