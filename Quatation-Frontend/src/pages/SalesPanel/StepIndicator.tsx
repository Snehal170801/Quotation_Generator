// src/pages/SalesPanel/StepIndicator.tsx

interface Step {
  number: number;
  label: string;
  sublabel: string;
}

const STEPS: Step[] = [
  { number: 1, label: "Customer", sublabel: "Fill in details" },
  { number: 2, label: "Items", sublabel: "Select products & services" },
  { number: 3, label: "Review", sublabel: "Save or preview PDF" },
];

interface StepIndicatorProps {
  /** 1 | 2 | 3  — which step is active */
  active?: number;
}

export default function StepIndicator({ active = 1 }: StepIndicatorProps) {
  return (
    <div
      className="rounded-(--radius-lg) overflow-hidden"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-light)",
        padding: "0 24px",
      }}
    >
      <div className="flex items-stretch">
        {STEPS.map((step, idx) => {
          const isDone = step.number < active;
          const isActive = step.number === active;

          return (
            <div
              key={step.number}
              className="flex items-center"
              style={{ flex: 1 }}
            >
              {/* Step cell */}
              <div className="flex items-center gap-3 py-4" style={{ flex: 1 }}>
                {/* Circle */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: isDone
                      ? "var(--color-primary)"
                      : isActive
                        ? "var(--color-primary-light, #ede9ff)"
                        : "var(--color-bg-input)",
                    border: isActive
                      ? "2px solid var(--color-primary)"
                      : isDone
                        ? "2px solid var(--color-primary)"
                        : "2px solid var(--color-border-light)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: isActive
                          ? "var(--color-primary)"
                          : "var(--color-text-muted)",
                        lineHeight: 1,
                      }}
                    >
                      {step.number}
                    </span>
                  )}
                </div>

                {/* Labels */}
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: isActive || isDone ? 600 : 500,
                      color:
                        isActive || isDone
                          ? "var(--color-text-main)"
                          : "var(--color-text-muted)",
                      lineHeight: 1.2,
                      marginBottom: 2,
                    }}
                  >
                    {step.label}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-muted)",
                      lineHeight: 1,
                    }}
                  >
                    {step.sublabel}
                  </p>
                </div>
              </div>

              {/* Connector line — not after last */}
              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    width: 40,
                    height: 1,
                    flexShrink: 0,
                    background:
                      step.number < active
                        ? "var(--color-primary)"
                        : "var(--color-border-light)",
                    transition: "background 0.3s ease",
                    margin: "0 8px",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
