# Mess Maintain Web App - Project Overview

This document provides a comprehensive overview of the **Mess Maintain** web application. It is used as a reference to quickly understand the project's architecture, features, and internal workings.

## 🚀 Overview
**Mess Maintain** is a full-stack web application designed to help bachelor messes or hostels manage their daily meals, expenses, deposits, and cook's salary in a transparent and automated way.

## 💻 Tech Stack
- **Frontend & Backend:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, `lucide-react` for icons, `recharts` for charts
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Custom JWT (JSON Web Tokens) with `jose`, stored in `HttpOnly` cookies.
- **Reporting:** `jspdf` and `jspdf-autotable` for generating monthly PDF reports.

## 📊 Database Models (Schemas)
1. **User (`User.ts`)**: Stores member details (name, email, phone, password, role).
2. **Mess (`Mess.ts`)**: The core entity representing a mess. Contains mess name, manager ID, list of members, and cook details (`cookName`, `cookPhone`).
3. **Meal (`Meal.ts`)**: Tracks the daily meals consumed by each member.
4. **Expense (`Expense.ts`)**: Tracks all financial transactions. Types include:
   - `Deposit`: Money added by a member.
   - `Bazar/Meal Cost`: General mess groceries.
   - `Individual Cost`: Cost incurred by a specific member only.
   - `Shared Cost`: Extra mess costs shared equally among all members (e.g., WiFi, Gas).
5. **CookSetting (`CookSetting.ts`)**: Month-to-month tracking of the cook's salary, payment status, and notes. Uses a roll-forward logic (if a month has no salary set, it inherits the last set salary).
6. **CookMeal (`CookMeal.ts`)**: Tracks the cook's daily attendance (Afternoon and Night meals cooked or missed).

## 🔑 Roles & Permissions
- **Manager**: The creator of the mess. Has full read/write access. Can edit meals, expenses, cook settings, and manage members.
- **Member**: Has Read-Only access to most pages (Dashboard, Meals, Expenses, Cook Tracker, Report). Can view their own stats and global mess stats but cannot edit data.

## ✨ Core Features & Pages

### 1. Dashboard (`/dashboard`)
- Displays global mess statistics (Total Meals, Meal Rate, Mess Balance).
- Displays personal stats (My Deposit, My Total Cost, My Balance).
- **Charts:** A pie chart for Cost Breakdown and a Bar chart for Daily Activity (Deposits vs Costs).
- **Recent Transactions:** A paginated table showing the latest financial entries.

### 2. Meals Tracker (`/dashboard/meals`)
- A grid showing daily meals for all members.
- Manager can edit meals for any date.

### 3. Expenses (`/dashboard/expenses`)
- Tracks all financial entries (Deposits and Costs).
- Automatically calculates the "Meal Rate" (Total Meal Cost / Total Meals).

### 4. Cook (খালা) Tracker (`/dashboard/cook-tracker`)
- **Profile:** Manage cook's name and phone number.
- **Salary Tracking:** Tracks monthly salary. Automatically deducts money if the cook misses a meal (Per Meal Cost = Salary / Total Meals in month).
- **Attendance:** A daily toggle for Afternoon (দুপুর) and Night (রাত) meals.
- **Roll Forward Logic:** If a salary is set in August, September will automatically inherit the August salary unless explicitly changed.
- **Read-Only Access:** Members can view the tracker and absence summary, but only the manager can edit.

### 5. Report & PDF Generation (`/dashboard/report`)
- A comprehensive monthly summary page.
- **Low Balance Alert:** Automatically tags members with a red `Low Balance ⚠️` badge if their individual balance falls below zero.
- **PDF Export:** Generates a multi-page PDF containing the Mess Summary, Member Balances, Daily Meal Matrix, and Itemized Expense Tables.

### 6. Member Management (`/dashboard/members`)
- Displays all active members, their roles, and contact information.

## 🔄 Core Logic Flow
- **Meal Rate Calculation**: `Total Bazar Cost / Total Meals in Mess`.
- **Individual Total Cost**: `(Meal Rate × Individual Meals) + Shared Cost Per Person + Individual Specific Costs`.
- **Member Balance**: `Total Deposit - Individual Total Cost`.

---
*Generated for future context and AI analysis.*
