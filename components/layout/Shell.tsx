import type { ReactNode } from "react"

export function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`shell w-full max-w-maxw mx-auto px-gutter${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  )
}
