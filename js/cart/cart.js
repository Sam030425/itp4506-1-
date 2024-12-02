class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.createCartModal();
    }

    
    createCartModal() {
        const modalHTML = `
            <div class="cart-modal">
                <div class="cart-header">
                    <h2>Shopping Cart</h2>
                    <button class="close-cart">✕</button> <!-- Close Icon -->
                </div>
                <div class="cart-items">
                    <!-- Shopping Cart Items Will Be Added Dynamically Here -->
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span class="total-amount">HK$0</span>
                    </div>
                    <button class="checkout-btn" onclick="cart.checkout()">Checkout</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const closeBtn = document.querySelector('.close-cart');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideCart());
        }
    }

    addItem(vehicle) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = '../html/login.html';
            return;
        }

        
        const existingItem = this.items.find(item => item.id === vehicle.id);
        if (existingItem) {
            alert('This vehicle is already in your cart!');
            return;
        }

        
        this.items.push({
            id: vehicle.id,
            model: vehicle.model,
            brand: vehicle.brand,
            year: vehicle.year,
            engine: vehicle.engine,
            mileage: vehicle.mileage,
            type: vehicle.type,
            price: vehicle.price,
            image: vehicle.image,
            timestamp: new Date().toISOString()
        });

        
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
        
    
        this.showMessage('Vehicle added to cart successfully!');
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.items.length;
        }
    }

    
    updateCartDisplay() {
        const cartItems = document.querySelector('.cart-items');
        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.model}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.model}</div>
                        <div class="cart-item-price">HK$${item.price.toLocaleString()}</div>
                    </div>
                    <button class="remove-item" onclick="cart.removeItem(${item.id})">
                        ✕ <!-- Close Icon -->
                    </button>
                </div>
            `).join('');
        }

        this.updateTotal();
    }

    updateTotal() {
        const totalAmount = document.querySelector('.total-amount');
        if (totalAmount) {
            const total = this.items.reduce((sum, item) => sum + item.price, 0);
            totalAmount.textContent = `HK$${total.toLocaleString()}`;
        }
    }

    showCart() {
        const modal = document.querySelector('.cart-modal');
        if (modal) {
            modal.classList.add('active');
            this.updateCartDisplay();
        }
    }

    hideCart() {
        const modal = document.querySelector('.cart-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    checkout() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../html/login.html';
        return;
    }

    if (this.items.length === 0) {
        alert('Your cart is empty!');
        return;
    }

   
    window.location.href = '../html/checkout.html';
    }

    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'cart-message';
        messageDiv.textContent = message;
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.5s ease-out;
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}


const cart = new ShoppingCart();


function showCart(event) {
    event.preventDefault();
    cart.showCart();
}