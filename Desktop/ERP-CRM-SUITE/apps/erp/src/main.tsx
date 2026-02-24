import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import "@/index.css"
import { router } from "@/routes"
import { ToastContainer } from "react-toastify"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "react-toastify/dist/ReactToastify.css"

// ✅ QueryClient bitta marta yaratiladi
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* ✅ TanStack Query Provider */}
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={2500} newestOnTop />
    </QueryClientProvider>
  </React.StrictMode>
)
