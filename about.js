// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// CTA button handlers
document.querySelectorAll('.btn-cta').forEach(btn => {
    btn.addEventListener('click', () => {
        window.location.href = 'signup.html';
    });
});

// Smooth scroll for nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('href').includes('#')) {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href').split('#')[1]);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});