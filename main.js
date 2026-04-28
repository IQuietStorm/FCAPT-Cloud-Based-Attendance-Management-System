/**
 * FCAPT Global Logic
 * Handles Theme Persistence & Authentication Guard
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    injectThemeButton();
    checkAuth();
});

// --- THEME MANAGEMENT ---

function initTheme() {
    const savedTheme = localStorage.getItem('fcapt_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleNightMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('fcapt_theme', newTheme);
}

function injectThemeButton() {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.innerHTML = '🌓';
    btn.title = "Toggle Night Mode";
    btn.onclick = toggleNightMode;
    document.body.appendChild(btn);
}

// --- AUTHENTICATION & UTILITIES ---

function checkAuth() {
    const path = window.location.pathname;
    const user = JSON.parse(localStorage.getItem('fcapt_user'));

    // If on login page and already logged in, skip to dashboard
    if (path.includes('index.html') || path === '/') {
        if (user) redirectUser(user);
        return;
    }

    // If on dashboard and not logged in, kick to login
    if (!user) {
        window.location.href = 'index.html';
    }
}

function redirectUser(user) {
    if (user.role === 'admin') window.location.href = 'admin_dashboard.html';
    else if (user.role === 'lecturer') window.location.href = 'lecturer_dashboard.html';
    else window.location.href = 'student_portal.html';
}

function logout() {
    localStorage.removeItem('fcapt_user');
    window.location.href = 'index.html';
}

/**
 * Utility: Format dates to local readability
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}