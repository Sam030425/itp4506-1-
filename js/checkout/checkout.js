class Checkout {
    constructor() {
        this.cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.baseInsurance = 5000; // 基本保費金額
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
                    
                    <!-- Insurance Options -->
                    <div class="insurance-options">
                        <h3>Insurance Options</h3>
                        <div class="insurance-details">
                            <!-- Age Input Section -->
                            <div class="insurance-age-input">
                                <label for="userAge">Driver's Age:</label>
                                <input type="number" 
                                       id="userAge" 
                                       name="userAge" 
                                       min="18" 
                                       max="99" 
                                       placeholder="Enter age"
                                       value="${this.currentUser.age || ''}"
                                       onchange="checkout.updateInsuranceSummary()">
                                <p class="age-discount-info">Age 30-40 eligible for 10% discount</p>
                            </div>
                            <div class="insurance-option">
                                <input type="checkbox" id="accidentFree" name="insuranceOptions" checked 
                                       onchange="checkout.updateInsuranceSummary()">
                                <label for="accidentFree">No Accident Record (15% off)</label>
                            </div>
                            <div class="insurance-option">
                                <input type="checkbox" id="safetySystem" name="insuranceOptions" checked
                                       onchange="checkout.updateInsuranceSummary()">
                                <label for="safetySystem">Safety System Equipped (5% off)</label>
                            </div>
                            <div class="insurance-summary">
                                <p>Base Insurance: HK$${this.baseInsurance.toLocaleString()}</p>
                                <p class="age-discount-line">Age Discount (30-40): <span>Not Eligible</span></p>
                                <p>No Accident Discount: -15%</p>
                                <p>Safety System Discount: -5%</p>
                                <p class="total-insurance">Final Insurance: HK$${this.calculateInsurance().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div class="order-summary">
                        <div class="summary-item">
                            <span>Subtotal:</span>
                            <span>HK$${this.calculateSubtotal().toLocaleString()}</span>
                        </div>
                        <div class="summary-item">
                            <span>First Registration Tax:</span>
                            <span>HK$${this.calculateTax().toLocaleString()}</span>
                        </div>
                        <div class="summary-item">
                            <span>Insurance:</span>
                            <span>HK$${this.calculateInsurance().toLocaleString()}</span>
                        </div>
                        <div class="summary-item total">
                            <span>Total:</span>
                            <span>HK$${(this.calculateSubtotal() + this.calculateTax() + this.calculateInsurance()).toLocaleString()}</span>
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

    calculateInsurance() {
        let totalDiscount = 0;
        
        // 獲取用戶輸入的年齡
        const ageInput = document.getElementById('userAge');
        const userAge = ageInput ? parseInt(ageInput.value) : 0;
        
        // 年齡折扣計算
        let ageDiscount = 0;
        if (userAge >= 30 && userAge <= 40) {
            ageDiscount = this.baseInsurance * 0.10; // 30-40歲享有10%折扣
            totalDiscount += ageDiscount;
            
            // 更新年齡折扣顯示
            const ageDiscountLine = document.querySelector('.age-discount-line');
            if (ageDiscountLine) {
                ageDiscountLine.classList.add('active');
                ageDiscountLine.querySelector('span').textContent = `-HK$${ageDiscount.toLocaleString()}`;
            }
        } else {
            // 如果年齡不符合折扣條件，更新顯示
            const ageDiscountLine = document.querySelector('.age-discount-line');
            if (ageDiscountLine) {
                ageDiscountLine.classList.remove('active');
                ageDiscountLine.querySelector('span').textContent = 'Not Eligible';
            }
        }

        // 檢查其他保險選項
        const accidentFreeChecked = document.getElementById('accidentFree')?.checked ?? false;
        const safetySystemChecked = document.getElementById('safetySystem')?.checked ?? false;

        // 無事故記錄折扣
        if (accidentFreeChecked) {
            totalDiscount += this.baseInsurance * 0.15;
        }

        // 安全裝置折扣
        if (safetySystemChecked) {
            totalDiscount += this.baseInsurance * 0.05;
        }

        // 計算最終保費
        const finalInsurance = this.baseInsurance - totalDiscount;
        return Math.max(finalInsurance, 0); // 確保保費不會為負數
    }

    calculateSubtotal() {
        return this.cartItems.reduce((total, item) => total + item.price, 0);
    }

    calculateTax() {
        const subtotal = this.calculateSubtotal();
        let taxRate;
        if (subtotal <= 150000) {
            taxRate = 0.4; // 40%
        } else if (subtotal <= 300000) {
            taxRate = 0.75; // 75%
        } else if (subtotal <= 500000) {
            taxRate = 1.0; // 100%
        } else {
            taxRate = 1.15; // 115%
        }
        return subtotal * taxRate;
    }

    generateOrderNumber() {
        return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    }

    renderOrderSummary() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Not selected';
        const subtotal = this.calculateSubtotal();
        const tax = this.calculateTax();
        const insurance = this.calculateInsurance();
        const total = subtotal + tax + insurance;
        
        return `
            <div class="summary-details">
                <p>Subtotal: HK$${subtotal.toLocaleString()}</p>
                <p>First Registration Tax: HK$${tax.toLocaleString()}</p>
                <p>Insurance: HK$${insurance.toLocaleString()}</p>
                <p>Total Amount: HK$${total.toLocaleString()}</p>
                <p>Payment Method: ${paymentMethod === 'creditCard' ? 'Credit Card' : 'Bank Transfer'}</p>
                <p>Order Date: ${new Date().toLocaleDateString()}</p>
            </div>
        `;
    }

    validateAge() {
        const ageInput = document.getElementById('userAge');
        if (!ageInput) return false;

        const age = parseInt(ageInput.value);
        
        if (!ageInput.value.trim()) {
            this.showMessage('Please enter driver\'s age', 'error');
            return false;
        }
        
        if (isNaN(age) || age < 18) {
            this.showMessage('Driver must be at least 18 years old', 'error');
            ageInput.value = '';
            return false;
        }
        
        if (age > 99) {
            this.showMessage('Please enter a valid age', 'error');
            ageInput.value = '';
            return false;
        }
        
        return true;
    }

    updateInsuranceSummary() {
        if (this.validateAge()) {
            const insuranceAmount = this.calculateInsurance();
            const totalInsuranceElement = document.querySelector('.total-insurance');
            if (totalInsuranceElement) {
                totalInsuranceElement.textContent = `Final Insurance: HK$${insuranceAmount.toLocaleString()}`;
            }

            // 更新總結算金額
            const totalElement = document.querySelector('.summary-item.total span:last-child');
            if (totalElement) {
                const total = this.calculateSubtotal() + this.calculateTax() + insuranceAmount;
                totalElement.textContent = `HK$${total.toLocaleString()}`;
            }
        }
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
            if (this.cartItems.length === 0) {
                this.showMessage('Your cart is empty!', 'error');
                return;
            }
            
            // 驗證年齡
            if (!this.validateAge()) {
                return;
            }
            
            document.getElementById('orderReview').classList.add('hidden');
            document.getElementById('paymentMethod').classList.remove('hidden');
        } else if (currentStep === 2) {
            const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
            if (!selectedPayment) {
                this.showMessage('Please select a payment method!', 'error');
                return;
            }

            if (selectedPayment.value === 'creditCard' && !this.validateCreditCardInfo()) {
                return;
            }

            document.getElementById('paymentMethod').classList.add('hidden');
            document.getElementById('confirmation').classList.remove('hidden');
            this.saveOrder();
        }

        document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`.step[data-step="${currentStep + 1}"]`).classList.add('active');
    }

    previousStep(currentStep) {
        if (currentStep === 2) {
            document.getElementById('paymentMethod').classList.add('hidden');
            document.getElementById('orderReview').classList.remove('hidden');
        } else if (currentStep === 3) {
            document.getElementById('confirmation').classList.add('hidden');
            document.getElementById('paymentMethod').classList.remove('hidden');
        }

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

        if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
            this.showMessage('Invalid card number!', 'error');
            return false;
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
            this.showMessage('Invalid expiry date! (MM/YY)', 'error');
            return false;
        }

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
            customerName: this.currentUser.name,
            customerEmail: this.currentUser.email,
            customerPhone: this.currentUser.phone || 'N/A',
            shippingAddress: this.currentUser.address || 'N/A',
            items: this.cartItems,
            subtotal: this.calculateSubtotal(),
            tax: this.calculateTax(),
            insuranceDetails: {
                driverAge: document.getElementById('userAge').value,
                accidentFree: document.getElementById('accidentFree').checked,
                safetySystem: document.getElementById('safetySystem').checked,
                baseInsurance: this.baseInsurance,
                totalDiscount: this.baseInsurance - this.calculateInsurance(),
                finalInsurance: this.calculateInsurance()
            },
            total: this.calculateSubtotal() + this.calculateTax() + this.calculateInsurance(),
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
            status: 'pending',
            orderDate: new Date().toISOString(),
            statusHistory: [{
                status: 'created',
                date: new Date().toISOString(),
                text: 'Order Created'
            }]
        };

        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));
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