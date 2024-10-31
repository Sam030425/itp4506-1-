document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;

        // 從 localStorage 獲取用戶數據
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // 查找匹配的用戶
        const user = users.find(u => 
            u.email === email && 
            u.password === password && 
            u.userType === userType
        );

        if (user) {
            // 儲存登入狀態
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // 根據用戶類型重定向到不同頁面
            switch (user.userType) {
                case 'Customer':
                    window.location.href = 'vehicledisplay.html';
                    break;
                case 'vehicleSalesperson':
                    window.location.href = '../html/sales.html';
                    break;
                case 'insuranceSalesperson':
                    window.location.href = '../html/insurance.html';
                    break;
                default:
                    window.location.href = '../html/index.html';
            }
        } else {
            alert('Invalid email or password!');
        }
    });
});