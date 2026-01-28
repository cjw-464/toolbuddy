"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ActiveLoan } from "@/types";

interface BorrowedCardProps {
	loan: ActiveLoan;
}

export function BorrowedCard({ loan }: BorrowedCardProps) {
	const primaryImage =
		loan.tool.images?.find((img) => img.is_primary) || loan.tool.images?.[0];

	const formatDate = (dateString: string | null) => {
		if (!dateString) return null;
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	const getDuration = () => {
		const start = loan.picked_up_at || loan.responded_at || loan.requested_at;
		const startDate = new Date(start);
		const now = new Date();
		const days = Math.floor(
			(now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
		);
		if (days === 0) return "Today";
		if (days === 1) return "1 day";
		return `${days} days`;
	};

	return (
		<div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
			<div className="flex gap-4">
				{/* Tool Image */}
				<Link
					href={`/friends/${loan.lender_id}/tools/${loan.tool_id}`}
					className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100"
				>
					{primaryImage ? (
						<Image
							src={primaryImage.url}
							alt={loan.tool.name}
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
						href={`/friends/${loan.lender_id}/tools/${loan.tool_id}`}
						className="font-semibold text-neutral-900 hover:underline truncate block"
					>
						{loan.tool.name}
					</Link>

					{/* Lender info */}
					<div className="mt-1 flex items-center gap-2">
						<div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100">
							{loan.lender.avatar_url ? (
								<img
									src={loan.lender.avatar_url}
									alt={loan.lender.display_name || "User"}
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
						<span className="text-sm text-neutral-600 truncate">
							from {loan.lender.display_name || loan.lender.email}
						</span>
					</div>

					{/* Status & Duration */}
					<div className="mt-2 flex items-center gap-2">
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
								loan.status === "active"
									? "bg-blue-50 text-blue-700"
									: "bg-green-50 text-green-700"
							)}
						>
							{loan.status === "active" ? "In your possession" : "Ready for pickup"}
						</span>
						{loan.status === "active" && (
							<span className="text-xs text-neutral-500">{getDuration()}</span>
						)}
					</div>
				</div>
			</div>

			{/* Reminder for approved loans */}
			{loan.status === "approved" && (
				<div className="mt-3 rounded-lg bg-yellow-50 p-3">
					<p className="text-sm text-yellow-800">
						<span className="font-medium">Ready for pickup!</span> Contact{" "}
						{loan.lender.display_name || "the owner"} to arrange pickup.
					</p>
				</div>
			)}

			{/* Return reminder for active loans */}
			{loan.status === "active" && (
				<div className="mt-3 rounded-lg bg-neutral-50 p-3">
					<p className="text-sm text-neutral-600">
						Remember to return this tool when you&apos;re done.{" "}
						{loan.lender.display_name || "The owner"} will mark it as returned.
					</p>
				</div>
			)}
		</div>
	);
}
