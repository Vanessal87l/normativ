export type EntryType = "INCOME" | "EXPENSE" | "ADJUSTMENT"
export type PaymentMethod = "BANK" | "CARD" | "CASH"
export type Currency = "UZS" | "USD" | "EUR" | "RUB"

export type FinanceEntry = {
  id: string
  date: string // YYYY-MM-DD
  entryType: EntryType
  category: string
  amount: number
  currency: Currency
  paymentMethod: PaymentMethod
  referenceType?: string
  referenceId?: string | null
  reference?: string | null
  notes?: string | null
}

export type Employee = {
  id: string
  fullName: string
  role: string
  phone?: string
  baseSalary: number
  currency: Currency
}

const LS_ENTRIES = "finance_demo_entries"
const LS_EMP = "finance_demo_employees"

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJSON(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value))
}

function seedIfEmpty() {
  const entries = loadJSON<FinanceEntry[]>(LS_ENTRIES, [])
  if (entries.length === 0) {
    const today = new Date().toISOString().slice(0, 10)
    const seeded: FinanceEntry[] = [
      {
        id: uid("e"),
        date: today,
        entryType: "INCOME",
        category: "Sotuv",
        amount: 350000,
        currency: "UZS",
        paymentMethod: "CASH",
        referenceType: "Manual",
        reference: "Demo kirim",
        notes: "Demo yozuv",
      },
      {
        id: uid("e"),
        date: today,
        entryType: "EXPENSE",
        category: "Transport",
        amount: 120000,
        currency: "UZS",
        paymentMethod: "CARD",
        referenceType: "Manual",
        reference: "Demo xarajat",
        notes: "Yo‘l xarajati",
      },
    ]
    saveJSON(LS_ENTRIES, seeded)
  }

  const emps = loadJSON<Employee[]>(LS_EMP, [])
  if (emps.length === 0) {
    const seededEmp: Employee[] = [
      {
        id: uid("u"),
        fullName: "Akmal Karimov",
        role: "Hisobchi",
        phone: "+998 90 123 45 67",
        baseSalary: 3500000,
        currency: "UZS",
      },
      {
        id: uid("u"),
        fullName: "Dilshod Sodiqov",
        role: "Kassir",
        phone: "+998 93 555 66 77",
        baseSalary: 2800000,
        currency: "UZS",
      },
    ]
    saveJSON(LS_EMP, seededEmp)
  }
}

seedIfEmpty()

export const demoStore = {
  /* ===================== Entries ===================== */

  listEntries(): FinanceEntry[] {
    const rows = loadJSON<FinanceEntry[]>(LS_ENTRIES, [])
    // avval sana bo'yicha, keyin id bo'yicha (stabil)
    return rows
      .slice()
      .sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id))
  },

  createEntry(payload: Omit<FinanceEntry, "id">): FinanceEntry {
    const rows = loadJSON<FinanceEntry[]>(LS_ENTRIES, [])
    const row: FinanceEntry = { ...payload, id: uid("e") }
    rows.unshift(row)
    saveJSON(LS_ENTRIES, rows)
    return row
  },

  // ✅ YANGI: UPDATE (EDIT ishlashi uchun)
  updateEntry(id: string, patch: Partial<Omit<FinanceEntry, "id">>): FinanceEntry {
    const rows = loadJSON<FinanceEntry[]>(LS_ENTRIES, [])
    const idx = rows.findIndex((x) => x.id === id)
    if (idx === -1) throw new Error("Yozuv topilmadi.")

    const updated: FinanceEntry = {
      ...rows[idx],
      ...patch,
      id: rows[idx].id, // id o'zgarmasin
    }

    rows[idx] = updated
    saveJSON(LS_ENTRIES, rows)
    return updated
  },

  deleteEntry(id: string) {
    const rows = loadJSON<FinanceEntry[]>(LS_ENTRIES, [])
    saveJSON(LS_ENTRIES, rows.filter((x) => x.id !== id))
  },

  /* ===================== Employees ===================== */

  listEmployees(): Employee[] {
    return loadJSON<Employee[]>(LS_EMP, [])
  },

  createEmployee(payload: Omit<Employee, "id">): Employee {
    const rows = loadJSON<Employee[]>(LS_EMP, [])
    const row: Employee = { ...payload, id: uid("u") }
    rows.unshift(row)
    saveJSON(LS_EMP, rows)
    return row
  },
}
