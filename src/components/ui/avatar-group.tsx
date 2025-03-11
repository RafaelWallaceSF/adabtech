
import * as React from "react"
import { cn } from "@/lib/utils"

const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { limit?: number }
>(({ className, limit = 3, children, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children)
  const visibleChildren = limit ? childrenArray.slice(0, limit) : childrenArray
  const remainingCount = childrenArray.length - visibleChildren.length

  return (
    <div
      ref={ref}
      className={cn("flex -space-x-2", className)}
      {...props}
    >
      {visibleChildren}
      {remainingCount > 0 && (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-medium border-2 border-background">
          +{remainingCount}
        </div>
      )}
    </div>
  )
})

AvatarGroup.displayName = "AvatarGroup"

export { AvatarGroup }
