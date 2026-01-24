import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Tool, ToolImage, TOOL_CATEGORIES, TOOL_CONDITIONS } from "@/types";

interface ToolCardProps {
	tool: Tool & { images: ToolImage[] };
	className?: string;
}

const categoryLabels: Record<string, string> = {
	"power-tools": "Power Tools",
	"hand-tools": "Hand Tools",
	"measuring": "Measuring",
	"electrical": "Electrical",
	"plumbing": "Plumbing",
	"automotive": "Automotive",
	"gardening": "Gardening",
	"safety": "Safety",
	"other": "Other",
};

const conditionLabels: Record<string, { label: string; color: string }> = {
	"excellent": { label: "Excellent", color: "text-green-600" },
	"good": { label: "Good", color: "text-blue-600" },
	"fair": { label: "Fair", color: "text-yellow-600" },
	"needs-repair": { label: "Needs Repair", color: "text-red-600" },
};

export function ToolCard({ tool, className }: ToolCardProps) {
	const primaryImage = tool.images?.find((img) => img.is_primary) || tool.images?.[0];
	const condition = conditionLabels[tool.condition] || conditionLabels["good"];

	return (
		<Link
			href={`/tools/${tool.id}`}
			className={cn(
				"block w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5",
				"transition-colors hover:bg-neutral-50 active:bg-neutral-100",
				"min-h-[48px]",
				className
			)}
		>
			<div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
				{primaryImage ? (
					<Image
						src={primaryImage.url}
						alt={tool.name}
						width={400}
						height={300}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<svg
							className="h-12 w-12 text-neutral-300"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
							/>
						</svg>
					</div>
				)}
			</div>

			<div className="mt-3">
				<p className="text-xs font-medium text-neutral-500">
					{categoryLabels[tool.category] || tool.category}
				</p>
				<h3 className="mt-0.5 text-lg font-semibold text-neutral-900 line-clamp-1">
					{tool.name}
				</h3>
				{(tool.brand || tool.model) && (
					<p className="text-sm text-neutral-600 line-clamp-1">
						{[tool.brand, tool.model].filter(Boolean).join(" ")}
					</p>
				)}
				<p className={cn("mt-1 flex items-center text-sm font-medium", condition.color)}>
					<span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-current" />
					{condition.label}
				</p>
			</div>
		</Link>
	);
}
