const API_BASE_URL = '';

// Global Cart State
let cart = JSON.parse(localStorage.getItem('aurelia_cart')) || [];
let products = [];

// DOM Elements
const cartBtn = document.getElementById('cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const closeCartBtn = document.getElementById('close-cart');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalElement = document.getElementById('cart-total-amount');
const cartCountElement = document.getElementById('cart-count');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    setupIntersectionObserver();
    setupChat();
    
    // Load products on index.html
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        fetchProducts();
    }

    // Event Listeners
    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);
    
    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        renderCheckoutItems();
        checkoutForm.addEventListener('submit', handleCheckout);
    }

    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

// --- Cart Logic ---
function toggleCart() {
    cartDrawer.classList.toggle('open');
    cartOverlay.classList.toggle('show');
}

function addToCart(productId, productData) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...productData, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('show');
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        saveCart();
        updateCartUI();
        renderCheckoutItems(); // Update checkout page if active
    }
}

function saveCart() {
    localStorage.setItem('aurelia_cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = totalItems;

    // Update Items
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                total += item.price * item.quantity;
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${item.imageURL}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-actions">
                            <button onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }
        
        if (cartTotalElement) {
            cartTotalElement.textContent = `$${total.toFixed(2)}`;
        }
    }
}

// --- Fetch Products ---
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error("Network response was not ok");
        products = await response.json();
    } catch (error) {
        console.error('Error fetching products from backend, falling back to local data:', error);
        products = [
            {
                "id": 1,
                "name": "Obsidian Leather Tote",
                "price": 1250.00,
                "imageURL": "assets/handbag.png",
                "description": "Handcrafted from the finest Italian calfskin with champagne gold hardware."
            },
            {
                "id": 2,
                "name": "Silk Moiré Scarf",
                "price": 345.00,
                "imageURL": "assets/scarf.png",
                "description": "Pure Mulberry silk featuring our signature abstract monogram."
            },
            {
                "id": 3,
                "name": "Cashmere Wrap Coat",
                "price": 2890.00,
                "imageURL": "assets/coat.png",
                "description": "Sourced from the highlands of Mongolia, an ultra-soft timeless piece."
            },
            {
                "id": 4,
                "name": "Aurelia Chronograph",
                "price": 4500.00,
                "imageURL": "assets/watch.png",
                "description": "18k Champagne gold plating with a minimalist obsidian dial."
            }
        ];
    }
    
    const container = document.getElementById('products-container');
    
    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageURL}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                </div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
            <button class="add-to-cart-btn" onclick='addToCart(${product.id}, ${JSON.stringify(product).replace(/'/g, "&apos;")})'>Add to Cart</button>
        `;
        container.appendChild(card);
    });

    // Re-run intersection observer for new elements
    setupIntersectionObserver();
}

// --- Intersection Observer (Fade-in Animations) ---
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// --- Chat UI & Logic ---
function setupChat() {
    const fab = document.getElementById('chat-fab');
    const window = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input-field');

    if (fab && window) {
        fab.addEventListener('click', () => window.classList.add('open'));
        closeChat.addEventListener('click', () => window.classList.remove('open'));
        
        const sendMessage = async () => {
            const message = input.value.trim();
            if (!message) return;

            // Add User message
            appendMessage(message, 'user');
            input.value = '';

            try {
                const response = await fetch(`${API_BASE_URL}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });
                const data = await response.json();
                
                // Add Bot message
                appendMessage(data.response, 'bot');
            } catch (error) {
                appendMessage("I'm currently unable to connect to the server.", 'bot');
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

function appendMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// --- Checkout Logic ---
function renderCheckoutItems() {
    const container = document.getElementById('checkout-items');
    const totalEl = document.getElementById('checkout-total');
    if (!container || !totalEl) return;
    
    container.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.marginBottom = '1rem';
        div.style.borderBottom = '1px solid #eee';
        div.style.paddingBottom = '0.5rem';
        div.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        container.appendChild(div);
    });
    
    totalEl.textContent = `$${total.toFixed(2)}`;
}

async function handleCheckout(e) {
    e.preventDefault();
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const name = document.getElementById('checkout-name').value;
    const email = document.getElementById('checkout-email').value;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const btn = document.getElementById('place-order-btn');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/process-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cart: cart.map(i => ({ id: i.id, quantity: i.quantity })),
                total_amount: total,
                customer_name: name,
                email: email
            })
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            document.getElementById('checkout-form').innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h2>Thank You</h2>
                    <p>${data.message}</p>
                    <p>Transaction ID: ${data.transaction_id}</p>
                    <a href="index.html" class="btn-primary" style="margin-top: 2rem;">Continue Shopping</a>
                </div>
            `;
            cart = [];
            saveCart();
            updateCartUI();
        }
    } catch (error) {
        alert("Payment failed. Please try again.");
        btn.textContent = 'Place Order';
        btn.disabled = false;
    }
}

// --- Contact Logic ---
async function handleContactSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('contact-submit-btn');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        inquiry: document.getElementById('inquiry').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/contact-submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            document.getElementById('contact-form').innerHTML = `
                <div style="text-align: center; padding: 2rem; border: 1px solid var(--color-gold);">
                    <h3>Inquiry Sent</h3>
                    <p>${result.message}</p>
                </div>
            `;
        }
    } catch (error) {
        alert("Failed to send message.");
        btn.textContent = 'Send Message';
        btn.disabled = false;
    }
}
