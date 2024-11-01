class SalesManager {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.init();
    }

    init() {
   
        if (!this.currentUser || this.currentUser.userType !== 'vehicleSalesperson') {
            this.showMessage('Access denied. Only Vehicle Salesperson can access this page.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        this.loadSalesOverview();
        this.loadOrders();
        this.initializeFilters();
        this.setupEventListeners();
    }

    loadSalesOverview() {

        const today = new Date().toDateString();
        const todaySales = this.orders
            .filter(order => 
                new Date(order.orderDate).toDateString() === today && 
                order.status === 'completed' &&
                order.salesPersonId === this.currentUser.id
            )
            .reduce((sum, order) => sum + order.total, 0);

        const currentMonth = new Date().getMonth();
        const monthlySales = this.orders
            .filter(order => 
                new Date(order.orderDate).getMonth() === currentMonth && 
                order.status === 'completed' &&
                order.salesPersonId === this.currentUser.id
            )
            .reduce((sum, order) => sum + order.total, 0);

        const pendingOrders = this.orders.filter(order => 
            (order.status === 'pending' || order.status === 'processing') &&
            (!order.salesPersonId || order.salesPersonId === this.currentUser.id)
        ).length;

        const completedOrders = this.orders.filter(order => 
            order.status === 'completed' &&
            order.salesPersonId === this.currentUser.id
        ).length;

        document.getElementById('todaySales').textContent = todaySales.toLocaleString();
        document.getElementById('monthlySales').textContent = monthlySales.toLocaleString();
        document.getElementById('pendingOrders').textContent = pendingOrders;
        document.getElementById('completedOrders').textContent = completedOrders;
    }

    loadOrders() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

   
        let filteredOrders = this.orders.filter(order => 
            order.salesPersonId === this.currentUser.id ||
            !order.salesPersonId
        );

        if (statusFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }

        if (dateFilter) {
            const filterDate = new Date(dateFilter).toDateString();
            filteredOrders = filteredOrders.filter(order => 
                new Date(order.orderDate).toDateString() === filterDate
            );
        }

        filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        tbody.innerHTML = filteredOrders.map(order => `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.customerName}</td>
                <td>${order.items.map(item => item.model).join(', ')}</td>
                <td>HK$${order.total.toLocaleString()}</td>
                <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge status-${order.status}">
                        ${order.status.toUpperCase()}
                    </span>
                </td>
                <td>
                    <button class="action-btn view-btn" onclick="salesManager.viewOrderDetails('${order.orderId}')">
                        View
                    </button>
                    ${this.getActionButtons(order)}
                </td>
            </tr>
        `).join('');
    }

    getActionButtons(order) {
        if (order.salesPersonId && order.salesPersonId !== this.currentUser.id) {
            return '';
        }

        if (order.status === 'pending') {
            return `
                <button class="action-btn process-btn" onclick="salesManager.processOrder('${order.orderId}')">
                    Process
                </button>
                <button class="action-btn cancel-btn" onclick="salesManager.cancelOrder('${order.orderId}')">
                    Cancel
                </button>
            `;
        }
        if (order.status === 'processing') {
            return `
                <button class="action-btn process-btn" onclick="salesManager.completeOrder('${order.orderId}')">
                    Complete
                </button>
            `;
        }
        return '';
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.orderId === orderId);
        if (!order) return;
    
        const modal = document.getElementById('orderModal');
        const detailsContainer = document.getElementById('orderDetails');
    
        detailsContainer.innerHTML = `
            <div class="order-details">
                <!-- Basic Order Information -->
                <div class="detail-row">
                    <span>Order ID:</span>
                    <span>${order.orderId}</span>
                </div>
                <div class="detail-row">
                    <span>Order Date:</span>
                    <span>${new Date(order.orderDate).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span>Status:</span>
                    <span class="status-badge status-${order.status}">
                        ${order.status.toUpperCase()}
                    </span>
                </div>
                <div class="detail-row">
                    <span>Sales Person:</span>
                    <span>${order.salesPersonName || 'Not Assigned'}</span>
                </div>
    
                <!-- Customer Information -->
                <div class="customer-info">
                    <h3>Customer Information</h3>
                    <div class="detail-row">
                        <span>Name:</span>
                        <span>${order.customerName || 'undefined'}</span>
                    </div>
                    <div class="detail-row">
                        <span>Email:</span>
                        <span>${order.customerEmail || 'undefined'}</span>
                    </div>
                    <div class="detail-row">
                        <span>Phone:</span>
                        <span>${order.customerPhone || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span>Shipping Address:</span>
                        <span>${order.shippingAddress || 'N/A'}</span>
                    </div>
                </div>
    
                <!-- Order Items -->
                <div class="order-items">
                    <h3>Order Items</h3>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.model}">
                            <div class="item-details">
                                <h4>${item.model}</h4>
                                <p>HK$${item.price.toLocaleString()}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
    
                <!-- Status History -->
                <div class="status-history">
                    <h3>Order History</h3>
                    <div class="status-timeline">
                        ${this.getOrderTimeline(order)}
                    </div>
                </div>
    
                <!-- Order Total -->
                <div class="order-total">
                    <span>Total Amount:</span>
                    <span>HK$${order.total.toLocaleString()}</span>
                </div>
    
                <!-- Order Action Button -->
                <div class="order-actions">
                    ${this.getDetailActionButtons(order)}
                </div>
            </div>
        `;
    
        modal.style.display = 'block';
    }

    getOrderTimeline(order) {
        const timeline = [
            {
                status: 'created',
                date: order.orderDate,
                text: 'Order Created'
            }
        ];

        if (order.statusHistory) {
            timeline.push(...order.statusHistory);
        }

        return timeline.map(item => `
            <div class="timeline-item">
                <div class="timeline-date">
                    ${new Date(item.date).toLocaleString()}
                </div>
                <div class="timeline-status">
                    ${item.text}
                </div>
            </div>
        `).join('');
    }

    getDetailActionButtons(order) {
        if (order.salesPersonId && order.salesPersonId !== this.currentUser.id) {
            return '';
        }

        switch(order.status) {
            case 'pending':
                return `
                    <button onclick="salesManager.processOrder('${order.orderId}')" class="process-btn">
                        Process Order
                    </button>
                    <button onclick="salesManager.cancelOrder('${order.orderId}')" class="cancel-btn">
                        Cancel Order
                    </button>
                `;
            case 'processing':
                return `
                    <button onclick="salesManager.completeOrder('${order.orderId}')" class="process-btn">
                        Complete Order
                    </button>
                `;
            default:
                return '';
        }
    }

    processOrder(orderId) {
        if (confirm('Are you sure you want to process this order?')) {
            this.updateOrderStatus(orderId, 'processing');
        }
    }

    completeOrder(orderId) {
        if (confirm('Are you sure you want to mark this order as completed?')) {
            this.updateOrderStatus(orderId, 'completed');
        }
    }

    cancelOrder(orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            this.updateOrderStatus(orderId, 'cancelled');
        }
    }

    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.orderId === orderId);
        if (!order) return;

        if (!order.salesPersonId) {
            order.salesPersonId = this.currentUser.id;
            order.salesPersonName = this.currentUser.name;
        }

        if (!order.statusHistory) {
            order.statusHistory = [];
        }

        order.statusHistory.push({
            status: newStatus,
            date: new Date().toISOString(),
            text: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} by ${this.currentUser.name}`
        });

        order.status = newStatus;
        localStorage.setItem('orders', JSON.stringify(this.orders));

        this.loadOrders();
        this.loadSalesOverview();
        
        const modal = document.getElementById('orderModal');
        if (modal.style.display === 'block') {
            this.viewOrderDetails(orderId);
        }

        this.showMessage(`Order ${orderId} has been ${newStatus}`);
    }

    initializeFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const dateFilter = document.getElementById('dateFilter');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.loadOrders());
        }
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.loadOrders());
        }
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
       
            localStorage.removeItem('currentUser');
        
            window.location.href = 'login.html';
            
      
            this.showMessage('Logout successful', 'success');
        }
    }

    setupEventListeners() {
        const modal = document.getElementById('orderModal');
        const closeBtn = document.querySelector('.close');

        if (closeBtn && modal) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };

            window.onclick = (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        }
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

    refreshOrders() {
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('dateFilter').value = '';
        this.loadOrders();
    }
}


const salesManager = new SalesManager();