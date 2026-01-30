// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Navigation Toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Message buttons
    document.querySelectorAll('.btn-message').forEach(button => {
        button.addEventListener('click', (e) => {
            const mentorName = e.target.closest('.mentor-item').querySelector('h4').textContent;
            alert(`Opening chat with ${mentorName}...`);
        });
    });

    // Apply buttons
    document.querySelectorAll('.btn-apply').forEach(button => {
        button.addEventListener('click', (e) => {
            const jobTitle = e.target.closest('.job-item').querySelector('h4').textContent;
            button.textContent = 'Applied ✓';
            button.style.background = '#28a745';
            button.disabled = true;
            alert(`Application submitted for ${jobTitle}!`);
        });
    });

    // Profile dropdown functionality is handled in HTML inline script

    // View all links
    document.querySelectorAll('.view-all-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const cardTitle = e.target.closest('.dashboard-card').querySelector('h3').textContent;
            alert(`${cardTitle} - Full page coming soon!`);
        });
    });

    // Activity items click
    document.querySelectorAll('.activity-item').forEach(item => {
        item.addEventListener('click', () => {
            item.style.background = '#e3f2fd';
            setTimeout(() => {
                item.style.background = '#f8f9fa';
            }, 1000);
        });
    });

    console.log('Dashboard loaded successfully!');
});