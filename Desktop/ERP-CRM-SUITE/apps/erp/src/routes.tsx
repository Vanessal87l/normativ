import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

import PublicOnlyRoute from "./pages/auth/PublicOnlyRoute";
import LoginPage from "./pages/auth/LoginPage";

// ✅ DASHBOARDS
import OverviewDashboardPage from "./pages/Dashboard/overview/OverviewDashboardPage";
import SotuvDashboardPage from "./pages/sotuv/SotuvDashboardPage";
import SkladDashboardPage from "./pages/sklad/SkladDashboardPage";

// ✅ MOLIYA
import MoliyaLayout from "./pages/moliya/MoliyaLayout";
import MoliyaDashboardContent from "./pages/moliya/Dashboard/MoliyaDashboardContent";
import MoliyaLedgerPage from "./pages/moliya/Ledger/MoliyaLedgerPage";
import MoliyaAddEntryPage from "./pages/moliya/Entry/MoliyaAddEntryPage";
import MoliyaEmployeesPage from "./pages/moliya/Employees/MoliyaEmployeesPage";
import MoliyaClientDebtsPage from "./pages/moliya/Debts/MoliyaClientDebtsPage";

// ✅ SETTINGS / CATALOG
import DictsSettingsPage from "./pages/Settings/DictsSettingsPage";
import ProductsPage from "./pages/catalog/ProductsPage";
import MaterialsPage from "@/pages/Materials/MaterialsPage";
import RecipesPage from "./pages/Recipes/RecipesPage";
import RecipeDetailPage from "./pages/Recipes/components/RecipeDetailPage";

// ✅ PURCHASES
import PurchasesListPage from "./pages/purchases/PurchasesListPage";
import PurchaseDetailPage from "./pages/purchases/PurchaseDetailPage";

// ✅ ORDERS (SOTUV)
import OrdersPage from "./pages/orders/OrdersPage";
import OrderCreatePage from "./pages/orders/components/OrderCreatePage";

// ✅ WAREHOUSE
import WarehouseLayout from "./pages/sklad/warehouse/WarehouseLayout";
import WarehouseOverviewPage from "./pages/sklad/warehouse/overview/WarehouseOverviewPage";
import WarehouseReceiptPage from "./pages/sklad/warehouse/actions/WarehouseReceiptPage";
import WarehouseWriteOffPage from "./pages/sklad/warehouse/actions/WarehouseWriteOffPage";
import WarehouseTransferPage from "./pages/sklad/warehouse/actions/WarehouseTransferPage";
import WarehouseInventoryPage from "./pages/sklad/warehouse/inventory/WarehouseInventoryPage";
import WarehouseInternalOrdersPage from "./pages/sklad/warehouse/internal-orders/WarehouseInternalOrdersPage";
import WarehousesPage from "./pages/sklad/warehouse/warehouses/WarehousesPage";
import WarehouseMovementsPage from "./pages/sklad/warehouse/movements/WarehouseMovementsPage";
import StockOnHandPage from "./pages/sklad/stock/StockOnHandPage";

// ✅ XODIMLAR
import TabsCrudTS from "./pages/xodimlar/TabsCrud";
import Xodimlar from "./pages/xodimlar/Employee/Xodimlar";
import XodimlarTable from "./pages/xodimlar/Employee/XodimlarTable";

// ✅ PROFILE (если реально есть файл)
import ProfilePage from "./pages/profile/profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      // ✅ root -> /dashboard
      { index: true, element: <Navigate to="dashboard" replace /> },

      // ✅ Dashboard pages
      { path: "dashboard", element: <OverviewDashboardPage /> },
      { path: "dashboard/sotuv", element: <SotuvDashboardPage /> },
      { path: "dashboard/sklad", element: <SkladDashboardPage /> },

      // ✅ Settings / Catalog
      { path: "dashboard/settings/dicts", element: <DictsSettingsPage /> },
      { path: "dashboard/catalog/products", element: <ProductsPage /> },
      { path: "dashboard/catalog/materials", element: <MaterialsPage /> },
      { path: "dashboard/catalog/recipes", element: <RecipesPage /> },
      { path: "dashboard/catalog/recipes/:id", element: <RecipeDetailPage /> },

      // ✅ Purchases
      { path: "dashboard/purchases", element: <PurchasesListPage /> },
      { path: "dashboard/purchases/:id", element: <PurchaseDetailPage /> },

      // ✅ Profile
      { path: "profile", element: <ProfilePage /> },

      // ✅ Moliya (nested)  /dashboard/moliya/...
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

      // ✅ Sklad + Warehouse (nested) /dashboard/sklad/warehouse/...
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
              {
                path: "internal-orders",
                element: <WarehouseInternalOrdersPage />,
              },
              { path: "balances", element: <StockOnHandPage /> },
              { path: "warehouses", element: <WarehousesPage /> },
              { path: "movements", element: <WarehouseMovementsPage /> },

              // aliases (старые ссылки)
              { path: "stock", element: <Navigate to="balances" replace /> },
              { path: "receipt", element: <Navigate to="receipts" replace /> },
              {
                path: "transfer",
                element: <Navigate to="transfers" replace />,
              },
              {
                path: "writeoff",
                element: <Navigate to="write-offs" replace />,
              },
              {
                path: "inventory",
                element: <Navigate to="inventories" replace />,
              },
            ],
          },
        ],
      },

      // ✅ Sotuv routes /sotuv/...
      {
        path: "sotuv",
        element: <Outlet />,
        children: [
          { index: true, element: <Navigate to="orders" replace /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "orders/new", element: <OrderCreatePage /> },
        ],
      },

      // ✅ Xodimlar /xodimlar/...
      {
        path: "xodimlar",
        element: <Outlet />,
        children: [
          { index: true, element: <TabsCrudTS /> },
          { path: "form", element: <Xodimlar /> },
          { path: "employees", element: <XodimlarTable /> },
        ],
      },

      // ✅ optional: /login (если хочешь отдельный логин не через /auth/login)
      { path: "login", element: <LoginPage /> },

      // ✅ fallback
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },

  // ✅ auth group (public only)
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/auth",
        element: <AuthLayout />,
        children: [
          { index: true, element: <Navigate to="login" replace /> },
          { path: "login", element: <LoginPage /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
