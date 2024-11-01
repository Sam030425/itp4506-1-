document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;

        
        const users = JSON.parse(localStorage.getItem('users')) || [];

       
        const user = users.find(u => 
            u.email === email && 
            u.password === password && 
            u.userType === userType
        );

        if (user) {
           
            localStorage.setItem('currentUser', JSON.stringify(user));
            
           
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