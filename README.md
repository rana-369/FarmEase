# 🚜 FarmEase

FarmEase is a comprehensive, two-sided agri-equipment rental platform designed to connect farmers with equipment owners. This platform empowers farmers to easily browse, book, and pay for agricultural machinery per hour, while providing equipment owners with a streamlined dashboard to list and manage their inventory. 

An integrated admin panel ensures smooth operations and secure oversight of the entire ecosystem.

## ✨ Key Features

* **🧑‍🌾 For Farmers:** Browse available equipment, check availability, and book machinery seamlessly.
* **🚜 For Equipment Owners:** List new equipment, manage existing inventory, and track earnings.
* **🛡️ Admin Dashboard:** Monitor overall operations, manage users, and oversee transactions.
* **💳 Secure Payments:** Integrated with **Razorpay** for safe, reliable, and swift transactions.
* **🔐 Security:** Role-Based Access Control (RBAC) ensures users only see what they are permitted to see.

## 🛠️ Tech Stack

This project is built using a modern full-stack architecture, utilizing a monorepo structure to keep the frontend and backend clearly separated.

### Frontend
* **Framework:** React.js
* **Language:** JavaScript
* **Integration:** REST APIs for seamless backend communication

### Backend
* **Framework:** .NET 8 Web API
* **Architecture:** N-Tier Layered Architecture (Domain, Repositories, Services, API)
* **Database:** SQL Server
* **ORM:** Entity Framework (EF) Core with Code-First Migrations
* **Payment Gateway:** Razorpay API

## 📂 Project Structure

```text
FarmEase/
│
├── FeBackend/               # .NET 8 Backend Solution
│   ├── FarmEase/            # Main Web API Project
│   ├── FECommon/            # Shared utilities and DTOs
│   ├── FEDomain/            # Core business entities and interfaces
│   ├── FERepositories/      # Data access layer and DB Context
│   └── FEServices/          # Business logic and external integrations
│
└── FeFrontend/              # React.js Single Page Application
