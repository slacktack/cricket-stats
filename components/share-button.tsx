"use client";

import { Share2 } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ShareButton({
  title,
  text,
  className,
  label,
}: {
  title: string;
  text?: string;
  className?: string;
  label?: string;
}) {
  const { toast } = useToast();

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard");
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand("copy");
        toast("Link copied to clipboard");
      } catch {
        toast("Could not copy the link", "error");
      }
      document.body.removeChild(field);
    }
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text ?? title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copyLink(url);
  }

  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        buttonClass({ variant: "secondary" }),
        label ? "px-4" : "w-10 px-0",
        className
      )}
      aria-label={label ?? "Share"}
      title={label ?? "Share"}
    >
      <Share2 className="h-4 w-4" />
      {label ? <span>{label}</span> : null}
    </button>
  );
}
