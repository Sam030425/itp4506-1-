import { validateForm } from '../handlers/formHandler.js';

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const backBtn = document.getElementById('backBtn');
    const successMessage = document.getElementById('successMessage');

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(this)) {
            
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

           
            let users = JSON.parse(localStorage.getItem('users')) || [];

          
            if (users.some(user => user.email === formData.email)) {
                alert('This email has already been registered!');
                return;
            }

         
            users.push(formData);

            
            localStorage.setItem('users', JSON.stringify(users));

            
            registerForm.style.display = 'none';
            successMessage.style.display = 'block';

           
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    });

    backBtn.addEventListener('click', function() {
        window.location.href = 'login.html';
    });
});