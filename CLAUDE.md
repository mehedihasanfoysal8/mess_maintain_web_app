# MessMaintain Project Guide

## 🏗 Architecture
- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB (Mongoose models in `src/models/`)
- **API**: Route Handlers in `src/app/api/`
- **UI**: Tailwind CSS 4 + Lucide React icons
- **State Management**: React `useState` / `useEffect` (Server Actions not heavily used yet)

## 🛠 Tech Stack Details
- **Next.js**: Using newest `app/` structure.
- **Tailwind**: Version 4 (standard CSS-like syntax in config).
- **Authentication**: Custom JWT implementation (see `src/app/api/auth/`).
- **Models**:
  - `User`: Base user info + mess reference.
  - `Mess`: Group details, manager ID, member list.
  - `Meal`: Daily breakfast/lunch/dinner counts.
  - `Expense`: Deposits and mess costs.

## 📜 Development Rules
- **Styling**: Always prioritize premium aesthetics. Use `indigo-600` as the primary brand color.
- **Responsiveness**: Everything must work on mobile.
- **Database**: Always use `dbConnect()` in API routes.
- **Error Handling**: Standardize API responses with `{ error: "message" }` on failure.

## 🚀 Key Commands
- `npm run dev`: Start dev server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint

## 📁 File Structure
- `src/app/`: Routes and UI
- `src/models/`: Database schemas
- `src/lib/`: Utilities (DB connect, auth helpers)
- `src/components/`: Reusable UI components
- `public/`: Static assets
