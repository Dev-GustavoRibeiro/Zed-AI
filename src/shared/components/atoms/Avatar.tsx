'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"
import { User } from "lucide-react"

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border transition-all duration-200",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        default: "h-10 w-10 text-base",
        lg: "h-12 w-12 text-lg",
        xl: "h-16 w-16 text-xl",
        "2xl": "h-20 w-20 text-2xl",
      },
      variant: {
        default: "border-white/10",
        blue: "border-blue-500/30 shadow-lg shadow-blue-500/20",
        gold: "border-amber-500/30 shadow-lg shadow-amber-500/20",
        silver: "border-slate-400/30 shadow-lg shadow-slate-400/10",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  isOnline?: boolean
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, variant, src, alt, fallback, isOnline, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)

    const getInitials = (name?: string) => {
      if (!name) return ''
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, variant, className }), "relative")}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || "Avatar"}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : fallback ? (
          <span className="font-semibold text-slate-300">
            {getInitials(fallback)}
          </span>
        ) : (
          <User className="h-1/2 w-1/2 text-slate-400" />
        )}
        
        {isOnline && (
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar, avatarVariants }

