import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";

// --- In-memory storage ---
let users = []; // { id, email, password }
let items = [
  { id: "1", title: "Laptop", price: 999, category: "electronics" },
  { id: "2", title: "Shoes", price: 59, category: "fashion" },
  { id: "3", title: "Headphones", price: 199, category: "electronics" },
];
let carts = {}; // { userId: { itemId: qty } }

// --- Helpers ---
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// --- Auth Routes ---
app.post("/auth/signup", (req, res) => {
  const { email, password } = req.body;
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }
  const user = { id: String(users.length + 1), email, password };
  users.push(user);
  const token = generateToken(user);
  res.json({ user: { id: user.id, email: user.email }, token });
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const token = generateToken(user);
  res.json({ user: { id: user.id, email: user.email }, token });
});

// --- Items CRUD ---
app.get("/items", (req, res) => {
  const { q, minPrice, maxPrice, category } = req.query;
  let filtered = [...items];

  if (q) filtered = filtered.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()));
  if (category) filtered = filtered.filter((i) => i.category === category);
  if (minPrice) filtered = filtered.filter((i) => i.price >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter((i) => i.price <= Number(maxPrice));

  res.json(filtered);
});

app.post("/items", (req, res) => {
  const { title, price, category } = req.body;
  const newItem = { id: String(items.length + 1), title, price, category };
  items.push(newItem);
  res.json(newItem);
});

app.put("/items/:id", (req, res) => {
  const { id } = req.params;
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return res.status(404).json({ message: "Item not found" });

  items[idx] = { ...items[idx], ...req.body };
  res.json(items[idx]);
});

app.delete("/items/:id", (req, res) => {
  const { id } = req.params;
  items = items.filter((i) => i.id !== id);
  res.json({ success: true });
});

// --- Cart APIs ---
app.get("/cart", authMiddleware, (req, res) => {
  const userId = req.user.id;
  res.json(carts[userId] || {});
});

app.post("/cart", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { itemId, qty } = req.body;
  if (!carts[userId]) carts[userId] = {};
  carts[userId][itemId] = (carts[userId][itemId] || 0) + qty;
  res.json(carts[userId]);
});

app.patch("/cart", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { itemId, qty } = req.body;
  if (!carts[userId]) carts[userId] = {};
  if (qty > 0) carts[userId][itemId] = qty;
  else delete carts[userId][itemId];
  res.json(carts[userId]);
});

app.delete("/cart/:id", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  if (carts[userId]) delete carts[userId][id];
  res.json(carts[userId] || {});
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
