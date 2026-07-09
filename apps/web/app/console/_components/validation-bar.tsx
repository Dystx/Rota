export interface ValidationBarCheck {
  label: string;
  tone: "error" | "primary";
}

export interface ValidationBarProps {
  checks: ValidationBarCheck[];
}

const checkClass: Record<"error" | "primary", string> = {
  error: "bg-error/20 border border-error/30 text-on-error-container",
  primary: "bg-surface-tint/30 text-primary-fixed",
};

export function ValidationBar({ checks }: ValidationBarProps) {
  return (
    <div className="absolute bottom-0 right-0 left-0 bg-glass-dark border-t border-white/10 p-4 shadow-2xl z-20 flex flex-col gap-3 md:flex-row md:justify-between md:items-center backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light flex items-center gap-2">
          <span aria-hidden className="ph text-[16px]">
            rule
          </span>
          Logistical Checks
        </span>
        <ul className="flex flex-wrap items-center gap-2">
          {checks.map((check) => (
            <li
              key={check.label}
              className={`font-mono-micro text-mono-micro uppercase tracking-wider px-3 py-1 rounded-full ${checkClass[check.tone]}`}
            >
              {check.label}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        className="font-label-ui text-label-ui inline-flex items-center gap-2 bg-ochre-light text-primary px-6 py-2.5 rounded-lg hover:bg-ochre-dark hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-glass-dark transition-colors"
      >
        <span aria-hidden className="ph text-[18px] ph-sparkle">sparkle</span>
        Resolve Conflicts
      </button>
    </div>
  );
}