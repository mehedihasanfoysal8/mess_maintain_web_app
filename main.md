# 🏠 Mess Maintain Web App

A modern web application designed to simplify shared living management — track meals, expenses, deposits, and member activity in one centralized system.

---

## 🚀 Overview

Managing a mess (shared living space) manually is messy — calculations, tracking meals, and handling expenses often lead to confusion.

This app provides a **smart, digital solution** where:

- Members can track meals and deposits
- Managers can control expenses and reports
- Everything stays transparent and automated

---

## 👤 Authentication Flow

### 🔐 Sign Up

Users create an account using:

- Name
- Email
- Password
- Confirm Password
- Phone _(optional)_
- Address _(optional)_

---

### 🔑 Login

- Email
- Password

After login → Redirect to **Dashboard**

---

## 🏡 Mess Management

After login, users get two options:

![Dashboard Options](image.png)

---

### 1. ➕ Create New Mess

![Create Mess](image-1.png)

User becomes the **Manager**

**Form Fields:**

- Mess Name
- Initial Month
- Mess Password _(used by others to join)_

---

### 2. 🔗 Join Existing Mess

![Join Mess](image-2.png)

**Form Fields:**

- Mess Name
- Mess Password

User joins as a **Member**

---

## 👥 Roles

| Role    | Permissions                                                     |
| ------- | --------------------------------------------------------------- |
| Manager | Full control (expenses, deposits, approvals, settings)          |
| Member  | Limited access (view, meals, dashboard all data view, not edit) |

---

## 📊 Dashboard

![Dashboard](dashboar.png)

### 🧾 Overview

- Mess Name
- Active Month

### 📌 Personal Stats

- My Deposit
- My Meals
- Meal Rate
- Balance

---

### 📈 Mess Summary

- Total Members
- Total Meals
- Mess Meal Cost
- Total Shared Cost
- Total Deposits
- Mess Individual Cost
- Total All Cost
- Mess Balance

---

## 🍽️ Meals Management

### 1. Daily Entry

- List of all members
- Mark who ate meals

---

### 2. Monthly Summary

![Meal Chart 1](image-3.png)  
![Meal Chart 2](image-4.png)

- Chart view of meals per member
- Easy comparison and tracking

---

## 💸 Expense Management

👉 Only **Manager** can access

### UI Preview

![Expense 1](image-5.png)  
![Expense 2](image-6.png)  
![Expense 3](image-7.png)  
![Expense 4](image-8.png)

---

### ➕ Add Transaction

![Transaction Form](image-9.png)

**Form Fields:**

- Member (dropdown list)
- Transaction Type
- Amount
- Date
- Description

---

### 🔽 Transaction Types

1. Deposit
2. Bazar / Meal Cost
3. Shared Cost (WiFi, Gas, Maid)
4. Individual Cost

---

## 👨‍👩‍👧 Members Section

![Members](image-10.png)

- View all members
- Member details and participation

---

## 📑 Reports

- Generate full reports
- Export as **PDF**
- Monthly and overall summaries

---

## ⚙️ Settings

### 1. Mess Settings

![Mess Settings](image-11.png)

- Update mess information

---

### 2. Member Management

![Member Settings](image-12.png)

- View active members
- Promote to Manager
- Remove members

---

### 3. Joining Requests

- Manager approves/rejects requests

---

### 4. Months Management

![Months](image-13.png)

- View all months
- Delete old records

---

## 🎯 Key Features

- 🔐 Secure authentication
- 👥 Role-based access
- 📊 Real-time calculations
- 💸 Smart expense tracking
- 📈 Meal analytics
- 📄 PDF reports
- ⚙️ Full mess control panel

---

## 🛠️ Tech Stack

- **Frontend and Backend:** Next.js
- **Database:** mongoDB
- **ORM:** mongoose
- **UI:** Tailwind CSS / PrimeReact

---

- Advanced analytics dashboard

---

## 📌 Conclusion

This Mess Management System removes manual hassle and brings:

- Transparency
- Accuracy
- Simplicity

Perfect for students, bachelors, and shared living environments.
