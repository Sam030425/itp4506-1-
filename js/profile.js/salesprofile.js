class SalesProfile {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
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

        this.loadProfileData();
        this.initializeEventListeners();
        this.loadSalesPerformance();
        this.loadRecentActivities();
    }

    loadProfileData() {
        document.getElementById('salesName').textContent = this.currentUser.name;
        document.getElementById('salesEmail').textContent = `Email: ${this.currentUser.email}`;

        document.getElementById('name').value = this.currentUser.name;
        document.getElementById('phone').value = this.currentUser.phone || '';
    }

    loadSalesPerformance() {
        const userOrders = this.orders.filter(order => 
            order.salesPersonId === this.currentUser.id
        );

        const currentMonth = new Date().getMonth();
        const monthlySales = userOrders
            .filter(order => 
                new Date(order.orderDate).getMonth() === currentMonth &&
                order.status === 'completed'
            )
            .reduce((sum, order) => sum + order.total, 0);

        const completedOrders = userOrders.filter(order => order.status === 'completed').length;
        const completionRate = userOrders.length > 0 
            ? ((completedOrders / userOrders.length) * 100).toFixed(1)
            : 0;

        document.getElementById('monthlySales').textContent = `HK$${monthlySales.toLocaleString()}`;
        document.getElementById('totalOrders').textContent = userOrders.length;
        document.getElementById('currentMonthSales').textContent = `HK$${monthlySales.toLocaleString()}`;
        document.getElementById('completionRate').textContent = `${completionRate}%`;
    }

    loadRecentActivities() {
        const activityList = document.getElementById('activityList');
        const userOrders = this.orders
            .filter(order => order.salesPersonId === this.currentUser.id)
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);

        activityList.innerHTML = userOrders.map(order => `
            <div class="activity-item">
                <div class="activity-icon">
                    ${this.getActivityIcon(order.status)}
                </div>
                <div class="activity-details">
                    <div class="activity-title">
                        ${this.getActivityTitle(order)}
                    </div>
                    <div class="activity-time">
                        ${new Date(order.orderDate).toLocaleString()}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(status) {
        const icons = {
            'pending': '⏳',
            'processing': '🔄',
            'completed': '✅',
            'cancelled': '❌'
        };
        return icons[status] || '📋';
    }

    getActivityTitle(order) {
        const statusText = {
            'pending': 'New order received',
            'processing': 'Processing order',
            'completed': 'Completed order',
            'cancelled': 'Cancelled order'
        };
        return `${statusText[order.status]} - ${order.items.map(item => item.model).join(', ')}`;
    }

    initializeEventListeners() {
        const personalInfoForm = document.getElementById('personalInfoForm');
        if (personalInfoForm) {
            personalInfoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updatePersonalInfo();
            });
        }

        const securityForm = document.getElementById('securityForm');
        if (securityForm) {
            securityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updatePassword();
            });
        }
    }

    updatePersonalInfo() {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;

        this.currentUser.name = name;
        this.currentUser.phone = phone;

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.map(user => {
            if (user.email === this.currentUser.email) {
                return {...user, name, phone};
            }
            return user;
        });
        localStorage.setItem('users', JSON.stringify(users));

        this.showMessage('Personal information updated successfully');
    }

    updatePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (currentPassword !== this.currentUser.password) {
            this.showMessage('Current password is incorrect', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showMessage('New passwords do not match', 'error');
            return;
        }

        this.currentUser.password = newPassword;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.map(user => {
            if (user.email === this.currentUser.email) {
                return {...user, password: newPassword};
            }
            return user;
        });
        localStorage.setItem('users', JSON.stringify(users));

        document.getElementById('securityForm').reset();
        this.showMessage('Password updated successfully');
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {

            localStorage.removeItem('currentUser');
            

            this.showMessage('Logout successful', 'success');
            
     
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
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
}

const salesProfile = new SalesProfile();