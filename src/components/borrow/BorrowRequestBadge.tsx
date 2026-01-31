"use client";

import Link from "next/link";
import { usePendingBorrowRequestCount } from "@/hooks/usePendingBorrowRequestCount";

interface BorrowRequestBadgeProps {
	className?: string;
}

export function BorrowRequestBadge({ className }: BorrowRequestBadgeProps) {
	const { count, loading, error } = usePendingBorrowRequestCount();

	// Hide when loading, error, or count is 0
	if (loading || error || count === 0) {
		return null;
	}

	return (
		<Link
			href="/requests"
			className={className}
			aria-label={`${count} pending handshake${count === 1 ? "" : "s"}`}
		>
			<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFCC00] px-1.5 text-xs font-medium text-[#333333]">
				{count > 99 ? "99+" : count}
			</span>
		</Link>
	);
}
