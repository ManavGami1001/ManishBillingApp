# Retail POS & Billing System

A production-ready, multi-tenant Point of Sale (POS) and billing application built for modern retail stores, featuring automated inclusive GST calculations, inventory management, and tax reporting.

## Tech Stack

- **Framework:** Next.js 16.3.0 (App Router, Turbopack)
- **Database & ORM:** PostgreSQL (Supabase), Prisma ORM
- **Styling & UI:** Tailwind CSS, Shadcn UI / Base UI
- **Authentication:** NextAuth.js
- **Spreadsheet Handling:** `xlsx` for GSTR-1 Excel Exports

## Core Features

- **POS Interface:** Rapid checkout screen with real-time inventory tracking, inclusive GST backward calculation, and zero-stock animation feedback.
- **Inventory & Soft Deletes:** Product management with cost price, selling price, dynamic stock adjustments, and safe archiving to preserve past invoice integrity.
- **Supplier Directory:** Manage vendors and track supply lines with dedicated CRUD controls.
- **Tax & GSTR Reports:** Automated calculation of monthly revenue, taxable values, CGST, SGST, and gross profit with one-click Excel export.
- **Store Settings:** Tenant-isolated configuration for custom store names, GSTIN, addresses, and contact info.
- **Invoice Actions:** Instant printing, browser-native PDF export, and Web Share API integration.

## Getting Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL database instance (e.g., Supabase)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Billing app MM"

2. **Install dependencies:**
   ```bash
   npm install

3. **Configure environment variables:**
   Create a .env file in the root directory and configure your credentials:
   ```Code snippet
   DATABASE_URL="postgresql://user:password@host:port/database"
   AUTH_SECRET="your-nextauth-secret"

4. **Initialize the database:**
   Sync your Prisma schema with your PostgreSQL instance:
   ```Bash
   npx prisma db push

5. **Run the development server:**
   ```Bash
   npm run dev
   Open http://localhost:3000 in your browser to access the dashboard.