import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		console.error("Missing Supabase env vars:", {
			hasUrl: !!supabaseUrl,
			hasKey: !!supabaseAnonKey,
		});
		// Return a dummy client that won't crash but won't work either
		// This prevents the app from crashing on pages that don't need auth
		return createBrowserClient(
			"https://placeholder.supabase.co",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU1MjI4MDAsImV4cCI6MTk2MTA5ODgwMH0.placeholder"
		);
	}

	return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
