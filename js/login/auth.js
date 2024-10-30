// auth.js
class Auth {
    constructor() {
        this.initializeAuth();
        this.setupEventListeners();
    }

    initializeAuth() {
        // 檢查是否有保存的登入狀態
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.updateUIState();
    }

    setupEventListeners() {
        // 在檔案載入時設置事件監聽器
        document.addEventListener('DOMContentLoaded', () => {
            this.updateUIState();
            this.setupUserMenu();
        });
    }

    updateUIState() {
        const userSection = document.querySelector('.user-section');
        if (!userSection) return;
    
        if (this.currentUser) {
            userSection.innerHTML = `
                <div class="user-info">
                    <span class="user-name">${this.currentUser.name}</span>
                    <span class="dropdown-arrow">▼</span> <!-- 下拉箭頭 -->
                </div>
                <div class="user-menu">
                    <a href="../html/profile.html" class="user-menu-item">Profile</a>
                    <a href="../html/myorder.html" class="user-menu-item">My Orders</a>
                    <button class="logout-btn" onclick="auth.logout()">Logout</button>
                </div>
            `;
        } else {
            userSection.innerHTML = `
                <a href="../html/login.html" class="login-btn">Login</a>
            `;
        }
    }

    setupUserMenu() {
        const userInfo = document.querySelector('.user-info');
        const userMenu = document.querySelector('.user-menu');

        if (userInfo && userMenu) {
            userInfo.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenu.classList.toggle('active');
            });

            // 點擊其他地方關閉選單
            document.addEventListener('click', () => {
                userMenu.classList.remove('active');
            });

            userMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    logout() {
        // 移除所有存儲的資訊
        localStorage.removeItem('currentUser');
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        
        // 顯示登出消息
        this.showLogoutMessage();
        
        // 延遲後重定向到首頁
        setTimeout(() => {
            window.location.href = '../html/index.html';
        }, 1500);
    }

    showLogoutMessage() {
        // 創建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = 'logout-message';
        messageDiv.innerHTML = 'Logout successful! Redirecting...';
        
        // 添加樣式
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 4px;
            animation: slideIn 0.5s ease-out;
            z-index: 1000;
        `;

        // 添加到頁面
        document.body.appendChild(messageDiv);

        // 設置動畫
        document.head.insertAdjacentHTML('beforeend', `
            <style>
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `);

        // 自動移除消息
        setTimeout(() => {
            messageDiv.remove();
        }, 1500);
    }

    // 檢查是否已登入
    isLoggedIn() {
        return !!this.currentUser;
    }

    // 獲取當前用戶資訊
    getCurrentUser() {
        return this.currentUser;
    }

    // 檢查用戶權限
    hasPermission(requiredType) {
        return this.currentUser && this.currentUser.userType === requiredType;
    }
}

// 創建全局實例
const auth = new Auth();