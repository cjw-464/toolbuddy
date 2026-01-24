import Link from "next/link";
import { cn } from "@/lib/utils";

interface CardProps {
	label: string;
	title: string;
	description: string;
	href?: string;
	onClick?: () => void;
	className?: string;
}

export function Card({ label, title, description, href, onClick, className }: CardProps) {
	const cardClassName = cn(
		"w-full rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5",
		"transition-colors hover:bg-neutral-50 active:bg-neutral-100",
		className
	);

	const content = (
		<>
			<div className="text-sm text-neutral-500">{label}</div>
			<div className="mt-1 text-xl font-medium text-neutral-900">{title}</div>
			<div className="mt-2 text-neutral-600">{description}</div>
		</>
	);

	if (href) {
		return (
			<Link href={href} className={cn(cardClassName, "block")}>
				{content}
			</Link>
		);
	}

	return (
		<button onClick={onClick} className={cardClassName}>
			{content}
		</button>
	);
}
