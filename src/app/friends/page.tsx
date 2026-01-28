"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useFriends } from "@/hooks/useFriends";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useAllFriendsTools, type SortOption } from "@/hooks/useAllFriendsTools";
import { useProfile } from "@/hooks/useProfile";
import { FriendCard } from "@/components/friends/FriendCard";
import { FriendToolCard } from "@/components/friends/FriendToolCard";
import { UserSearchResult } from "@/components/friends/UserSearchResult";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";
import { TOOL_CATEGORIES, type ToolCategory } from "@/types";

type TabType = "friends" | "tools";

export default function FriendsPage() {
	const { profile } = useProfile();
	const { friends, loading: friendsLoading } = useFriends();
	const { incomingCount } = useFriendRequests();
	const {
		results,
		loading: searchLoading,
		search,
		sendRequest,
		clearResults,
	} = useUserSearch();

	const userCoordinates =
		profile?.latitude && profile?.longitude
			? { latitude: profile.latitude, longitude: profile.longitude }
			: null;

	const [activeTab, setActiveTab] = useState<TabType>("friends");
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearching, setIsSearching] = useState(false);

	// Tool search state
	const [toolSearch, setToolSearch] = useState("");
	const [toolCategory, setToolCategory] = useState<ToolCategory | "">("");
	const [toolSort, setToolSort] = useState<SortOption>("distance");
	const [debouncedToolSearch, setDebouncedToolSearch] = useState("");

	const { tools, loading: toolsLoading } = useAllFriendsTools({
		search: debouncedToolSearch,
		category: toolCategory,
		sortBy: toolSort,
		userLatitude: profile?.latitude,
		userLongitude: profile?.longitude,
	});

	// Debounce tool search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedToolSearch(toolSearch);
		}, 300);
		return () => clearTimeout(timer);
	}, [toolSearch]);

	// Debounced user search
	useEffect(() => {
		if (!searchQuery) {
			clearResults();
			setIsSearching(false);
			return;
		}

		setIsSearching(true);
		const timer = setTimeout(() => {
			search(searchQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery, search, clearResults]);

	const handleClearSearch = useCallback(() => {
		setSearchQuery("");
		clearResults();
		setIsSearching(false);
	}, [clearResults]);

	const categoryOptions = [
		{ value: "", label: "All Categories" },
		...TOOL_CATEGORIES,
	];

	const sortOptions = [
		{ value: "distance", label: "Nearest" },
		{ value: "recent", label: "Most Recent" },
		{ value: "name", label: "Name A-Z" },
	];

	return (
		<main className="min-h-screen bg-neutral-50 px-5 py-8">
			<header className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-neutral-900">Friends</h1>
					<p className="mt-1 text-sm text-neutral-600">
						{friends.length} {friends.length === 1 ? "friend" : "friends"}
						{tools.length > 0 && ` · ${tools.length} tools available`}
					</p>
				</div>
				<Link href="/friends/requests">
					<Button variant="secondary" className="relative">
						Requests
						{incomingCount > 0 && (
							<span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
								{incomingCount}
							</span>
						)}
					</Button>
				</Link>
			</header>

			{/* Tabs */}
			<div className="mb-6 flex gap-2 rounded-xl bg-neutral-100 p-1">
				<button
					onClick={() => setActiveTab("friends")}
					className={cn(
						"flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
						activeTab === "friends"
							? "bg-white text-neutral-900 shadow-sm"
							: "text-neutral-600 hover:text-neutral-900"
					)}
				>
					Friends
				</button>
				<button
					onClick={() => setActiveTab("tools")}
					className={cn(
						"flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
						activeTab === "tools"
							? "bg-white text-neutral-900 shadow-sm"
							: "text-neutral-600 hover:text-neutral-900"
					)}
				>
					Available Tools
				</button>
			</div>

			{/* Friends Tab */}
			{activeTab === "friends" && (
				<>
					{/* User Search */}
					<div className="relative mb-6">
						<Input
							type="search"
							placeholder="Search users by name or email..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && (
							<button
								onClick={handleClearSearch}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
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
						<div className="mb-6">
							<h2 className="mb-3 text-sm font-medium text-neutral-700">
								Search Results
							</h2>
							{searchLoading ? (
								<div className="space-y-3">
									{[...Array(3)].map((_, i) => (
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
										</div>
									))}
								</div>
							) : results.length === 0 ? (
								<div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
									<p className="text-neutral-600">
										No users found matching &quot;{searchQuery}&quot;
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{results.map((user) => (
										<UserSearchResult
											key={user.id}
											user={user}
											onSendRequest={sendRequest}
										/>
									))}
								</div>
							)}
						</div>
					)}

					{/* Friends List */}
					{!isSearching && (
						<>
							{friendsLoading ? (
								<div className="space-y-3">
									{[...Array(3)].map((_, i) => (
										<div
											key={i}
											className="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
										>
											<div className="flex items-center gap-4">
												<div className="h-12 w-12 rounded-full bg-neutral-200" />
												<div className="flex-1 space-y-2">
													<div className="h-4 w-32 rounded bg-neutral-200" />
													<div className="h-3 w-24 rounded bg-neutral-200" />
												</div>
											</div>
										</div>
									))}
								</div>
							) : friends.length === 0 ? (
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
												d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
											/>
										</svg>
									</div>
									<h3 className="text-lg font-semibold text-neutral-900">
										No friends yet
									</h3>
									<p className="mt-1 text-neutral-600">
										Search for users above to add friends.
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{friends.map((friend) => (
										<FriendCard
											key={friend.id}
											friend={friend}
											userCoordinates={userCoordinates}
										/>
									))}
								</div>
							)}
						</>
					)}
				</>
			)}

			{/* Available Tools Tab */}
			{activeTab === "tools" && (
				<>
					{/* Tool Filters */}
					<div className="mb-6 space-y-3">
						<Input
							type="search"
							placeholder="Search tools..."
							value={toolSearch}
							onChange={(e) => setToolSearch(e.target.value)}
							className="w-full"
						/>
						<div className="flex gap-3">
							<div className="flex-1">
								<Select
									options={categoryOptions}
									value={toolCategory}
									onChange={(e) =>
										setToolCategory(e.target.value as ToolCategory | "")
									}
								/>
							</div>
							<div className="flex-1">
								<Select
									options={sortOptions}
									value={toolSort}
									onChange={(e) => setToolSort(e.target.value as SortOption)}
								/>
							</div>
						</div>
					</div>

					{/* Tools Grid */}
					{toolsLoading ? (
						<div className="grid grid-cols-2 gap-4">
							{[...Array(4)].map((_, i) => (
								<div
									key={i}
									className="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
								>
									<div className="aspect-[4/3] rounded-xl bg-neutral-200" />
									<div className="mt-3 space-y-2">
										<div className="h-3 w-16 rounded bg-neutral-200" />
										<div className="h-5 w-24 rounded bg-neutral-200" />
										<div className="h-3 w-20 rounded bg-neutral-200" />
									</div>
								</div>
							))}
						</div>
					) : tools.length === 0 ? (
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
										d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-neutral-900">
								{friends.length === 0
									? "No friends yet"
									: "No tools available"}
							</h3>
							<p className="mt-1 text-neutral-600">
								{friends.length === 0
									? "Add friends to see their lendable tools."
									: toolSearch || toolCategory
									? "Try adjusting your search or filters."
									: "None of your friends have lendable tools yet."}
							</p>
						</div>
					) : (
						<div className="grid grid-cols-2 gap-4">
							{tools.map((tool) => (
								<FriendToolCard key={tool.id} tool={tool} />
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
