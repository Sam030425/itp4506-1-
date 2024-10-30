class Checkout {
    constructor() {
        this.cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.initCheckout();
    }

    initCheckout() {
        // 檢查用戶是否登入
        if (!this.currentUser) {
            window.location.href = '../html/login.html';
            return;
        }
        // 檢查購物車是否為空
        if (this.cartItems.length === 0) {
            window.location.href = 'vehicledisplay.html';
            return;
        }
        this.renderCheckoutPage();
        this.attachEventListeners();
    }

    renderCheckoutPage() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        const checkoutHTML = `
            <div class="checkout-container">
                <div class="checkout-steps">
                    <div class="step active" data-step="1">1. Order Review</div>
                    <div class="step" data-step="2">2. Payment Method</div>
                    <div class="step" data-step="3">3. Confirmation</div>
                </div>

                <!-- Step 1: Order Review -->
                <div class="checkout-section" id="orderReview">
                    <h2>Order Review</h2>
                    <div class="order-items">
                        ${this.renderOrderItems()}
                    </div>
                    <div class="order-summary">
                        <div class="summary-item">
                            <span>Subtotal:</span>
                            <span>HK$${this.calculateSubtotal().toLocaleString()}</span>
                        </div>
                        <div class="summary-item">
                            <span>Tax (0%):</span>
                            <span>HK$0</span>
                        </div>
                        <div class="summary-item total">
                            <span>Total:</span>
                            <span>HK$${this.calculateSubtotal().toLocaleString()}</span>
                        </div>
                    </div>
                    <button class="next-step-btn" onclick="checkout.nextStep(1)">Continue to Payment</button>
                </div>

                <!-- Step 2: Payment Method -->
                <div class="checkout-section hidden" id="paymentMethod">
                    <h2>Payment Method</h2>
                    <div class="payment-options">
                        <div class="payment-option">
                            <input type="radio" id="creditCard" name="paymentMethod" value="creditCard">
                            <label for="creditCard">Credit Card</label>
                            <div class="payment-details hidden">
                                <input type="text" placeholder="Card Number" class="card-number">
                                <div class="card-extra">
                                    <input type="text" placeholder="MM/YY" class="card-expiry">
                                    <input type="text" placeholder="CVV" class="card-cvv">
                                </div>
                            </div>
                        </div>
                        <div class="payment-option">
                            <input type="radio" id="bankTransfer" name="paymentMethod" value="bankTransfer">
                            <label for="bankTransfer">Bank Transfer</label>
                            <div class="payment-details hidden">
                                <p>Bank: Legend Motor Bank</p>
                                <p>Account: 1234-5678-9012-3456</p>
                                <p>Please transfer the exact amount and use your order number as reference.</p>
                            </div>
                        </div>
                    </div>
                    <div class="button-group">
                        <button class="back-btn" onclick="checkout.previousStep(2)">Back</button>
                        <button class="next-step-btn" onclick="checkout.nextStep(2)">Confirm Payment</button>
                    </div>
                </div>

                <!-- Step 3: Confirmation -->
                <div class="checkout-section hidden" id="confirmation">
                    <h2>Order Confirmation</h2>
                    <div class="confirmation-details">
                        <div class="order-number">
                            Order #: ${this.generateOrderNumber()}
                        </div>
                        <div class="confirmation-message">
                            <h3>Thank you for your purchase!</h3>
                            <p>We have received your order and will process it shortly.</p>
                            <p>A confirmation email has been sent to ${this.currentUser.email}</p>
                        </div>
                        <div class="order-summary">
                            ${this.renderOrderSummary()}
                        </div>
                    </div>
                    <button class="finish-btn" onclick="checkout.finishOrder()">Back to Home</button>
                </div>
            </div>
        `;

        mainContent.innerHTML = checkoutHTML;
    }

    renderOrderItems() {
        return this.cartItems.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.model}" class="item-image">
                <div class="item-details">
                    <h3>${item.model}</h3>
                    <p>HK$${item.price.toLocaleString()}</p>
                </div>
            </div>
        `).join('');
    }

    calculateSubtotal() {
        return this.cartItems.reduce((total, item) => total + item.price, 0);
    }

    generateOrderNumber() {
        return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    }

    renderOrderSummary() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Not selected';
        return `
            <div class="summary-details">
                <p>Total Amount: HK$${this.calculateSubtotal().toLocaleString()}</p>
                <p>Payment Method: ${paymentMethod === 'creditCard' ? 'Credit Card' : 'Bank Transfer'}</p>
                <p>Order Date: ${new Date().toLocaleDateString()}</p>
            </div>
        `;
    }

    attachEventListeners() {
        // 支付方式選擇監聽
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                // 隱藏所有支付詳情
                document.querySelectorAll('.payment-details').forEach(detail => {
                    detail.classList.add('hidden');
                });
                // 顯示選中的支付詳情
                const selectedDetails = e.target.parentElement.querySelector('.payment-details');
                if (selectedDetails) {
                    selectedDetails.classList.remove('hidden');
                }
            });
        });
    }

    nextStep(currentStep) {
        if (currentStep === 1) {
            // 驗證訂單內容
            if (this.cartItems.length === 0) {
                this.showMessage('Your cart is empty!', 'error');
                return;
            }
            // 隱藏當前步驟，顯示下一步
            document.getElementById('orderReview').classList.add('hidden');
            document.getElementById('paymentMethod').classList.remove('hidden');
        } else if (currentStep === 2) {
            // 驗證支付方式
            const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
            if (!selectedPayment) {
                this.showMessage('Please select a payment method!', 'error');
                return;
            }

            // 如果是信用卡，驗證卡片信息
            if (selectedPayment.value === 'creditCard' && !this.validateCreditCardInfo()) {
                return;
            }

            // 隱藏當前步驟，顯示下一步
            document.getElementById('paymentMethod').classList.add('hidden');
            document.getElementById('confirmation').classList.remove('hidden');
            // 保存訂單
            this.saveOrder();
        }

        // 更新步驟指示器
        document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`.step[data-step="${currentStep + 1}"]`).classList.add('active');
    }

    previousStep(currentStep) {
        if (currentStep === 2) {
            // 從支付方式返回訂單審查
            document.getElementById('paymentMethod').classList.add('hidden');
            document.getElementById('orderReview').classList.remove('hidden');
        } else if (currentStep === 3) {
            // 從確認返回支付方式
            document.getElementById('confirmation').classList.add('hidden');
            document.getElementById('paymentMethod').classList.remove('hidden');
        }

        // 更新步驟指示器
        document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`.step[data-step="${currentStep - 1}"]`).classList.add('active');
    }

    validateCreditCardInfo() {
        const cardNumber = document.querySelector('.card-number').value;
        const cardExpiry = document.querySelector('.card-expiry').value;
        const cardCvv = document.querySelector('.card-cvv').value;

        if (!cardNumber || !cardExpiry || !cardCvv) {
            this.showMessage('Please fill in all card details!', 'error');
            return false;
        }

        // 簡單的信用卡號碼驗證
        if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
            this.showMessage('Invalid card number!', 'error');
            return false;
        }

        // 驗證有效期
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
            this.showMessage('Invalid expiry date! (MM/YY)', 'error');
            return false;
        }

        // 驗證 CVV
        if (!/^\d{3,4}$/.test(cardCvv)) {
            this.showMessage('Invalid CVV!', 'error');
            return false;
        }

        return true;
    }

    saveOrder() {
        const orderData = {
            orderId: this.generateOrderNumber(),
            userId: this.currentUser.email,
            customerName: this.currentUser.name,          // 添加顧客姓名
            customerEmail: this.currentUser.email,        // 添加顧客郵箱
            customerPhone: this.currentUser.phone || 'N/A',  // 添加顧客電話
            shippingAddress: this.currentUser.address || 'N/A',  // 添加收貨地址
            items: this.cartItems,
            total: this.calculateSubtotal(),
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
            status: 'pending',
            orderDate: new Date().toISOString(),
            statusHistory: [{                             // 添加狀態歷史
                status: 'created',
                date: new Date().toISOString(),
                text: 'Order Created'
            }]
        };

        // 保存訂單到 localStorage
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));
    
        // 清空購物車
        localStorage.removeItem('cart');
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 4px;
            color: white;
            z-index: 1000;
            animation: slideIn 0.5s ease-out;
        `;

        switch(type) {
            case 'success':
                messageDiv.style.backgroundColor = '#28a745';
                break;
            case 'warning':
                messageDiv.style.backgroundColor = '#ffc107';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#dc3545';
                break;
            default:
                messageDiv.style.backgroundColor = '#17a2b8';
        }

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    finishOrder() {
        window.location.href = 'index.html';
    }
}

// 創建結帳實例
const checkout = new Checkout();