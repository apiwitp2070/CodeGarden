import { Badge } from './ui/badge';
import { cn } from '#/lib/utils';
import type { ComponentProps } from 'react';

export function TagChip({ className, variant = "secondary", ...props }: ComponentProps<typeof Badge>) {
  return (
    <Badge 
      variant={variant} 
      className={cn(
        "rounded-full font-space text-xs px-3 py-1 font-medium", 
        className
      )} 
      {...props} 
    />
  );
}
