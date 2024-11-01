
class Auth {
    constructor() {
        this.initializeAuth();
        this.setupEventListeners();
    }

    initializeAuth() {
        
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.updateUIState();
    }

    setupEventListeners() {
       
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
                    <span class="dropdown-arrow">▼</span> 
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

          
            document.addEventListener('click', () => {
                userMenu.classList.remove('active');
            });

            userMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    logout() {
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        
        
        this.showLogoutMessage();
        
        
        setTimeout(() => {
            window.location.href = '../html/index.html';
        }, 1500);
    }

    showLogoutMessage() {
       
        const messageDiv = document.createElement('div');
        messageDiv.className = 'logout-message';
        messageDiv.innerHTML = 'Logout successful! Redirecting...';
        
        
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

        
        document.body.appendChild(messageDiv);

       
        document.head.insertAdjacentHTML('beforeend', `
            <style>
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `);

       
        setTimeout(() => {
            messageDiv.remove();
        }, 1500);
    }

   
    isLoggedIn() {
        return !!this.currentUser;
    }

   
    getCurrentUser() {
        return this.currentUser;
    }

    hasPermission(requiredType) {
        return this.currentUser && this.currentUser.userType === requiredType;
    }
}


const auth = new Auth();