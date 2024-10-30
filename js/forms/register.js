import { validateForm } from '../handlers/formHandler.js';

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const backBtn = document.getElementById('backBtn');
    const successMessage = document.getElementById('successMessage');

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(this)) {
            // 獲取表單數據
            const formData = {
                userType: document.getElementById('userType').value,
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                password: document.getElementById('password').value,
                address: document.getElementById('address').value,
                preferredContact: Array.from(document.querySelectorAll('input[name="preferredContact"]:checked'))
                    .map(checkbox => checkbox.value)
            };

            // 從 localStorage 獲取現有用戶數據或創建新數組
            let users = JSON.parse(localStorage.getItem('users')) || [];

            // 檢查郵箱是否已被註冊
            if (users.some(user => user.email === formData.email)) {
                alert('This email has already been registered!');
                return;
            }

            // 添加新用戶
            users.push(formData);

            // 保存到 localStorage
            localStorage.setItem('users', JSON.stringify(users));

            // 隱藏表單並顯示成功消息
            registerForm.style.display = 'none';
            successMessage.style.display = 'block';

            // 延遲跳轉到登入頁面
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    });

    backBtn.addEventListener('click', function() {
        window.location.href = 'login.html';
    });
});