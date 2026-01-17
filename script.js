// =================================================================
// KECA Website - JavaScript
// 한국교육컨설팅협회 공식 웹사이트
// =================================================================

document.addEventListener('DOMContentLoaded', function() {

    // =================================================================
    // Navigation Scroll Effect
    // =================================================================
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // =================================================================
    // Mobile Menu Toggle
    // =================================================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);

        if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // =================================================================
    // Smooth Scroll
    // =================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =================================================================
    // Tab Functionality (Business Section)
    // =================================================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // =================================================================
    // Counter Animation (Achievements Section)
    // =================================================================
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16); // 60 FPS

        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    }

    // Intersection Observer for counter animation
    const counterElements = document.querySelectorAll('.achievement-number[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                entry.target.classList.add('counted');
            }
        });
    }, { threshold: 0.5 });

    counterElements.forEach(element => {
        counterObserver.observe(element);
    });

    // =================================================================
    // Scroll Animation (Fade-in on scroll)
    // =================================================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Elements to animate on scroll
    const animateElements = document.querySelectorAll(`
        .overview-item,
        .mv-card,
        .value-card,
        .executive-card,
        .tab-content,
        .achievement-card,
        .cert-info-card,
        .stat-card,
        .benefit-card,
        .timeline-item
    `);

    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(element);
    });

    // =================================================================
    // Active Navigation Link on Scroll
    // =================================================================
    const sections = document.querySelectorAll('section[id]');

    function highlightNavigation() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - navbar.offsetHeight - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);

    // =================================================================
    // Contact Form Submission
    // =================================================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Here you would typically send the data to a server
            // For now, we'll just show an alert
            alert(`문의가 접수되었습니다!\n\n이름: ${formData.name}\n이메일: ${formData.email}\n제목: ${formData.subject}`);

            // Reset form
            contactForm.reset();
        });
    }

    // =================================================================
    // Lazy Loading for Images (if images are added later)
    // =================================================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img.lazy');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // =================================================================
    // Back to Top Button (Optional Enhancement)
    // =================================================================
    function createBackToTopButton() {
        const button = document.createElement('button');
        button.innerHTML = '↑';
        button.setAttribute('id', 'backToTop');
        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 4px 12px rgba(46, 117, 181, 0.3);
        `;

        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                button.style.opacity = '1';
                button.style.visibility = 'visible';
            } else {
                button.style.opacity = '0';
                button.style.visibility = 'hidden';
            }
        });

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-4px)';
            button.style.boxShadow = '0 6px 16px rgba(46, 117, 181, 0.4)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 12px rgba(46, 117, 181, 0.3)';
        });

        document.body.appendChild(button);
    }

    createBackToTopButton();

    // =================================================================
    // Typing Effect for Hero Section (Optional Enhancement)
    // =================================================================
    function typeWriter(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';

        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }

        type();
    }

    // Uncomment to enable typing effect on hero subtitle
    // const heroSubtitle = document.querySelector('.hero-subtitle');
    // if (heroSubtitle) {
    //     const originalText = heroSubtitle.textContent;
    //     typeWriter(heroSubtitle, originalText, 80);
    // }

    // =================================================================
    // Parallax Effect for Hero Section (Optional Enhancement)
    // =================================================================
    const hero = document.querySelector('.hero');

    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroContent = hero.querySelector('.hero-content');

            if (heroContent && scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
                heroContent.style.opacity = 1 - (scrolled / 700);
            }
        });
    }

    // =================================================================
    // Table Responsive Wrapper (for mobile)
    // =================================================================
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        if (!table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('table-responsive');
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });

    // =================================================================
    // Print Styles Detection (Optional)
    // =================================================================
    window.addEventListener('beforeprint', () => {
        console.log('Page is being printed');
        // Add any print-specific modifications here
    });

    // =================================================================
    // Performance Optimization: Debounce Scroll Events
    // =================================================================
    function debounce(func, wait = 10) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Apply debounce to scroll-heavy functions
    const debouncedHighlightNav = debounce(highlightNavigation, 50);
    window.removeEventListener('scroll', highlightNavigation);
    window.addEventListener('scroll', debouncedHighlightNav);

    // =================================================================
    // Accessibility Enhancements
    // =================================================================

    // Skip to main content link
    function addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#about';
        skipLink.className = 'skip-link';
        skipLink.textContent = '본문으로 건너뛰기';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--primary-color);
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            z-index: 10000;
        `;
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    addSkipLink();

    // Add ARIA labels to interactive elements
    const interactiveElements = document.querySelectorAll('button:not([aria-label]), a:not([aria-label])');
    interactiveElements.forEach(element => {
        if (!element.getAttribute('aria-label') && element.textContent.trim()) {
            element.setAttribute('aria-label', element.textContent.trim());
        }
    });

    // =================================================================
    // Keyboard Navigation Enhancement
    // =================================================================
    document.addEventListener('keydown', (e) => {
        // Press 'Escape' to close mobile menu
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // =================================================================
    // Console Welcome Message
    // =================================================================
    console.log('%c한국교육컨설팅협회 (KECA)', 'color: #2E75B5; font-size: 24px; font-weight: bold;');
    console.log('%c신뢰받는 교육컨설팅 생태계를 선도합니다', 'color: #6B7280; font-size: 14px;');
    console.log('%cWebsite developed with ❤️', 'color: #00D4FF; font-size: 12px;');

    // =================================================================
    // Initialize - Log success message
    // =================================================================
    console.log('✅ KECA Website JavaScript initialized successfully');
});

// =================================================================
// Service Worker Registration (for PWA - Optional)
// =================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('Service Worker registered'))
        //     .catch(error => console.log('Service Worker registration failed:', error));
    });
}
