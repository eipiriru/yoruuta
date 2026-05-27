// components/ui/Button.tsx
type ButtonProps = {
  children: React.ReactNode
  variant?: "primary" | "secondary"
}

export default function Button2({
  children,
  variant = "primary"
}: ButtonProps) {
  return (
    <button
      className={`
        px-7 py-4 rounded-xl font-medium transition-all duration-300
        ${variant === "primary"
          ? "bg-[#E7C4BE] text-[#1F3552] hover:scale-[1.02]"
          : "border border-white/20 text-white hover:bg-white/10"
        }
      `}
    >
      {children}
    </button>
  )
}