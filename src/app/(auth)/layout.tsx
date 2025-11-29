import { BackgroundGradient } from "@/shared/components/organisms/BackgroundGradient"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[hsl(222,47%,6%)]">
        <BackgroundGradient themeName="dark">
          {children}
        </BackgroundGradient>
    </div>
  )
}

