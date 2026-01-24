import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
	primary: "bg-[#FFCC00] text-[#333333] hover:bg-[#E6B800] active:bg-[#CCa300]",
	secondary:
		"bg-white text-[#333333] border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100",
	ghost: "bg-transparent text-[#333333] hover:bg-neutral-100 active:bg-neutral-200",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant = "primary", isLoading, className, children, disabled, ...props }, ref) => {
		return (
			<button
				ref={ref}
				disabled={disabled || isLoading}
				className={cn(
					"inline-flex items-center justify-center rounded-lg px-4 py-2.5 font-medium",
					"transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50 focus:ring-offset-2",
					"disabled:cursor-not-allowed disabled:opacity-50",
					variantStyles[variant],
					className
				)}
				{...props}
			>
				{isLoading ? (
					<>
						<svg
							className="mr-2 h-4 w-4 animate-spin"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Loading...
					</>
				) : (
					children
				)}
			</button>
		);
	}
);

Button.displayName = "Button";
