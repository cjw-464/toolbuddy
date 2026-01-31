"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { IncomingBorrowRequest } from "@/types";

interface IncomingRequestCardProps {
	request: IncomingBorrowRequest;
	onApprove: (requestId: string) => Promise<{ error: string | null }>;
	onDecline: (requestId: string) => Promise<{ error: string | null }>;
}

export function IncomingRequestCard({
	request,
	onApprove,
	onDecline,
}: IncomingRequestCardProps) {
	const [isApproving, setIsApproving] = useState(false);
	const [isDeclining, setIsDeclining] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const primaryImage =
		request.tool.images?.find((img) => img.is_primary) ||
		request.tool.images?.[0];

	const handleApprove = async () => {
		setIsApproving(true);
		setError(null);
		const { error } = await onApprove(request.id);
		if (error) {
			setError(error);
		}
		setIsApproving(false);
	};

	const handleDecline = async () => {
		setIsDeclining(true);
		setError(null);
		const { error } = await onDecline(request.id);
		if (error) {
			setError(error);
		}
		setIsDeclining(false);
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
				<div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100">
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
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-neutral-900 truncate">
						{request.tool.name}
					</h3>

					{/* Borrower info */}
					<Link
						href={`/friends/${request.borrower_id}`}
						className="mt-1 flex items-center gap-2 group"
					>
						<div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100">
							{request.borrower.avatar_url ? (
								<img
									src={request.borrower.avatar_url}
									alt={request.borrower.display_name || "User"}
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
							{request.borrower.display_name || request.borrower.email}
						</span>
					</Link>

					<p className="mt-1 text-xs text-neutral-500">
						Requested {formatDate(request.requested_at)}
					</p>
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

			{/* Actions */}
			{request.status === "pending" && (
				<div className="mt-4 flex gap-2">
					<Button
						variant="secondary"
						onClick={handleDecline}
						isLoading={isDeclining}
						disabled={isApproving}
						className="flex-1"
					>
						Decline
					</Button>
					<Button
						variant="primary"
						onClick={handleApprove}
						isLoading={isApproving}
						disabled={isDeclining}
						className="flex-1"
					>
						Approve
					</Button>
				</div>
			)}

			{/* Status badges for non-pending */}
			{request.status === "approved" && (
				<div className="mt-3">
					<span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
						Approved - Awaiting pickup
					</span>
				</div>
			)}

			{request.status === "active" && (
				<div className="mt-3">
					<span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
						Currently borrowed
					</span>
				</div>
			)}

			{request.status === "waitlisted" && (
				<div className="mt-3">
					<span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
						On waitlist
					</span>
				</div>
			)}
		</div>
	);
}
