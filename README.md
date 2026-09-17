# Currency Converter

Live ECB exchange rates — convert, browse and chart currencies, with a bilingual interface (English / Polski).

🔗 **Live:** https://currency.saif1.usermd.net

## Features

- 💱 Converter with instant amounts, swap, and ECB reference rates
- 📅 Historical conversions — pick any date back to 1999
- 📊 Interactive history chart (Recharts) — 7 / 30 / 90 / 365-day ranges, cached per range
- 📋 Rates table for ~30 currencies, filterable by code or localized name
- 🌐 Bilingual UI (EN/PL): every string, currency name (Intl.DisplayNames), number and date format localized; choice persisted
- 🔗 Everything deep-linkable — the URL is the app's state: `?amount=100&from=EUR&to=PLN&date=2024-01-02`
- ⚡ TanStack Query: caching, deduplication, retries and cancellation across all requests
- ⚠️ Skeleton loaders, explicit error states with retry, error boundary

## Stack

React · TypeScript · Vite · TanStack Query · React Router · Recharts · react-i18next · plain CSS

## Getting started

    npm install
    npm run dev

## Notes

- Data: Frankfurter API (ECB reference rates) — keyless, no signup.
- Every page's state lives in the URL — shareable links restore the exact view.