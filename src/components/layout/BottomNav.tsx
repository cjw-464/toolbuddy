"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FriendRequestBadge } from "@/components/friends/FriendRequestBadge";
import { BorrowRequestBadge } from "@/components/borrow/BorrowRequestBadge";

const navItems = [
	{ href: "/tools", label: "My Tools" },
	{ href: "/friends", label: "Friends", badge: "friends" },
	{ href: "/requests", label: "Requests", badge: "borrow" },
	{ href: "/profile", label: "Profile" },
];

export function BottomNav() {
	const pathname = usePathname();

	return (
		<nav className="fixed inset-x-0 bottom-0 border-t border-black/5 bg-white/90 backdrop-blur">
			<div className="mx-auto flex max-w-md items-center justify-around px-6 py-4">
				{navItems.map((item) => {
					const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

					return (
						<div key={item.href} className="relative flex items-center gap-1">
							<Link
								href={item.href}
								className={cn(
									"text-sm transition-colors",
									isActive
										? "font-medium text-neutral-900"
										: "text-neutral-500 hover:text-neutral-700"
								)}
							>
								{item.label}
							</Link>
							{item.badge === "friends" && <FriendRequestBadge />}
							{item.badge === "borrow" && <BorrowRequestBadge />}
						</div>
					);
				})}
			</div>
		</nav>
	);
}
