"use client";

import { useState } from "react";
import Link from "next/link";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import { IncomingRequestCard } from "@/components/borrow/IncomingRequestCard";
import { OutgoingRequestCard } from "@/components/borrow/OutgoingRequestCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

type TabType = "incoming" | "outgoing";

export default function RequestsPage() {
	const [activeTab, setActiveTab] = useState<TabType>("incoming");

	const {
		incoming,
		outgoing,
		pendingIncomingCount,
		loading,
		error,
		approveRequest,
		declineRequest,
		cancelRequest,
		markAsPickedUp,
	} = useBorrowRequests();

	// Filter to show only pending for incoming, and pending/approved/active for outgoing
	const pendingIncoming = incoming.filter((r) => r.status === "pending");
	const activeIncoming = incoming.filter((r) => r.status === "approved" || r.status === "active");
	const pendingOutgoing = outgoing.filter((r) => r.status === "pending");
	const activeOutgoing = outgoing.filter((r) => r.status === "approved" || r.status === "active");

	return (
		<main className="min-h-screen bg-neutral-50 px-5 py-8">
			<header className="mb-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-semibold text-neutral-900">
							Borrow Requests
						</h1>
						<p className="mt-0.5 text-sm text-neutral-600">
							Manage your lending and borrowing
						</p>
					</div>
					<Link
						href="/loans"
						className="rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
					>
						Active Loans
					</Link>
				</div>
			</header>

			{/* Tabs */}
			<div className="mb-6 flex gap-2 rounded-xl bg-neutral-100 p-1">
				<button
					onClick={() => setActiveTab("incoming")}
					className={cn(
						"relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
						activeTab === "incoming"
							? "bg-white text-neutral-900 shadow-sm"
							: "text-neutral-600 hover:text-neutral-900"
					)}
				>
					Incoming
					{pendingIncomingCount > 0 && (
						<span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
							{pendingIncomingCount}
						</span>
					)}
				</button>
				<button
					onClick={() => setActiveTab("outgoing")}
					className={cn(
						"flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
						activeTab === "outgoing"
							? "bg-white text-neutral-900 shadow-sm"
							: "text-neutral-600 hover:text-neutral-900"
					)}
				>
					Outgoing
					{pendingOutgoing.length > 0 && (
						<span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-500 px-1.5 text-xs font-medium text-white">
							{pendingOutgoing.length}
						</span>
					)}
				</button>
			</div>

			{/* Loading State */}
			{loading && (
				<div className="space-y-4">
					{[...Array(3)].map((_, i) => (
						<div
							key={i}
							className="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
						>
							<div className="flex gap-4">
								<div className="h-20 w-20 rounded-xl bg-neutral-200" />
								<div className="flex-1 space-y-2">
									<div className="h-5 w-32 rounded bg-neutral-200" />
									<div className="h-4 w-24 rounded bg-neutral-200" />
									<div className="h-3 w-40 rounded bg-neutral-200" />
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Error State */}
			{error && !loading && (
				<div className="rounded-2xl bg-red-50 p-4 text-center text-red-600">
					{error}
				</div>
			)}

			{/* Incoming Tab */}
			{!loading && activeTab === "incoming" && (
				<div className="space-y-6">
					{/* Pending Requests */}
					{pendingIncoming.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-neutral-700">
								Pending Requests ({pendingIncoming.length})
							</h2>
							<div className="space-y-3">
								{pendingIncoming.map((request) => (
									<IncomingRequestCard
										key={request.id}
										request={request}
										onApprove={approveRequest}
										onDecline={declineRequest}
									/>
								))}
							</div>
						</section>
					)}

					{/* Active Loans (as lender) */}
					{activeIncoming.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-neutral-700">
								Active Loans ({activeIncoming.length})
							</h2>
							<div className="space-y-3">
								{activeIncoming.map((request) => (
									<IncomingRequestCard
										key={request.id}
										request={request}
										onApprove={approveRequest}
										onDecline={declineRequest}
									/>
								))}
							</div>
						</section>
					)}

					{/* Empty State */}
					{pendingIncoming.length === 0 && activeIncoming.length === 0 && (
						<div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
							<div className="mb-4 rounded-full bg-neutral-100 p-4">
								<svg
									className="h-12 w-12 text-neutral-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-neutral-900">
								No incoming requests
							</h3>
							<p className="mt-1 text-neutral-600">
								When friends request to borrow your tools, they&apos;ll appear here.
							</p>
						</div>
					)}
				</div>
			)}

			{/* Outgoing Tab */}
			{!loading && activeTab === "outgoing" && (
				<div className="space-y-6">
					{/* Pending Requests */}
					{pendingOutgoing.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-neutral-700">
								Awaiting Response ({pendingOutgoing.length})
							</h2>
							<div className="space-y-3">
								{pendingOutgoing.map((request) => (
									<OutgoingRequestCard
										key={request.id}
										request={request}
										onCancel={cancelRequest}
										onMarkPickedUp={markAsPickedUp}
									/>
								))}
							</div>
						</section>
					)}

					{/* Active Borrowing */}
					{activeOutgoing.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-neutral-700">
								Currently Borrowing ({activeOutgoing.length})
							</h2>
							<div className="space-y-3">
								{activeOutgoing.map((request) => (
									<OutgoingRequestCard
										key={request.id}
										request={request}
										onCancel={cancelRequest}
										onMarkPickedUp={markAsPickedUp}
									/>
								))}
							</div>
						</section>
					)}

					{/* Empty State */}
					{pendingOutgoing.length === 0 && activeOutgoing.length === 0 && (
						<div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
							<div className="mb-4 rounded-full bg-neutral-100 p-4">
								<svg
									className="h-12 w-12 text-neutral-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-neutral-900">
								No outgoing requests
							</h3>
							<p className="mt-1 text-neutral-600">
								Browse your friends&apos; tools and request to borrow.
							</p>
							<Link
								href="/friends"
								className="mt-4 text-sm font-medium text-[#FFCC00] hover:underline"
							>
								Browse available tools →
							</Link>
						</div>
					)}
				</div>
			)}

			<BottomNav />

			<div className="h-24" />
		</main>
	);
}
