"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // Without richColors, sonner styles every type with the neutral popover
      // colours — success, error and warning all render identically.
      richColors
      position="top-right"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",

          // Per-type colours, defined in globals.css so light and dark both work.
          "--success-bg": "var(--toast-success-bg)",
          "--success-text": "var(--toast-success-text)",
          "--success-border": "var(--toast-success-border)",
          "--error-bg": "var(--toast-error-bg)",
          "--error-text": "var(--toast-error-text)",
          "--error-border": "var(--toast-error-border)",
          "--warning-bg": "var(--toast-warning-bg)",
          "--warning-text": "var(--toast-warning-text)",
          "--warning-border": "var(--toast-warning-border)",
          "--info-bg": "var(--toast-info-bg)",
          "--info-text": "var(--toast-info-text)",
          "--info-border": "var(--toast-info-border)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // border-2 so the coloured edge reads even on a tinted background;
          // the description inherits the toast's text colour instead of sonner's
          // washed-out default.
          toast: "cn-toast border-2 shadow-lg",
          title: "font-semibold",
          description: "opacity-90",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
