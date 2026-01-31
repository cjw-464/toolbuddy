"use client";

import { useState } from "react";
import Link from "next/link";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { FriendRequestCard } from "@/components/friends/FriendRequestCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

type Tab = "received" | "sent";

export default function FriendRequestsPage() {
	const [activeTab, setActiveTab] = useState<Tab>("received");
	const {
		incoming,
		outgoing,
		loading,
		acceptRequest,
		declineRequest,
		cancelRequest,
	} = useFriendRequests();

	const requests = activeTab === "received" ? incoming : outgoing;

	return (
		<main className="min-h-screen bg-neutral-50 px-5 py-8">
			<header className="mb-6">
				<Link
					href="/friends"
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
					Back to buddies
				</Link>
				<h1 className="text-2xl font-semibold text-neutral-900">
					Buddy Requests
				</h1>
			</header>

			{/* Tabs */}
			<div className="mb-6 flex gap-2">
				<button
					onClick={() => setActiveTab("received")}
					className={cn(
						"flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
						activeTab === "received"
							? "bg-[#FFCC00] text-[#333333]"
							: "bg-white text-neutral-600 ring-1 ring-black/5 hover:bg-neutral-50"
					)}
				>
					Received
					{incoming.length > 0 && (
						<span className="ml-1.5 rounded-full bg-black/10 px-2 py-0.5 text-xs">
							{incoming.length}
						</span>
					)}
				</button>
				<button
					onClick={() => setActiveTab("sent")}
					className={cn(
						"flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
						activeTab === "sent"
							? "bg-[#FFCC00] text-[#333333]"
							: "bg-white text-neutral-600 ring-1 ring-black/5 hover:bg-neutral-50"
					)}
				>
					Sent
					{outgoing.length > 0 && (
						<span className="ml-1.5 rounded-full bg-black/10 px-2 py-0.5 text-xs">
							{outgoing.length}
						</span>
					)}
				</button>
			</div>

			{/* Request List */}
			{loading ? (
				<div className="space-y-3">
					{[...Array(2)].map((_, i) => (
						<div
							key={i}
							className="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
						>
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 rounded-full bg-neutral-200" />
								<div className="flex-1 space-y-2">
									<div className="h-4 w-32 rounded bg-neutral-200" />
									<div className="h-3 w-48 rounded bg-neutral-200" />
								</div>
							</div>
							<div className="mt-4 flex gap-3">
								<div className="h-10 flex-1 rounded-lg bg-neutral-200" />
								<div className="h-10 flex-1 rounded-lg bg-neutral-200" />
							</div>
						</div>
					))}
				</div>
			) : requests.length === 0 ? (
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
								d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-neutral-900">
						No {activeTab === "received" ? "incoming" : "sent"} requests
					</h3>
					<p className="mt-1 text-neutral-600">
						{activeTab === "received"
							? "When someone sends you a buddy request, it will appear here."
							: "Buddy requests you send will appear here until accepted."}
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{requests.map((request) => (
						<FriendRequestCard
							key={request.friendship_id}
							user={request}
							type={activeTab === "received" ? "incoming" : "outgoing"}
							onAccept={activeTab === "received" ? acceptRequest : undefined}
							onDecline={activeTab === "received" ? declineRequest : undefined}
							onCancel={activeTab === "sent" ? cancelRequest : undefined}
						/>
					))}
				</div>
			)}

			<BottomNav />

			<div className="h-24" />
		</main>
	);
}
