// import Orders from '@/pages/Orders';
import React from 'react'
import { Outlet } from "react-router-dom";

export default function OrdersLayout() {
  return (
<div className="min-h-screen bg-[#D8E9F0] py-4 px-15 ">
      <Outlet />
  </div>
  )
}
