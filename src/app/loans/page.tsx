"use client";

import { useState } from "react";
import Link from "next/link";
import { useLoans } from "@/hooks/useLoans";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import { LentOutCard } from "@/components/borrow/LentOutCard";
import { BorrowedCard } from "@/components/borrow/BorrowedCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

type TabType = "lent" | "borrowed";

export default function LoansPage() {
	const [activeTab, setActiveTab] = useState<TabType>("lent");

	const { lentOut, borrowed, lentOutCount, borrowedCount, loading, error } =
		useLoans();
	const { markAsReturned } = useBorrowRequests();

	return (
		<main className="min-h-screen bg-neutral-50 px-5 py-8">
			<header className="mb-6">
				<div className="flex items-center gap-3">
					<Link
						href="/requests"
						className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
					>
						<svg
							className="h-5 w-5 text-neutral-600"
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
					</Link>
					<div>
						<h1 className="text-2xl font-semibold text-neutral-900">
							Active Loans
						</h1>
						<p className="mt-0.5 text-sm text-neutral-600">
							{lentOutCount + borrowedCount} active{" "}
							{lentOutCount + borrowedCount === 1 ? "loan" : "loans"}
						</p>
					</div>
				</div>
			</header>

			{/* Tabs */}
			<div className="mb-6 flex gap-2 rounded-xl bg-neutral-100 p-1">
				<button
					onClick={() => setActiveTab("lent")}
					className={cn(
						"relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
						activeTab === "lent"
							? "bg-white text-neutral-900 shadow-sm"
							: "text-neutral-600 hover:text-neutral-900"
					)}
				>
					Lent Out
					{lentOutCount > 0 && (
						<span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-medium text-white">
							{lentOutCount}
						</span>
					)}
				</button>
				<button
					onClick={() => setActiveTab("borrowed")}
					className={cn(
						"relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
						activeTab === "borrowed"
							? "bg-white text-neutral-900 shadow-sm"
							: "text-neutral-600 hover:text-neutral-900"
					)}
				>
					Borrowed
					{borrowedCount > 0 && (
						<span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-green-500 px-1.5 text-xs font-medium text-white">
							{borrowedCount}
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
									<div className="h-3 w-16 rounded bg-neutral-200" />
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
			{!loading && activeTab === "lent" && (
				<>
					{lentOut.length === 0 ? (
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
								No tools lent out
							</h3>
							<p className="mt-1 text-neutral-600">
								When friends borrow your tools, they&apos;ll appear here.
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{lentOut.map((loan) => (
								<LentOutCard
									key={loan.id}
									loan={loan}
									onMarkReturned={markAsReturned}
								/>
							))}
						</div>
					)}
				</>
			)}

			{/* Borrowed Tab */}
			{!loading && activeTab === "borrowed" && (
				<>
					{borrowed.length === 0 ? (
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
								Not borrowing anything
							</h3>
							<p className="mt-1 text-neutral-600">
								Tools you&apos;re currently borrowing will appear here.
							</p>
							<Link
								href="/friends"
								className="mt-4 text-sm font-medium text-[#FFCC00] hover:underline"
							>
								Browse available tools →
							</Link>
						</div>
					) : (
						<div className="space-y-4">
							{borrowed.map((loan) => (
								<BorrowedCard key={loan.id} loan={loan} />
							))}
						</div>
					)}
				</>
			)}

			<BottomNav />

			<div className="h-24" />
		</main>
	);
}
