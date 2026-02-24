import { z } from "zod";

export const entityTypeEnum = z.enum(["EMPLOYEE", "CLIENT", "SUPPLIER"]);
export type EntityType = z.infer<typeof entityTypeEnum>;

const base = z.object({
  name: z.string().min(2, "Name min 2 ta belgi"),
  phone: z.string().min(7, "Phone noto‘g‘ri"),
  email: z.string().email("Email noto‘g‘ri").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  // ✅ hamma formda bor bo'ladi
  type: entityTypeEnum,
});

export const employeeSchema = base.extend({
  position: z.string().min(2, "Position min 2 ta belgi"),
  salary: z
    .union([z.number().nonnegative("Salary manfiy bo‘lmasin"), z.nan()])
    .optional()
    .transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined)),
});

export const clientSchema = base.extend({
  company: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const supplierSchema = base.extend({
  company: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  paymentTerms: z.string().optional().or(z.literal("")),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
export type ClientFormValues = z.infer<typeof clientSchema>;
export type SupplierFormValues = z.infer<typeof supplierSchema>;
