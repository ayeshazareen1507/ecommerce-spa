import express from 'express';
// --- Cart (auth required) ---
// GET current cart
app.get('/cart', authMiddleware, async (req, res) => {
const db = await readDB();
const user = db.users.find(u => u.id === req.user.sub);
if (!user) return res.status(401).json({ message: 'User not found' });
res.json(user.cart || {});
});


// POST add item (increments qty)
app.post('/cart', authMiddleware, async (req, res) => {
const { itemId, qty = 1 } = req.body || {};
if (!itemId) return res.status(400).json({ message: 'itemId required' });
const db = await readDB();
const user = db.users.find(u => u.id === req.user.sub);
if (!user) return res.status(401).json({ message: 'User not found' });
const item = db.items.find(i => i.id === itemId);
if (!item) return res.status(404).json({ message: 'Item not found' });
user.cart = user.cart || {};
const current = Number(user.cart[itemId] || 0);
user.cart[itemId] = current + Number(qty);
await writeDB(db);
res.json(user.cart);
});


// PATCH update exact qty (>=0) for an item
app.patch('/cart', authMiddleware, async (req, res) => {
const { itemId, qty } = req.body || {};
if (!itemId || qty == null) return res.status(400).json({ message: 'itemId and qty required' });
const q = Number(qty);
if (q < 0) return res.status(400).json({ message: 'qty must be >= 0' });
const db = await readDB();
const user = db.users.find(u => u.id === req.user.sub);
if (!user) return res.status(401).json({ message: 'User not found' });
if (q === 0) delete user.cart[itemId]; else user.cart[itemId] = q;
await writeDB(db);
res.json(user.cart);
});


// DELETE remove item from cart
app.delete('/cart/:itemId', authMiddleware, async (req, res) => {
const db = await readDB();
const user = db.users.find(u => u.id === req.user.sub);
if (!user) return res.status(401).json({ message: 'User not found' });
user.cart = user.cart || {};
delete user.cart[req.params.itemId];
await writeDB(db);
res.json(user.cart);
});


app.get('/', (req, res) => {
res.json({ ok: true, routes: ['POST /auth/signup', 'POST /auth/login', 'GET/POST/PUT/DELETE /items', 'GET/POST/PATCH/DELETE /cart'] });
});


app.listen(PORT, () => {
console.log(`API listening on http://localhost:${PORT}`);
});