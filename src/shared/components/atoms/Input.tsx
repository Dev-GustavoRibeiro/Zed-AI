'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"
import { LucideIcon } from "lucide-react"

const inputVariants = cva(
  "flex w-full rounded-xl bg-slate-900/50 text-slate-100 transition-all duration-200 placeholder:text-slate-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: [
          "border border-white/10",
          "focus:border-blue-500/50",
          "focus:ring-2 focus:ring-blue-500/20",
        ],
        ghost: [
          "border-transparent",
          "bg-white/5",
          "focus:bg-white/10",
        ],
        filled: [
          "border-transparent",
          "bg-slate-800/80",
          "focus:bg-slate-800",
          "focus:ring-2 focus:ring-blue-500/20",
        ],
      },
      inputSize: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  error?: string
  label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    inputSize, 
    type = "text",
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    error,
    label,
    id,
    ...props 
  }, ref) => {
    const inputId = id || React.useId()

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <LeftIcon className="h-4 w-4" />
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ variant, inputSize, className }),
              LeftIcon && "pl-10",
              RightIcon && "pr-10",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
            )}
            ref={ref}
            {...props}
          />
          {RightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              <RightIcon className="h-4 w-4" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }

