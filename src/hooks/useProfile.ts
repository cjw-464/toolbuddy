"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import { getCoordinatesFromZip } from "@/lib/distance";

export interface Profile {
	id: string;
	email: string;
	display_name: string | null;
	avatar_url: string | null;
	location: string | null;
	zip_code: string | null;
	latitude: number | null;
	longitude: number | null;
	created_at: string;
}

export function useProfile() {
	const { user, loading: authLoading } = useAuth();
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (authLoading) return;

		if (!user) {
			setProfile(null);
			setLoading(false);
			return;
		}

		const fetchProfile = async () => {
			const supabase = createClient();

			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.single();

			if (error) {
				setError(error.message);
			} else {
				setProfile(data);
			}
			setLoading(false);
		};

		fetchProfile();
	}, [user, authLoading]);

	const updateProfile = async (updates: Partial<Omit<Profile, "id" | "email" | "created_at">>) => {
		if (!user) return { error: "Not authenticated" };

		const supabase = createClient();

		// If zip_code is being updated, look up coordinates
		let finalUpdates = { ...updates };
		if (updates.zip_code && updates.zip_code !== profile?.zip_code) {
			const coords = await getCoordinatesFromZip(updates.zip_code);
			if (coords) {
				finalUpdates = {
					...finalUpdates,
					latitude: coords.latitude,
					longitude: coords.longitude,
				};
			}
		}

		const { error } = await supabase
			.from("profiles")
			.update(finalUpdates)
			.eq("id", user.id);

		if (error) {
			return { error: error.message };
		}

		setProfile((prev) => (prev ? { ...prev, ...finalUpdates } : null));
		return { error: null };
	};

	const uploadAvatar = async (file: File) => {
		if (!user) return { error: "Not authenticated" };

		// Validate file type
		const validTypes = ["image/jpeg", "image/png", "image/webp"];
		if (!validTypes.includes(file.type)) {
			return { error: "Invalid file type. Please use JPEG, PNG, or WebP." };
		}

		// Validate file size (2MB max)
		if (file.size > 2 * 1024 * 1024) {
			return { error: "File too large. Maximum size is 2MB." };
		}

		const supabase = createClient();

		// Get file extension - path starts with userId to match storage policy
		const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
		const filePath = `${user.id}/avatar/avatar.${ext}`;

		// Upload to tool-images bucket (reusing existing bucket) with upsert to replace existing
		const { error: uploadError } = await supabase.storage
			.from("tool-images")
			.upload(filePath, file, {
				upsert: true,
				contentType: file.type,
			});

		if (uploadError) {
			return { error: uploadError.message };
		}

		// Get public URL
		const { data: { publicUrl } } = supabase.storage
			.from("tool-images")
			.getPublicUrl(filePath);

		// Add cache buster to URL to ensure fresh image
		const avatarUrl = `${publicUrl}?t=${Date.now()}`;

		// Update profile with new avatar URL
		const { error: updateError } = await supabase
			.from("profiles")
			.update({ avatar_url: avatarUrl })
			.eq("id", user.id);

		if (updateError) {
			return { error: updateError.message };
		}

		setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null));
		return { error: null, avatarUrl };
	};

	return { profile, loading: loading || authLoading, error, updateProfile, uploadAvatar };
}
