class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.createCartModal();
    }

    // 在 cart.js 中修改 createCartModal 方法
    createCartModal() {
        const modalHTML = `
            <div class="cart-modal">
                <div class="cart-header">
                    <h2>Shopping Cart</h2>
                    <button class="close-cart">✕</button> <!-- 關閉圖標 -->
                </div>
                <div class="cart-items">
                    <!-- 購物車項目將在這裡動態添加 -->
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
        // 檢查是否已登入
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = '../html/login.html';
            return;
        }

        // 檢查車輛是否已在購物車中
        const existingItem = this.items.find(item => item.id === vehicle.id);
        if (existingItem) {
            alert('This vehicle is already in your cart!');
            return;
        }

        // 添加到購物車
        this.items.push({
            id: vehicle.id,
            model: vehicle.model,
            price: vehicle.price,
            image: vehicle.image,
            timestamp: new Date().toISOString()
        });

        // 更新本地存儲和UI
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
        
        // 顯示成功消息
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

    // 在 cart.js 中修改 updateCartDisplay 方法
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
                        ✕ <!-- 關閉圖標 -->
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

    // 重定向到結帳頁面
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

// 創建全局購物車實例
const cart = new ShoppingCart();

// 顯示購物車的全局函數
function showCart(event) {
    event.preventDefault();
    cart.showCart();
}