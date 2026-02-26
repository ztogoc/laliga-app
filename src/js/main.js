// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const menuToggle = document.getElementById('menuToggle');
    const navWrapper = document.querySelector('.nav-links-wrapper');
    const navOverlay = document.querySelector('.nav-overlay');
    const navItems = document.querySelectorAll('.nav-link');
    const html = document.documentElement;
    
    // State
    let isMenuOpen = false;
    let isMobileView = window.innerWidth <= 1024;
    
    // Toggle mobile menu with animation
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        // Toggle classes
        menuToggle?.classList.toggle('active');
        navWrapper?.classList.toggle('active');
        navOverlay?.classList.toggle('active');
        
        // Lock body scroll when menu is open
        html.style.overflow = isMenuOpen ? 'hidden' : '';
        
        // Focus management
        if (isMenuOpen) {
            // Focus first link when opening menu
            setTimeout(() => {
                const firstLink = navWrapper?.querySelector('a');
                firstLink?.focus();
            }, 100);
        } else {
            // Return focus to menu toggle when closing
            menuToggle?.focus();
        }
    }
    
    // Close menu function
    function closeMenu() {
        if (isMenuOpen) {
            isMenuOpen = false;
            menuToggle?.classList.remove('active');
            navWrapper?.classList.remove('active');
            navOverlay?.classList.remove('active');
            html.style.overflow = '';
        }
    }
    
    // Smooth scroll to section and update active state
    function scrollToSection(targetId, behavior = 'smooth') {
        if (!targetId || targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        // Calculate offset based on header height
        const headerHeight = document.querySelector('.navbar')?.offsetHeight || 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: behavior
        });
    }
    
    // Update active nav item based on scroll position
    function updateActiveNavItem() {
        if (isMenuOpen) return; // Don't update while menu is open
        
        const scrollPosition = window.scrollY + 100; // Add offset
        let activeFound = false;
        
        // Find which section is in view
        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            const sectionId = '#' + section.id;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Update active state
                navItems.forEach(item => {
                    if (item.getAttribute('href') === sectionId) {
                        item.classList.add('active');
                        activeFound = true;
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
        
        // If no section is in view, clear all active states
        if (!activeFound) {
            navItems.forEach(item => item.classList.remove('active'));
        }
    }
    
    // Event Listeners
    
    // Toggle menu on button click
    menuToggle?.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
    
    // Close menu when clicking on overlay
    navOverlay?.addEventListener('click', closeMenu);
    
    // Handle nav item clicks
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Only prevent default for same-page anchors
            if (targetId && targetId !== '#') {
                e.preventDefault();
                
                // Close menu on mobile
                if (isMobileView) {
                    closeMenu();
                }
                
                // Update active class
                navItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Smooth scroll to section
                scrollToSection(targetId);
            }
        });
    });
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const wasMobileView = isMobileView;
            isMobileView = window.innerWidth <= 1024;
            
            // Reset menu state when changing viewport size
            if ((!isMobileView && isMenuOpen) || (wasMobileView !== isMobileView)) {
                closeMenu();
            }
        }, 100);
    });
    
    // Update active nav item on scroll
    let isScrolling;
    window.addEventListener('scroll', function() {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(updateActiveNavItem, 100);
    }, false);
    
    // Initial setup
    updateActiveNavItem();
    
    // Handle page load with hash in URL
    if (window.location.hash) {
        // Small delay to ensure DOM is fully loaded
        setTimeout(() => {
            scrollToSection(window.location.hash, 'auto');
            // Update active nav item after scrolling
            setTimeout(updateActiveNavItem, 500);
        }, 100);
    }
});
