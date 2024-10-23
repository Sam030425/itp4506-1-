export const validators = {
    name: (value) => {
        return value.trim().length >= 2;
    },
    
    email: (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    
    phone: (value) => {
        return /^[5-9]\d{7}$/.test(value);
    },
    
    password: (value) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
    }
};

export function showError(element, message) {
    const errorElement = element.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    element.classList.add('error');
}

export function clearErrors() {
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.style.display = 'none';
    });
}