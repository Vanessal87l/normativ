import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { loginUser } from "@/pages/shared/auth/storage"

export default function LoginPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    try {
      loginUser(email, password)
      nav("/app", { replace: true })
    } catch (e: any) {
      setErr(e?.message ?? "Xatolik")
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow-[0_24px_90px_-40px_rgba(0,0,0,0.45)] border border-black/5 overflow-hidden">
      <div className="bg-blue-100 px-6 py-4 text-center">
        <div className="text-lg font-extrabold text-slate-900">Log In</div>
      </div>

      <form onSubmit={onSubmit} className="p-6">
        <div className="text-center text-slate-500 text-xs mb-6">
          Welcome, introduce your credentials to begin.
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <label className="block mb-3">
          <div className="text-xs font-bold text-slate-700 mb-2">Email Address</div>
          <input
            className="h-12 w-full rounded-xl border border-black/10 bg-slate-50 px-4 outline-none focus:ring-2 focus:ring-blue-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
          />
        </label>

        <label className="block mb-4">
          <div className="text-xs font-bold text-slate-700 mb-2">Password</div>
          <input
            type="password"
            className="h-12 w-full rounded-xl border border-black/10 bg-slate-50 px-4 outline-none focus:ring-2 focus:ring-blue-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </label>

        <button className="h-12 w-full rounded-xl bg-slate-900 text-white font-extrabold shadow-md hover:opacity-95 transition">
          Sign In
        </button>

        <div className="mt-4 text-center text-xs text-slate-500">
          No account?{" "}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Create one
          </Link>
        </div>
      </form>
    </div>
  )
}