import { cn } from "@/lib/utils";

/**
 * Minimalist wax-seal mark. A concentric ring monogram ("SD") rendered in
 * bronze — evokes an academic press colophon without any crypto iconography.
 */
export function BrandSeal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-8 w-8 text-bronze", className)}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.25" />
      <circle
        cx="24"
        cy="24"
        r="17.5"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="2 2"
      />
      <text
        x="24"
        y="29.5"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="15"
        fontWeight="600"
        fill="currentColor"
      >
        SD
      </text>
    </svg>
  );
}
