"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Button } from "@/components/ui/Button";
import { AppShell } from "@/components/layout/AppShell";

export default function ProfilePage() {
	const { signOut } = useAuth();
	const { profile, loading, updateProfile, uploadAvatar } = useProfile();
	const [isEditing, setIsEditing] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);

	const handleSignOut = async () => {
		setIsSigningOut(true);
		await signOut();
	};

	const handleSave = async (data: { display_name: string; location: string; zip_code: string }) => {
		const result = await updateProfile(data);
		return result;
	};

	const handleUpload = async (file: File) => {
		const result = await uploadAvatar(file);
		return { error: result.error };
	};

	if (loading) {
		return (
			<AppShell>
				<div className="animate-pulse space-y-6">
					<div className="flex items-center justify-between">
						<div className="h-8 w-24 rounded bg-neutral-200" />
						<div className="h-10 w-16 rounded bg-neutral-200" />
					</div>
					<div className="flex flex-col items-center space-y-4 pt-4">
						<div className="h-24 w-24 rounded-full bg-neutral-200" />
						<div className="h-6 w-32 rounded bg-neutral-200" />
						<div className="h-4 w-48 rounded bg-neutral-200" />
					</div>
					<div className="grid grid-cols-3 gap-3 pt-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-20 rounded-xl bg-neutral-200" />
						))}
					</div>
				</div>
			</AppShell>
		);
	}

	if (!profile) {
		return (
			<AppShell>
				<div className="text-center">
					<h1 className="text-xl font-semibold text-neutral-900">
						Profile not found
					</h1>
					<p className="mt-2 text-neutral-600">
						Please try signing in again.
					</p>
				</div>
			</AppShell>
		);
	}

	return (
		<AppShell>
			{/* Header */}
			<header className="mb-8 flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-neutral-900">Profile</h1>
				{!isEditing && (
					<Button
						variant="secondary"
						onClick={() => setIsEditing(true)}
					>
						Edit
					</Button>
				)}
			</header>

			{/* Avatar Section */}
			<div className="mb-6">
				<AvatarUpload
					avatarUrl={profile.avatar_url}
					displayName={profile.display_name}
					isEditing={isEditing}
					onUpload={handleUpload}
				/>
			</div>

			{/* Profile Info / Edit Form */}
			{isEditing ? (
				<div className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
					<ProfileForm
						displayName={profile.display_name || ""}
						location={profile.location || ""}
						zipCode={profile.zip_code || ""}
						onSave={handleSave}
						onCancel={() => setIsEditing(false)}
					/>
				</div>
			) : (
				<div className="mb-8 text-center">
					<h2 className="text-xl font-semibold text-neutral-900">
						{profile.display_name || "No display name"}
					</h2>
					<p className="mt-1 text-neutral-500">{profile.email}</p>
					{(profile.location || profile.zip_code) && (
						<p className="mt-1 flex items-center justify-center text-neutral-600">
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
									d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
								/>
							</svg>
							{[profile.location, profile.zip_code].filter(Boolean).join(" ")}
						</p>
					)}
				</div>
			)}

			{/* Stats Section */}
			<div className="mb-8">
				<ProfileStats />
			</div>

			{/* Sign Out Button */}
			<div className="pt-4">
				<Button
					variant="secondary"
					onClick={handleSignOut}
					isLoading={isSigningOut}
					className="w-full text-red-600 hover:bg-red-50"
				>
					Sign Out
				</Button>
			</div>
		</AppShell>
	);
}
