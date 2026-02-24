// src/pages/purchases/demo.ts
import type { PageResponse, PurchaseDetail, PurchaseListItem } from "./types"

function isoMinusHours(h: number) {
  return new Date(Date.now() - h * 3600_000).toISOString()
}

export const DEMO_PURCHASES_LIST: PageResponse<PurchaseListItem> = {
  page: 1,
  page_size: 20,
  count: 3,
  results: [
    {
      id: 74,
      number: "00074",
      created_at: isoMinusHours(2),
      kontragent_name: "Farrux 3-02",
      organization_name: "tursunkhodja",
      currency: "UZS",
      total_amount: 294_000,
      invoiced_amount: 0,
      paid_amount: 120_000,
      received_amount: 294_000,
      reserved_amount: 0,
      status: "RECEIVED",
      comment: "Demo xarid 1",
    },
    {
      id: 73,
      number: "00073",
      created_at: isoMinusHours(8),
      kontragent_name: "Yunus 4-134",
      organization_name: "tursunkhodja",
      currency: "USD",
      total_amount: 98,
      invoiced_amount: 0,
      paid_amount: 0,
      received_amount: 98,
      reserved_amount: 0,
      status: "APPROVED",
      comment: "Demo xarid 2",
    },
    {
      id: 72,
      number: "00072",
      created_at: isoMinusHours(28),
      kontragent_name: "Umar 4-42",
      organization_name: "tursunkhodja",
      currency: "UZS",
      total_amount: 116_000,
      invoiced_amount: 0,
      paid_amount: 0,
      received_amount: 0,
      reserved_amount: 0,
      status: "DRAFT",
      comment: "Demo draft",
    },
  ],
}

export const DEMO_PURCHASES_DETAIL: Record<number, PurchaseDetail> = {
  74: {
    id: 74,
    number: "00074",
    created_at: isoMinusHours(2),
    updated_at: isoMinusHours(1),
    status: "RECEIVED",
    is_posted: true,
    is_reserved: false,

    organization_id: 1,
    organization_name: "tursunkhodja",
    kontragent_id: 12,
    kontragent_name: "Farrux 3-02",
    warehouse_id: 3,
    warehouse_name: "Asosiy sklad",

    currency: "UZS",
    planned_receive_date: new Date().toISOString().slice(0, 10),
    delivery_address: "Toshkent, Chilonzor, 12-uy",
    comment: "Qabul qilindi",

    vat_enabled: true,
    price_includes_vat: true,

    total_amount: 294_000,
    items: [
      {
        id: 1,
        name: "00018 4,5*50",
        qty: "10.000000",
        uom: "шт",
        price: 31_000,
        vat_rate: 12,
        discount_percent: 0,
        line_total: 310_000,
        available_qty: "322.000000",
        stock_qty: "322.000000",
      },
      {
        id: 2,
        name: "00016 4,5*100",
        qty: "10.000000",
        uom: "шт",
        price: 5_900,
        vat_rate: 12,
        discount_percent: 0,
        line_total: 59_000,
        available_qty: "247.000000",
        stock_qty: "247.000000",
      },
    ],
  },

  73: {
    id: 73,
    number: "00073",
    created_at: isoMinusHours(8),
    updated_at: isoMinusHours(6),
    status: "APPROVED",
    is_posted: false,
    is_reserved: true,

    organization_id: 1,
    organization_name: "tursunkhodja",
    kontragent_id: 7,
    kontragent_name: "Yunus 4-134",
    warehouse_id: 3,
    warehouse_name: "Asosiy sklad",

    currency: "USD",
    planned_receive_date: new Date().toISOString().slice(0, 10),
    delivery_address: "",
    comment: "Tasdiqlandi",

    vat_enabled: false,
    price_includes_vat: false,

    total_amount: 98,
    items: [
      {
        id: 1,
        name: "Material A",
        qty: "2.000000",
        uom: "kg",
        price: 49,
        vat_rate: 0,
        discount_percent: 0,
        line_total: 98,
      },
    ],
  },
}
