class InsuranceManager {
    constructor() {
        this.policies = JSON.parse(localStorage.getItem('policies')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.init();
    }

    init() {
       
        if (!this.currentUser || this.currentUser.userType !== 'insuranceSalesperson') {
            this.showMessage('Access denied. Only Insurance Agents can access this page.', 'error');
            setTimeout(() => {
                window.location.href = '../html/login.html';
            }, 2000);
            return;
        }

        this.loadInsuranceOverview();
        this.loadPolicies();
        this.initializeFilters();
        this.setupEventListeners();
    }

    loadInsuranceOverview() {
        const today = new Date().toDateString();
        const todayPremium = this.policies
            .filter(policy => 
                new Date(policy.createdDate).toDateString() === today && 
                policy.status === 'active' &&
                policy.agentId === this.currentUser.id
            )
            .reduce((sum, policy) => sum + policy.premium, 0);

        const currentMonth = new Date().getMonth();
        const monthlyPremium = this.policies
            .filter(policy => 
                new Date(policy.createdDate).getMonth() === currentMonth && 
                policy.status === 'active' &&
                policy.agentId === this.currentUser.id
            )
            .reduce((sum, policy) => sum + policy.premium, 0);

        const pendingApplications = this.policies.filter(policy => 
            (policy.status === 'pending' || policy.status === 'reviewing') &&
            (!policy.agentId || policy.agentId === this.currentUser.id)
        ).length;

        const activePolicies = this.policies.filter(policy => 
            policy.status === 'active' &&
            policy.agentId === this.currentUser.id
        ).length;

        document.getElementById('todayPremium').textContent = todayPremium.toLocaleString();
        document.getElementById('monthlyPremium').textContent = monthlyPremium.toLocaleString();
        document.getElementById('pendingApplications').textContent = pendingApplications;
        document.getElementById('activePolicies').textContent = activePolicies;
    }

    loadPolicies() {
        const tbody = document.getElementById('policiesTableBody');
        if (!tbody) return;

        const statusFilter = document.getElementById('statusFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        let filteredPolicies = this.policies.filter(policy => 
            policy.agentId === this.currentUser.id ||
            !policy.agentId
        );

        if (statusFilter !== 'all') {
            filteredPolicies = filteredPolicies.filter(policy => policy.status === statusFilter);
        }

        if (typeFilter !== 'all') {
            filteredPolicies = filteredPolicies.filter(policy => policy.type === typeFilter);
        }

        if (dateFilter) {
            const filterDate = new Date(dateFilter).toDateString();
            filteredPolicies = filteredPolicies.filter(policy => 
                new Date(policy.createdDate).toDateString() === filterDate
            );
        }

        filteredPolicies.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

        tbody.innerHTML = filteredPolicies.map(policy => `
            <tr>
                <td>${policy.policyId}</td>
                <td>${policy.clientName}</td>
                <td>${this.getInsuranceTypeDisplay(policy.type)}</td>
                <td>HK$${policy.premium.toLocaleString()}</td>
                <td>${new Date(policy.startDate).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge status-${policy.status}">
                        ${this.getStatusDisplay(policy.status)}
                    </span>
                </td>
                <td>
                    <button class="action-btn view-btn" onclick="insuranceManager.viewPolicyDetails('${policy.policyId}')">
                        View
                    </button>
                    ${this.getActionButtons(policy)}
                </td>
            </tr>
        `).join('');
    }

    getInsuranceTypeDisplay(type) {
        const types = {
            'vehicle': 'Vehicle Insurance',
            'driver': 'Driver Insurance',
            'comprehensive': 'Comprehensive'
        };
        return types[type] || type;
    }

    getStatusDisplay(status) {
        const statuses = {
            'pending': 'Pending Review',
            'reviewing': 'Under Review',
            'approved': 'Approved',
            'active': 'Active',
            'expired': 'Expired',
            'rejected': 'Rejected'
        };
        return statuses[status] || status;
    }

    getActionButtons(policy) {
        if (policy.agentId && policy.agentId !== this.currentUser.id) {
            return '';
        }

        switch(policy.status) {
            case 'pending':
                return `
                    <button class="action-btn approve-btn" onclick="insuranceManager.startReview('${policy.policyId}')">
                        Review
                    </button>
                `;
            case 'reviewing':
                return `
                    <button class="action-btn approve-btn" onclick="insuranceManager.approvePolicy('${policy.policyId}')">
                        Approve
                    </button>
                    <button class="action-btn reject-btn" onclick="insuranceManager.rejectPolicy('${policy.policyId}')">
                        Reject
                    </button>
                `;
            default:
                return '';
        }
    }

    viewPolicyDetails(policyId) {
        const policy = this.policies.find(p => p.policyId === policyId);
        if (!policy) return;
    
        const modal = document.getElementById('policyModal');
        const detailsContainer = document.getElementById('policyDetails');
    
        detailsContainer.innerHTML = `
            <div class="policy-details">
                <div class="policy-header">
                    <div class="policy-id-badge">Policy ID: ${policy.policyId}</div>
                    <div class="policy-status">
                        <span class="status-badge status-${policy.status}">
                            ${this.getStatusDisplay(policy.status)}
                        </span>
                    </div>
                </div>
    
                <div class="policy-grid">
                    <div class="policy-card">
                        <div class="card-header">
                            <i class="fas fa-info-circle"></i>
                            <h3>Policy Information</h3>
                        </div>
                        <div class="card-content">
                            <div class="info-row">
                                <label>Insurance Type</label>
                                <span>${this.getInsuranceTypeDisplay(policy.type)}</span>
                            </div>
                            <div class="info-row">
                                <label>Premium</label>
                                <span class="premium-value">HK$${policy.premium.toLocaleString()}</span>
                            </div>
                            <div class="info-row">
                                <label>Start Date</label>
                                <span>${new Date(policy.startDate).toLocaleDateString()}</span>
                            </div>
                            <div class="info-row">
                                <label>End Date</label>
                                <span>${new Date(policy.endDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
    
                    <div class="policy-card">
                        <div class="card-header">
                            <i class="fas fa-user"></i>
                            <h3>Client Details</h3>
                        </div>
                        <div class="card-content">
                            <div class="info-row">
                                <label>Full Name</label>
                                <span>${policy.clientName}</span>
                            </div>
                            <div class="info-row">
                                <label>ID Number</label>
                                <span>${this.maskIdNumber(policy.clientId)}</span>
                            </div>
                            <div class="info-row">
                                <label>Phone</label>
                                <span>${policy.clientPhone}</span>
                            </div>
                            <div class="info-row">
                                <label>Email</label>
                                <span>${policy.clientEmail}</span>
                            </div>
                        </div>
                    </div>
    
                    ${policy.type === 'vehicle' || policy.type === 'comprehensive' ? `
                        <div class="policy-card">
                            <div class="card-header">
                                <i class="fas fa-car"></i>
                                <h3>Vehicle Details</h3>
                            </div>
                            <div class="card-content">
                                <div class="info-row">
                                    <label>Model</label>
                                    <span>${policy.vehicleModel}</span>
                                </div>
                                <div class="info-row">
                                    <label>Registration</label>
                                    <span>${policy.vehicleRegistration}</span>
                                </div>
                                <div class="info-row">
                                    <label>Year</label>
                                    <span>${policy.vehicleYear}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
    
                    <div class="policy-card full-width">
                        <div class="card-header">
                            <i class="fas fa-shield-alt"></i>
                            <h3>Coverage Details</h3>
                        </div>
                        <div class="card-content coverage-grid">
                            ${policy.coverage.map(item => `
                                <div class="coverage-card">
                                    <h4>${item.name}</h4>
                                    <div class="coverage-amount">HK$${item.limit.toLocaleString()}</div>
                                    <p>${item.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
    
                    <div class="policy-card full-width">
                        <div class="card-header">
                            <i class="fas fa-history"></i>
                            <h3>Policy Timeline</h3>
                        </div>
                        <div class="card-content">
                            <div class="timeline">
                                ${this.getPolicyTimeline(policy)}
                            </div>
                        </div>
                    </div>
                </div>
    
                <div class="policy-actions">
                    ${this.getDetailActionButtons(policy)}
                </div>
            </div>
        `;
    
        modal.style.display = 'block';
    }
    

    getVehicleDetailsHTML(policy) {
        if (policy.type === 'vehicle' || policy.type === 'comprehensive') {
            return `
                <div class="detail-section">
                    <h3>Vehicle Information</h3>
                    <div class="detail-row">
                        <span>Vehicle Model:</span>
                        <span>${policy.vehicleModel}</span>
                    </div>
                    <div class="detail-row">
                        <span>Registration Number:</span>
                        <span>${policy.vehicleRegistration}</span>
                    </div>
                    <div class="detail-row">
                        <span>Manufacturing Year:</span>
                        <span>${policy.vehicleYear}</span>
                    </div>
                </div>
            `;
        }
        return '';
    }

    getCoverageDetailsHTML(policy) {
        return policy.coverage.map(item => `
            <div class="coverage-item">
                <div class="coverage-name">${item.name}</div>
                <div class="coverage-limit">Coverage Limit: HK$${item.limit.toLocaleString()}</div>
                <div class="coverage-description">${item.description}</div>
            </div>
        `).join('');
    }

    getPolicyTimeline(policy) {
        if (!policy.history) return '';

        return policy.history.map(event => `
            <div class="timeline-item">
                <div class="timeline-date">${new Date(event.date).toLocaleString()}</div>
                <div class="timeline-content">
                    <div class="timeline-title">${event.action}</div>
                    <div class="timeline-description">${event.description}</div>
                </div>
            </div>
        `).join('');
    }

    maskIdNumber(idNumber) {
        if (!idNumber) return 'N/A';
        return idNumber.substring(0, 4) + '****' + idNumber.substring(idNumber.length - 4);
    }

    getDetailActionButtons(policy) {
        if (policy.agentId && policy.agentId !== this.currentUser.id) {
            return '';
        }

        switch(policy.status) {
            case 'pending':
                return `
                    <button class="action-btn approve-btn" onclick="insuranceManager.startReview('${policy.policyId}')">
                        Start Review
                    </button>
                `;
            case 'reviewing':
                return `
                    <button class="action-btn approve-btn" onclick="insuranceManager.approvePolicy('${policy.policyId}')">
                        Approve Policy
                    </button>
                    <button class="action-btn reject-btn" onclick="insuranceManager.rejectPolicy('${policy.policyId}')">
                        Reject Policy
                    </button>
                `;
            default:
                return '';
        }
    }

    startReview(policyId) {
        if (confirm('Start reviewing this policy application?')) {
            this.updatePolicyStatus(policyId, 'reviewing');
        }
    }

    approvePolicy(policyId) {
        if (confirm('Approve this policy application?')) {
            this.updatePolicyStatus(policyId, 'approved');
            setTimeout(() => {
                this.updatePolicyStatus(policyId, 'active');
            }, 1000);
        }
    }

    rejectPolicy(policyId) {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            this.updatePolicyStatus(policyId, 'rejected', reason);
        }
    }

    updatePolicyStatus(policyId, newStatus, reason = '') {
        const policy = this.policies.find(p => p.policyId === policyId);
        if (!policy) return;

        if (!policy.agentId) {
            policy.agentId = this.currentUser.id;
            policy.agentName = this.currentUser.name;
        }

        if (!policy.history) {
            policy.history = [];
        }

        policy.history.push({
            date: new Date().toISOString(),
            action: `Status changed to ${this.getStatusDisplay(newStatus)}`,
            description: reason || `Policy ${newStatus} by ${this.currentUser.name}`
        });

        policy.status = newStatus;
        localStorage.setItem('policies', JSON.stringify(this.policies));

        this.loadPolicies();
        this.loadInsuranceOverview();

        const modal = document.getElementById('policyModal');
        if (modal.style.display === 'block') {
            this.viewPolicyDetails(policyId);
        }

        this.showMessage(`Policy ${policyId} has been ${newStatus}${reason ? ': ' + reason : ''}`);
    }

    initializeFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const typeFilter = document.getElementById('typeFilter');
        const dateFilter = document.getElementById('dateFilter');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.loadPolicies());
        }
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.loadPolicies());
        }
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.loadPolicies());
        }
    }

    setupEventListeners() {
        const modal = document.getElementById('policyModal');
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

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
            this.showMessage('Logout successful', 'success');
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

    refreshPolicies() {
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('typeFilter').value = 'all';
        document.getElementById('dateFilter').value = '';
        this.loadPolicies();
    }
}


const insuranceManager = new InsuranceManager();