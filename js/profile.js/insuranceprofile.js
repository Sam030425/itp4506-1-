class InsuranceProfile {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.policies = JSON.parse(localStorage.getItem('policies')) || [];
        this.init();
    }

    init() {
        if (!this.currentUser || this.currentUser.userType !== 'insuranceSalesperson') {
            this.showMessage('Access denied. Only Insurance Agents can access this page.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        this.loadProfileData();
        this.initializeEventListeners();
        this.loadPerformanceData();
        this.loadRecentActivities();
    }

    loadProfileData() {
       
        document.getElementById('agentName').textContent = this.currentUser.name;
        document.getElementById('agentEmail').textContent = `Email: ${this.currentUser.email}`;

     
        document.getElementById('name').value = this.currentUser.name;
        document.getElementById('phone').value = this.currentUser.phone || '';
        document.getElementById('licenseNumber').value = this.currentUser.licenseNumber || 'IA-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        document.getElementById('specialization').value = this.currentUser.specialization || 'Vehicle Insurance';
    }

    loadPerformanceData() {
        const userPolicies = this.policies.filter(policy => 
            policy.agentId === this.currentUser.id
        );

       
        const currentMonth = new Date().getMonth();
        const monthlyPremium = userPolicies
            .filter(policy => 
                new Date(policy.createdDate).getMonth() === currentMonth &&
                policy.status === 'active'
            )
            .reduce((sum, policy) => sum + policy.premium, 0);

       
        const activePolicies = userPolicies.filter(policy => 
            policy.status === 'active'
        ).length;

       
        const processedPolicies = userPolicies.filter(policy => 
            ['approved', 'active', 'rejected'].includes(policy.status)
        );
        const approvedPolicies = userPolicies.filter(policy => 
            ['approved', 'active'].includes(policy.status)
        );
        const approvalRate = processedPolicies.length > 0 
            ? ((approvedPolicies.length / processedPolicies.length) * 100).toFixed(1)
            : 0;

        
        const ratings = userPolicies
            .filter(policy => policy.clientRating)
            .map(policy => policy.clientRating);
        const averageRating = ratings.length > 0
            ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
            : 'N/A';

        
        document.getElementById('monthlyPremium').textContent = `HK$${monthlyPremium.toLocaleString()}`;
        document.getElementById('activePolicies').textContent = activePolicies;
        document.getElementById('currentMonthPremium').textContent = `HK$${monthlyPremium.toLocaleString()}`;
        document.getElementById('approvalRate').textContent = `${approvalRate}%`;
        document.getElementById('satisfaction').textContent = averageRating;
    }

    loadRecentActivities() {
        const activityList = document.getElementById('activityList');
        const userPolicies = this.policies
            .filter(policy => policy.agentId === this.currentUser.id)
            .sort((a, b) => new Date(b.lastUpdated || b.createdDate) - new Date(a.lastUpdated || a.createdDate))
            .slice(0, 5);

        activityList.innerHTML = userPolicies.map(policy => `
            <div class="activity-item">
                <div class="activity-icon">
                    ${this.getActivityIcon(policy.status)}
                </div>
                <div class="activity-details">
                    <div class="activity-title">
                        ${this.getActivityTitle(policy)}
                    </div>
                    <div class="activity-time">
                        ${new Date(policy.lastUpdated || policy.createdDate).toLocaleString()}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(status) {
        const icons = {
            'pending': '⏳',
            'reviewing': '🔄',
            'approved': '✅',
            'active': '🟢',
            'expired': '⌛',
            'rejected': '❌'
        };
        return icons[status] || '📋';
    }

    getActivityTitle(policy) {
        const statusText = {
            'pending': 'New application received',
            'reviewing': 'Application under review',
            'approved': 'Policy approved',
            'active': 'Policy activated',
            'expired': 'Policy expired',
            'rejected': 'Application rejected'
        };
        return `${statusText[policy.status]} - ${policy.clientName} (${this.getInsuranceTypeDisplay(policy.type)})`;
    }

    getInsuranceTypeDisplay(type) {
        const types = {
            'vehicle': 'Vehicle Insurance',
            'driver': 'Driver Insurance',
            'comprehensive': 'Comprehensive Insurance'
        };
        return types[type] || type;
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

    calculatePerformanceMetrics() {
        const userPolicies = this.policies.filter(policy => 
            policy.agentId === this.currentUser.id
        );

        
        const metrics = {
            totalPolicies: userPolicies.length,
            activePolicies: userPolicies.filter(p => p.status === 'active').length,
            pendingReviews: userPolicies.filter(p => p.status === 'pending').length,
            monthlyPremium: userPolicies
                .filter(p => p.status === 'active')
                .reduce((sum, p) => sum + p.premium, 0),
            approvalRate: this.calculateApprovalRate(userPolicies),
            customerSatisfaction: this.calculateCustomerSatisfaction(userPolicies)
        };

        return metrics;
    }

    calculateApprovalRate(policies) {
        const processed = policies.filter(p => ['approved', 'active', 'rejected'].includes(p.status));
        const approved = policies.filter(p => ['approved', 'active'].includes(p.status));
        return processed.length > 0 ? (approved.length / processed.length) * 100 : 0;
    }

    calculateCustomerSatisfaction(policies) {
        const ratings = policies
            .filter(p => p.clientRating)
            .map(p => p.clientRating);
        return ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : 0;
    }
}


const insuranceProfile = new InsuranceProfile();