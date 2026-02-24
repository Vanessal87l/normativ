/**
 * ✅ formatUZS
 * Vazifasi:
 * - pulni o‘qilishi oson format qilish
 * Eslatma: backend pulni tiyin/so‘mda yuborishiga qarab keyin moslaymiz.
 */
export function formatUZS(amount: number) {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so‘m"
}
