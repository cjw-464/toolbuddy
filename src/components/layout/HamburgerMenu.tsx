"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FriendRequestBadge } from "@/components/friends/FriendRequestBadge";
import { BorrowRequestBadge } from "@/components/borrow/BorrowRequestBadge";

const navItems = [
	{ href: "/", label: "Home", emoji: "🏠" },
	{ href: "/tools", label: "Toolbox", emoji: "🧰" },
	{ href: "/friends", label: "Buddies", emoji: "👥", badge: "friends" },
	{ href: "/requests", label: "Handshakes", emoji: "🤝", badge: "borrow" },
	{ href: "/profile", label: "Profile", emoji: "👤" },
];

export function HamburgerMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	return (
		<>
			{/* Hamburger Button */}
			<button
				onClick={() => setIsOpen(true)}
				className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
				aria-label="Open menu"
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
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>

			{/* Backdrop */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 transition-opacity"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Slide-out Menu */}
			<div
				className={cn(
					"fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl transition-transform duration-300 ease-in-out",
					isOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
					<h2 className="text-lg font-semibold text-neutral-900">Menu</h2>
					<button
						onClick={() => setIsOpen(false)}
						className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
						aria-label="Close menu"
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
				</div>

				{/* Navigation Links */}
				<nav className="px-3 py-4">
					<ul className="space-y-1">
						{navItems.map((item) => {
							const isActive =
								pathname === item.href ||
								(item.href !== "/" && pathname.startsWith(item.href + "/"));

							return (
								<li key={item.href}>
									<Link
										href={item.href}
										onClick={() => setIsOpen(false)}
										className={cn(
											"flex items-center gap-3 rounded-xl px-4 py-3 text-base transition-colors",
											isActive
												? "bg-[#FFCC00]/20 font-medium text-neutral-900"
												: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
										)}
									>
										<span className="text-xl">{item.emoji}</span>
										<span className="flex-1">{item.label}</span>
										{item.badge === "friends" && <FriendRequestBadge />}
										{item.badge === "borrow" && <BorrowRequestBadge />}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				{/* Footer */}
				<div className="absolute bottom-0 left-0 right-0 border-t border-neutral-100 px-5 py-4">
					<p className="text-center text-xs text-neutral-400">
						ToolBuddy
					</p>
				</div>
			</div>
		</>
	);
}
