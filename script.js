// Main script for home page, login page, and navigation
console.log('script.js loaded');

// Load Supabase browser client (public anon key)
import { supabase } from "./supabaseBrowser.js";

console.log("Supabase client loaded:", supabase);

// ----------------------------------------------------
// ROLE SELECTION (HOME PAGE)
// ----------------------------------------------------
function selectRole(role) {
    console.log('selectRole called with:', role);

    const validRoles = ['patient', 'doctor', 'nurse'];
    if (!validRoles.includes(role)) {
        console.error('Invalid role selected:', role);
        alert('Invalid role selected');
        return;
    }

    try {
        sessionStorage.setItem('selectedRole', role);
        console.log('Role stored, redirecting to login page...');
        window.location.href = `login.html?role=${role}`;
    } catch (error) {
        console.error('Error redirecting:', error);
        alert('Error: Could not redirect to login page');
    }
}

window.selectRole = selectRole;

// ----------------------------------------------------
// HOME PAGE BUTTON SETUP
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {

    const roleButtons = document.querySelectorAll('.btn-role');

    if (roleButtons.length > 0) {
        console.log('Setting up role buttons:', roleButtons.length);

        roleButtons.forEach(button => {
            const role = button.getAttribute('data-role');
            if (role) {
                button.addEventListener('click', function (e) {
                    e.preventDefault();
                    console.log('Button clicked for role:', role);
                    selectRole(role);
                });
            }
        });

        console.log('Role buttons setup complete');
    }

    // Login page logic lives in login.html inline script
});

// ----------------------------------------------------
// DASHBOARD REDIRECT
// ----------------------------------------------------
function redirectToDashboard(role) {

    const validRoles = ['patient', 'doctor', 'nurse'];
    if (!validRoles.includes(role)) {
        console.error('Invalid role for dashboard redirect:', role);
        alert('Invalid role selected');
        window.location.href = 'index.html';
        return;
    }

    // Remove only "selectedRole", keep other session values
    sessionStorage.removeItem('selectedRole');

    const dashboardMap = {
        patient: 'patient-dashboard.html',
        doctor: 'doctor-dashboard.html',
        nurse: 'nurse-dashboard.html'
    };

    window.location.href = dashboardMap[role];
}

// ----------------------------------------------------
// LOGOUT
// ----------------------------------------------------
let isLoggingOut = false;

function logout() {
    if (isLoggingOut) {
        console.log('Already logging out, ignoring click');
        return false;
    }

    isLoggingOut = true;
    console.log('Logging out...');

    sessionStorage.clear();
    window.location.replace('index.html');
    return false;
}

window.logout = logout;

// ----------------------------------------------------
// FORM VALIDATION
// ----------------------------------------------------
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#dc3545';
        } else {
            field.style.borderColor = '#e0e0e0';
        }
    });

    return isValid;
}

// ----------------------------------------------------
// SHOW MESSAGE
// ----------------------------------------------------
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    const container = document.querySelector('.dashboard-container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}
