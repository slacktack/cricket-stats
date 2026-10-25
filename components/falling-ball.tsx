import { cn } from "@/lib/utils";

export function FallingBall({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
    >
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M86 66c92 55 169 126 221 213" opacity=".5" />
        <path d="M143 34c86 54 156 122 204 202" opacity=".3" />
        <path d="M45 124c86 47 152 109 198 181" opacity=".22" />
        <circle cx="332" cy="330" r="128" />
        <circle cx="332" cy="330" r="112" opacity=".28" />
        <path d="M244 244c65 42 97 128 66 205" />
        <path d="M280 211c65 42 97 128 66 205" />
        <path
          d="M262 227c65 42 97 128 66 205"
          strokeWidth="5"
          strokeDasharray="3 12"
          opacity=".8"
        />
        <path d="M206 430c77 44 173 38 243-18" opacity=".35" />
        <path d="M416 186c26-26 57-43 91-51" opacity=".45" />
        <path d="M461 243c20-12 41-19 63-22" opacity=".3" />
        <path d="M73 455c30 19 62 31 97 37" opacity=".22" />
        <path d="M109 493c22 11 45 18 69 21" opacity=".16" />
        <path d="M525 330h28M539 316v28" opacity=".45" />
        <path d="M80 245h18M89 236v18" opacity=".45" />
        <path d="M456 486h20M466 476v20" opacity=".32" />
        <path d="M337 104c0-12 0-22 0-32" opacity=".3" />
        <path d="M319 119c-8-8-14-15-20-23" opacity=".25" />
      </g>
    </svg>
  );
}
