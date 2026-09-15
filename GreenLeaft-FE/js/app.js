/**
 * GreenLeaf Shop - Frontend Client
 * Pure Vanilla JavaScript ES6+
 */

const API_BASE_URL = 'http://localhost:5001/api';

// State
let products = [];
let activeCategory = 'all';
let activeStock = 'all';
let activeSort = 'newest';
let searchQuery = '';
let currentView = 'grid';
let editingProductId = null;
let deletingProduct = null;
let searchDebounceTimer = null;

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const productsTableWrapper = document.getElementById('productsTableWrapper');
const productsTableBody = document.getElementById('productsTableBody');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const categoryPills = document.getElementById('categoryPills');
const searchInput = document.getElementById('searchInput');
const btnClearSearch = document.getElementById('btnClearSearch');
const stockFilter = document.getElementById('stockFilter');
const sortSelect = document.getElementById('sortSelect');
const viewGridBtn = document.getElementById('viewGridBtn');
const viewTableBtn = document.getElementById('viewTableBtn');
const btnResetFilters = document.getElementById('btnResetFilters');

// Stats Elements
const statTotalCount = document.getElementById('statTotalCount');
const statInStock = document.getElementById('statInStock');
const statOutOfStock = document.getElementById('statOutOfStock');
const statTotalValue = document.getElementById('statTotalValue');
const apiStatusText = document.getElementById('apiStatusText');
const statusDot = document.querySelector('.status-dot');

// Modal Elements
const productModal = document.getElementById('productModal');
const deleteModal = document.getElementById('deleteModal');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const productIdInput = document.getElementById('productId');
const productNameInput = document.getElementById('productName');
const productCategoryInput = document.getElementById('productCategory');
const productPriceInput = document.getElementById('productPrice');
const productStockInput = document.getElementById('productStock');
const productImageUrlInput = document.getElementById('productImageUrl');
const imagePreview = document.getElementById('imagePreview');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const productDescriptionInput = document.getElementById('productDescription');
const productFeaturedInput = document.getElementById('productFeatured');
const btnOpenAddModal = document.getElementById('btnOpenAddModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelModal = document.getElementById('btnCancelModal');
const btnSubmitModal = document.getElementById('btnSubmitModal');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const deleteProductName = document.getElementById('deleteProductName');
const toastContainer = document.getElementById('toastContainer');

// ============================================================================
// Initialization & Event Listeners
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

async function initApp() {
  await checkApiHealth();
  await loadCategories();
  await loadStats();
  await loadProducts();
}

function setupEventListeners() {
  // Search input with debounce
  searchInput.addEventListener('input', (e) => {
    const value = e.target.value;
    btnClearSearch.style.display = value ? 'block' : 'none';
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      searchQuery = value;
      loadProducts();
    }, 300);
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    btnClearSearch.style.display = 'none';
    loadProducts();
  });

  // Stock Filter & Sort Select
  stockFilter.addEventListener('change', (e) => {
    activeStock = e.target.value;
    loadProducts();
  });

  sortSelect.addEventListener('change', (e) => {
    activeSort = e.target.value;
    loadProducts();
  });

  // Reset Filters
  btnResetFilters.addEventListener('click', resetAllFilters);

  // View switchers
  viewGridBtn.addEventListener('click', () => switchView('grid'));
  viewTableBtn.addEventListener('click', () => switchView('table'));

  // Modals
  btnOpenAddModal.addEventListener('click', () => openProductModal());
  btnCloseModal.addEventListener('click', closeProductModal);
  btnCancelModal.addEventListener('click', closeProductModal);
  productForm.addEventListener('submit', handleFormSubmit);

  // Live Image preview
  productImageUrlInput.addEventListener('input', (e) => updateImagePreview(e.target.value));

  // Delete modal buttons
  btnCancelDelete.addEventListener('click', closeDeleteModal);
  btnConfirmDelete.addEventListener('click', confirmDeleteProduct);

  // Close modals on backdrop click
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
  });
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeDeleteModal();
    }
  });
}

// ============================================================================
// API Calls & Data Fetching
// ============================================================================

async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      statusDot.classList.add('online');
      apiStatusText.textContent = 'Máy chủ: Đang hoạt động';
      return true;
    }
  } catch (err) {
    statusDot.classList.remove('online');
    apiStatusText.textContent = 'Máy chủ: Không kết nối được';
    showToast('Không thể kết nối đến máy chủ Backend (cổng 5001)', 'error');
    return false;
  }
}

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/products/stats`);
    if (!res.ok) return;
    const data = await res.json();

    statTotalCount.textContent = data.totalCount || 0;
    statInStock.textContent = data.inStockCount || 0;
    statOutOfStock.textContent = data.outOfStockCount || 0;
    statTotalValue.textContent = formatVND(data.totalValue || 0);
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/products/categories`);
    if (!res.ok) return;
    const categories = await res.json();
    renderCategoryPills(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

function renderCategoryPills(categories) {
  categoryPills.innerHTML = `
    <button class="pill ${activeCategory === 'all' ? 'active' : ''}" data-category="all">Tất cả</button>
  `;

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `pill ${activeCategory === cat ? 'active' : ''}`;
    btn.dataset.category = cat;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-pills .pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = cat;
      loadProducts();
    });
    categoryPills.appendChild(btn);
  });

  // First pill click event
  const allBtn = categoryPills.querySelector('[data-category="all"]');
  allBtn.addEventListener('click', () => {
    document.querySelectorAll('.category-pills .pill').forEach(p => p.classList.remove('active'));
    allBtn.classList.add('active');
    activeCategory = 'all';
    loadProducts();
  });
}

async function loadProducts() {
  showLoading(true);
  try {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (activeCategory !== 'all') params.append('category', activeCategory);
    if (activeStock !== 'all') params.append('stock', activeStock);
    if (activeSort) params.append('sort', activeSort);

    const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
    
    products = await res.json();
    renderProducts();
  } catch (err) {
    console.error('Error loading products:', err);
    showToast('Lỗi khi tải dữ liệu sản phẩm!', 'error');
  } finally {
    showLoading(false);
  }
}

// ============================================================================
// Rendering
// ============================================================================

function renderProducts() {
  if (products.length === 0) {
    emptyState.classList.remove('hidden');
    productsGrid.classList.add('hidden');
    productsTableWrapper.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  if (currentView === 'grid') {
    productsGrid.classList.remove('hidden');
    productsTableWrapper.classList.add('hidden');
    renderGridView();
  } else {
    productsGrid.classList.add('hidden');
    productsTableWrapper.classList.remove('hidden');
    renderTableView();
  }
}

function renderGridView() {
  productsGrid.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    
    const stock = Number(product.stock) || 0;
    let stockBadge = '';
    if (stock <= 0) {
      stockBadge = `<span class="stock-status-pill out-of-stock">● Hết hàng</span>`;
    } else if (stock < 10) {
      stockBadge = `<span class="stock-status-pill low-stock">● Sắp hết (${stock})</span>`;
    } else {
      stockBadge = `<span class="stock-status-pill in-stock">● Còn hàng (${stock})</span>`;
    }

    const fallbackImg = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80';
    const displayImg = product.imageUrl || fallbackImg;

    card.innerHTML = `
      <div class="card-image-wrap">
        <img src="${escapeHtml(displayImg)}" alt="${escapeHtml(product.name)}" onerror="this.src='${fallbackImg}'">
        ${product.isFeatured ? '<div class="featured-badge">★ Nổi bật</div>' : ''}
        <span class="category-tag">${escapeHtml(product.category || 'Khác')}</span>
      </div>

      <div class="card-content">
        <div class="card-header-row">
          <h4 class="product-title" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h4>
          <span class="product-rating">★ ${product.rating || '5.0'}</span>
        </div>

        <p class="product-desc">${escapeHtml(product.description || 'Sản phẩm thân thiện với môi trường và sức khỏe gia đình.')}</p>

        <div class="card-footer-info">
          <div class="price-box">
            <span class="price-label">Giá bán</span>
            <span class="price-amount">${formatVND(product.price)}</span>
          </div>
          ${stockBadge}
        </div>
      </div>

      <div class="card-action-bar">
        <button class="btn-icon edit-btn" title="Chỉnh sửa sản phẩm" onclick="openProductModal('${product.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        <button class="btn-icon delete-btn" title="Xóa sản phẩm" onclick="openDeleteModal('${product.id}', '${escapeHtml(product.name)}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;

    productsGrid.appendChild(card);
  });
}

function renderTableView() {
  productsTableBody.innerHTML = '';
  const fallbackImg = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80';

  products.forEach(product => {
    const tr = document.createElement('tr');
    const stock = Number(product.stock) || 0;
    let stockBadge = '';
    if (stock <= 0) {
      stockBadge = `<span class="stock-status-pill out-of-stock">Hết hàng</span>`;
    } else if (stock < 10) {
      stockBadge = `<span class="stock-status-pill low-stock">Sắp hết (${stock})</span>`;
    } else {
      stockBadge = `<span class="stock-status-pill in-stock">Còn hàng (${stock})</span>`;
    }

    tr.innerHTML = `
      <td>
        <img class="table-thumb" src="${escapeHtml(product.imageUrl || fallbackImg)}" alt="${escapeHtml(product.name)}" onerror="this.src='${fallbackImg}'">
      </td>
      <td>
        <strong>${escapeHtml(product.name)}</strong>
        ${product.isFeatured ? '<span style="color:#d97706; font-size:0.75rem; margin-left:6px;">★ Nổi bật</span>' : ''}
      </td>
      <td><span class="pill" style="font-size:0.75rem; padding:4px 10px;">${escapeHtml(product.category || 'Khác')}</span></td>
      <td><strong>${formatVND(product.price)}</strong></td>
      <td>${stock}</td>
      <td>${stockBadge}</td>
      <td class="text-right">
        <div style="display:inline-flex; gap:6px;">
          <button class="btn-icon edit-btn" title="Chỉnh sửa" onclick="openProductModal('${product.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="btn-icon delete-btn" title="Xóa" onclick="openDeleteModal('${product.id}', '${escapeHtml(product.name)}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    `;
    productsTableBody.appendChild(tr);
  });
}

function switchView(view) {
  currentView = view;
  if (view === 'grid') {
    viewGridBtn.classList.add('active');
    viewTableBtn.classList.remove('active');
  } else {
    viewGridBtn.classList.remove('active');
    viewTableBtn.classList.add('active');
  }
  renderProducts();
}

function showLoading(isLoading) {
  if (isLoading) {
    loadingIndicator.classList.remove('hidden');
    productsGrid.classList.add('hidden');
    productsTableWrapper.classList.add('hidden');
  } else {
    loadingIndicator.classList.add('hidden');
  }
}

function resetAllFilters() {
  searchInput.value = '';
  searchQuery = '';
  btnClearSearch.style.display = 'none';
  activeCategory = 'all';
  activeStock = 'all';
  activeSort = 'newest';
  stockFilter.value = 'all';
  sortSelect.value = 'newest';

  document.querySelectorAll('.category-pills .pill').forEach(p => {
    if (p.dataset.category === 'all') p.classList.add('active');
    else p.classList.remove('active');
  });

  loadProducts();
}

// ============================================================================
// Modal Handlers (Create & Edit)
// ============================================================================

window.openProductModal = function(id = null) {
  productForm.reset();
  updateImagePreview('');

  if (id) {
    const product = products.find(p => String(p.id) === String(id));
    if (!product) return;

    editingProductId = product.id;
    modalTitle.textContent = 'Chỉnh Sửa Sản Phẩm';
    productIdInput.value = product.id;
    productNameInput.value = product.name || '';
    productCategoryInput.value = product.category || 'Trà & Thảo Mộc';
    productPriceInput.value = product.price || 0;
    productStockInput.value = product.stock !== undefined ? product.stock : 0;
    productImageUrlInput.value = product.imageUrl || '';
    productDescriptionInput.value = product.description || '';
    productFeaturedInput.checked = Boolean(product.isFeatured);
    updateImagePreview(product.imageUrl);
  } else {
    editingProductId = null;
    modalTitle.textContent = 'Thêm Sản Phẩm Mới';
    productIdInput.value = '';
  }

  productModal.classList.remove('hidden');
  productNameInput.focus();
};

function closeProductModal() {
  productModal.classList.add('hidden');
  editingProductId = null;
}

function updateImagePreview(url) {
  if (url && url.trim()) {
    imagePreview.src = url.trim();
    imagePreview.classList.remove('hidden');
    previewPlaceholder.classList.add('hidden');
    imagePreview.onerror = () => {
      imagePreview.classList.add('hidden');
      previewPlaceholder.classList.remove('hidden');
      previewPlaceholder.textContent = 'Lỗi ảnh';
    };
  } else {
    imagePreview.classList.add('hidden');
    previewPlaceholder.classList.remove('hidden');
    previewPlaceholder.textContent = 'Xem trước';
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const name = productNameInput.value.trim();
  const category = productCategoryInput.value;
  const price = Number(productPriceInput.value);
  const stock = Number(productStockInput.value);
  const imageUrl = productImageUrlInput.value.trim();
  const description = productDescriptionInput.value.trim();
  const isFeatured = productFeaturedInput.checked;

  if (!name) {
    showToast('Vui lòng nhập tên sản phẩm!', 'error');
    return;
  }
  if (isNaN(price) || price < 0) {
    showToast('Đơn giá không hợp lệ!', 'error');
    return;
  }
  if (isNaN(stock) || stock < 0) {
    showToast('Số lượng kho không hợp lệ!', 'error');
    return;
  }

  const payload = {
    name,
    category,
    price,
    stock,
    imageUrl,
    description,
    isFeatured
  };

  const btnText = btnSubmitModal.querySelector('.btn-text');
  btnSubmitModal.disabled = true;
  btnText.textContent = 'Đang lưu...';

  try {
    let res;
    if (editingProductId) {
      res = await fetch(`${API_BASE_URL}/products/${editingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Có lỗi xảy ra khi lưu sản phẩm');
    }

    closeProductModal();
    showToast(editingProductId ? 'Đã cập nhật sản phẩm thành công!' : 'Đã thêm sản phẩm mới thành công!', 'success');
    
    // Refresh stats, categories & products
    await loadStats();
    await loadCategories();
    await loadProducts();
  } catch (err) {
    console.error('Save error:', err);
    showToast(err.message || 'Lỗi khi lưu sản phẩm', 'error');
  } finally {
    btnSubmitModal.disabled = false;
    btnText.textContent = 'Lưu sản phẩm';
  }
}

// ============================================================================
// Delete Confirmation Modal
// ============================================================================

window.openDeleteModal = function(id, name) {
  deletingProduct = { id, name };
  deleteProductName.textContent = `"${name}"`;
  deleteModal.classList.remove('hidden');
};

function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  deletingProduct = null;
}

async function confirmDeleteProduct() {
  if (!deletingProduct) return;

  btnConfirmDelete.disabled = true;
  btnConfirmDelete.textContent = 'Đang xóa...';

  try {
    const res = await fetch(`${API_BASE_URL}/products/${deletingProduct.id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Xóa thất bại');
    }

    closeDeleteModal();
    showToast(`Đã xóa sản phẩm thành công!`, 'success');
    
    await loadStats();
    await loadCategories();
    await loadProducts();
  } catch (err) {
    console.error('Delete error:', err);
    showToast(err.message || 'Lỗi khi xóa sản phẩm', 'error');
  } finally {
    btnConfirmDelete.disabled = false;
    btnConfirmDelete.textContent = 'Xóa ngay';
  }
}

// ============================================================================
// Helper Utilities
// ============================================================================

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
