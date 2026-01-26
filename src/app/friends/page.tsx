"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useFriends } from "@/hooks/useFriends";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useProfile } from "@/hooks/useProfile";
import { FriendCard } from "@/components/friends/FriendCard";
import { UserSearchResult } from "@/components/friends/UserSearchResult";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/layout/BottomNav";

export default function FriendsPage() {
	const { profile } = useProfile();
	const { friends, loading: friendsLoading } = useFriends();
	const { incomingCount } = useFriendRequests();
	const { results, loading: searchLoading, search, sendRequest, clearResults } = useUserSearch();

	const userCoordinates = profile?.latitude && profile?.longitude
		? { latitude: profile.latitude, longitude: profile.longitude }
		: null;

	const [searchQuery, setSearchQuery] = useState("");
	const [isSearching, setIsSearching] = useState(false);

	// Debounced search
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

	return (
		<main className="min-h-screen bg-neutral-50 px-5 py-8">
			<header className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-neutral-900">Friends</h1>
					<p className="mt-1 text-sm text-neutral-600">
						{friends.length} {friends.length === 1 ? "friend" : "friends"}
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

			{/* Search */}
			<div className="mb-6 relative">
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
								<FriendCard key={friend.id} friend={friend} userCoordinates={userCoordinates} />
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
