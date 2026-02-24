import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { http } from "@/shared/http"

type DebtApiRow = {
  client_id?: number
  client_name?: string
  total?: number
  paid?: number
  debt?: number
  prepayment_total?: number
  prepayment?: number
  pre_paid?: number
  advance_paid?: number
  new_order_total?: number
  new_orders_total?: number
  current_order_total?: number
}

type DebtViewRow = {
  id: number | string
  clientName: string
  totalOrderSum: number
  prePaidSum: number
  newOrderTotalSum: number
  paidSum: number
  debtSum: number
}

function toNum(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function fmtMoney(v: number) {
  return `${new Intl.NumberFormat("uz-UZ").format(toNum(v))} so'm`
}

function mapDebtRow(x: DebtApiRow, idx: number): DebtViewRow {
  const prePaidSum = toNum(x.prepayment_total ?? x.prepayment ?? x.pre_paid ?? x.advance_paid ?? 0)
  const totalOrderSum = toNum(x.total)
  const paidSum = toNum(x.paid)
  return {
    id: x.client_id ?? idx,
    clientName: String(x.client_name ?? `Client #${x.client_id ?? idx + 1}`),
    totalOrderSum,
    prePaidSum,
    newOrderTotalSum: toNum(x.new_order_total ?? x.new_orders_total ?? x.current_order_total ?? totalOrderSum),
    paidSum,
    debtSum: toNum(x.debt ?? Math.max(totalOrderSum - paidSum, 0)),
  }
}

export default function MoliyaClientDebtsPage() {
  const [rows, setRows] = useState<DebtViewRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const res = await http.get<{ rows?: DebtApiRow[] } | DebtApiRow[]>("/api/v1/finance/dashboard/debts/clients/", {})
      const list = Array.isArray(res) ? res : Array.isArray(res?.rows) ? res.rows : []
      setRows(list.map(mapDebtRow))
    } catch (e: unknown) {
      const msg =
        typeof e === "object" &&
          e !== null &&
          "response" in e &&
          typeof (e as { response?: { data?: { detail?: unknown } } }).response?.data?.detail !== "undefined"
          ? String((e as { response?: { data?: { detail?: unknown } } }).response?.data?.detail)
          : "Qarzdorlik ma'lumotini yuklab bo'lmadi"
      setRows([])
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalDebt = useMemo(() => rows.reduce((acc, r) => acc + r.debtSum, 0), [rows])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold text-slate-900">Qarzdorlik</div>
          <div className="text-sm text-slate-500">Tovar olgan mijozlar qarzi</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            Jami qarzdorlik: <span className="text-slate-900">{fmtMoney(totalDebt)}</span>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? "Yuklanmoqda..." : "Yangilash"}
          </Button>
        </div>
      </div>

      {error ? <div className="text-sm text-rose-600">{error}</div> : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mijoz</TableHead>
              <TableHead className="text-right">Umumiy zakaz summasi</TableHead>
              <TableHead className="text-right">Oldindan to'lagan summasi</TableHead>
              <TableHead className="text-right">Yangi zakaz Summasi umumiysi</TableHead>
              <TableHead className="text-right">To'lagan summa</TableHead>
              <TableHead className="text-right">Qarzdorlik summa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.clientName}</TableCell>
                <TableCell className="text-right">{fmtMoney(r.totalOrderSum)}</TableCell>
                <TableCell className="text-right">{fmtMoney(r.prePaidSum)}</TableCell>
                <TableCell className="text-right">{fmtMoney(r.newOrderTotalSum)}</TableCell>
                <TableCell className="text-right">{fmtMoney(r.paidSum)}</TableCell>
                <TableCell className="text-right font-semibold text-rose-600">{fmtMoney(r.debtSum)}</TableCell>
              </TableRow>
            ))}

            {!loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  Ma'lumot topilmadi
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
