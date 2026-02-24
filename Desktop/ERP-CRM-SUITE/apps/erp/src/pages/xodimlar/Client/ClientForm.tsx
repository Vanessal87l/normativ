import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientFormValues } from "@/types/schemas";

const TYPE_OPTIONS = [
  { value: "CLIENT", label: "Client" },
  { value: "EMPLOYEE", label: "Employee" },
  { value: "SUPPLIER", label: "Supplier" },
] as const;

export function ClientForm({
  defaultValues,
  mode,
  onSubmit,
}: {
  defaultValues?: Partial<ClientFormValues>;
  mode: "create" | "edit" | "view";
  onSubmit: (values: ClientFormValues) => void;
}) {
  const disabled = mode === "view";
  const typeDisabled = mode !== "create";

  const { register, handleSubmit, formState, reset } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      type: "CLIENT",
      address: "",
      company: "",
      taxId: "",
      notes: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({
      name: "",
      phone: "",
      email: "",
      type: "CLIENT",
      address: "",
      company: "",
      taxId: "",
      notes: "",
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={styles.grid}>
      <Field label="Client name" error={formState.errors.name?.message}>
        <input disabled={disabled} {...register("name")} style={styles.input} />
      </Field>

      <Field label="Phone" error={formState.errors.phone?.message}>
        <input disabled={disabled} {...register("phone")} style={styles.input} />
      </Field>

      <Field label="Email" error={formState.errors.email?.message}>
        <input disabled={disabled} {...register("email")} style={styles.input} />
      </Field>

      {/* ✅ TYPE select (Emaildan keyin) */}
      <Field label="Type" error={formState.errors.type?.message as any}>
        <select disabled={disabled || typeDisabled} {...register("type")} style={styles.select}>
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="INN (Tax ID)" error={formState.errors.taxId?.message}>
        <input disabled={disabled} {...register("taxId")} style={styles.input} />
      </Field>

      <Field label="Address" error={formState.errors.address?.message}>
        <input disabled={disabled} {...register("address")} style={styles.input} />
      </Field>

      <Field label="Notes" error={formState.errors.notes?.message}>
        <input disabled={disabled} {...register("notes")} style={styles.input} />
      </Field>

      {mode !== "view" ? (
        <button type="submit" style={styles.save}>
          Save
        </button>
      ) : null}
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
      {error ? <span style={styles.error}>{error}</span> : null}
    </label>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 800, color: "#334155" },
  input: {
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 13,
    outline: "none",
  },
  select: {
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 13,
    outline: "none",
    background: "white",
  },
  error: { fontSize: 12, color: "#ef4444" },
  save: {
    gridColumn: "1 / -1",
    border: "none",
    cursor: "pointer",
    padding: "10px 14px",
    borderRadius: 12,
    background: "#0f172a",
    color: "white",
    fontWeight: 800,
  },
};
