import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"

import AppLayout from "./layouts/AppLayout"
import AuthLayout from "./layouts/AuthLayout"

import PublicOnlyRoute from "./pages/auth/PublicOnlyRoute"
import LoginPage from "./pages/auth/LoginPage"

import OrdersKanban from "./pages/orders/ordersKanban"
import NewOrderDialog from "./pages/orders/createOrders"

import OverviewDashboardPage from "./pages/Dashboard/overview/OverviewDashboardPage"


import SotuvDashboardPage from "./pages/sotuv/SotuvDashboardPage"
import SkladDashboardPage from "./pages/sklad/SkladDashboardPage"
import QarzdorlikDashboardPage from "./pages/qarzdorlik/QarzdorlikDashboardPage"

// ✅ WAREHOUSE
import WarehouseLayout from "./pages/sklad/warehouse/WarehouseLayout"
import WarehouseOverviewPage from "./pages/sklad/warehouse/overview/WarehouseOverviewPage"
import StockOnHandPage from "./pages/sklad/stock/StockOnHandPage"

// ✅ 3 ta dashboard page (senda shu papkalarda bo‘lsa)

import Xodimlar from "./pages/xodimlar/Xodimlar";
import XodimlarTable from "./pages/xodimlar/XodimlarTable";
import OrdersLayout from "./pages/ordersKanban/layout/OrdersLayout"
import Orders from "./pages/ordersKanban/Orders"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },

      { path: "dashboard", element: <OverviewDashboardPage /> },
      { path: "dashboard/sotuv", element: <SotuvDashboardPage /> },
      { path: "dashboard/qarzdorlik", element: <QarzdorlikDashboardPage /> },

      {
        path: "dashboard/sklad",
        element: <Outlet />,
        children: [
          { index: true, element: <SkladDashboardPage /> },

          {
            path: "warehouse",
            element: <WarehouseLayout />,
            children: [
              { index: true, element: <Navigate to="overview" replace /> },
              { path: "overview", element: <WarehouseOverviewPage /> },
              { path: "stock", element: <StockOnHandPage /> },
            ],
          },
        ],
      },

      {
        path: "sotuv",
        element: <Outlet />,
        children: [
          { index: true, element: <OrdersKanban /> },
          // { path: "orders", element: <OrdersKanban /> },
          { path: "New_order", element: <NewOrderDialog /> },
          { path: "Orders", element: <Orders /> },
        ],
      },
      {
        path: "xodimlar",
        element: <Outlet />, // yoki SotuvLayout
        children: [
          { index: true, element: <XodimlarTable /> },
          { path: "form", element: <Xodimlar /> },
          // { path: "New_order", element: <NewOrderDialog /> },
        ],
      },
      
    ],
  },

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
  {
    element:<OrdersLayout/>,
    children:[
       {
        path:"/Orders",
        element:<Orders/>,
        children:[
           
        ]
       } 
    ]
  },

  { path: "*", element: <Navigate to="/dashboard" replace /> },
])
