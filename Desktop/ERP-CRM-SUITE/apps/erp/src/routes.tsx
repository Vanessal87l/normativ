// src/router.tsx
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"
import AppLayout from "./layouts/AppLayout"
import LoginPage from "./pages/auth/LoginPage"
import OverviewDashboardPage from "./pages/Dashboard/overview/OverviewDashboardPage"
import SotuvDashboardPage from "./pages/sotuv/SotuvDashboardPage"
import SkladDashboardPage from "./pages/sklad/SkladDashboardPage"

// вњ… MOLIYA
import MoliyaLayout from "./pages/moliya/MoliyaLayout"
import MoliyaDashboardContent from "./pages/moliya/Dashboard/MoliyaDashboardContent"
import MoliyaLedgerPage from "./pages/moliya/Ledger/MoliyaLedgerPage"
import MoliyaAddEntryPage from "./pages/moliya/Entry/MoliyaAddEntryPage"
import MoliyaEmployeesPage from "./pages/moliya/Employees/MoliyaEmployeesPage"
import MoliyaClientDebtsPage from "./pages/moliya/Debts/MoliyaClientDebtsPage"
// вњ… WAREHOUSE
import WarehouseLayout from "./pages/sklad/warehouse/WarehouseLayout"
import WarehouseOverviewPage from "./pages/sklad/warehouse/overview/WarehouseOverviewPage"
import StockOnHandPage from "./pages/sklad/stock/StockOnHandPage"
import WarehouseMovementsPage from "./pages/sklad/warehouse/movements/WarehouseMovementsPage"
import WarehouseInventoryPage from "./pages/sklad/warehouse/inventory/WarehouseInventoryPage"

// вњ… XODIMLAR
import Xodimlar from "./pages/xodimlar/Employee/Xodimlar"
import TabsCrudTS from "./pages/xodimlar/TabsCrud"
// вњ… DICTS / CATALOG

// вњ… PARTNERS / KONTRAGENT (Klient DB)

import TestUom from "./pages/Uom/CreateUom"
import DictsSettingsPage from "./pages/Settings/DictsSettingsPage"
import ProductsPage from "./pages/catalog/ProductsPage"
import XodimlarTable from "./pages/xodimlar/Employee/XodimlarTable"

import MaterialsPage from "@/pages/Materials/MaterialsPage"
import RecipesPage from "./pages/Recipes/RecipesPage"
import RecipeDetailPage from "./pages/Recipes/components/RecipeDetailPage"

// вњ… SOTUV (orders)
import OrdersKanbanPage from "./pages/ordersKanban/Orders"
import OrderCreatePage from "./pages/orders/components/OrderCreatePage"

// вњ… XARIDLAR
import PurchasesListPage from "./pages/purchases/PurchasesListPage"
import PurchaseDetailPage from "./pages/purchases/PurchaseDetailPage"

// вњ… WAREHOUSES pages

import ProfilePage from "./pages/profile/profile"

import WarehouseInternalOrdersPage from "./pages/sklad/warehouse/internal-orders/WarehouseInternalOrdersPage"
import WarehouseTransferPage from "./pages/sklad/warehouse/actions/WarehouseTransferPage"
import WarehouseWriteOffPage from "./pages/sklad/warehouse/actions/WarehouseWriteOffPage"
import WarehouseReceiptPage from "./pages/sklad/warehouse/actions/WarehouseReceiptPage"

// вњ… HUJJATLAR
import DocumentsPage from "./pages/documents/DocumentsPage"

// вњ… PRODUCTION (NEW)
import ProductionPage from "./pages/production/ProductionPage"
import ProductionLayout from "./pages/production/ProductionLayout"


export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      // вњ… root -> /dashboard
      { index: true, element: <Navigate to="dashboard" replace /> },

      // вњ… Dashboard pages
      { path: "dashboard", element: <OverviewDashboardPage /> },
      { path: "dashboard/sotuv", element: <SotuvDashboardPage /> },
      { path: "dashboard/sklad", element: <SkladDashboardPage /> },

      // вњ… Settings / Catalog
      { path: "dashboard/settings/dicts", element: <DictsSettingsPage /> },
      { path: "dashboard/catalog/products", element: <ProductsPage /> },
      { path: "dashboard/catalog/materials", element: <MaterialsPage /> },
      { path: "dashboard/catalog/recipes", element: <RecipesPage /> },
      { path: "dashboard/catalog/recipes/:id", element: <RecipeDetailPage /> },

      // вњ… HUJJATLAR
      { path: "dashboard/documents", element: <DocumentsPage /> },

      // вњ… PRODUCTION вњ…
      {
        path: "dashboard/production",
        element: <ProductionLayout />,
        children: [
          { index: true, element: <Navigate to="orders" replace /> },
          { path: "orders", element: <ProductionPage /> },
          { path: "materials", element: <MaterialsPage /> },
          { path: "recipes", element: <RecipesPage /> },
          { path: "recipes/:id", element: <RecipeDetailPage /> },
        ],
      },

      // вњ… XARIDLAR (LIST + DETAIL)
      { path: "dashboard/purchases", element: <PurchasesListPage /> },
      { path: "dashboard/purchases/:id", element: <PurchaseDetailPage /> },

      // вњ… MOLIYA (nested)
      {
        path: "dashboard/moliya",
        element: <MoliyaLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <MoliyaDashboardContent /> },
          { path: "ledger", element: <MoliyaLedgerPage /> },
          { path: "add-entry", element: <MoliyaAddEntryPage /> },
          { path: "employees", element: <MoliyaEmployeesPage /> },
          { path: "debts", element: <MoliyaClientDebtsPage /> },
        ],
      },

      // вњ… SKLAD + WAREHOUSE (nested)
      {
        path: "dashboard/sklad",
        element: <Outlet />,
        children: [
          { index: true, element: <SkladDashboardPage /> },
          {
            path: "warehouse",
            element: <WarehouseLayout />,
            children: [
              { index: true, element: <Navigate to="balances" replace /> },
              { path: "overview", element: <WarehouseOverviewPage /> },
              { path: "receipts", element: <WarehouseReceiptPage /> },
              { path: "write-offs", element: <WarehouseWriteOffPage /> },
              { path: "transfers", element: <WarehouseTransferPage /> },
              { path: "inventories", element: <WarehouseInventoryPage /> },
              { path: "internal-orders", element: <WarehouseInternalOrdersPage /> },
              { path: "balances", element: <StockOnHandPage /> },
              { path: "stock", element: <Navigate to="balances" replace /> },
              { path: "receipt", element: <Navigate to="receipts" replace /> },
              { path: "transfer", element: <Navigate to="transfers" replace /> },
              { path: "writeoff", element: <Navigate to="write-offs" replace /> },
              { path: "movements", element: <WarehouseMovementsPage /> },
              { path: "inventory", element: <Navigate to="inventories" replace /> },
            ],
          },
        ],
      },

      // вњ… SOTUV
      {
        path: "sotuv",
        element: <Outlet />,
        children: [
          { index: true, element: <Navigate to="ordersKanban" replace /> },
          { path: "orders", element: <Navigate to="/sotuv/ordersKanban" replace /> },
          { path: "orders/new", element: <Navigate to="/sotuv/ordersKanban/new" replace /> },
          { path: "ordersKanban", element: <OrdersKanbanPage /> },
          { path: "ordersKanban/new", element: <OrderCreatePage /> },
        ],
      },

      // вњ… XODIMLAR
      {
        path: "xodimlar",
        element: <Outlet />,
        children: [
          { index: true, element: <TabsCrudTS /> },
          { path: "form", element: <Xodimlar /> },
          { path: "employees", element: <XodimlarTable /> },
        ],
      },

      // вњ… fallback
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },

  // вњ… LOGIN
  { path: "login", element: <LoginPage /> },
  { path: "profile", element: <ProfilePage /> },
  { path: "Uom", element: <TestUom /> },
])


