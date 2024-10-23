import { validateForm } from '../handlers/formHandler.js';

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const backBtn = document.getElementById('backBtn');
    const successMessage = document.getElementById('successMessage');

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(this)) {
            registerForm.style.display = 'none';
            
            successMessage.style.display = 'block';

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        }
    });

    backBtn.addEventListener('click', function() {
        window.location.href = 'login.html';
    });
});