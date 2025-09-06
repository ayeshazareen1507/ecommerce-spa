# 🛍️ E-Commerce SPA (React + Bootstrap + Node/Express + JWT)

A simple **Single Page Application (SPA)** e-commerce website with **authentication, item CRUD, filtering, and cart management**.  
Built with **React (via CDN) + Bootstrap** on the frontend and **Node.js + Express + JWT** on the backend.

---

## 🚀 Features
### Frontend (React + Bootstrap)
- Signup and Login pages (JWT authentication)
- Item listing with **filters** (search, price range)
- Add to Cart & Remove from Cart
- Cart persists after logout (stored server-side)
- Responsive and professional Bootstrap design

### Backend (Node.js + Express)
- JWT-based authentication APIs
- Item CRUD APIs (with filters: price, categories, search)
- Cart APIs (add, update, remove, fetch cart)
- In-memory or simple DB storage (can connect to MongoDB/Postgres if needed)

---

## 📂 Project Structure
ecommerce-spa/
├── backend/ # Node.js + Express + JWT API
│ ├── server.js
│ ├── package.json
│ └── ...
├── frontend/ # React + Bootstrap SPA
│ └── index.html
└── README.md