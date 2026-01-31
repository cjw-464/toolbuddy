"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/distance";
import type { FriendTool } from "@/types";

interface FriendToolCardProps {
	tool: FriendTool;
	className?: string;
}

const categoryLabels: Record<string, string> = {
	"power-tools": "Power Tools",
	"hand-tools": "Hand Tools",
	measuring: "Measuring",
	electrical: "Electrical",
	plumbing: "Plumbing",
	automotive: "Automotive",
	gardening: "Gardening",
	safety: "Safety",
	other: "Other",
};

const conditionLabels: Record<string, { label: string; color: string }> = {
	excellent: { label: "Excellent", color: "text-green-600" },
	good: { label: "Good", color: "text-blue-600" },
	fair: { label: "Fair", color: "text-yellow-600" },
	"needs-repair": { label: "Needs Repair", color: "text-red-600" },
};

export function FriendToolCard({ tool, className }: FriendToolCardProps) {
	const primaryImage =
		tool.images?.find((img) => img.is_primary) || tool.images?.[0];
	const condition = conditionLabels[tool.condition] || conditionLabels["good"];

	return (
		<Link
			href={`/friends/${tool.owner_id}/tools/${tool.id}`}
			className={cn(
				"block w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5",
				"transition-colors hover:bg-neutral-50 active:bg-neutral-100",
				"min-h-[48px]",
				className
			)}
		>
			<div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
				{primaryImage ? (
					<Image
						src={primaryImage.url}
						alt={tool.name}
						width={400}
						height={300}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<svg
							className="h-12 w-12 text-neutral-300"
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

			<div className="mt-3">
				<div className="flex items-center justify-between gap-2">
					<p className="text-xs font-medium text-neutral-500">
						{categoryLabels[tool.category] || tool.category}
					</p>
					{tool.is_on_loan ? (
						<span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
							On loan
						</span>
					) : (
						<span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
							Available
						</span>
					)}
				</div>
				<h3 className="mt-0.5 text-lg font-semibold text-neutral-900 line-clamp-1">
					{tool.name}
				</h3>
				{(tool.brand || tool.model) && (
					<p className="text-sm text-neutral-600 line-clamp-1">
						{[tool.brand, tool.model].filter(Boolean).join(" ")}
					</p>
				)}
				<p
					className={cn(
						"mt-1 flex items-center text-sm font-medium",
						condition.color
					)}
				>
					<span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-current" />
					{condition.label}
				</p>
				{tool.waitlist_count && tool.waitlist_count > 0 ? (
					<p className="mt-1 text-xs text-neutral-500">
						{tool.waitlist_count} {tool.waitlist_count === 1 ? "person" : "people"} waiting
					</p>
				) : null}

				{/* Owner info */}
				<div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
					<div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
						{tool.owner_avatar ? (
							<img
								src={tool.owner_avatar}
								alt={tool.owner_name || "Owner"}
								className="h-6 w-6 rounded-full object-cover"
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
					<span className="text-xs text-neutral-500 truncate flex-1">
						{tool.owner_name || "Buddy"}
					</span>
					{tool.distance !== null && tool.distance !== undefined && (
						<span className="text-xs font-medium text-neutral-600">
							{formatDistance(tool.distance)}
						</span>
					)}
				</div>
			</div>
		</Link>
	);
}
