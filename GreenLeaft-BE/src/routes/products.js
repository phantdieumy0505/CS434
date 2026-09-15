import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/products.json');

const router = express.Router();

// Helper to read products
function readProducts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products file:', error);
    return [];
  }
}

// Helper to save products
function saveProducts(products) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing products file:', error);
    return false;
  }
}

// Default fallback images by category
const DEFAULT_IMAGES = {
  'Trà & Thảo Mộc': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'Cây Cảnh Trong Nhà': 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80',
  'Mỹ Phẩm Hữu Cơ': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
  'Đồ Dùng Tự Nhiên': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
  'Khác': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80'
};

// GET /api/products/stats - summary stats
router.get('/stats', (req, res) => {
  const products = readProducts();
  const totalCount = products.length;
  const inStockCount = products.filter(p => Number(p.stock) > 0).length;
  const outOfStockCount = totalCount - inStockCount;
  const totalValue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  res.json({
    totalCount,
    inStockCount,
    outOfStockCount,
    totalValue,
    totalCategories: categories.length,
    categories
  });
});

// GET /api/products/categories - unique category list
router.get('/categories', (req, res) => {
  const products = readProducts();
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  res.json(categories);
});

// GET /api/products - list all with filter, search & sort
router.get('/', (req, res) => {
  let products = readProducts();
  const { q, category, stock, sort } = req.query;

  // Search keyword (name or description)
  if (q && q.trim()) {
    const searchLower = q.trim().toLowerCase();
    products = products.filter(p =>
      (p.name && p.name.toLowerCase().includes(searchLower)) ||
      (p.description && p.description.toLowerCase().includes(searchLower)) ||
      (p.category && p.category.toLowerCase().includes(searchLower))
    );
  }

  // Filter category
  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  // Filter stock status
  if (stock === 'in-stock') {
    products = products.filter(p => Number(p.stock) > 0);
  } else if (stock === 'out-of-stock') {
    products = products.filter(p => Number(p.stock) === 0);
  }

  // Sorting
  if (sort === 'price-asc') {
    products.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sort === 'price-desc') {
    products.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sort === 'name-asc') {
    products.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  } else if (sort === 'stock-desc') {
    products.sort((a, b) => Number(b.stock) - Number(a.stock));
  } else {
    // Default newest
    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  res.json(products);
});

// GET /api/products/:id - single product
router.get('/:id', (req, res) => {
  const products = readProducts();
  const product = products.find(p => String(p.id) === String(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  }
  res.json(product);
});

// POST /api/products - create product
router.post('/', (req, res) => {
  const { name, category, price, stock, description, imageUrl, isFeatured } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Tên sản phẩm không được để trống' });
  }
  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: 'Giá sản phẩm phải là số hợp lệ lớn hơn hoặc bằng 0' });
  }

  const products = readProducts();
  const newProduct = {
    id: 'prod-' + Date.now(),
    name: name.trim(),
    category: category ? category.trim() : 'Khác',
    price: Math.round(Number(price)),
    stock: stock !== undefined && !isNaN(Number(stock)) ? Math.max(0, Math.floor(Number(stock))) : 0,
    description: description ? description.trim() : '',
    imageUrl: (imageUrl && imageUrl.trim()) ? imageUrl.trim() : (DEFAULT_IMAGES[category] || DEFAULT_IMAGES['Khác']),
    rating: 5.0,
    isFeatured: Boolean(isFeatured),
    createdAt: new Date().toISOString()
  };

  products.unshift(newProduct);
  const success = saveProducts(products);
  if (!success) {
    return res.status(500).json({ error: 'Lỗi ghi dữ liệu sản phẩm' });
  }

  res.status(201).json(newProduct);
});

// PUT /api/products/:id - update product
router.put('/:id', (req, res) => {
  const { name, category, price, stock, description, imageUrl, isFeatured } = req.body;
  const products = readProducts();
  const index = products.findIndex(p => String(p.id) === String(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm cần cập nhật' });
  }

  if (name !== undefined && !name.trim()) {
    return res.status(400).json({ error: 'Tên sản phẩm không được để trống' });
  }
  if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
    return res.status(400).json({ error: 'Giá sản phẩm phải là số hợp lệ' });
  }

  const existing = products[index];
  const updatedProduct = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    category: category !== undefined ? category.trim() : existing.category,
    price: price !== undefined ? Math.round(Number(price)) : existing.price,
    stock: stock !== undefined && !isNaN(Number(stock)) ? Math.max(0, Math.floor(Number(stock))) : existing.stock,
    description: description !== undefined ? description.trim() : existing.description,
    imageUrl: (imageUrl && imageUrl.trim()) ? imageUrl.trim() : (existing.imageUrl || DEFAULT_IMAGES['Khác']),
    isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
    updatedAt: new Date().toISOString()
  };

  products[index] = updatedProduct;
  const success = saveProducts(products);
  if (!success) {
    return res.status(500).json({ error: 'Lỗi lưu thay đổi sản phẩm' });
  }

  res.json(updatedProduct);
});

// DELETE /api/products/:id - delete product
router.delete('/:id', (req, res) => {
  let products = readProducts();
  const index = products.findIndex(p => String(p.id) === String(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm cần xóa' });
  }

  const deletedProduct = products[index];
  products.splice(index, 1);
  const success = saveProducts(products);
  if (!success) {
    return res.status(500).json({ error: 'Lỗi xóa sản phẩm' });
  }

  res.json({ message: 'Đã xóa sản phẩm thành công', product: deletedProduct });
});

export default router;
