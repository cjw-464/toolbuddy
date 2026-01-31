"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { OutgoingBorrowRequest } from "@/types";

interface OutgoingRequestCardProps {
	request: OutgoingBorrowRequest;
	onCancel: (requestId: string) => Promise<{ error: string | null }>;
	onMarkPickedUp: (requestId: string) => Promise<{ error: string | null }>;
	onCancelWaitlist?: (requestId: string) => Promise<{ error: string | null }>;
	waitlistPosition?: number;
	waitlistTotal?: number;
}

const statusConfig = {
	pending: {
		label: "Pending",
		description: "Waiting for response",
		color: "bg-yellow-50 text-yellow-700",
	},
	approved: {
		label: "Approved",
		description: "Ready for pickup",
		color: "bg-green-50 text-green-700",
	},
	active: {
		label: "Borrowed",
		description: "Currently in your possession",
		color: "bg-blue-50 text-blue-700",
	},
	declined: {
		label: "Declined",
		description: "Request was declined",
		color: "bg-red-50 text-red-700",
	},
	cancelled: {
		label: "Cancelled",
		description: "You cancelled this request",
		color: "bg-neutral-100 text-neutral-600",
	},
	returned: {
		label: "Returned",
		description: "Tool has been returned",
		color: "bg-neutral-100 text-neutral-600",
	},
	waitlisted: {
		label: "Waitlisted",
		description: "Waiting for tool to be available",
		color: "bg-purple-50 text-purple-700",
	},
};

export function OutgoingRequestCard({
	request,
	onCancel,
	onMarkPickedUp,
	onCancelWaitlist,
	waitlistPosition,
	waitlistTotal,
}: OutgoingRequestCardProps) {
	const [isCancelling, setIsCancelling] = useState(false);
	const [isMarkingPickedUp, setIsMarkingPickedUp] = useState(false);
	const [isLeavingWaitlist, setIsLeavingWaitlist] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const primaryImage =
		request.tool.images?.find((img) => img.is_primary) ||
		request.tool.images?.[0];

	const status = statusConfig[request.status] || statusConfig.pending;

	const handleCancel = async () => {
		setIsCancelling(true);
		setError(null);
		const { error } = await onCancel(request.id);
		if (error) {
			setError(error);
		}
		setIsCancelling(false);
	};

	const handleMarkPickedUp = async () => {
		setIsMarkingPickedUp(true);
		setError(null);
		const { error } = await onMarkPickedUp(request.id);
		if (error) {
			setError(error);
		}
		setIsMarkingPickedUp(false);
	};

	const handleLeaveWaitlist = async () => {
		if (!onCancelWaitlist) return;
		setIsLeavingWaitlist(true);
		setError(null);
		const { error } = await onCancelWaitlist(request.id);
		if (error) {
			setError(error);
		}
		setIsLeavingWaitlist(false);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	return (
		<div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
			<div className="flex gap-4">
				{/* Tool Image */}
				<Link
					href={`/friends/${request.lender_id}/tools/${request.tool_id}`}
					className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100"
				>
					{primaryImage ? (
						<Image
							src={primaryImage.url}
							alt={request.tool.name}
							width={80}
							height={80}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<svg
								className="h-8 w-8 text-neutral-300"
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
				</Link>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<Link
						href={`/friends/${request.lender_id}/tools/${request.tool_id}`}
						className="font-semibold text-neutral-900 hover:underline truncate block"
					>
						{request.tool.name}
					</Link>

					{/* Lender info */}
					<Link
						href={`/friends/${request.lender_id}`}
						className="mt-1 flex items-center gap-2 group"
					>
						<div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100">
							{request.lender.avatar_url ? (
								<img
									src={request.lender.avatar_url}
									alt={request.lender.display_name || "User"}
									className="h-5 w-5 rounded-full object-cover"
								/>
							) : (
								<svg
									className="h-3 w-3 text-neutral-400"
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
						<span className="text-sm text-neutral-600 truncate group-hover:underline">
							from {request.lender.display_name || request.lender.email}
						</span>
					</Link>

					<p className="mt-1 text-xs text-neutral-500">
						Requested {formatDate(request.requested_at)}
					</p>

					{/* Status badge */}
					<div className="mt-2 flex items-center gap-2 flex-wrap">
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
								status.color
							)}
						>
							{request.status === "waitlisted" && waitlistPosition
								? `#${waitlistPosition} on Waitlist`
								: status.label}
						</span>
						{/* Hot tool indicator */}
						{request.status === "waitlisted" && waitlistTotal && waitlistTotal > 1 && (
							<span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
								🔥 This tool&apos;s hot!
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Message */}
			{request.message && (
				<div className="mt-3 rounded-lg bg-neutral-50 p-3">
					<p className="text-sm text-neutral-600">&ldquo;{request.message}&rdquo;</p>
				</div>
			)}

			{error && (
				<div className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">
					{error}
				</div>
			)}

			{/* Actions based on status */}
			{request.status === "pending" && (
				<div className="mt-4">
					<Button
						variant="secondary"
						onClick={handleCancel}
						isLoading={isCancelling}
						className="w-full"
					>
						Cancel Request
					</Button>
				</div>
			)}

			{request.status === "approved" && (
				<div className="mt-4">
					<Button
						variant="primary"
						onClick={handleMarkPickedUp}
						isLoading={isMarkingPickedUp}
						className="w-full"
					>
						I&apos;ve Picked It Up
					</Button>
					<p className="mt-2 text-center text-xs text-neutral-500">
						Mark as picked up once you have the tool
					</p>
				</div>
			)}

			{request.status === "waitlisted" && onCancelWaitlist && (
				<div className="mt-4">
					<Button
						variant="secondary"
						onClick={handleLeaveWaitlist}
						isLoading={isLeavingWaitlist}
						className="w-full"
					>
						Leave Waitlist
					</Button>
					<p className="mt-2 text-center text-xs text-neutral-500">
						You&apos;ll be notified when the tool becomes available
					</p>
				</div>
			)}
		</div>
	);
}
