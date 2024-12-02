class Checkout {
    constructor() {
        try {
            this.cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            this.baseInsurance = 5000;
            this.policyId = null;
            this.orderId = null;
            this.insuranceOptions = {
                thirdPartyLiability: 2000000,
                personalAccident: 500000,
                medicalExpenses: 100000,
                windscreenCover: 10000
            };
            this.initCheckout();
            const styles = `
                <style>
                .color-selection {
                    margin-top: 15px;
                }
                
                .color-options {
                    display: flex;
                    gap: 15px;
                    margin-top: 8px;
                }
                
                .color-option {
                    cursor: pointer;
                    position: relative;
                }
                
                .color-option input {
                    display: none;
                }
                
                .color-circle {
                    display: inline-block;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    position: relative;
                }
                
                .color-name {
                    position: absolute;
                    bottom: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 12px;
                    white-space: nowrap;
                }
                
                .color-option input:checked + .color-circle::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    text-shadow: 0 0 2px black;
                }
                
                .color-option input:checked + .color-circle[style*="background-color: #FFFFFF"]::after {
                    color: black;
                    text-shadow: none;
                }
                .summary-item.total {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 2px solid #eee;
                    font-weight: bold;
                    font-size: 1.2em;
                    color: #2c3e50;
                }
                
                .summary-item.total span:last-child {
                    color: #e74c3c;
                }
                .vehicle-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .price-tag {
                    font-size: 1.2em;
                    font-weight: bold;
                    color: #e74c3c;
                }
                
                .vehicle-specs {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                }
                
                .specs-group {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 10px;
                }
                
                .spec-item {
                    display: flex;
                    flex-direction: column;
                }
                
                .spec-label {
                    font-size: 0.9em;
                    color: #666;
                    margin-bottom: 4px;
                }
                
                .spec-value {
                    font-weight: 600;
                    color: #2c3e50;
                }
                .order-item {
                    display: flex;
                    align-items: flex-start;
                    padding: 2rem;
                    border-bottom: 1px solid #eee;
                    gap: 2rem;
                }
                
                .item-image {
                    width: 300px; 
                    height: 200px; 
                    object-fit: cover;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease;
                }
                
                .item-image:hover {
                    transform: scale(1.05);
                }
                
                .item-details {
                    flex: 1;
                    padding-top: 0.5rem;
                }
                
                @media (max-width: 768px) {
                    .item-image {
                        width: 100%;
                        height: 200px;
                    }
                    
                    .order-item {
                        flex-direction: column;
                        padding: 1rem;
                    }
                }
                .insurance-packages {
                    margin: 20px 0;
                }

                .package-options {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-top: 20px;
                }

                .package-card {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 20px;
                    position: relative;
                    transition: all 0.3s ease;
                }

                .package-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }

                .package-card input[type="radio"] {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                }

                .package-label {
                    cursor: pointer;
                }

                .package-label h4 {
                    color: #2c3e50;
                    margin-bottom: 10px;
                }

                .price {
                    font-size: 1.5em;
                    color: #e74c3c;
                    margin: 10px 0;
                    font-weight: bold;
                }

                .features {
                    list-style: none;
                    padding: 0;
                }

                .features li {
                    margin: 8px 0;
                    color: #666;
                    padding-left: 20px;
                    position: relative;
                }

                .features li:before {
                    content: "✓";
                    position: absolute;
                    left: 0;
                    color: #27ae60;
                }

                .insurance-summary {
                    margin-top: 30px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                }

                .summary-row.total {
                    margin-top: 20px;
                    padding-top: 10px;
                    border-top: 2px solid #ddd;
                    font-weight: bold;
                    font-size: 1.2em;
                }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        } catch (error) {
            console.error('Checkout initialization error:', error);
            this.showMessage('Error initializing checkout. Please try again.', 'error');
        }
    }

    initCheckout() {
        try {
            if (!this.currentUser) {
                window.location.href = '../html/login.html';
                return;
            }
            if (this.cartItems.length === 0) {
                window.location.href = 'vehicledisplay.html';
                return;
            }

            this.orderId = this.generateOrderNumber();
            this.policyId = this.generatePolicyNumber();

            this.renderCheckoutPage();
            this.attachEventListeners();
        } catch (error) {
            console.error('Error in initCheckout:', error);
            this.showMessage('Error loading checkout page. Please try again.', 'error');
        }
    }

    generateOrderNumber() {
        return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    }

    generatePolicyNumber() {
        return 'POL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    }

    attachEventListeners() {
        try {
            document.querySelectorAll('.next-step-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const section = e.target.closest('.checkout-section');
                    if (!section) return;
                    
                    const currentStep = parseInt(section.dataset.step);
                    if (isNaN(currentStep)) return;
                    
                    this.nextStep(currentStep);
                });
            });

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

            const ageInput = document.getElementById('userAge');
            if (ageInput) {
                ageInput.addEventListener('input', () => this.updateInsuranceSummary());
                ageInput.addEventListener('change', () => this.updateInsuranceSummary());
            }

            const accidentFree = document.getElementById('accidentFree');
            const safetySystem = document.getElementById('safetySystem');
            
            if (accidentFree) {
                accidentFree.addEventListener('change', () => this.updateInsuranceSummary());
            }
            
            if (safetySystem) {
                safetySystem.addEventListener('change', () => this.updateInsuranceSummary());
            }

            const nextStepBtns = document.querySelectorAll('.next-step-btn');
            nextStepBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const currentStep = parseInt(e.target.closest('.checkout-section').dataset.step || '1');
                    this.nextStep(currentStep);
                });
            });

            const backBtns = document.querySelectorAll('.back-btn');
            backBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const currentStep = parseInt(e.target.closest('.checkout-section').dataset.step || '2');
                    this.previousStep(currentStep);
                });
            });

            const finishBtn = document.querySelector('.finish-btn');
            if (finishBtn) {
                finishBtn.addEventListener('click', () => this.finishOrder());
            }

            document.querySelectorAll('input[name="insurancePackage"]').forEach(radio => {
                radio.addEventListener('change', () => this.updateInsuranceSummary());
            });

        } catch (error) {
            console.error('Error attaching event listeners:', error);
        }
    }

    updateInsuranceSummary() {
        try {
            const insuranceAmount = this.calculateInsurance().total;
            
            const totalInsuranceElement = document.querySelector('.total-insurance');
            if (totalInsuranceElement) {
                totalInsuranceElement.textContent = `Final Insurance: HK$${insuranceAmount.toLocaleString()}`;
            }

            const insuranceSummaryElement = document.querySelector('.order-summary .summary-item:nth-child(3) span:last-child');
            if (insuranceSummaryElement) {
                insuranceSummaryElement.textContent = `HK$${insuranceAmount.toLocaleString()}`;
            }

            const totalElement = document.querySelector('.order-summary .summary-item.total span:last-child');
            if (totalElement) {
                const total = this.calculateSubtotal() + this.calculateTax() + insuranceAmount;
                totalElement.textContent = `HK$${total.toLocaleString()}`;
            }

            this.updateDiscountDisplay();
        } catch (error) {
            console.error('Error updating insurance summary:', error);
        }
    }

    updateDiscountDisplay() {
        try {
            const userAge = parseInt(document.getElementById('userAge')?.value || '0');
            const accidentFreeChecked = document.getElementById('accidentFree')?.checked ?? false;
            const safetySystemChecked = document.getElementById('safetySystem')?.checked ?? false;

            const ageDiscountLine = document.querySelector('.age-discount-line');
            if (ageDiscountLine) {
                if (userAge >= 30 && userAge <= 40) {
                    const ageDiscountAmount = this.baseInsurance * 0.10;
                    ageDiscountLine.classList.add('active');
                    ageDiscountLine.querySelector('span').textContent = `-HK$${ageDiscountAmount.toLocaleString()}`;
                } else {
                    ageDiscountLine.classList.remove('active');
                    ageDiscountLine.querySelector('span').textContent = 'Not Eligible';
                }
            }

            const accidentFreeDiscount = document.querySelector('.accident-free-discount');
            if (accidentFreeDiscount) {
                const accidentDiscountAmount = accidentFreeChecked ? this.baseInsurance * 0.15 : 0;
                accidentFreeDiscount.textContent = accidentFreeChecked ? 
                    `No Accident Discount: -HK$${accidentDiscountAmount.toLocaleString()}` : 
                    'No Accident Discount: Not Applied';
            }

            const safetySystemDiscount = document.querySelector('.safety-system-discount');
            if (safetySystemDiscount) {
                const safetyDiscountAmount = safetySystemChecked ? this.baseInsurance * 0.05 : 0;
                safetySystemDiscount.textContent = safetySystemChecked ? 
                    `Safety System Discount: -HK$${safetyDiscountAmount.toLocaleString()}` : 
                    'Safety System Discount: Not Applied';
            }
        } catch (error) {
            console.error('Error updating discount display:', error);
        }
    }

    renderCheckoutPage() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        const checkoutHTML = `
            <div class="checkout-container">
                <div class="checkout-steps">
                    <div class="step active" data-step="1">1. Order Review</div>
                    <div class="step" data-step="2">2. Insurance Application</div>
                    <div class="step" data-step="3">3. Payment Method</div>
                    <div class="step" data-step="4">4. Confirmation</div>
                </div>

                <!-- Step 1: Order Review -->
                <div class="checkout-section" id="orderReview" data-step="1">
                    <h2>Order Review</h2>
                    <div class="order-items">
                        ${this.renderOrderItems()}
                    </div>
                    <div class="order-summary">
                        <div class="summary-item">
                            <span>Vehicle Subtotal:</span>
                            <span>HK$${this.calculateSubtotal().toLocaleString()}</span>
                        </div>
                        <div class="summary-item">
                            <span>First Registration Tax:</span>
                            <span>HK$${this.calculateTax().toLocaleString()}</span>
                        </div>
                        <div class="summary-item total">
                            <span>Total Price:</span>
                            <span>HK$${(this.calculateSubtotal() + this.calculateTax()).toLocaleString()}</span>
                        </div>
                    </div>
                    <button class="next-step-btn">Continue to Insurance</button>
                </div>

                <!-- Step 2: Insurance Application -->
                <div class="checkout-section hidden" id="insuranceApplication" data-step="2">
                    <h2>Insurance Application</h2>
                    <div class="insurance-options">
                        <!-- Driver Information -->
                        <div class="driver-info-section">
                            <h3>Driver Information</h3>
                            <div class="form-group">
                                <label for="userAge">Driver's Age:</label>
                                <input type="number" id="userAge" min="18" max="99" required>
                            </div>
                            <div class="form-group">
                                <label for="driverLicense">Driver's License Number:</label>
                                <input type="text" id="driverLicense" required>
                            </div>
                            <div class="form-group">
                                <label for="drivingExperience">Driving Experience (Years):</label>
                                <input type="number" id="drivingExperience" min="0" max="50" required>
                            </div>
                        </div>

                        <!-- Coverage Options -->
                        <div class="coverage-options">
                            <h3>Coverage Options</h3>
                            <div class="coverage-item">
                                <input type="checkbox" id="thirdPartyLiability" checked disabled>
                                <label for="thirdPartyLiability">Third Party Liability (Required)</label>
                                <p>Coverage up to HK$${this.insuranceOptions.thirdPartyLiability.toLocaleString()}</p>
                            </div>
                            <div class="coverage-item">
                                <input type="checkbox" id="personalAccident">
                                <label for="personalAccident">Personal Accident Cover</label>
                                <p>Coverage up to HK$${this.insuranceOptions.personalAccident.toLocaleString()}</p>
                            </div>
                            <div class="coverage-item">
                                <input type="checkbox" id="medicalExpenses">
                                <label for="medicalExpenses">Medical Expenses</label>
                                <p>Coverage up to HK$${this.insuranceOptions.medicalExpenses.toLocaleString()}</p>
                            </div>
                            <div class="coverage-item">
                                <input type="checkbox" id="windscreenCover">
                                <label for="windscreenCover">Windscreen Cover</label>
                                <p>Coverage up to HK$${this.insuranceOptions.windscreenCover.toLocaleString()}</p>
                            </div>
                        </div>

                        <!-- Discounts -->
                        <div class="insurance-discounts">
                            <h3>Available Discounts</h3>
                            <div class="discount-item">
                                <input type="checkbox" id="accidentFree">
                                <label for="accidentFree">No Accident Record (15% off)</label>
                            </div>
                            <div class="discount-item">
                                <input type="checkbox" id="safetySystem">
                                <label for="safetySystem">Safety System Equipped (5% off)</label>
                            </div>
                            <div class="discount-item">
                                <input type="checkbox" id="garageParking">
                                <label for="garageParking">Garage Parking (10% off)</label>
                            </div>
                        </div>

                        
                    </div>
                    <div class="button-group">
                        <button class="back-btn">Back</button>
                        <button class="next-step-btn">Continue to Payment</button>
                    </div>
                </div>

                <!-- Step 3: Payment Method -->
                <div class="checkout-section hidden" id="paymentMethod" data-step="3">
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
                    <div class="insurance-packages">
                        <h3>Select Insurance Package</h3>
                        <div class="package-options">
                            <div class="package-card">
                                <input type="radio" name="insurancePackage" id="basicPackage" value="basic">
                                <label for="basicPackage" class="package-label">
                                    <h4>Basic Package</h4>
                                    <div class="price">HK$5,000</div>
                                    <ul class="features">
                                        <li>Third Party Liability (Required)</li>
                                        <li>Basic Vehicle Damage</li>
                                        <li>24/7 Emergency Support</li>
                                    </ul>
                                </label>
                            </div>

                            <div class="package-card">
                                <input type="radio" name="insurancePackage" id="goldPackage" value="gold">
                                <label for="goldPackage" class="package-label">
                                    <h4>Gold Package</h4>
                                    <div class="price">HK$8,000</div>
                                    <ul class="features">
                                        <li>Everything in Basic Package</li>
                                        <li>Personal Accident Cover</li>
                                        <li>Medical Expenses</li>
                                        <li>Windscreen Cover</li>
                                    </ul>
                                </label>
                            </div>

                            <div class="package-card">
                                <input type="radio" name="insurancePackage" id="platinumPackage" value="platinum">
                                <label for="platinumPackage" class="package-label">
                                    <h4>Platinum Package</h4>
                                    <div class="price">HK$12,000</div>
                                    <ul class="features">
                                        <li>Everything in Gold Package</li>
                                        <li>Full Vehicle Replacement</li>
                                        <li>Zero Depreciation</li>
                                        <li>Enhanced Personal Accident</li>
                                        <li>Worldwide Coverage</li>
                                    </ul>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Updated Insurance Summary -->
                    <div class="insurance-summary">
                        <h3>Insurance Premium Summary</h3>
                        <div class="premium-breakdown">
                            <div class="summary-row">
                                <span>Selected Package:</span>
                                <span id="selectedPackage">-</span>
                            </div>
                            <div class="summary-row">
                                <span>Base Premium:</span>
                                <span id="basePremium">HK$0</span>
                            </div>
                            <div class="summary-row">
                                <span>Age Discount:</span>
                                <span id="ageDiscount">-HK$0</span>
                            </div>
                            <div class="summary-row">
                                <span>No Accident Discount:</span>
                                <span id="accidentDiscount">-HK$0</span>
                            </div>
                            <div class="summary-row">
                                <span>Safety System Discount:</span>
                                <span id="safetyDiscount">-HK$0</span>
                            </div>
                            <div class="summary-row total">
                                <span>Final Premium:</span>
                                <span id="finalPremium">HK$0</span>
                            </div>
                        </div>
                    </div>
                    <div class="button-group">
                        <button class="back-btn">Back</button>
                        <button class="next-step-btn">Confirm Payment</button>
                    </div>
                </div>

                <!-- Confirmation Section -->
                ${this.renderConfirmationSection()}
            </div>
        `;

        mainContent.innerHTML = checkoutHTML;
        this.attachEventListeners();
    }

    renderPaymentSection() {
        return `
            <!-- Step 3: Payment Method -->
            <div class="checkout-section hidden" id="paymentMethod" data-step="3">
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
                <div class="insurance-packages">
                    <h3>Select Insurance Package</h3>
                    <div class="package-options">
                        <div class="package-card">
                            <input type="radio" name="insurancePackage" id="basicPackage" value="basic">
                            <label for="basicPackage" class="package-label">
                                <h4>Basic Package</h4>
                                <div class="price">HK$5,000</div>
                                <ul class="features">
                                    <li>Third Party Liability (Required)</li>
                                    <li>Basic Vehicle Damage</li>
                                    <li>24/7 Emergency Support</li>
                                </ul>
                            </label>
                        </div>

                        <div class="package-card">
                            <input type="radio" name="insurancePackage" id="goldPackage" value="gold">
                            <label for="goldPackage" class="package-label">
                                <h4>Gold Package</h4>
                                <div class="price">HK$8,000</div>
                                <ul class="features">
                                    <li>Everything in Basic Package</li>
                                    <li>Personal Accident Cover</li>
                                    <li>Medical Expenses</li>
                                    <li>Windscreen Cover</li>
                                </ul>
                            </label>
                        </div>

                        <div class="package-card">
                            <input type="radio" name="insurancePackage" id="platinumPackage" value="platinum">
                            <label for="platinumPackage" class="package-label">
                                <h4>Platinum Package</h4>
                                <div class="price">HK$12,000</div>
                                <ul class="features">
                                    <li>Everything in Gold Package</li>
                                    <li>Full Vehicle Replacement</li>
                                    <li>Zero Depreciation</li>
                                    <li>Enhanced Personal Accident</li>
                                    <li>Worldwide Coverage</li>
                                </ul>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Updated Insurance Summary -->
                <div class="insurance-summary">
                    <h3>Insurance Premium Summary</h3>
                    <div class="premium-breakdown">
                        <div class="summary-row">
                            <span>Selected Package:</span>
                            <span id="selectedPackage">-</span>
                        </div>
                        <div class="summary-row">
                            <span>Base Premium:</span>
                            <span id="basePremium">HK$0</span>
                        </div>
                        <div class="summary-row">
                            <span>Age Discount:</span>
                            <span id="ageDiscount">-HK$0</span>
                        </div>
                        <div class="summary-row">
                            <span>No Accident Discount:</span>
                            <span id="accidentDiscount">-HK$0</span>
                        </div>
                        <div class="summary-row">
                            <span>Safety System Discount:</span>
                            <span id="safetyDiscount">-HK$0</span>
                        </div>
                        <div class="summary-row total">
                            <span>Final Premium:</span>
                            <span id="finalPremium">HK$0</span>
                        </div>
                    </div>
                </div>
                <div class="button-group">
                    <button class="back-btn">Back</button>
                    <button class="next-step-btn">Confirm Payment</button>
                </div>
            </div>
        `;
    }

    renderConfirmationSection() {
        return `
            <!-- Step 4: Confirmation -->
            <div class="checkout-section hidden" id="confirmation" data-step="4">
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
                <button class="finish-btn">Back to Home</button>
            </div>
        `;
    }

    renderOrderItems() {
        return this.cartItems.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.model}" class="item-image">
                <div class="item-details">
                    <div class="vehicle-header">
                        <h3>${item.model}</h3>
                        <div class="price-tag">HK$${item.price.toLocaleString()}</div>
                    </div>
                    <div class="vehicle-specs">
                        <div class="specs-group">
                            <div class="spec-item">
                                <span class="spec-label">Brand:</span>
                                <span class="spec-value">${item.brand.toUpperCase()}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Year:</span>
                                <span class="spec-value">${item.year}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Type:</span>
                                <span class="spec-value">${item.type.toUpperCase()}</span>
                            </div>
                        </div>
                        <div class="specs-group">
                            <div class="spec-item">
                                <span class="spec-label">Engine:</span>
                                <span class="spec-value">${item.engine}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Mileage:</span>
                                <span class="spec-value">${item.mileage} Kilometer</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Registration:</span>
                                <span class="spec-value">${item.registration || 'New Vehicle'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="color-selection">
                        <label>Select Color:</label>
                        <div class="color-options">
                            <label class="color-option">
                                <input type="radio" name="color-${item.id}" value="black" checked>
                                <span class="color-circle" style="background-color: #000000;">
                                    <span class="color-name">Black</span>
                                </span>
                            </label>
                            <label class="color-option">
                                <input type="radio" name="color-${item.id}" value="white">
                                <span class="color-circle" style="background-color: #FFFFFF; border: 1px solid #ccc;">
                                    <span class="color-name">White</span>
                                </span>
                            </label>
                            <label class="color-option">
                                <input type="radio" name="color-${item.id}" value="silver">
                                <span class="color-circle" style="background-color: #C0C0C0;">
                                    <span class="color-name">Silver</span>
                                </span>
                            </label>
                            <label class="color-option">
                                <input type="radio" name="color-${item.id}" value="red">
                                <span class="color-circle" style="background-color: #FF0000;">
                                    <span class="color-name">Red</span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    calculateInsurance() {
        try {
            const selectedPackage = document.querySelector('input[name="insurancePackage"]:checked')?.value;
            let basePremium;
            
            switch(selectedPackage) {
                case 'basic':
                    basePremium = 5000;
                    break;
                case 'gold':
                    basePremium = 8000;
                    break;
                case 'platinum':
                    basePremium = 12000;
                    break;
                default:
                    basePremium = 0;
            }

            let totalPremium = basePremium;
            let discountPercentage = 0;

            const age = parseInt(document.getElementById('userAge')?.value || '0');
            if (age >= 30 && age <= 40) discountPercentage += 0.10;
            if (document.getElementById('accidentFree')?.checked) discountPercentage += 0.15;
            if (document.getElementById('safetySystem')?.checked) discountPercentage += 0.05;

            const discountAmount = totalPremium * discountPercentage;
            totalPremium -= discountAmount;

            document.getElementById('selectedPackage').textContent = selectedPackage ? 
                selectedPackage.charAt(0).toUpperCase() + selectedPackage.slice(1) + ' Package' : '-';
            document.getElementById('basePremium').textContent = `HK$${basePremium.toLocaleString()}`;
            document.getElementById('ageDiscount').textContent = age >= 30 && age <= 40 ? 
                `-HK$${(basePremium * 0.10).toLocaleString()}` : 'Not Eligible';
            document.getElementById('accidentDiscount').textContent = document.getElementById('accidentFree')?.checked ?
                `-HK$${(basePremium * 0.15).toLocaleString()}` : 'Not Applied';
            document.getElementById('safetyDiscount').textContent = document.getElementById('safetySystem')?.checked ?
                `-HK$${(basePremium * 0.05).toLocaleString()}` : 'Not Applied';
            document.getElementById('finalPremium').textContent = `HK$${totalPremium.toLocaleString()}`;

            return {
                basePremium,
                discount: discountAmount,
                total: totalPremium
            };
        } catch (error) {
            console.error('Error calculating insurance:', error);
            return {
                basePremium: 0,
                discount: 0,
                total: 0
            };
        }
    }

    calculateSubtotal() {
        return this.cartItems.reduce((total, item) => total + item.price, 0);
    }

    calculateTax() {
        const subtotal = this.calculateSubtotal();
        let taxRate;
        if (subtotal <= 150000) {
            taxRate = 0.4;
        } else if (subtotal <= 300000) {
            taxRate = 0.75;
        } else if (subtotal <= 500000) {
            taxRate = 1.0;
        } else {
            taxRate = 1.15;
        }
        return subtotal * taxRate;
    }

    createInsurancePolicy() {
        const existingPolicies = JSON.parse(localStorage.getItem('policies')) || [];
        if (existingPolicies.some(policy => policy.policyId === this.policyId)) {
            console.log('Policy already exists, skipping creation');
            return;
        }

        const vehicle = this.cartItems[0];
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);

        const policyData = {
            policyId: this.policyId,
            type: 'vehicle',
            status: 'pending',
            premium: this.calculateInsurance().total,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            createdDate: new Date().toISOString(),
            
            clientName: this.currentUser.name,
            clientId: this.currentUser.id || this.currentUser.email,
            clientEmail: this.currentUser.email,
            clientPhone: this.currentUser.phone,
            driverLicense: document.getElementById('driverLicense').value,
            driverAge: parseInt(document.getElementById('userAge').value),
            
            vehicleModel: vehicle.model,
            vehicleYear: vehicle.year,
            vehicleRegistration: vehicle.registration || 'New Vehicle',
            vehicleValue: vehicle.price,
            
            insuranceDetails: {
                driverAge: parseInt(document.getElementById('userAge').value),
                accidentFree: document.getElementById('accidentFree').checked,
                safetySystem: document.getElementById('safetySystem').checked,
                baseInsurance: this.baseInsurance,
                totalDiscount: this.baseInsurance - this.calculateInsurance().total,
                finalPremium: this.calculateInsurance().total
            },
            
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

            orderId: this.orderId,
            
            history: [{
                date: new Date().toISOString(),
                action: "Policy Created",
                description: "Insurance application submitted with vehicle purchase"
            }]
        };

        existingPolicies.push(policyData);
        localStorage.setItem('policies', JSON.stringify(existingPolicies));
    }

    saveOrder() {
        const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
        if (existingOrders.some(order => order.orderId === this.orderId)) {
            console.log('Order already exists, skipping save');
            return;
        }

        const orderData = {
            orderId: this.orderId,
            userId: this.currentUser.email,
            customerName: this.currentUser.name,
            customerEmail: this.currentUser.email,
            customerPhone: this.currentUser.phone || 'N/A',
            shippingAddress: this.currentUser.address || 'N/A',
            items: this.cartItems.map(item => ({
                ...item,
                selectedColor: document.querySelector(`input[name="color-${item.id}"]:checked`)?.value || 'black'
            })),
            subtotal: this.calculateSubtotal(),
            tax: this.calculateTax(),
            insuranceDetails: {
                policyId: this.policyId,
                driverAge: document.getElementById('userAge').value,
                driverLicense: document.getElementById('driverLicense').value,
                accidentFree: document.getElementById('accidentFree').checked,
                safetySystem: document.getElementById('safetySystem').checked,
                baseInsurance: this.baseInsurance,
                totalDiscount: this.baseInsurance - this.calculateInsurance().total,
                finalInsurance: this.calculateInsurance().total
            },
            total: this.calculateSubtotal() + this.calculateTax() + this.calculateInsurance().total,
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
            status: 'pending',
            orderDate: new Date().toISOString(),
            statusHistory: [{
                status: 'created',
                date: new Date().toISOString(),
                text: 'Order Created with Insurance Application'
            }]
        };

        existingOrders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
        
        this.createInsurancePolicy();
        
        localStorage.removeItem('cart');
    }

    renderOrderSummary() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Not selected';
        const subtotal = this.calculateSubtotal();
        const tax = this.calculateTax();
        const insurance = this.calculateInsurance().total;
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

    nextStep(currentStep) {
        try {
            const currentSection = document.querySelector(`.checkout-section[data-step="${currentStep}"]`);
            const nextSection = document.querySelector(`.checkout-section[data-step="${currentStep + 1}"]`);
            
            if (!currentSection || !nextSection) {
                console.error('Could not find sections');
                return;
            }

            if (currentStep === 1) {
                currentSection.classList.add('hidden');
                nextSection.classList.remove('hidden');
                document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
                document.querySelector(`.step[data-step="${currentStep + 1}"]`).classList.add('active');
            } else if (currentStep === 2) {
                if (!this.validateInsuranceInfo()) return;
                currentSection.classList.add('hidden');
                nextSection.classList.remove('hidden');
                document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
                document.querySelector(`.step[data-step="${currentStep + 1}"]`).classList.add('active');
            } else if (currentStep === 3) {
                if (!this.validatePayment()) return;
                
                this.saveOrder();
                
                currentSection.classList.add('hidden');
                nextSection.classList.remove('hidden');
                document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
                document.querySelector(`.step[data-step="${currentStep + 1}"]`).classList.add('active');
                
                this.showMessage('Payment successful! Order confirmed.', 'success');
            }
        } catch (error) {
            console.error('Error in nextStep:', error);
            this.showMessage('An error occurred. Please try again.', 'error');
        }
    }

    previousStep(currentStep) {
        try {
            if (currentStep === 2) {
                document.getElementById('insuranceApplication').classList.add('hidden');
                document.getElementById('orderReview').classList.remove('hidden');
            } else if (currentStep === 3) {
                document.getElementById('paymentMethod').classList.add('hidden');
                document.getElementById('insuranceApplication').classList.remove('hidden');
            } else if (currentStep === 4) {
                document.getElementById('confirmation').classList.add('hidden');
                document.getElementById('paymentMethod').classList.remove('hidden');
            }

            document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
            document.querySelector(`.step[data-step="${currentStep - 1}"]`).classList.add('active');
        } catch (error) {
            console.error('Error in previousStep:', error);
            this.showMessage('An error occurred. Please try again.', 'error');
        }
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

    validateInsuranceInfo() {
        const age = document.getElementById('userAge').value;
        const license = document.getElementById('driverLicense').value;
        const experience = document.getElementById('drivingExperience').value;

        if (!age || !license || !experience) {
            this.showMessage('Please complete all insurance information', 'error');
            return false;
        }

        if (parseInt(age) < 18) {
            this.showMessage('Driver must be at least 18 years old', 'error');
            return false;
        }

        if (parseInt(experience) > (parseInt(age) - 18)) {
            this.showMessage('Driving experience cannot exceed possible years since legal driving age', 'error');
            return false;
        }

        return true;
    }

    validatePayment() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        const selectedPackage = document.querySelector('input[name="insurancePackage"]:checked')?.value;

        if (!paymentMethod) {
            this.showMessage('Please select a payment method', 'error');
            return false;
        }

        if (!selectedPackage) {
            this.showMessage('Please select an insurance package', 'error');
            return false;
        }

        if (paymentMethod === 'creditCard') {
            return this.validateCreditCardInfo();
        } else if (paymentMethod === 'bankTransfer') {
            return true;
        }

        return false;
    }

    validateCreditCardInfo() {
        const cardNumber = document.querySelector('.card-number')?.value;
        const cardExpiry = document.querySelector('.card-expiry')?.value;
        const cardCvv = document.querySelector('.card-cvv')?.value;

        if (!cardNumber || !cardExpiry || !cardCvv) {
            this.showMessage('Please fill in all card details', 'error');
            return false;
        }

        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cleanCardNumber)) {
            this.showMessage('Invalid card number (must be 16 digits)', 'error');
            return false;
        }

        if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardExpiry)) {
            this.showMessage('Invalid expiry date (format: MM/YY)', 'error');
            return false;
        }

        const [month, year] = cardExpiry.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const now = new Date();
        if (expiry < now) {
            this.showMessage('Card has expired', 'error');
            return false;
        }

        if (!/^\d{3,4}$/.test(cardCvv)) {
            this.showMessage('Invalid CVV (3 or 4 digits)', 'error');
            return false;
        }

        return true;
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

const checkout = new Checkout();

window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + error);
    return false;
};