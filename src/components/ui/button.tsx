import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-2xl border text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4682A9] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "border-[#4682A9] bg-[#F6F4EB] text-[#1f3f56] hover:bg-[#ece9dc]",
      destructive: "border-red-700 bg-red-600 text-white hover:bg-red-700",
      outline: "border-[#4682A9] bg-transparent text-[#1f3f56] hover:bg-[#F6F4EB]",
      secondary: "border-[#4682A9] bg-[#e9eef2] text-[#1f3f56] hover:bg-[#dde5ec]",
      ghost: "border-transparent bg-transparent text-[#1f3f56] hover:border-[#4682A9] hover:bg-[#F6F4EB]",
      link: "border-transparent bg-transparent text-[#1f3f56] underline-offset-4 hover:underline"
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10"
    }
    
    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
