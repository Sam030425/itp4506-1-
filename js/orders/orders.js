class OrderManager {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.init();
    }

    init() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }
        this.loadOrders();
        this.initializeFilters();
    }

    loadOrders() {
        const userOrders = this.orders.filter(order => 
            order.userId === this.currentUser.email
        );
        
        const sortedOrders = userOrders.sort((a, b) => 
            new Date(b.orderDate) - new Date(a.orderDate)
        );
        
        this.displayOrders(sortedOrders);
    }

    initializeFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterOrders());
        }
        if (startDate) {
            startDate.addEventListener('change', () => this.filterOrders());
        }
        if (endDate) {
            endDate.addEventListener('change', () => this.filterOrders());
        }
    }

    filterOrders() {
        const status = document.getElementById('statusFilter').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        let filteredOrders = this.orders.filter(order => 
            order.userId === this.currentUser.email
        );

        if (status !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === status);
        }

        if (startDate) {
            filteredOrders = filteredOrders.filter(order => 
                new Date(order.orderDate) >= new Date(startDate)
            );
        }

        if (endDate) {
            filteredOrders = filteredOrders.filter(order => 
                new Date(order.orderDate) <= new Date(endDate)
            );
        }

        this.displayOrders(filteredOrders);
    }

    displayOrders(orders) {
        const ordersList = document.querySelector('.orders-list');
        if (!ordersList) return;

        ordersList.innerHTML = '';

        if (orders.length === 0) {
            ordersList.innerHTML = `
                <div class="no-orders">
                    <p>No orders found</p>
                </div>
            `;
            return;
        }

        const displayedOrders = new Set();

        orders.forEach(order => {
            if (!displayedOrders.has(order.orderId)) {
                displayedOrders.add(order.orderId);
                
                const orderElement = document.createElement('div');
                orderElement.className = 'order-card';
                orderElement.innerHTML = `
                    <div class="order-header">
                        <span class="order-id">Order #${order.orderId}</span>
                        <span class="order-date">${new Date(order.orderDate).toLocaleDateString()}</span>
                        <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                    </div>
                    <div class="order-body">
                        <div class="order-items">
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <img src="${item.image}" alt="${item.model}" class="item-image">
                                    <div class="item-details">
                                        <div class="item-model">${item.model}</div>
                                        <div class="item-price">HK$${item.price.toLocaleString()}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="order-footer">
                        <div class="order-total">
                            Total: HK$${order.total.toLocaleString()}
                        </div>
                        <div class="order-actions">
                            ${this.getOrderActions(order)}
                        </div>
                    </div>
                `;
                ordersList.appendChild(orderElement);
            }
        });

        this.removeEventListeners();
        this.attachEventListeners();
    }

    getOrderActions(order) {
        switch (order.status.toLowerCase()) {
            case 'pending':
                return `
                    <button onclick="orderManager.cancelOrder('${order.orderId}')" class="cancel-btn">
                        Cancel Order
                    </button>
                    <button onclick="orderManager.viewDetails('${order.orderId}')" class="view-btn">
                        View Details
                    </button>
                `;
            case 'processing':
            case 'completed':
            case 'cancelled':
                return `
                    <button onclick="orderManager.viewDetails('${order.orderId}')" class="view-btn">
                        View Details
                    </button>
                `;
            default:
                return `
                    <button onclick="orderManager.viewDetails('${order.orderId}')" class="view-btn">
                        View Details
                    </button>
                `;
        }
    }

    viewDetails(orderId) {
        const order = this.orders.find(o => o.orderId === orderId);
        if (!order) return;

        let modal = document.getElementById('orderDetailsModal');
        if (modal) {
            modal.remove();
        }

        const modalHtml = `
            <div id="orderDetailsModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Order Details</h2>
                    
                    <div class="order-info-section">
                        <h3>Order Information</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">Order ID:</span>
                                <span class="value">${order.orderId}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Order Date:</span>
                                <span class="value">${new Date(order.orderDate).toLocaleString()}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Status:</span>
                                <span class="value status-${order.status.toLowerCase()}">${order.status.toUpperCase()}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Payment Method:</span>
                                <span class="value">${order.paymentMethod}</span>
                            </div>
                        </div>
                    </div>

                    <div class="customer-info-section">
                        <h3>Customer Information</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">Name:</span>
                                <span class="value">${order.customerName}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Email:</span>
                                <span class="value">${order.customerEmail}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Phone:</span>
                                <span class="value">${order.customerPhone}</span>
                            </div>
                        </div>
                    </div>

                    <div class="items-section">
                        <h3>Ordered Items</h3>
                        ${order.items.map(item => `
                            <div class="order-detail-item">
                                <img src="${item.image}" alt="${item.model}" class="item-image">
                                <div class="item-info">
                                    <h4>${item.model}</h4>
                                    <p>Year: ${item.year}</p>
                                    <p>Price: HK$${item.price.toLocaleString()}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="insurance-section">
                        <h3>Insurance Details</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">Policy ID:</span>
                                <span class="value">${order.insuranceDetails.policyId}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Driver's Age:</span>
                                <span class="value">${order.insuranceDetails.driverAge}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Driver's License:</span>
                                <span class="value">${order.insuranceDetails.driverLicense}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Insurance Premium:</span>
                                <span class="value">HK$${order.insuranceDetails.finalInsurance.toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="insurance-details">
                            <div class="info-item">
                                <span class="label">No Accident Record:</span>
                                <span class="value">${order.insuranceDetails.accidentFree ? 'Yes' : 'No'}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Safety System Equipped:</span>
                                <span class="value">${order.insuranceDetails.safetySystem ? 'Yes' : 'No'}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Total Discount:</span>
                                <span class="value">HK$${order.insuranceDetails.totalDiscount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div class="order-summary-section">
                        <h3>Order Summary</h3>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <span class="label">Subtotal:</span>
                                <span class="value">HK$${order.subtotal.toLocaleString()}</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">Tax:</span>
                                <span class="value">HK$${order.tax.toLocaleString()}</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">Insurance:</span>
                                <span class="value">HK$${order.insuranceDetails.finalInsurance.toLocaleString()}</span>
                            </div>
                            <div class="summary-item total">
                                <span class="label">Total Amount:</span>
                                <span class="value">HK$${order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        modal = document.getElementById('orderDetailsModal');
        const closeBtn = modal.querySelector('.close');

        closeBtn.onclick = () => modal.remove();
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.remove();
            }
        };

        modal.style.display = 'block';
    }

    cancelOrder(orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            this.orders = this.orders.map(order => {
                if (order.orderId === orderId) {
                    return { ...order, status: 'cancelled' };
                }
                return order;
            });
            localStorage.setItem('orders', JSON.stringify(this.orders));
            this.loadOrders();
            this.showMessage('Order cancelled successfully');
        }
    }

    removeEventListeners() {
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });
    }

    attachEventListeners() {
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', () => {
                newButton.closest('.modal').style.display = 'none';
            });
        });
    }

    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
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

const orderManager = new OrderManager();

function resetFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    orderManager.loadOrders();
}

window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + error);
    return false;
};