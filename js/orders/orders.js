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
        this.displayOrders(userOrders);
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

        if (orders.length === 0) {
            ordersList.innerHTML = `
                <div class="no-orders">
                    <p>No orders found</p>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
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
            </div>
        `).join('');

        
        this.attachEventListeners();
    }

    getOrderActions(order) {
        switch (order.status) {
            case 'pending':
                return `
                    <button onclick="orderManager.cancelOrder('${order.orderId}')" class="cancel-btn">
                        Cancel Order
                    </button>
                `;
            case 'processing':
                return `
                    <button onclick="orderManager.viewDetails('${order.orderId}')" class="view-btn">
                        View Details
                    </button>
                `;
            case 'completed':
                return `
                    <button onclick="orderManager.viewDetails('${order.orderId}')" class="view-btn">
                        View Details
                    </button>
                `;
            default:
                return '';
        }
    }

    attachEventListeners() {
        
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

    viewDetails(orderId) {
        
        const order = this.orders.find(o => o.orderId === orderId);
        if (order) {
           
        }
    }


    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = message;
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: #28a745;
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