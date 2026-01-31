"use client";

import { ReactNode } from "react";
import { UniversalSearch } from "@/components/search/UniversalSearch";
import { HamburgerMenu } from "@/components/layout/HamburgerMenu";
import { BottomNav } from "@/components/layout/BottomNav";

interface AppShellProps {
	children: ReactNode;
	showSearch?: boolean;
}

export function AppShell({ children, showSearch = true }: AppShellProps) {
	return (
		<main className="min-h-screen bg-neutral-50 px-5 py-8">
			{showSearch && (
				<div className="mb-6 flex items-start gap-3">
					<HamburgerMenu />
					<div className="flex-1">
						<UniversalSearch />
					</div>
				</div>
			)}
			{children}
			<BottomNav />
			<div className="h-24" />
		</main>
	);
}
