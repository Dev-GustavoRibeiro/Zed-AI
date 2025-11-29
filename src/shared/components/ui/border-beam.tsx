"use client"

import { motion, Transition } from "framer-motion"
import type { CSSProperties } from "react"

import { cn } from "@/shared/lib/utils"

interface BorderBeamProps {
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
  transition?: Transition
  className?: string
  style?: CSSProperties
  reverse?: boolean
  initialOffset?: number
  borderWidth?: number
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#3b82f6",
  colorTo = "#f59e0b",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) => {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
      style={
        {
          borderWidth: `${borderWidth}px`,
        } as CSSProperties
      }
    >
      <motion.div
        className={cn(
          "absolute",
          "bg-gradient-to-r from-[var(--color-from)] via-[var(--color-to)] to-transparent",
          className
        )}
        style={
          {
            width: "200%",
            height: `${size}px`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
            top: "-2px",
            left: reverse ? "100%" : "-100%",
            ...style,
          } as CSSProperties
        }
        animate={{
          left: reverse 
            ? ["100%", "-100%"]
            : ["-100%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  )
}
