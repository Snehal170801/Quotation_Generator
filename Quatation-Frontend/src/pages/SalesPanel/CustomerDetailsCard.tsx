// src/pages/SalesPanel/CustomerDetailsCard.tsx

import { useState } from "react";
import { Input } from "../../components/ui";
import { useSalesStore } from "../../store/salesStore";

const INPUT_TYPE_MAP: Record<string, string> = {
  Text: "text",
  Email: "email",
  Phone: "tel",
  Address: "text",
};

function validateField(type: string, value: string): string | null {
  if (!value.trim()) return null;
  if (type === "Email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Invalid email address";
  if (type === "Phone" && !/^[+]?[\d\s\-().]{7,15}$/.test(value))
    return "Invalid phone number";
  return null;
}

export default function CustomerDetailsCard() {
  const fields = useSalesStore((s) => s.fields);
  const formValues = useSalesStore((s) => s.formValues);
  const setFormValue = useSalesStore((s) => s.setFormValue);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const requiredCount = fields.filter((f) => f.required).length;

  return (
    <section
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-light)",
        borderRadius: "var(--radius-lg, 12px)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 24px 16px",
          borderBottom: "1px solid var(--color-border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--color-text-main)",
              margin: 0,
            }}
          >
            Customer Details
          </h2>
          {fields.length > 0 && (
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 2,
              }}
            >
              {requiredCount > 0 ? `${requiredCount} required` : "All optional"}
            </p>
          )}
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: "20px 24px 24px" }}>
        {fields.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            No customer fields configured yet.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "16px 20px",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            }}
          >
            {fields.map((field) => {
              const value = formValues[String(field.id)] ?? "";
              const error = touched[field.id]
                ? (validateField(field.type, value) ?? undefined)
                : undefined;
              return (
                <Input
                  key={field.id}
                  id={`field-${field.id}`}
                  label={field.name}
                  type={INPUT_TYPE_MAP[field.type] ?? "text"}
                  placeholder={`Enter ${field.name.toLowerCase()}`}
                  value={value}
                  onChange={(e) =>
                    setFormValue(String(field.id), e.target.value)
                  }
                  onBlur={() => setTouched((t) => ({ ...t, [field.id]: true }))}
                  required={field.required}
                  error={error}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
