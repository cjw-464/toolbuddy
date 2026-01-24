import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, className, id, ...props }, ref) => {
		const inputId = id || props.name;

		return (
			<div className="w-full">
				{label && (
					<label
						htmlFor={inputId}
						className="mb-1.5 block text-sm font-medium text-neutral-700"
					>
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={inputId}
					className={cn(
						"w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-neutral-900",
						"placeholder:text-neutral-400",
						"focus:border-[#FFCC00] focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50",
						"disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500",
						error && "border-red-500 focus:border-red-500 focus:ring-red-500/50",
						className
					)}
					{...props}
				/>
				{error && (
					<p className="mt-1.5 text-sm text-red-600">{error}</p>
				)}
			</div>
		);
	}
);

Input.displayName = "Input";
