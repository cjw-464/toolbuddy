"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useTool } from "@/hooks/useTool";
import { ToolForm } from "@/components/tools/ToolForm";
import { Button } from "@/components/ui/Button";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

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
	"excellent": { label: "Excellent", color: "text-green-600 bg-green-50" },
	"good": { label: "Good", color: "text-blue-600 bg-blue-50" },
	"fair": { label: "Fair", color: "text-yellow-600 bg-yellow-50" },
	"needs-repair": { label: "Needs Repair", color: "text-red-600 bg-red-50" },
};

export default function ToolDetailPage() {
	const router = useRouter();
	const params = useParams();
	const toolId = params.id as string;

	const { tool, loading, error, deleteTool } = useTool(toolId);
	const [isEditing, setIsEditing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [selectedImage, setSelectedImage] = useState(0);
	const [activeLoan, setActiveLoan] = useState<{ borrower: User; status: string; picked_up_at: string | null } | null>(null);
	const [waitlistCount, setWaitlistCount] = useState(0);

	// Check if tool is currently loaned out and get waitlist count
	const checkActiveLoan = useCallback(async () => {
		if (!toolId) return;

		const supabase = createClient();

		const { data } = await supabase
			.from("borrow_requests")
			.select("*, borrower:profiles!borrow_requests_borrower_id_fkey(*)")
			.eq("tool_id", toolId)
			.in("status", ["approved", "active"])
			.single();

		if (data) {
			setActiveLoan({
				borrower: data.borrower,
				status: data.status,
				picked_up_at: data.picked_up_at,
			});
		} else {
			setActiveLoan(null);
		}

		// Get waitlist count
		const { count } = await supabase
			.from("borrow_requests")
			.select("*", { count: "exact", head: true })
			.eq("tool_id", toolId)
			.eq("status", "waitlisted");

		setWaitlistCount(count || 0);
	}, [toolId]);

	useEffect(() => {
		checkActiveLoan();
	}, [checkActiveLoan]);

	const handleDelete = async () => {
		setIsDeleting(true);
		const result = await deleteTool(toolId);
		if (result.error) {
			setIsDeleting(false);
			setShowDeleteConfirm(false);
		} else {
			router.push("/tools");
		}
	};

	if (loading) {
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

	if (error || !tool) {
		return (
			<AppShell>
				<div className="text-center">
					<h1 className="text-xl font-semibold text-neutral-900">Tool not found</h1>
					<p className="mt-2 text-neutral-600">
						This tool may have been deleted or you don&apos;t have access to it.
					</p>
					<Link href="/tools" className="mt-4 inline-block">
						<Button>Back to tools</Button>
					</Link>
				</div>
			</AppShell>
		);
	}

	if (isEditing) {
		return (
			<AppShell>
				<header className="mb-6">
					<button
						onClick={() => setIsEditing(false)}
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
						Cancel editing
					</button>
					<h1 className="text-2xl font-semibold text-neutral-900">Edit Tool</h1>
				</header>

				<div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
					<ToolForm tool={tool} mode="edit" onEditSuccess={() => setIsEditing(false)} />
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
					href="/tools"
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
					Back to tools
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
					{activeLoan ? (
						<span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
							{activeLoan.status === "active" ? "Loaned to" : "Approved for"}{" "}
							{activeLoan.borrower.display_name || activeLoan.borrower.email}
						</span>
					) : tool.is_lendable ? (
						<span className="inline-flex items-center rounded-full bg-[#FFCC00]/20 px-3 py-1 text-sm font-medium text-[#333333]">
							Available to lend
						</span>
					) : null}
					{waitlistCount > 0 && (
						<span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
							{waitlistCount} on waitlist
						</span>
					)}
				</div>

				{tool.notes && (
					<div className="mt-4">
						<h2 className="text-sm font-medium text-neutral-700">Notes</h2>
						<p className="mt-1 text-neutral-600 whitespace-pre-wrap">{tool.notes}</p>
					</div>
				)}

				<div className="mt-6 flex gap-3">
					<Button
						variant="secondary"
						onClick={() => setIsEditing(true)}
						className="flex-1"
					>
						Edit
					</Button>
					<Button
						variant="secondary"
						onClick={() => setShowDeleteConfirm(true)}
						className="flex-1 text-red-600 hover:bg-red-50"
					>
						Delete
					</Button>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
					<div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
						<h2 className="text-lg font-semibold text-neutral-900">
							Delete this tool?
						</h2>
						<p className="mt-2 text-neutral-600">
							This action cannot be undone. The tool and all its photos will be
							permanently deleted.
						</p>
						<div className="mt-4 flex gap-3">
							<Button
								variant="secondary"
								onClick={() => setShowDeleteConfirm(false)}
								disabled={isDeleting}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								onClick={handleDelete}
								isLoading={isDeleting}
								className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800"
							>
								Delete
							</Button>
						</div>
					</div>
				</div>
			)}
		</AppShell>
	);
}
