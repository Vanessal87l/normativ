import React from "react"
import ReactDOM from "react-dom/client"
import AppProviders from "@/app/providers/AppProviders"
import "@/index.css"
import { ensureSeed } from "@/mock/fakeApi";

ensureSeed();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders />
  </React.StrictMode>
)