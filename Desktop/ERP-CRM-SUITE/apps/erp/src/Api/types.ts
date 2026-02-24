export type TabKey = "employee" | "client" | "supplier";

export type BaseEntity = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  code?: string;
  kind?: "SUPPLIER" | "CLIENT" | "OTHER" | string;
  isActive?: boolean;
  deletedAt?: string | null;
  createdAt: string; // ISO
  updatedAt?: string;
};

export type Employee = BaseEntity & {
  position: string;
  salary?: number;
};

export type Client = BaseEntity & {
  company?: string;
  taxId?: string;
  notes?: string;
};

export type Supplier = BaseEntity & {
  company?: string;
  taxId?: string;
  notes?: string;
  paymentTerms?: string;
};

export type EntityMap = {
  employee: Employee;
  client: Client;
  supplier: Supplier;
};

export type Mode = "create" | "edit" | "view";

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
