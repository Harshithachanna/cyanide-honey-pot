import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-muted text-muted-foreground": variant === "default",
          "border-neon-green/30 bg-neon-green/10 text-neon-green": variant === "success",
          "border-yellow-500/30 bg-yellow-500/10 text-yellow-500": variant === "warning",
          "border-neon-red/30 bg-neon-red/10 text-neon-red": variant === "danger",
          "border-border bg-transparent text-foreground": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
