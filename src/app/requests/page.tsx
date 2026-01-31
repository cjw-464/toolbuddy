"use client";

import { useState } from "react";
import Link from "next/link";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import { IncomingRequestCard } from "@/components/borrow/IncomingRequestCard";
import { OutgoingRequestCard } from "@/components/borrow/OutgoingRequestCard";
import { LentOutCard } from "@/components/borrow/LentOutCard";
import { BorrowedCard } from "@/components/borrow/BorrowedCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

type TabType = "lent-out" | "borrowed";

export default function RequestsPage() {
	const [activeTab, setActiveTab] = useState<TabType>("lent-out");

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
		cancelWaitlist,
		getWaitlistInfo,
		confirmPickup,
		confirmReturn,
	} = useBorrowRequests();

	// Filter requests by status
	// Lent Out tab (user is lender)
	const pendingLentOut = incoming.filter((r) => r.status === "pending");
	const activeLentOut = incoming.filter((r) => r.status === "approved" || r.status === "active");
	const waitlistedLentOut = incoming.filter((r) => r.status === "waitlisted");

	// Borrowed tab (user is borrower)
	const pendingBorrowed = outgoing.filter((r) => r.status === "pending");
	const activeBorrowed = outgoing.filter((r) => r.status === "approved" || r.status === "active");
	const waitlistedBorrowed = outgoing.filter((r) => r.status === "waitlisted");

	// Handlers for lender confirmations
	const handleLenderConfirmPickup = async (requestId: string) => {
		return confirmPickup(requestId, "lender");
	};

	const handleLenderConfirmReturn = async (requestId: string) => {
		return confirmReturn(requestId, "lender");
	};

	// Handlers for borrower confirmations
	const handleBorrowerConfirmPickup = async (requestId: string) => {
		return confirmPickup(requestId, "borrower");
	};

	const handleBorrowerConfirmReturn = async (requestId: string) => {
		return confirmReturn(requestId, "borrower");
	};

	return (
		<main className="min-h-screen bg-neutral-50 px-5 py-8">
			<header className="mb-6">
				<h1 className="text-2xl font-semibold text-neutral-900">
					Handshakes
				</h1>
				<p className="mt-0.5 text-sm text-neutral-600">
					Manage your lending and borrowing
				</p>
			</header>

			{/* Tabs */}
			<div className="mb-6 flex gap-2 rounded-xl bg-neutral-100 p-1">
				<button
					onClick={() => setActiveTab("lent-out")}
					className={cn(
						"relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
						activeTab === "lent-out"
							? "bg-white text-neutral-900 shadow-sm"
							: "text-neutral-600 hover:text-neutral-900"
					)}
				>
					Lent Out
					{pendingIncomingCount > 0 && (
						<span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
							{pendingIncomingCount}
						</span>
					)}
				</button>
				<button
					onClick={() => setActiveTab("borrowed")}
					className={cn(
						"flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
						activeTab === "borrowed"
							? "bg-white text-neutral-900 shadow-sm"
							: "text-neutral-600 hover:text-neutral-900"
					)}
				>
					Borrowed
					{pendingBorrowed.length > 0 && (
						<span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-500 px-1.5 text-xs font-medium text-white">
							{pendingBorrowed.length}
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

			{/* Lent Out Tab */}
			{!loading && activeTab === "lent-out" && (
				<div className="space-y-6">
					{/* Pending Requests */}
					{pendingLentOut.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-neutral-700">
								Pending Requests ({pendingLentOut.length})
							</h2>
							<div className="space-y-3">
								{pendingLentOut.map((request) => (
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
					{activeLentOut.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-neutral-700">
								Active Loans ({activeLentOut.length})
							</h2>
							<div className="space-y-3">
								{activeLentOut.map((request) => (
									<LentOutCard
										key={request.id}
										loan={request}
										onConfirmPickup={handleLenderConfirmPickup}
										onConfirmReturn={handleLenderConfirmReturn}
									/>
								))}
							</div>
						</section>
					)}

					{/* Waitlist */}
					{waitlistedLentOut.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-neutral-700">
								Waitlist ({waitlistedLentOut.length})
							</h2>
							<div className="space-y-3">
								{waitlistedLentOut.map((request) => (
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
					{pendingLentOut.length === 0 && activeLentOut.length === 0 && waitlistedLentOut.length === 0 && (
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
								Nothing lent out
							</h3>
							<p className="mt-1 text-neutral-600">
								When buddies request to borrow your tools, they&apos;ll appear here.
							</p>
						</div>
					)}
				</div>
			)}

			{/* Borrowed Tab */}
			{!loading && activeTab === "borrowed" && (
				<div className="space-y-6">
					{/* Pending Requests */}
					{pendingBorrowed.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-neutral-700">
								Awaiting Response ({pendingBorrowed.length})
							</h2>
							<div className="space-y-3">
								{pendingBorrowed.map((request) => (
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

					{/* Active Loans (as borrower) */}
					{activeBorrowed.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-neutral-700">
								Currently Borrowing ({activeBorrowed.length})
							</h2>
							<div className="space-y-3">
								{activeBorrowed.map((request) => (
									<BorrowedCard
										key={request.id}
										loan={request}
										onConfirmPickup={handleBorrowerConfirmPickup}
										onConfirmReturn={handleBorrowerConfirmReturn}
									/>
								))}
							</div>
						</section>
					)}

					{/* Waitlisted */}
					{waitlistedBorrowed.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-neutral-700">
								On Waitlist ({waitlistedBorrowed.length})
							</h2>
							<div className="space-y-3">
								{waitlistedBorrowed.map((request) => {
									const waitlistInfo = getWaitlistInfo(request.id);
									return (
										<OutgoingRequestCard
											key={request.id}
											request={request}
											onCancel={cancelRequest}
											onMarkPickedUp={markAsPickedUp}
											onCancelWaitlist={cancelWaitlist}
											waitlistPosition={waitlistInfo.position}
											waitlistTotal={waitlistInfo.total}
										/>
									);
								})}
							</div>
						</section>
					)}

					{/* Empty State */}
					{pendingBorrowed.length === 0 && activeBorrowed.length === 0 && waitlistedBorrowed.length === 0 && (
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
								Nothing borrowed
							</h3>
							<p className="mt-1 text-neutral-600">
								Browse your buddies&apos; tools and request to borrow.
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
