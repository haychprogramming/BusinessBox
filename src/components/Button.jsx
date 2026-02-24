import { cn } from '../lib/utils';
import React from 'react';
import { motion } from 'framer-motion';

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
                {
                    "bg-primary text-primary-foreground shadow hover:bg-primary/90": variant === "default",
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm": variant === "destructive",
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm": variant === "outline",
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
                    "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
                    "underline-offset-4 hover:underline text-primary": variant === "link",
                    "h-10 py-2 px-4": size === "default",
                    "h-9 px-3 rounded-md": size === "sm",
                    "h-11 px-8 rounded-md": size === "lg",
                },
                className
            )}
            {...props}
        />
    );
});

Button.displayName = "Button";

export { Button };
