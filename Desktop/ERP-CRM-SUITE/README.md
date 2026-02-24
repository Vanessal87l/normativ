# ERP / CRM Suite (Monorepo)

Bu repoda 3 ta React + TypeScript (Vite) app bor:

- `apps/portal` – umumiy Landing (rasm + select ERP/CRM)
- `apps/erp` – ERP-SOLUTION
- `apps/crm` – CRM

## Ishga tushirish (DEV)

1) Node.js 18+ tavsiya qilinadi
2) Root papkada:

```bash
npm install
npm run dev
```

Shunda:
- Portal: http://localhost:5173
- ERP: http://localhost:5174
- CRM: http://localhost:5175

Portal sahifada select orqali ERP yoki CRM tanlanadi va "Ochish" bosilganda tegishli ilovaga yo'naltiradi.

## Build (PROD)

```bash
npm run build
```

Build natijalar:
- `apps/portal/dist`
- `apps/erp/dist`
- `apps/crm/dist`

### Bir domen ostida `.../erp` va `.../crm`

Prod'da bitta domen ostida ishlatish uchun serverda shunday yo'l qilasiz:
- `/` -> portal `dist`
- `/erp` -> erp `dist`
- `/crm` -> crm `dist`

> Portal kodida localda avtomatik `5174/5175` ga, prod'da esa `/erp` va `/crm` ga yo'naltiradi.

## Rasmni almashtirish
Portal rasm: `apps/portal/src/assets/hero.svg`
