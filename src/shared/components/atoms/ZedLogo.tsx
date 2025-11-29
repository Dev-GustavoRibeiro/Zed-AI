'use client'

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/shared/lib/utils"

interface ZedLogoProps {
  size?: "sm" | "default" | "md" | "lg" | "xl" | "2xl" | "custom"
  animated?: boolean
  className?: string
  showPulse?: boolean
}

const sizeMap = {
  sm: "h-8 w-8",
  default: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
  "2xl": "h-28 w-28",
  custom: "",
}

const ZedLogo: React.FC<ZedLogoProps> = ({
  size = "default",
  animated = true,
  className,
  showPulse = false,
}) => {
  return (
    <motion.div
      className={cn(
        "relative flex items-center justify-center rounded-full",
        "bg-gradient-to-br from-blue-500/20 via-slate-500/10 to-amber-500/20",
        "border border-blue-500/30",
        "shadow-lg shadow-blue-500/20",
        "overflow-hidden",
        size !== "custom" && sizeMap[size],
        showPulse && "animate-pulse-glow",
        className
      )}
      initial={animated ? { scale: 0.8, opacity: 0 } : false}
      animate={animated ? { scale: 1, opacity: 1 } : false}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {/* Inner ring */}
      <div className="absolute inset-1 rounded-full border border-blue-400/20" />
      
      {/* Logo Image */}
      <div className="relative z-10 flex items-center justify-center p-1.5">
        <Image
          src="/logo.png"
          alt="ZED Logo"
          width={size === "sm" ? 24 : size === "default" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : size === "xl" ? 64 : size === "2xl" ? 96 : 32}
          height={size === "sm" ? 24 : size === "default" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : size === "xl" ? 64 : size === "2xl" ? 96 : 32}
          className="object-contain"
          priority
        />
      </div>
      
      {/* Outer glow ring */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-400/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden rounded-full opacity-30">
        <motion.div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
          animate={{
            top: ["-10%", "110%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </motion.div>
  )
}

export { ZedLogo }
