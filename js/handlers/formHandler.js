import { validators, showError, clearErrors } from '../utils/validation.js';

export function validateForm(form) {
    let isValid = true;
    clearErrors();

    const name = form.querySelector('#name');
    if (!validators.name(name.value)) {
        showError(name, 'Please enter a valid name (at least 2 characters)');
        isValid = false;
    }

    const phone = form.querySelector('#phone');
    if (!validators.phone(phone.value)) {
        showError(phone, 'Please enter a valid Hong Kong mobile phone number');
        isValid = false;
    }

    const password = form.querySelector('#password');
    if (!validators.password(password.value)) {
        showError(password, 'Password must be at least 8 characters and contain uppercase and lowercase letters and numbers');
        isValid = false;
    }

    const confirmPassword = form.querySelector('#confirmPassword');
    if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'Password does not match');
        isValid = false;
    }

    return isValid;
}