# 🧾 Expiry Inventory Management System (EXIMS)

> A MERN stack-based solution to help small shopkeepers manage product inventory and track expiry dates, reducing financial loss and product wastage.

[🔗 View Project Repository](https://github.com/SayoojVP/expiry-inventory-management)

---

## 📌 Overview

The **Expiry Inventory Management System (EXIMS)** is a web-based inventory and sales management platform that helps shopkeepers, especially in remote areas, track and manage products nearing expiry. It includes expiry alerts, product organization, barcode scanning, ERP features, and customer-side shopping.

---

## 🚀 Features

- 🔔 **Expiry Alerts** — Get notified when items are about to expire.
- 📦 **Inventory Management** — Add, update, and manage stock.
- 🧾 **Barcode Scanning** — Quick and accurate product entry.
- 🛍️ **Customer Portal** — Buy near-expiry discounted products.
- 👨‍💼 **Multi-role Access** — Admins, Shopkeepers, Customers.
- 💳 **Secure Payments** — (Planned/simulated demo integration).
- 📊 **ERP Tools** — Track inventory health and sales performance.

---

## ⚙️ Tech Stack

| Tech       | Description                                  |
|------------|----------------------------------------------|
| **MongoDB**| NoSQL database for inventory and user data   |
| **Express.js** | Backend framework handling APIs and logic |
| **React.js** | Frontend framework for UI/UX                |
| **Node.js** | Runtime environment for backend services     |

---

## 🧩 Folder Structure

expiry-inventory-management/
├── client/ # React frontend
│ └── src/
│ ├── components/ # UI components
│ └── pages/ # Pages for each user role
├── server/ # Node.js backend
│ ├── controllers/ # Route logic
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API endpoints
│ └── utils/ # Helper functions
├── .gitignore
├── README.md
└── package.json

---

## 🛠️ Setup Instructions
**Backend:**
cd server
npm install
npm start

**Frontend:**
cd ../client
npm install
npm start

(Make sure MongoDB is running and configured (either locally or via Atlas). If .env files are needed for database URL or port, create them accordingly.)

---

## 👥 User Roles

### 👨‍💼 Shopkeeper
- Add/edit/delete inventory
- Track expiry dates
- Receive notifications
- Process payments

### 🛒 Customer
- Browse and purchase items
- View discounts on near-expiry products

---

## 📚 Future Enhancements

- 📈 Analytics & sales reports
- 📱 Progressive Web App (PWA) support
- 📦 Delivery tracking & logistics integration
- 📬 Email & SMS notifications

---

## ✍️ Authors

- [Anujith K](https://github.com/AnujithK) – VDA21CS013  
- [Sayooj V P](https://github.com/SayoojVP) – VDA21CS057  

**Department of Computer Science & Engineering**  
College of Engineering Vadakara, Kerala  
*APJ Abdul Kalam Technological University*


