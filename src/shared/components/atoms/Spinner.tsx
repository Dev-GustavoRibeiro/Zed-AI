'use client'

import * as React from "react"
import { cn } from "@/shared/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg" | "xl"
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  default: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-3",
  xl: "h-12 w-12 border-4",
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full",
          "border-blue-500/30 border-t-blue-500",
          sizeMap[size],
          className
        )}
        {...props}
      />
    )
  }
)
Spinner.displayName = "Spinner"

export { Spinner }


