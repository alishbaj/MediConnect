// Main script for home page, login page, and navigation
console.log('script.js loaded');

// Select role on home page - redirects to login page
function selectRole(role) {
    console.log('selectRole called with:', role);
    
    // Validate role
    const validRoles = ['patient', 'doctor', 'nurse'];
    if (!validRoles.includes(role)) {
        console.error('Invalid role selected:', role);
        alert('Invalid role selected');
        return;
    }
    
    // Store selected role and redirect to login page
    try {
        sessionStorage.setItem('selectedRole', role);
        console.log('Role stored, redirecting to login page...');
        window.location.href = `login.html?role=${role}`;
    } catch (error) {
        console.error('Error redirecting:', error);
        alert('Error: Could not redirect to login page');
    }
}

// Make sure function is available globally
window.selectRole = selectRole;

// Setup role buttons on home page
document.addEventListener('DOMContentLoaded', function() {
    // Setup role button event listeners (for home page)
    const roleButtons = document.querySelectorAll('.btn-role');
    if (roleButtons.length > 0) {
        console.log('Setting up role buttons:', roleButtons.length);
        
        roleButtons.forEach(button => {
            const role = button.getAttribute('data-role');
            if (role) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Button clicked for role:', role);
                    selectRole(role);
                });
            }
        });
        
        console.log('Role buttons setup complete');
    }
    
    // Login page handling is done in login.html inline script
    // This prevents conflicts and ensures it works
});

// Redirect to dashboard based on role
function redirectToDashboard(role) {
    // Validate role
    const validRoles = ['patient', 'doctor', 'nurse'];
    if (!validRoles.includes(role)) {
        console.error('Invalid role for dashboard redirect:', role);
        alert('Invalid role selected');
        window.location.href = 'index.html';
        return;
    }
    
    // Clear selected role from sessionStorage (keep userRole for dashboard)
    sessionStorage.removeItem('selectedRole');
    
    // Redirect to appropriate dashboard
    const dashboardMap = {
        'patient': 'patient-dashboard.html',
        'doctor': 'doctor-dashboard.html',
        'nurse': 'nurse-dashboard.html'
    };
    
    window.location.href = dashboardMap[role];
}

// Logout function - prevent multiple clicks
let isLoggingOut = false;

function logout() {
    // Prevent multiple clicks
    if (isLoggingOut) {
        console.log('Already logging out, ignoring click');
        return false;
    }
    
    isLoggingOut = true;
    console.log('Logging out...');
    sessionStorage.clear();
    // Use replace to prevent back button issues
    window.location.replace('index.html');
    return false;
}

// Make logout available globally
window.logout = logout;

// Form validation helper
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

// Show message helper
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

