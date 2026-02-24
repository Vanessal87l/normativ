import { useEffect, useState } from "react"
import { dictsApi, type UomRow } from "@/pages/Settings/Api/dictsApi"

export default function TestUom() {
  const [rows, setRows] = useState<UomRow[]>([])

  useEffect(() => {
    dictsApi.listUom().then(setRows)
  }, [])

  return (
    <div>
      <h1>UoM</h1>
      <pre>{JSON.stringify(rows, null, 2)}</pre>
    </div>
  )
}
