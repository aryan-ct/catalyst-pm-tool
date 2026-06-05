import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, className, ...props }, ref) => {
    const getInitials = (fullName: string) => {
      if (!fullName) return '';
      const parts = fullName.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
      }
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const initials = getInitials(name);

    return (
      <TooltipPrimitive.Provider delay={200}>
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger render={<div />}>
            <div
              ref={ref}
              className={cn(
                "relative h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 cursor-default",
                className
              )}
              {...props}
            >
              {initials}
            </div>
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Positioner side="top" sideOffset={4} className="z-[100000]">
              <TooltipPrimitive.Popup className="bg-foreground text-background text-xs rounded-md py-1.5 px-2.5 shadow-md font-medium whitespace-nowrap data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                {name}
                <TooltipPrimitive.Arrow className="fill-foreground" />
              </TooltipPrimitive.Popup>
            </TooltipPrimitive.Positioner>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    );
  }
);

Avatar.displayName = 'Avatar';
