"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useTools } from "@/hooks/useTools";
import { useAllFriendsTools } from "@/hooks/useAllFriendsTools";
import { useFriends } from "@/hooks/useFriends";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { formatDistance } from "@/lib/distance";

interface LoanInfo {
	tool_id: string;
	borrower_name: string | null;
}

interface MyRequestInfo {
	tool_id: string;
	status: string;
}

export function UniversalSearch() {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [myToolsLoans, setMyToolsLoans] = useState<Map<string, LoanInfo>>(new Map());
	const [myRequests, setMyRequests] = useState<Map<string, MyRequestInfo>>(new Map());

	const { user } = useAuth();
	const { profile } = useProfile();

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(searchQuery);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	const isSearching = debouncedQuery.length > 0;

	// Search hooks
	const { tools: myTools, loading: myToolsLoading } = useTools({
		search: debouncedQuery,
	});

	const { tools: availableTools, loading: availableToolsLoading } = useAllFriendsTools({
		search: debouncedQuery,
		userLatitude: profile?.latitude,
		userLongitude: profile?.longitude,
	});

	const { friends, loading: friendsLoading } = useFriends();

	// Fetch loan status for my tools
	const fetchMyToolsLoans = useCallback(async () => {
		if (!user || myTools.length === 0) {
			setMyToolsLoans(new Map());
			return;
		}

		const supabase = createClient();
		const toolIds = myTools.map((t) => t.id);

		const { data: activeLoans } = await supabase
			.from("borrow_requests")
			.select("tool_id, borrower:profiles!borrow_requests_borrower_id_fkey(display_name, email)")
			.in("tool_id", toolIds)
			.in("status", ["approved", "active"]);

		const loanMap = new Map<string, LoanInfo>();
		(activeLoans || []).forEach((loan) => {
			const borrower = Array.isArray(loan.borrower) ? loan.borrower[0] : loan.borrower;
			loanMap.set(loan.tool_id, {
				tool_id: loan.tool_id,
				borrower_name: borrower?.display_name || borrower?.email || null,
			});
		});

		setMyToolsLoans(loanMap);
	}, [user, myTools]);

	useEffect(() => {
		if (isSearching && myTools.length > 0) {
			fetchMyToolsLoans();
		}
	}, [isSearching, myTools, fetchMyToolsLoans]);

	// Fetch my request status for available tools (to show if I'm on waitlist)
	const fetchMyRequests = useCallback(async () => {
		if (!user || availableTools.length === 0) {
			setMyRequests(new Map());
			return;
		}

		const supabase = createClient();
		const toolIds = availableTools.map((t) => t.id);

		const { data: requests } = await supabase
			.from("borrow_requests")
			.select("tool_id, status")
			.eq("borrower_id", user.id)
			.in("tool_id", toolIds)
			.in("status", ["pending", "waitlisted", "approved"]);

		const requestMap = new Map<string, MyRequestInfo>();
		(requests || []).forEach((req) => {
			requestMap.set(req.tool_id, {
				tool_id: req.tool_id,
				status: req.status,
			});
		});

		setMyRequests(requestMap);
	}, [user, availableTools]);

	useEffect(() => {
		if (isSearching && availableTools.length > 0) {
			fetchMyRequests();
		}
	}, [isSearching, availableTools, fetchMyRequests]);

	// Filter buddies client-side
	const filteredBuddies = useMemo(() => {
		if (!debouncedQuery) return [];
		const query = debouncedQuery.toLowerCase();
		return friends.filter(
			(friend) =>
				friend.display_name?.toLowerCase().includes(query) ||
				friend.email?.toLowerCase().includes(query) ||
				friend.location?.toLowerCase().includes(query)
		);
	}, [friends, debouncedQuery]);

	const loading = myToolsLoading || availableToolsLoading || friendsLoading;
	const hasResults = myTools.length > 0 || availableTools.length > 0 || filteredBuddies.length > 0;

	return (
		<div>
			{/* Search Input */}
			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
					<svg
						className="h-5 w-5 text-neutral-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
				<Input
					type="search"
					placeholder="Search tools or buddies..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
				{searchQuery && (
					<button
						onClick={() => setSearchQuery("")}
						className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600"
					>
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				)}
			</div>

			{/* Search Results */}
			{isSearching && (
				<div className="mt-4 space-y-4">
					{loading ? (
						<div className="space-y-3">
							{[...Array(3)].map((_, i) => (
								<div
									key={i}
									className="animate-pulse rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5"
								>
									<div className="flex items-center gap-3">
										<div className="h-12 w-12 rounded-lg bg-neutral-200" />
										<div className="flex-1 space-y-2">
											<div className="h-4 w-32 rounded bg-neutral-200" />
											<div className="h-3 w-24 rounded bg-neutral-200" />
										</div>
									</div>
								</div>
							))}
						</div>
					) : !hasResults ? (
						<div className="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
							<p className="text-neutral-600">
								No results found for &quot;{debouncedQuery}&quot;
							</p>
						</div>
					) : (
						<>
							{/* My Tools Results */}
							{myTools.length > 0 && (
								<section>
									<h3 className="mb-2 text-sm font-medium text-neutral-700">
										🧰 My Tools ({myTools.length})
									</h3>
									<div className="space-y-2">
										{myTools.slice(0, 3).map((tool) => {
											const primaryImage = tool.images?.find((img) => img.is_primary) || tool.images?.[0];
											const loan = myToolsLoans.get(tool.id);
											const isLentOut = !!loan;

											return (
												<Link
													key={tool.id}
													href={`/tools/${tool.id}`}
													className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-neutral-50"
												>
													<div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
														{primaryImage ? (
															<Image
																src={primaryImage.url}
																alt={tool.name}
																width={48}
																height={48}
																className="h-full w-full object-cover"
															/>
														) : (
															<div className="flex h-full w-full items-center justify-center">
																<svg className="h-6 w-6 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
																</svg>
															</div>
														)}
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<p className="font-medium text-neutral-900 truncate">{tool.name}</p>
															{isLentOut && (
																<span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 whitespace-nowrap">
																	Lent to {loan.borrower_name || "someone"}
																</span>
															)}
														</div>
														<p className="text-sm text-neutral-500 truncate">
															{tool.brand && `${tool.brand} · `}{tool.category}
														</p>
													</div>
													<svg className="h-5 w-5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
													</svg>
												</Link>
											);
										})}
										{myTools.length > 3 && (
											<Link
												href={`/tools?search=${encodeURIComponent(debouncedQuery)}`}
												className="block text-center text-sm font-medium text-[#FFCC00] hover:underline"
											>
												View all {myTools.length} results →
											</Link>
										)}
									</div>
								</section>
							)}

							{/* Available Tools Results */}
							{availableTools.length > 0 && (
								<section>
									<h3 className="mb-2 text-sm font-medium text-neutral-700">
										🔧 Available from Buddies ({availableTools.length})
									</h3>
									<div className="space-y-2">
										{availableTools.slice(0, 3).map((tool) => {
											const primaryImage = tool.images?.find((img) => img.is_primary) || tool.images?.[0];
											const isOnLoan = tool.is_on_loan;
											const waitlistCount = tool.waitlist_count || 0;
											const myRequest = myRequests.get(tool.id);
											const imOnWaitlist = myRequest?.status === "waitlisted";
											const myRequestPending = myRequest?.status === "pending";
											const myRequestApproved = myRequest?.status === "approved";

											return (
												<Link
													key={tool.id}
													href={`/friends/${tool.owner_id}/tools/${tool.id}`}
													className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-neutral-50"
												>
													{/* Tool image */}
													<div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
														{primaryImage ? (
															<Image
																src={primaryImage.url}
																alt={tool.name}
																width={48}
																height={48}
																className="h-full w-full object-cover"
															/>
														) : (
															<div className="flex h-full w-full items-center justify-center">
																<svg className="h-6 w-6 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
																</svg>
															</div>
														)}
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 flex-wrap">
															<p className="font-medium text-neutral-900 truncate">{tool.name}</p>
															{/* Show user's request status first if they have one */}
															{imOnWaitlist ? (
																<span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 whitespace-nowrap">
																	You're on waitlist
																</span>
															) : myRequestPending ? (
																<span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 whitespace-nowrap">
																	Request pending
																</span>
															) : myRequestApproved ? (
																<span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 whitespace-nowrap">
																	Ready for pickup
																</span>
															) : isOnLoan ? (
																<span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 whitespace-nowrap">
																	On Loan
																</span>
															) : (
																<span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 whitespace-nowrap">
																	Available
																</span>
															)}
															{/* Show waitlist count if there are others waiting (and user isn't the only one) */}
															{waitlistCount > 0 && !imOnWaitlist && (
																<span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 whitespace-nowrap">
																	{waitlistCount} waiting
																</span>
															)}
														</div>
														{/* Buddy avatar, name and distance */}
														<div className="flex items-center gap-1.5 mt-0.5">
															<div className="h-5 w-5 flex-shrink-0 overflow-hidden rounded-full bg-neutral-200">
																{tool.owner_avatar ? (
																	<img
																		src={tool.owner_avatar}
																		alt={tool.owner_name || "Buddy"}
																		className="h-full w-full object-cover"
																	/>
																) : (
																	<div className="flex h-full w-full items-center justify-center">
																		<svg className="h-3 w-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
																		</svg>
																	</div>
																)}
															</div>
															<span className="text-sm text-neutral-500 truncate">
																{tool.owner_name || "Buddy"}
															</span>
															{tool.distance !== null && tool.distance !== undefined && (
																<span className="text-sm text-neutral-400 whitespace-nowrap flex-shrink-0">
																	· {formatDistance(tool.distance)}
																</span>
															)}
														</div>
													</div>
													<svg className="h-5 w-5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
													</svg>
												</Link>
											);
										})}
										{availableTools.length > 3 && (
											<Link
												href="/tools?tab=available"
												className="block text-center text-sm font-medium text-[#FFCC00] hover:underline"
											>
												View all {availableTools.length} results →
											</Link>
										)}
									</div>
								</section>
							)}

							{/* Buddies Results */}
							{filteredBuddies.length > 0 && (
								<section>
									<h3 className="mb-2 text-sm font-medium text-neutral-700">
										👥 Buddies ({filteredBuddies.length})
									</h3>
									<div className="space-y-2">
										{filteredBuddies.slice(0, 3).map((buddy) => (
											<Link
												key={buddy.id}
												href={`/friends/${buddy.id}`}
												className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-neutral-50"
											>
												<div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-neutral-100">
													{buddy.avatar_url ? (
														<img
															src={buddy.avatar_url}
															alt={buddy.display_name || "Buddy"}
															className="h-full w-full object-cover"
														/>
													) : (
														<div className="flex h-full w-full items-center justify-center">
															<svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
															</svg>
														</div>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-neutral-900 truncate">
														{buddy.display_name || buddy.email}
													</p>
													<p className="text-sm text-neutral-500 truncate">
														{buddy.location && `${buddy.location} · `}
														{buddy.lendable_tools_count || 0} tools available
													</p>
												</div>
												<svg className="h-5 w-5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
												</svg>
											</Link>
										))}
										{filteredBuddies.length > 3 && (
											<Link
												href="/friends"
												className="block text-center text-sm font-medium text-[#FFCC00] hover:underline"
											>
												View all {filteredBuddies.length} buddies →
											</Link>
										)}
									</div>
								</section>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
}
