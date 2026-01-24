import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ label, error, className, id, ...props }, ref) => {
		const textareaId = id || props.name;

		return (
			<div className="w-full">
				{label && (
					<label
						htmlFor={textareaId}
						className="mb-1.5 block text-sm font-medium text-neutral-700"
					>
						{label}
					</label>
				)}
				<textarea
					ref={ref}
					id={textareaId}
					className={cn(
						"w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-neutral-900",
						"placeholder:text-neutral-400",
						"focus:border-[#FFCC00] focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50",
						"disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500",
						"resize-none",
						error && "border-red-500 focus:border-red-500 focus:ring-red-500/50",
						className
					)}
					rows={4}
					{...props}
				/>
				{error && (
					<p className="mt-1.5 text-sm text-red-600">{error}</p>
				)}
			</div>
		);
	}
);

Textarea.displayName = "Textarea";
