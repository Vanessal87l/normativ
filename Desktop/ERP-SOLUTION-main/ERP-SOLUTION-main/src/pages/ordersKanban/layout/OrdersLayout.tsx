// import Orders from '@/pages/Orders';
import React from 'react'
import { Outlet } from "react-router-dom";

export default function OrdersLayout() {
  return (
<div className="min-h-screen  py-4 px-15 ">
      <Outlet />
  </div>
  )
}
