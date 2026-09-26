/**
 * FreshCart - Vanilla JavaScript User Panel
 * Modular, lightweight, mobile-first grocery shopping logic with Supabase integration.
 */

// Global State
let supabaseClient = null;
let allCategories = [];
let allProducts = [];
let activeCategoryId = 'all';
let searchQuery = '';
let cart = []; // Array of { product_id, name, price, unit, quantity, image_url }

// Fallback demo data if Supabase keys have not been configured yet
const DEMO_CATEGORIES = [
  { id: 1, name: "Vegetables", image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80" },
  { id: 2, name: "Fruits", image_url: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&auto=format&fit=crop&q=80" },
  { id: 3, name: "Grocery", image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80" },
  { id: 4, name: "Eggs", image_url: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400&auto=format&fit=crop&q=80" },
  { id: 5, name: "Fish", image_url: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=400&auto=format&fit=crop&q=80" },
  { id: 6, name: "Meat", image_url: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&auto=format&fit=crop&q=80" },
  { id: 7, name: "Drinks", image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80" },
  { id: 8, name: "Others", image_url: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&auto=format&fit=crop&q=80" }
];

const DEMO_PRODUCTS = [
  { id: 1, name: "Potato (আলু)", description: "Fresh local red and white potatoes", price: 50, unit: "kg", category_id: 1, image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 2, name: "Onion (পেঁয়াজ)", description: "High quality local deshi onion", price: 80, unit: "kg", category_id: 1, image_url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 3, name: "Tomato (টমেটো)", description: "Farm fresh ripe red tomatoes", price: 60, unit: "kg", category_id: 1, image_url: "https://images.unsplash.com/photo-1546470427-e26264be0b11?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 4, name: "Carrot (গাজর)", description: "Crisp sweet orange carrots", price: 70, unit: "kg", category_id: 1, image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 5, name: "Green Chili (কাঁচা মরিচ)", description: "Spicy fresh green chilies", price: 120, unit: "kg", category_id: 1, image_url: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 6, name: "Apple Fuji (আপেল)", description: "Sweet and crisp imported Fuji apples", price: 260, unit: "kg", category_id: 2, image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 7, name: "Banana Sagor (সাগর কলা)", description: "Naturally ripened sweet bananas", price: 100, unit: "dozen", category_id: 2, image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 8, name: "Miniket Rice (মিনিকেট চাল)", description: "Premium polished long grain Miniket rice", price: 75, unit: "kg", category_id: 3, image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 9, name: "Masoor Dal (মসুর ডাল)", description: "Clean premium red lentils", price: 135, unit: "kg", category_id: 3, image_url: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 10, name: "Farm Fresh Brown Eggs (লাল ডিম)", description: "Nutritious fresh brown chicken eggs", price: 145, unit: "dozen", category_id: 4, image_url: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 11, name: "Ruhi Fish (রুই মাছ)", description: "Cleaned fresh river Ruhi fish", price: 380, unit: "kg", category_id: 5, image_url: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 12, name: "Aarong Milk (দুধ)", description: "Pure pasteurized liquid milk", price: 90, unit: "litre", category_id: 7, image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80", available: true }
];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  loadCartFromStorage();
  updateCartBadge();
  setupEventListeners();
  loadAppData();
});

// Initialize Supabase Client
function initSupabase() {
  if (typeof window.supabase !== 'undefined' && SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('Supabase client initialized.');
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
    }
  }
}

// Load Categories & Products (Supabase with fallback)
async function loadAppData() {
  showLoading(true);
  try {
    await Promise.all([loadCategories(), loadProducts()]);
  } catch (error) {
    console.error('Error fetching grocery data:', error);
    showErrorState('Unable to load products. Please try again.');
  } finally {
    showLoading(false);
  }
}

// 1. loadCategories()
async function loadCategories() {
  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    allCategories = data || [];
  } else {
    // Demo fallback
    allCategories = DEMO_CATEGORIES;
  }
  displayCategories(allCategories);
}

// 2. loadProducts()
async function loadProducts() {
  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    allProducts = data || [];
  } else {
    // Demo fallback
    allProducts = DEMO_PRODUCTS;
  }
  displayProducts(getFilteredProducts());
}

// 3. displayCategories()
function displayCategories(categories) {
  const container = document.getElementById('categoryContainer');
  if (!container) return;

  // "All" button
  let html = `
    <button class="category-btn ${activeCategoryId === 'all' ? 'active' : ''}" data-id="all">
      <span>🛍️ All</span>
    </button>
  `;

  categories.forEach(cat => {
    const isActive = String(cat.id) === String(activeCategoryId);
    html += `
      <button class="category-btn ${isActive ? 'active' : ''}" data-id="${cat.id}">
        <span>${escapeHtml(cat.name)}</span>
      </button>
    `;
  });

  container.innerHTML = html;

  // Attach click events
  container.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-id');
      filterByCategory(catId);
    });
  });
}

// 4. displayProducts()
function displayProducts(products) {
  const container = document.getElementById('productGrid');
  const countEl = document.getElementById('productCount');
  if (!container) return;

  if (countEl) {
    countEl.textContent = `${products.length} item${products.length === 1 ? '' : 's'}`;
  }

  if (products.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1;" class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try searching with another keyword or pick another category.</p>
      </div>
    `;
    return;
  }

  let html = '';
  products.forEach(product => {
    const isAvailable = product.available !== false;
    const imgUrl = product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
    
    html += `
      <div class="product-card" data-id="${product.id}">
        <div class="product-image-wrap">
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(product.name)}" class="product-img" loading="lazy" />
          ${!isAvailable ? '<span class="badge-out-of-stock">Out of Stock</span>' : ''}
        </div>
        <div class="product-details">
          <h4 class="product-name">${escapeHtml(product.name)}</h4>
          ${product.description ? `<p class="product-desc">${escapeHtml(product.description)}</p>` : ''}
          <div class="product-price-row">
            <span class="product-price">${CURRENCY_SYMBOL}${Number(product.price).toFixed(0)}</span>
            <span class="product-unit">/ ${escapeHtml(product.unit)}</span>
          </div>
          <button 
            class="btn-add-cart ${!isAvailable ? 'btn-disabled' : ''}" 
            data-id="${product.id}"
            ${!isAvailable ? 'disabled' : ''}
          >
            ${isAvailable ? '+ Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Add event listeners to Add buttons
  container.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodId = btn.getAttribute('data-id');
      const prod = allProducts.find(p => String(p.id) === String(prodId));
      if (prod && prod.available !== false) {
        addToCart(prod);
      }
    });
  });
}

// Helper: Filter products by current active category and search
function getFilteredProducts() {
  return allProducts.filter(prod => {
    const matchCategory = activeCategoryId === 'all' || String(prod.category_id) === String(activeCategoryId);
    const matchSearch = !searchQuery || prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });
}

// 5. filterByCategory()
function filterByCategory(categoryId) {
  activeCategoryId = categoryId;
  // Update category buttons UI
  document.querySelectorAll('.category-btn').forEach(btn => {
    if (btn.getAttribute('data-id') === String(categoryId)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  displayProducts(getFilteredProducts());
}

// 6. searchProducts()
function searchProducts(query) {
  searchQuery = query.trim();
  displayProducts(getFilteredProducts());
}

// 7. addToCart()
function addToCart(product) {
  const existingIndex = cart.findIndex(item => String(item.product_id) === String(product.id));
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      unit: product.unit,
      quantity: 1,
      image_url: product.image_url
    });
  }

  saveCartToStorage();
  updateCartBadge();
  showToast(`Added ${product.name} to cart`);
  
  // If cart modal is open, re-render it
  if (isCartOpen()) {
    renderCartModal();
  }
}

// 8. removeFromCart()
function removeFromCart(productId) {
  cart = cart.filter(item => String(item.product_id) !== String(productId));
  saveCartToStorage();
  updateCartBadge();
  renderCartModal();
}

// 9. increaseQuantity()
function increaseQuantity(productId) {
  const item = cart.find(item => String(item.product_id) === String(productId));
  if (item) {
    item.quantity += 1;
    saveCartToStorage();
    updateCartBadge();
    renderCartModal();
  }
}

// 10. decreaseQuantity()
function decreaseQuantity(productId) {
  const itemIndex = cart.findIndex(item => String(item.product_id) === String(productId));
  if (itemIndex > -1) {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1;
    } else {
      // Remove product if quantity drops below 1
      cart.splice(itemIndex, 1);
    }
    saveCartToStorage();
    updateCartBadge();
    renderCartModal();
  }
}

// 11. updateCart()
function updateCart() {
  saveCartToStorage();
  updateCartBadge();
  renderCartModal();
}

// 12. calculateSubtotal()
function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// 13. calculateTotal()
function calculateTotal() {
  const subtotal = calculateSubtotal();
  const delivery = typeof DELIVERY_CHARGE !== 'undefined' ? DELIVERY_CHARGE : 0;
  return subtotal + delivery;
}

// 14. validateCustomer()
// Bangladeshi phone number pattern: 01 followed by 3-9 and 8 digits (total 11 digits) e.g. 01712345678
function validateCustomer(name, phone, address) {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = "Please enter your name.";
  }

  const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '');
  const bdPhoneRegex = /^(?:8801|01)[3-9]\d{8}$/;
  
  if (!cleanPhone) {
    errors.phone = "Please enter your phone number.";
  } else if (!bdPhoneRegex.test(cleanPhone)) {
    errors.phone = "Enter a valid Bangladeshi number (e.g. 017XXXXXXXX).";
  }

  if (!address || !address.trim()) {
    errors.address = "Please enter your delivery address.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// 15. generateWhatsAppMessage()
function generateWhatsAppMessage(customer, items, subtotal, delivery, total) {
  let message = `*NEW GROCERY ORDER*\n\n`;
  message += `*Customer:*\n${customer.name.trim()}\n\n`;
  message += `*Phone:*\n${customer.phone.trim()}\n\n`;
  message += `*Delivery Address:*\n${customer.address.trim()}\n\n`;
  
  message += `*Products:*\n`;
  items.forEach((item, index) => {
    const itemSubtotal = item.price * item.quantity;
    message += `${index + 1}. *${item.name}*\n`;
    message += `   Quantity: ${item.quantity} ${item.unit}\n`;
    message += `   Price: ${CURRENCY_SYMBOL}${item.price}/${item.unit}\n`;
    message += `   Subtotal: ${CURRENCY_SYMBOL}${itemSubtotal}\n\n`;
  });

  message += `------------------------\n`;
  message += `*Subtotal:* ${CURRENCY_SYMBOL}${subtotal}\n`;
  message += `*Delivery:* ${CURRENCY_SYMBOL}${delivery}\n\n`;
  message += `*TOTAL:* ${CURRENCY_SYMBOL}${total}\n`;

  if (customer.note && customer.note.trim()) {
    message += `\n*Note:*\n${customer.note.trim()}\n`;
  }

  message += `====================`;
  return message;
}

// 16. sendWhatsAppOrder()
function sendWhatsAppOrder() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const nameInput = document.getElementById('custName');
  const phoneInput = document.getElementById('custPhone');
  const addressInput = document.getElementById('custAddress');
  const noteInput = document.getElementById('custNote');

  const name = nameInput ? nameInput.value : '';
  const phone = phoneInput ? phoneInput.value : '';
  const address = addressInput ? addressInput.value : '';
  const note = noteInput ? noteInput.value : '';

  // Clear previous errors
  clearFormErrors();

  const validation = validateCustomer(name, phone, address);
  if (!validation.isValid) {
    if (validation.errors.name) showFieldError('nameError', validation.errors.name);
    if (validation.errors.phone) showFieldError('phoneError', validation.errors.phone);
    if (validation.errors.address) showFieldError('addressError', validation.errors.address);
    return;
  }

  const subtotal = calculateSubtotal();
  const delivery = typeof DELIVERY_CHARGE !== 'undefined' ? DELIVERY_CHARGE : 0;
  const total = calculateTotal();

  const messageText = generateWhatsAppMessage({ name, phone, address, note }, cart, subtotal, delivery, total);
  const encodedMessage = encodeURIComponent(messageText);
  const adminNumber = (typeof ADMIN_WHATSAPP !== 'undefined' ? ADMIN_WHATSAPP : '8801700000000').replace(/[^0-9]/g, '');

  const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodedMessage}`;

  showToast("Your order is ready. WhatsApp will open now.");

  setTimeout(() => {
    window.open(whatsappUrl, '_blank');
    // Optionally clear the cart
    cart = [];
    saveCartToStorage();
    updateCartBadge();
    closeCartModal();
  }, 900);
}

// UI State & Modal Handlers
function renderCartModal() {
  const container = document.getElementById('cartItemsList');
  const summaryEl = document.getElementById('cartSummaryContent');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Explore our fresh grocery items and add them to your basket!</p>
      </div>
    `;
    if (summaryEl) summaryEl.style.display = 'none';
    document.getElementById('customerFormWrapper').style.display = 'none';
    return;
  }

  if (summaryEl) summaryEl.style.display = 'block';
  document.getElementById('customerFormWrapper').style.display = 'block';

  let itemsHtml = '';
  cart.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    const imgUrl = item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80';
    
    itemsHtml += `
      <div class="cart-item">
        <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(item.name)}" class="cart-item-img" />
        <div class="cart-item-info">
          <div class="cart-item-title">${escapeHtml(item.name)}</div>
          <div class="cart-item-price">${CURRENCY_SYMBOL}${item.price} / ${escapeHtml(item.unit)}</div>
          <div class="cart-item-subtotal">Subtotal: ${CURRENCY_SYMBOL}${itemSubtotal}</div>
        </div>
        <div class="qty-control">
          <button class="qty-btn" onclick="decreaseQuantity('${item.product_id}')">-</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="increaseQuantity('${item.product_id}')">+</button>
        </div>
        <button class="btn-remove-item" onclick="removeFromCart('${item.product_id}')" title="Remove">✕</button>
      </div>
    `;
  });

  container.innerHTML = itemsHtml;

  // Calculate & display totals
  const subtotal = calculateSubtotal();
  const delivery = typeof DELIVERY_CHARGE !== 'undefined' ? DELIVERY_CHARGE : 0;
  const total = calculateTotal();

  const subtotalEl = document.getElementById('calcSubtotal');
  const deliveryEl = document.getElementById('calcDelivery');
  const totalEl = document.getElementById('calcTotal');

  if (subtotalEl) subtotalEl.textContent = `${CURRENCY_SYMBOL}${subtotal}`;
  if (deliveryEl) deliveryEl.textContent = `${CURRENCY_SYMBOL}${delivery}`;
  if (totalEl) totalEl.textContent = `${CURRENCY_SYMBOL}${total}`;
}

function openCartModal() {
  renderCartModal();
  const modal = document.getElementById('cartModalOverlay');
  if (modal) modal.classList.add('active');
}

function closeCartModal() {
  const modal = document.getElementById('cartModalOverlay');
  if (modal) modal.classList.remove('active');
}

function isCartOpen() {
  const modal = document.getElementById('cartModalOverlay');
  return modal && modal.classList.contains('active');
}

function updateCartBadge() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-badge-count').forEach(el => {
    el.textContent = count;
  });
}

function saveCartToStorage() {
  try {
    localStorage.setItem('freshcart_cart', JSON.stringify(cart));
  } catch (e) {
    console.warn('Could not save cart to localStorage', e);
  }
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('freshcart_cart');
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    cart = [];
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function showFieldError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.add('visible');
  }
}

function clearFormErrors() {
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
}

function showLoading(isLoading) {
  const loader = document.getElementById('loadingState');
  if (loader) {
    loader.style.display = isLoading ? 'block' : 'none';
  }
}

function showErrorState(message) {
  const errEl = document.getElementById('errorState');
  if (errEl) {
    errEl.innerHTML = `
      <p>${escapeHtml(message)}</p>
      <button class="btn-retry" onclick="loadAppData()">Retry</button>
    `;
    errEl.style.display = 'block';
  }
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

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchProducts(e.target.value);
    });
  }

  // Cart open buttons
  document.querySelectorAll('.trigger-cart').forEach(btn => {
    btn.addEventListener('click', openCartModal);
  });

  // Cart close button & overlay click
  const closeBtn = document.getElementById('closeCartBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeCartModal);

  const overlay = document.getElementById('cartModalOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeCartModal();
    });
  }

  // WhatsApp order button
  const orderBtn = document.getElementById('sendWhatsAppBtn');
  if (orderBtn) {
    orderBtn.addEventListener('click', sendWhatsAppOrder);
  }
}
