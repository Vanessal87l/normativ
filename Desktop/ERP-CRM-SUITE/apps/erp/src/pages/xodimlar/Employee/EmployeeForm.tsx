import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema } from "@/types/schemas";

const TYPE_OPTIONS = [
  { value: "EMPLOYEE", label: "Employee" },
  { value: "CLIENT", label: "Client" },
  { value: "SUPPLIER", label: "Supplier" },
] as const;

// ✅ input/output type ajratib olamiz (transform sabab)
type EmployeeFormInput = z.input<typeof employeeSchema>;
type EmployeeFormOutput = z.output<typeof employeeSchema>; // bu EmployeeFormValues bilan bir xil

export function EmployeeForm({
  defaultValues,
  mode,
  onSubmit,
}: {
  // ✅ defaultValues input bo‘yicha bo‘lishi to‘g‘ri
  defaultValues?: Partial<EmployeeFormInput>;
  mode: "create" | "edit" | "view";
  // ✅ onSubmit output (transformdan keyingi)
  onSubmit: (values: EmployeeFormOutput) => void;
}) {
  const disabled = mode === "view";
  const typeDisabled = mode !== "create";

  const { register, handleSubmit, formState, reset } = useForm<
    EmployeeFormInput,
    any,
    EmployeeFormOutput
  >({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      type: "EMPLOYEE",
      address: "",
      position: "",
      salary: undefined,
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({
      name: "",
      phone: "",
      email: "",
      type: "EMPLOYEE",
      address: "",
      position: "",
      salary: undefined,
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={styles.grid}>
      <Field label="Full name" error={formState.errors.name?.message}>
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
        <select
          disabled={disabled || typeDisabled}
          {...register("type")}
          style={styles.select}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Address" error={formState.errors.address?.message}>
        <input disabled={disabled} {...register("address")} style={styles.input} />
      </Field>

      <Field label="Position" error={formState.errors.position?.message}>
        <input disabled={disabled} {...register("position")} style={styles.input} />
      </Field>

      <Field label="Salary" error={formState.errors.salary?.message as any}>
        <input
          disabled={disabled}
          type="number"
          {...register("salary", { valueAsNumber: true })}
          style={styles.input}
        />
      </Field>

      {mode !== "view" ? (
        <button type="submit" style={styles.save}>
          Save
        </button>
      ) : null}
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
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
