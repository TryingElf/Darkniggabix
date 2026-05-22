// ============================================
// DARK WEB MARKET - Frontend Application
// Accessible & WCAG 2.1 Level AA Compliant
// ============================================

const API_BASE = 'http://localhost:3000/api/products';

// Global state
let cart = [];
let currentSection = 'weapons';

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  loadProducts();
});

function initializeApp() {
  console.log('Dark Web Market initialized');
  loadCartFromStorage();
  updateCartUI();
}

function setupEventListeners() {
  // Section navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchSection(e.target.dataset.section);
    });
  });

  // Cart button
  document.getElementById('cart-btn').addEventListener('click', () => {
    switchSection('cart');
  });

  // Checkout & Clear cart
  document.getElementById('checkout-btn').addEventListener('click', checkout);
  document.getElementById('clear-cart-btn').addEventListener('click', clearCart);

  // Modal close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ============ SECTION SWITCHING ============
function switchSection(section) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  
  // Show selected section
  const sectionId = section === 'cart' ? 'cart-section' : `${section}-section`;
  document.getElementById(sectionId).classList.add('active');

  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  
  if (section !== 'cart') {
    const activeBtn = document.querySelector(`[data-section="${section}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    currentSection = section;
  } else {
    // Mark cart button as active
    document.getElementById('cart-btn').classList.add('active');
  }

  // Load cart if switching to cart
  if (section === 'cart') {
    renderCart();
  }
}

// ============ FETCH PRODUCTS ============
async function loadProducts() {
  try {
    await Promise.all([
      loadWeapons(),
      loadDrugs(),
      loadOrgans()
    ]);
  } catch (error) {
    showNotification('Error al carregar productes', 'error');
    console.error(error);
  }
}

async function loadWeapons() {
  try {
    const response = await fetch(`${API_BASE}/weapons`);
    const weapons = await response.json();
    renderProducts('weapons', weapons);
  } catch (error) {
    console.error('Error loading weapons:', error);
  }
}

async function loadDrugs() {
  try {
    const response = await fetch(`${API_BASE}/drugs`);
    const drugs = await response.json();
    renderProducts('drugs', drugs);
  } catch (error) {
    console.error('Error loading drugs:', error);
  }
}

async function loadOrgans() {
  try {
    const response = await fetch(`${API_BASE}/organs`);
    const organs = await response.json();
    renderProducts('organs', organs);
  } catch (error) {
    console.error('Error loading organs:', error);
  }
}

// ============ RENDER PRODUCTS ============
function renderProducts(category, products) {
  const containerId = `${category}-container`;
  const container = document.getElementById(containerId);
  
  if (!products || products.length === 0) {
    container.innerHTML = '<p>No hay productos disponibles</p>';
    return;
  }

  container.innerHTML = products.map(product => {
    return createProductCard(category, product);
  }).join('');

  // Attach event listeners
  container.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.dataset.id;
      const product = products.find(p => p.id == productId);
      addToCart(category, product);
    });
  });
}

function createProductCard(category, product) {
  let specs = '';
  let price = product.price || product.price_per_gram || 0;

  if (category === 'weapons') {
    specs = `<p><strong>Caliber:</strong> ${product.size}</p>
             <p><strong>Ammunition:</strong> ${product.bullet_type}</p>`;
  } else if (category === 'drugs') {
    specs = `<p><strong>Description:</strong> ${product.description}</p>
             <p><strong>Price:</strong> $${product.price_per_gram}/g</p>`;
    price = product.price_per_gram;
  } else if (category === 'organs') {
    specs = `<p><strong>Quantity:</strong> ${product.quantity}</p>
             <p><strong>Weight:</strong> ${product.weight}kg</p>
             <p><strong>Status:</strong> ${product.health_status}</p>`;
  }

  return `
    <div class="product-card" role="article">
      <div class="product-image" aria-label="Image of ${product.name}">[ITEM]</div>
      <div class="product-info">
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        <div class="product-specs">${specs}</div>
        <div class="product-price">$${price.toFixed(2)}</div>
        <div class="product-actions">
          <button class="btn btn-primary btn-add-cart" 
                  data-id="${product.id}"
                  data-category="${category}"
                  aria-label="Add ${product.name} to cart">
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============ CART MANAGEMENT ============
function addToCart(category, product) {
  let quantity = 1;

  // Special handling for drugs (grams selector)
  if (category === 'drugs') {
    quantity = prompt(`¿Cuántos gramos de ${product.name}?`, '10');
    if (!quantity) return;
    quantity = parseFloat(quantity);
    if (isNaN(quantity) || quantity <= 0) {
      showNotification('Cantidad inválida', 'error');
      return;
    }
  }

  const cartItem = {
    id: Date.now(),
    category: category,
    product_id: product.id,
    product_name: product.name,
    quantity: quantity,
    unit_price: category === 'drugs' ? product.price_per_gram : product.price,
    total_price: quantity * (category === 'drugs' ? product.price_per_gram : product.price)
  };

  cart.push(cartItem);
  saveCartToStorage();
  updateCartUI();
  showNotification(`[+] ${product.name} added to cart`, 'success');
}

function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  saveCartToStorage();
  updateCartUI();
  renderCart();
  showNotification('[-] Product removed from cart', 'success');
}

function clearCart() {
  if (confirm('Are you sure you want to clear the cart?')) {
    cart = [];
    saveCartToStorage();
    updateCartUI();
    renderCart();
    showNotification('Cart cleared', 'success');
  }
}

function renderCart() {
  const cartContainer = document.getElementById('cart-container');
  
  if (cart.length === 0) {
    cartContainer.innerHTML = '<p class="empty-cart">[CART EMPTY]</p>';
    document.getElementById('checkout-btn').disabled = true;
    document.getElementById('clear-cart-btn').disabled = true;
    return;
  }

  let cartHTML = '<div class="cart-items">';
  let total = 0;

  cart.forEach(item => {
    total += item.total_price;
    const quantityLabel = item.category === 'drugs' ? 'g' : 'ud.';
    
    cartHTML += `
      <div class="cart-item" role="article">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(item.product_name)}</div>
          <div class="cart-item-details">
            ${item.quantity}${quantityLabel} × $${item.unit_price.toFixed(2)} = $${item.total_price.toFixed(2)}
          </div>
        </div>
        <div class="cart-item-price">$${item.total_price.toFixed(2)}</div>
        <button class="btn btn-small btn-secondary" 
                aria-label="Remove ${item.product_name} from cart"
                onclick="removeFromCart(${item.id})">
          [X] REMOVE
        </button>
      </div>
    `;
  });

  cartHTML += '</div>';
  cartContainer.innerHTML = cartHTML;

  // Update total
  document.getElementById('cart-total').textContent = '$' + total.toFixed(2);

  // Enable checkout buttons
  document.getElementById('checkout-btn').disabled = false;
  document.getElementById('clear-cart-btn').disabled = false;
}

function updateCartUI() {
  const cartCount = document.getElementById('cart-count');
  const cartBtn = document.getElementById('cart-btn');
  
  cartCount.textContent = cart.length;
  cartBtn.setAttribute('aria-label', `Abrir carrito de compra (${cart.length} items)`);
}

// ============ CHECKOUT ============
function checkout() {
  if (cart.length === 0) {
    showNotification('Cart is empty', 'error');
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.total_price, 0);
  const confirmation = confirm(
    `Confirm purchase: $${total.toFixed(2)}?\n\nItems: ${cart.length}`
  );

  if (confirmation) {
    // Simular envío al servidor
    setTimeout(() => {
      showNotification('[✓] Transaction completed. Secure transfer confirmed.', 'success');
      cart = [];
      saveCartToStorage();
      updateCartUI();
      switchSection('weapons');
      renderCart();
    }, 1000);
  }
}

// ============ STORAGE ============
function saveCartToStorage() {
  localStorage.setItem('darkwebCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
  const saved = localStorage.getItem('darkwebCart');
  cart = saved ? JSON.parse(saved) : [];
}

// ============ NOTIFICATIONS ============
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  
  // Add accessibility announcement
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', 'assertive');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// ============ MODAL ============
function closeModal() {
  const modal = document.getElementById('product-modal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

// ============ UTILITIES ============
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ============ KEYBOARD NAVIGATION ============
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    const prevBtn = document.querySelector('.nav-btn.active')?.previousElementSibling;
    if (prevBtn && prevBtn.classList.contains('nav-btn')) {
      prevBtn.click();
    }
  } else if (e.key === 'ArrowRight') {
    const nextBtn = document.querySelector('.nav-btn.active')?.nextElementSibling;
    if (nextBtn && nextBtn.classList.contains('nav-btn')) {
      nextBtn.click();
    }
  }
});
