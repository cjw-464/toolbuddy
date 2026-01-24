import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
	options: SelectOption[];
	placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ label, error, options, placeholder, className, id, value, ...props }, ref) => {
		const selectId = id || props.name;

		return (
			<div className="w-full">
				{label && (
					<label
						htmlFor={selectId}
						className="mb-1.5 block text-sm font-medium text-neutral-700"
					>
						{label}
					</label>
				)}
				<select
					ref={ref}
					id={selectId}
					value={value}
					className={cn(
						"w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-neutral-900",
						"focus:border-[#FFCC00] focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50",
						"disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500",
						!value && "text-neutral-400",
						error && "border-red-500 focus:border-red-500 focus:ring-red-500/50",
						className
					)}
					{...props}
				>
					{placeholder && (
						<option value="" disabled>
							{placeholder}
						</option>
					)}
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				{error && (
					<p className="mt-1.5 text-sm text-red-600">{error}</p>
				)}
			</div>
		);
	}
);

Select.displayName = "Select";
