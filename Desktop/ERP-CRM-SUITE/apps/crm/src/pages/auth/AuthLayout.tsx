import { Outlet, Link, useLocation } from "react-router-dom"

export default function AuthLayout() {
  const { pathname } = useLocation()
  const isLogin = pathname === "/" || pathname === "/login"

  return (
    <div className="min-h-screen bg-slate-100">
      {/* top bar */}
      <div className="h-14 bg-white/80 backdrop-blur border-b border-black/5 flex items-center justify-between px-6">
        <div className="font-extrabold text-slate-900 tracking-tight">
          <span className="text-blue-600">Height</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <a className="text-slate-600 hover:text-slate-900" href="#">
            Request A Demo
          </a>
          {isLogin ? (
            <Link className="font-bold text-blue-600 hover:underline" to="/register">
              Sign Up Now
            </Link>
          ) : (
            <Link className="font-bold text-blue-600 hover:underline" to="/login">
              Log In
            </Link>
          )}
        </div>
      </div>

      {/* background like image */}
      <div className="relative min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1800&q=60)",
          }}
        />
        <div className="absolute inset-0 bg-white/70" />

        <div className="relative w-full max-w-[460px]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}