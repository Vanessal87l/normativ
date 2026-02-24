import { RouterProvider } from "react-router-dom"
import { router } from "../router/routes"

export default function AppProviders() {
  return <RouterProvider router={router} />
}