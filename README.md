# GoVPN — Admin Panel

GoVPN xizmati uchun boshqaruv paneli. **Vue 3 (Composition API, `<script setup>`)** + **Vite** + **Tailwind CSS** + **Pinia** + **Vue Router** asosida qurilgan. Bitta HTML fayldan to'liq komponentli loyihaga ko'chirildi va alohida **login sahifasi** qo'shildi.

## Stack

- **Vue 3** — Composition API, `<script setup>`
- **Vite** — dev server va build
- **Tailwind CSS v3** — dizayn tokenlari `tailwind.config.js` ichida
- **Pinia** — holat boshqaruvi (auth, ui, data)
- **Vue Router** — sahifalar va auth guard
- **Chart.js** — grafiklar
- **SheetJS (xlsx)** — Excel eksport

## Ishga tushirish

```bash
npm install
npm run dev
```

So'ng brauzerda: **http://localhost:5173**

Production build:

```bash
npm run build
npm run preview
```

## Kirish (demo)

| Maydon | Qiymat |
|--------|--------|
| Email  | `admin@govpn.uz` |
| Parol  | `govpn` |

> Auth demo rejimida ishlaydi — sessiya `localStorage` da saqlanadi. Real backend ulash uchun `src/stores/auth.js` dagi `login()` ni API chaqiruviga almashtiring.

## Sahifalar

- **Пользователи** — KPI kartalar, qidiruv/filtr, saralanadigan jadval, sahifalash, foydalanuvchi paneli (qurilmalar + ulanishlar tarixi), bloklash/blokdan chiqarish (sabab bilan), Excel eksport.
- **Сессии** — joriy sessiyalar, sessiyalar grafigi (24 soat / hafta), xatolar grafigi, xatolar jurnali + Excel eksport.
- **Сервера** — node kartalari (status, yuklama, uptime), Outbound kanal grafigi (joriy / kun bo'yicha).
- **Оплата** — daromad va to'lovlar KPI, tranzaksiyalar jadvali filtrlar bilan.
- **Посещённые сайты** — period bo'yicha statistika (shu jumladan ixtiyoriy sana oralig'i), domenlar jadvali ulush diagrammasi bilan.

Yuqoridagi davr tanlagichi (kun / hafta / oy) KPI raqamlarini yangilaydi.

## Struktura

```
src/
├── main.js                 # ilova kirish nuqtasi
├── App.vue                 # root + global Toast
├── style.css               # Tailwind + reusable klasslar
├── router/index.js         # marshrutlar + auth guard
├── stores/                 # Pinia (auth, ui, data)
├── utils/                  # format, chart, xlsx yordamchilari
├── data/mock.js            # demo ma'lumotlar generatori
├── composables/useToast.js
├── components/
│   ├── ui/                 # Badge, StatCard, Segmented, Toast, ChartCanvas
│   ├── layout/             # Sidebar, Topbar
│   ├── UserDrawer.vue
│   └── BlockModal.vue
└── views/                  # LoginView, AdminLayout, Users/Sessions/Servers/Payments/Sites
```

## Eslatma

Interfeys matni **rus tilida** (asl HTML bilan bir xil). Kerak bo'lsa, butun UI ni o'zbek tiliga (yoki ko'p tilli) o'tkazish mumkin — barcha matnlar komponentlar ichida.
# govVpn
