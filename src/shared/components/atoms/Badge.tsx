'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        default: [
          "bg-blue-500/15",
          "text-blue-300",
          "border border-blue-500/30",
        ],
        secondary: [
          "bg-slate-500/15",
          "text-slate-300",
          "border border-slate-500/30",
        ],
        gold: [
          "bg-amber-500/15",
          "text-amber-300",
          "border border-amber-500/30",
        ],
        success: [
          "bg-emerald-500/15",
          "text-emerald-300",
          "border border-emerald-500/30",
        ],
        warning: [
          "bg-amber-500/15",
          "text-amber-300",
          "border border-amber-500/30",
        ],
        destructive: [
          "bg-red-500/15",
          "text-red-300",
          "border border-red-500/30",
        ],
        info: [
          "bg-cyan-500/15",
          "text-cyan-300",
          "border border-cyan-500/30",
        ],
        outline: [
          "border border-white/20",
          "text-white/70",
        ],
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {icon}
        {children}
      </span>
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }


