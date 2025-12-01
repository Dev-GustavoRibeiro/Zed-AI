'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/shared/lib/utils"

const cardVariants = cva(
  "relative overflow-hidden rounded-2xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-br from-[#0A101F]/95 to-[#111827]/90",
          "border border-white/8",
          "shadow-lg",
          "hover:border-white/15",
          "hover:shadow-xl",
        ],
        glass: [
          "glass",
          "border border-white/10",
          "shadow-lg",
        ],
        elevated: [
          "bg-gradient-to-br from-slate-800/90 to-slate-900/90",
          "border border-white/10",
          "shadow-2xl shadow-black/20",
        ],
        ghost: [
          "bg-white/5",
          "border border-transparent",
          "hover:bg-white/8",
        ],
        gold: [
          "bg-gradient-to-br from-amber-500/10 to-yellow-600/5",
          "border border-amber-500/20",
          "shadow-lg shadow-amber-500/5",
          "hover:border-amber-400/30",
        ],
        blue: [
          "bg-gradient-to-br from-blue-500/10 to-blue-600/5",
          "border border-blue-500/20",
          "shadow-lg shadow-blue-500/5",
          "hover:border-blue-400/30",
        ],
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        default: "p-4 sm:p-5",
        lg: "p-6 sm:p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface CardProps
  extends Omit<HTMLMotionProps<"div">, "ref">,
    VariantProps<typeof cardVariants> {
  animated?: boolean
  hoverEffect?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, animated = false, hoverEffect = true, children, ...props }, ref) => {
    const content = (
      <>
        {children}
        {/* Subtle accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-blue-500/20 via-transparent to-transparent opacity-60" />
      </>
    )

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cn(cardVariants({ variant, padding, className }))}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
          whileHover={hoverEffect ? { y: -2, scale: 1.01 } : undefined}
          {...props}
        >
          {content}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {content}
      </div>
    )
  }
)
Card.displayName = "Card"

// Card Header
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  action?: React.ReactNode
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, icon, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="shrink-0 p-2 rounded-xl bg-white/5 border border-white/10">
              {icon}
            </div>
          )}
          <div className="min-w-0">{children}</div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )
  }
)
CardHeader.displayName = "CardHeader"

// Card Title
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-bold text-white truncate", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// Card Description
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// Card Content
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative z-10", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

// Card Footer
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between gap-4 border-t border-white/10 pt-4 mt-4",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants }


