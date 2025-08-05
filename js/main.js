// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active class to current navigation item
    const currentLocation = location.pathname;
    const menuItems = document.querySelectorAll('nav a');
    menuItems.forEach(item => {
        if(item.getAttribute('href') === currentLocation){
            item.classList.add('active');
        }
    });

    // Simple form validation if you add forms later
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const required = form.querySelectorAll('[required]');
            let valid = true;
            
            required.forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!valid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });
});// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create burger menu if on mobile
    if (window.innerWidth <= 768) {
        const header = document.querySelector('.header-content');
        const nav = document.querySelector('nav');
        
        // Create burger menu element
        const burger = document.createElement('div');
        burger.className = 'burger-menu';
        burger.innerHTML = '<span></span><span></span><span></span>';
        
        // Insert burger after phone button
        const phoneBtn = document.querySelector('.phone-cta');
        phoneBtn.parentNode.insertBefore(burger, phoneBtn.nextSibling);
        
        // Toggle menu on click
        burger.addEventListener('click', function() {
            burger.classList.toggle('active');
            nav.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!header.contains(e.target)) {
                burger.classList.remove('active');
                nav.classList.remove('active');
            }
        });
    }
});

// Handle resize
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        if (window.innerWidth > 768) {
            const burger = document.querySelector('.burger-menu');
            const nav = document.querySelector('nav');
            if (burger) burger.remove();
            if (nav) nav.classList.remove('active');
        }
    }, 250);
});