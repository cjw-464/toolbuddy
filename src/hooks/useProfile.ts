"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
	id: string;
	email: string;
	display_name: string | null;
	avatar_url: string | null;
	location: string | null;
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

		const { error } = await supabase
			.from("profiles")
			.update(updates)
			.eq("id", user.id);

		if (error) {
			return { error: error.message };
		}

		setProfile((prev) => (prev ? { ...prev, ...updates } : null));
		return { error: null };
	};

	return { profile, loading: loading || authLoading, error, updateProfile };
}
