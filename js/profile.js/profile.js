class ProfileManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.init();
    }

    init() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        this.loadUserData();
        this.initializeNavigation();
        this.attachEventListeners();
    }

    loadUserData() {
        // 加載個人信息
        document.getElementById('name').value = this.currentUser.name || '';
        document.getElementById('email').value = this.currentUser.email || '';
        document.getElementById('phone').value = this.currentUser.phone || '';
        document.getElementById('dateOfBirth').value = this.currentUser.dateOfBirth || '';

        // 加載地址
        this.loadAddresses();
    }

    initializeNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // 移除所有活動狀態
                navItems.forEach(nav => nav.classList.remove('active'));
                document.querySelectorAll('.profile-section').forEach(section => {
                    section.classList.remove('active');
                });

                // 添加新的活動狀態
                item.classList.add('active');
                const sectionId = item.getAttribute('data-section');
                document.getElementById(sectionId).classList.add('active');
            });
        });
    }

    attachEventListeners() {
        // 個人信息表單
        const personalInfoForm = document.getElementById('personal-info-form');
        if (personalInfoForm) {
            personalInfoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updatePersonalInfo();
            });
        }

        // 安全設置表單
        const securityForm = document.getElementById('security-form');
        if (securityForm) {
            securityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updatePassword();
            });
        }

        // 地址表單
        const addressForm = document.getElementById('address-form');
        if (addressForm) {
            addressForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAddress();
            });
        }
    }

    updatePersonalInfo() {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;

        // 更新用戶數據
        this.currentUser.name = name;
        this.currentUser.phone = phone;
        this.currentUser.dateOfBirth = dateOfBirth;

        // 更新 localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        // 更新用戶列表中的用戶數據
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.map(user => {
            if (user.email === this.currentUser.email) {
                return {...user, name, phone, dateOfBirth};
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

        // 驗證當前密碼
        if (currentPassword !== this.currentUser.password) {
            this.showMessage('Current password is incorrect', 'error');
            return;
        }

        // 驗證新密碼
        if (newPassword !== confirmPassword) {
            this.showMessage('New passwords do not match', 'error');
            return;
        }

        // 更新密碼
        this.currentUser.password = newPassword;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        // 更新用戶列表中的密碼
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.map(user => {
            if (user.email === this.currentUser.email) {
                return {...user, password: newPassword};
            }
            return user;
        });
        localStorage.setItem('users', JSON.stringify(users));

        // 清空表單
        document.getElementById('security-form').reset();
        this.showMessage('Password updated successfully');
    }

    loadAddresses() {
        const addressesList = document.querySelector('.addresses-list');
        const addresses = this.currentUser.addresses || [];

        if (addresses.length === 0) {
            addressesList.innerHTML = '<p>No addresses saved yet.</p>';
            return;
        }

        addressesList.innerHTML = addresses.map((address, index) => `
            <div class="address-card">
                <div class="address-card-header">
                    <h3>${address.name}</h3>
                    <div class="address-actions">
                        <button onclick="profileManager.editAddress(${index})">
                            Edit
                        </button>
                        <button onclick="profileManager.deleteAddress(${index})">
                            Delete
                        </button>
                    </div>
                </div>
                <div class="address-details">
                    <p>${address.line1}</p>
                    ${address.line2 ? `<p>${address.line2}</p>` : ''}
                    <p>${address.city}, ${address.postalCode}</p>
                </div>
            </div>
        `).join('');
    }

    showAddAddressForm() {
        const modal = document.getElementById('addressModal');
        modal.style.display = 'block';

        // 關閉按鈕事件
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        // 點擊模態窗外部關閉
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    saveAddress(index = null) {
        const addressName = document.getElementById('addressName').value;
        const line1 = document.getElementById('addressLine1').value;
        const line2 = document.getElementById('addressLine2').value;
        const city = document.getElementById('city').value;
        const postalCode = document.getElementById('postalCode').value;

        const newAddress = {
            name: addressName,
            line1,
            line2,
            city,
            postalCode
        };

        // 獲取現有地址或創建新數組
        this.currentUser.addresses = this.currentUser.addresses || [];

        if (index !== null) {
            // 編輯現有地址
            this.currentUser.addresses[index] = newAddress;
        } else {
            // 添加新地址
            this.currentUser.addresses.push(newAddress);
        }

        // 更新存儲
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        // 更新用戶列表
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.map(user => {
            if (user.email === this.currentUser.email) {
                return {...user, addresses: this.currentUser.addresses};
            }
            return user;
        });
        localStorage.setItem('users', JSON.stringify(users));

        // 關閉模態窗並重新加載地址
        document.getElementById('addressModal').style.display = 'none';
        document.getElementById('address-form').reset();
        this.loadAddresses();
        this.showMessage('Address saved successfully');
    }

    editAddress(index) {
        const address = this.currentUser.addresses[index];
        
        // 填充表單
        document.getElementById('addressName').value = address.name;
        document.getElementById('addressLine1').value = address.line1;
        document.getElementById('addressLine2').value = address.line2 || '';
        document.getElementById('city').value = address.city;
        document.getElementById('postalCode').value = address.postalCode;

        // 顯示模態窗
        this.showAddAddressForm();

        // 修改表單提交處理
        const form = document.getElementById('address-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveAddress(index);
        };
    }

    deleteAddress(index) {
        if (confirm('Are you sure you want to delete this address?')) {
            this.currentUser.addresses.splice(index, 1);
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            // 更新用戶列表
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users = users.map(user => {
                if (user.email === this.currentUser.email) {
                    return {...user, addresses: this.currentUser.addresses};
                }
                return user;
            });
            localStorage.setItem('users', JSON.stringify(users));

            this.loadAddresses();
            this.showMessage('Address deleted successfully');
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
            border-radius: 4px;
            color: white;
            z-index: 1000;
            animation: slideIn 0.5s ease-out;
        `;

        switch(type) {
            case 'success':
                messageDiv.style.backgroundColor = '#28a745';
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
}

// 創建 ProfileManager 實例
const profileManager = new ProfileManager();