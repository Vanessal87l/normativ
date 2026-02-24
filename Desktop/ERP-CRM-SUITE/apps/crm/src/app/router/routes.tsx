import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "@/pages/shared/auth/ProtectedRoute";
import AuthLayout from "@/pages/auth/AuthLayout";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

import AppShell from "@/layouts/AppShell/AppShell";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import CustomersPage from "@/pages/customers/CustomersPage";
import TasksPage from "@/pages/tasks/TasksPage";

// ✅ Yangi page'lar
import CompanyPage from "@/pages/company/CompanyPage";
import ContactPage from "@/pages/contact/ContactPage";
import SalesPage from "@/pages/sales/SalesPage";
import CallsPage from "@/pages/calls/CallsPage";

export const router = createBrowserRouter([
  // AUTH
  {
    element: <AuthLayout />,
    children: [
      // ✅ root -> login
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },

  // APP (protected)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/app",
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "customers", element: <CustomersPage /> },
          { path: "tasks", element: <TasksPage /> },
          { path: "company", element: <CompanyPage /> },
          { path: "contact", element: <ContactPage /> },
          { path: "sales", element: <SalesPage /> },
          { path: "calls", element: <CallsPage /> },
          
        ],
      },
    ],
  },

  // ✅ fallback (not found) -> login
  { path: "*", element: <Navigate to="/login" replace /> },
]);
