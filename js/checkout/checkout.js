class Checkout {
    constructor() {
        this.cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.baseInsurance = 5000;
        this.policyId = null; // 添加保單ID屬性
        this.orderId = null; // 添加訂單ID屬性
        this.initCheckout();
    }

    initCheckout() {
        try {
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

            // 生成訂單和保單ID
            this.orderId = this.generateOrderNumber();
            this.policyId = this.generatePolicyNumber();

            this.renderCheckoutPage();
            this.attachEventListeners();
        } catch (error) {
            console.error('Checkout initialization error:', error);
            this.showMessage('Error initializing checkout. Please try again.', 'error');
        }
    }

    generateOrderNumber() {
        return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    }

    generatePolicyNumber() {
        return 'POL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    }

    renderCheckoutPage() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        const checkoutHTML = `
            <div class="checkout-container">
                <div class="checkout-steps">
                    <div class="step active" data-step="1">1. Order & Insurance Review</div>
                    <div class="step" data-step="2">2. Payment Method</div>
                    <div class="step" data-step="3">3. Confirmation</div>
                </div>

                <!-- Step 1: Order & Insurance Review -->
                <div class="checkout-section" id="orderReview">
                    <h2>Order Review</h2>
                    <div class="order-items">
                        ${this.renderOrderItems()}
                    </div>
                    
                    <!-- Insurance Options -->
                    <div class="insurance-options">
                        <h3>Insurance Options</h3>
                        <div class="insurance-details">
                            <!-- Driver Information Section -->
                            <div class="driver-info-section">
                                <h4>Driver Information</h4>
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
                                <div class="driver-license-input">
                                    <label for="driverLicense">Driver's License Number:</label>
                                    <input type="text" 
                                           id="driverLicense" 
                                           name="driverLicense"
                                           placeholder="Enter license number"
                                           required>
                                </div>
                            </div>

                            <!-- Insurance Discounts -->
                            <div class="insurance-discounts">
                                <h4>Available Discounts</h4>
                                <div class="insurance-option">
                                    <input type="checkbox" id="accidentFree" name="insuranceOptions" checked 
                                           onchange="checkout.updateInsuranceSummary()">
                                    <label for="accidentFree">No Accident Record (15% off)</label>
                                    <p class="discount-description">No accidents or claims in the past 3 years</p>
                                </div>
                                <div class="insurance-option">
                                    <input type="checkbox" id="safetySystem" name="insuranceOptions" checked
                                           onchange="checkout.updateInsuranceSummary()">
                                    <label for="safetySystem">Safety System Equipped (5% off)</label>
                                    <p class="discount-description">Vehicle equipped with advanced safety features</p>
                                </div>
                            </div>

                            <!-- Coverage Details -->
                            <div class="coverage-details">
                                <h4>Insurance Coverage</h4>
                                <div class="coverage-item">
                                    <h5>Third Party Liability</h5>
                                    <p>Coverage up to HK$2,000,000</p>
                                    <p class="coverage-description">Covers damage to third party property and injury</p>
                                </div>
                                <div class="coverage-item">
                                    <h5>Vehicle Damage</h5>
                                    <p>Coverage up to vehicle value</p>
                                    <p class="coverage-description">Covers damage to the insured vehicle</p>
                                </div>
                            </div>

                            <!-- Insurance Summary -->
                            <div class="insurance-summary">
                                <h4>Insurance Premium Calculation</h4>
                                <p>Base Insurance: HK$${this.baseInsurance.toLocaleString()}</p>
                                <p class="age-discount-line">Age Discount (30-40): <span>Not Eligible</span></p>
                                <p class="accident-free-discount">No Accident Discount: -15%</p>
                                <p class="safety-system-discount">Safety System Discount: -5%</p>
                                <p class="total-insurance">Final Insurance: HK$${this.calculateInsurance().toLocaleString()}</p>
                                <p class="coverage-period">Coverage Period: 1 Year</p>
                            </div>
                        </div>
                    </div>

                    <!-- Order Summary -->
                    <div class="order-summary">
                        <div class="summary-item">
                            <span>Vehicle Subtotal:</span>
                            <span>HK$${this.calculateSubtotal().toLocaleString()}</span>
                        </div>
                        <div class="summary-item">
                            <span>First Registration Tax:</span>
                            <span>HK$${this.calculateTax().toLocaleString()}</span>
                        </div>
                        <div class="summary-item">
                            <span>Insurance Premium:</span>
                            <span>HK$${this.calculateInsurance().toLocaleString()}</span>
                        </div>
                        <div class="summary-item total">
                            <span>Total Amount:</span>
                            <span>HK$${(this.calculateSubtotal() + this.calculateTax() + this.calculateInsurance()).toLocaleString()}</span>
                        </div>
                    </div>
                    <button class="next-step-btn" onclick="checkout.nextStep(1)">Continue to Payment</button>
                </div>

                <!-- Payment Method Section -->
                ${this.renderPaymentSection()}

                <!-- Confirmation Section -->
                ${this.renderConfirmationSection()}
            </div>
        `;

        mainContent.innerHTML = checkoutHTML;
    }

    renderPaymentSection() {
        return `
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
        `;
    }

    renderConfirmationSection() {
        return `
            <!-- Step 3: Confirmation -->
            <div class="checkout-section hidden" id="confirmation">
                <h2>Order & Insurance Confirmation</h2>
                <div class="confirmation-details">
                    <div class="order-number">
                        Order #: ${this.orderId}
                    </div>
                    <div class="policy-number">
                        Policy #: ${this.policyId}
                    </div>
                    <div class="confirmation-message">
                        <h3>Thank you for your purchase!</h3>
                        <p>We have received your order and insurance application.</p>
                        <p>A confirmation email has been sent to ${this.currentUser.email}</p>
                    </div>
                    <div class="order-summary">
                        ${this.renderOrderSummary()}
                    </div>
                </div>
                <button class="finish-btn" onclick="checkout.finishOrder()">Back to Home</button>
            </div>
        `;
    }

    renderOrderItems() {
        return this.cartItems.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.model}" class="item-image">
                <div class="item-details">
                    <h3>${item.model}</h3>
                    <p>HK$${item.price.toLocaleString()}</p>
                    <div class="vehicle-specs">
                        <span>Year: ${item.year}</span>
                        <span>Registration: ${item.registration || 'New Vehicle'}</span>
                    </div>
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
            ageDiscount = this.baseInsurance * 0.10;
            totalDiscount += ageDiscount;
            
            // 更新年齡折扣顯示
            const ageDiscountLine = document.querySelector('.age-discount-line');
            if (ageDiscountLine) {
                ageDiscountLine.classList.add('active');
                ageDiscountLine.querySelector('span').textContent = `-HK$${ageDiscount.toLocaleString()}`;
            }
        } else {
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
        return Math.max(finalInsurance, 0);
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

    createInsurancePolicy() {
        const vehicle = this.cartItems[0];
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);

        const policyData = {
            policyId: this.policyId,
            type: 'vehicle',
            status: 'pending',
            premium: this.calculateInsurance(),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            createdDate: new Date().toISOString(),
            
            // 客戶信息
            clientName: this.currentUser.name,
            clientId: this.currentUser.id || this.currentUser.email,
            clientEmail: this.currentUser.email,
            clientPhone: this.currentUser.phone,
            driverLicense: document.getElementById('driverLicense').value,
            driverAge: parseInt(document.getElementById('userAge').value),
            
            // 車輛信息
            vehicleModel: vehicle.model,
            vehicleYear: vehicle.year,
            vehicleRegistration: vehicle.registration || 'New Vehicle',
            vehicleValue: vehicle.price,
            
            // 保險詳情
            insuranceDetails: {
                driverAge: parseInt(document.getElementById('userAge').value),
                accidentFree: document.getElementById('accidentFree').checked,
                safetySystem: document.getElementById('safetySystem').checked,
                baseInsurance: this.baseInsurance,
                totalDiscount: this.baseInsurance - this.calculateInsurance(),
                finalPremium: this.calculateInsurance()
            },
            
            // 保障範圍
            coverage: [
                {
                    name: "Third Party Liability",
                    limit: 2000000,
                    description: "Covers damage to third party property and injury"
                },
                {
                    name: "Vehicle Damage",
                    limit: vehicle.price,
                    description: "Covers damage to the insured vehicle"
                }
            ],

            // 關聯訂單
            orderId: this.orderId,
            
            // 歷史記錄
            history: [{
                date: new Date().toISOString(),
                action: "Policy Created",
                description: "Insurance application submitted with vehicle purchase"
            }]
        };

        // 保存保單
        let policies = JSON.parse(localStorage.getItem('policies')) || [];
        policies.push(policyData);
        localStorage.setItem('policies', JSON.stringify(policies));
    }

    saveOrder() {
        const orderData = {
            orderId: this.orderId,
            userId: this.currentUser.email,
            customerName: this.currentUser.name,
            customerEmail: this.currentUser.email,
            customerPhone: this.currentUser.phone || 'N/A',
            shippingAddress: this.currentUser.address || 'N/A',
            items: this.cartItems,
            subtotal: this.calculateSubtotal(),
            tax: this.calculateTax(),
            insuranceDetails: {
                policyId: this.policyId,
                driverAge: document.getElementById('userAge').value,
                driverLicense: document.getElementById('driverLicense').value,
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
                text: 'Order Created with Insurance Application'
            }]
        };

        // 保存訂單
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));

        // 創建和保存保單
        this.createInsurancePolicy();

        // 清空購物車
        localStorage.removeItem('cart');
    }

    renderOrderSummary() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Not selected';
        const subtotal = this.calculateSubtotal();
        const tax = this.calculateTax();
        const insurance = this.calculateInsurance();
        const total = subtotal + tax + insurance;
        
        return `
            <div class="summary-details">
                <h4>Order Details</h4>
                <p>Order ID: ${this.orderId}</p>
                <p>Policy ID: ${this.policyId}</p>
                <p>Subtotal: HK$${subtotal.toLocaleString()}</p>
                <p>First Registration Tax: HK$${tax.toLocaleString()}</p>
                <p>Insurance Premium: HK$${insurance.toLocaleString()}</p>
                <p class="total-amount">Total Amount: HK$${total.toLocaleString()}</p>
                <p>Payment Method: ${paymentMethod === 'creditCard' ? 'Credit Card' : 'Bank Transfer'}</p>
                <p>Order Date: ${new Date().toLocaleDateString()}</p>
            </div>
        `;
    }

    validateDriverInfo() {
        const age = document.getElementById('userAge').value;
        const license = document.getElementById('driverLicense').value;

        if (!age || !license) {
            this.showMessage('Please complete all driver information', 'error');
            return false;
        }

        if (parseInt(age) < 18) {
            this.showMessage('Driver must be at least 18 years old', 'error');
            return false;
        }

        if (license.length < 8) {
            this.showMessage('Please enter a valid driver license number', 'error');
            return false;
        }

        return true;
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

    attachEventListeners() {
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.querySelectorAll('.payment-details').forEach(detail => {
                    detail.classList.add('hidden');
                });
                const selectedDetails = e.target.parentElement.querySelector('.payment-details');
                if (selectedDetails) {
                    selectedDetails.classList.remove('hidden');
                }
            });
        });
    }

    nextStep(currentStep) {
        if (currentStep === 1) {
            if (!this.validateDriverInfo()) {
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