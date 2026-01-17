// ========================================
// KECA - Complete JavaScript Interactions
// 한국교육컨설팅협회 공식 웹사이트
// ========================================

document.addEventListener('DOMContentLoaded', function() {

    // ========================================
    // 1. NAVBAR SCROLL EFFECT (Transparent → Solid)
    // ========================================
    const navbar = document.getElementById('navbar') || document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;

    function handleNavbarScroll() {
        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }


    // ========================================
    // 2. MOBILE HAMBURGER MENU TOGGLE
    // ========================================
    const hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
    const navMenu = document.getElementById('navMenu') || document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const body = document.body;

    function toggleMenu() {
        if (!hamburger || !navMenu) return;

        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.classList.toggle('menu-open');

        const isExpanded = hamburger.classList.contains('active');
        hamburger.setAttribute('aria-expanded', isExpanded);
    }

    function closeMenu() {
        if (!hamburger || !navMenu) return;

        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu?.contains(event.target);
        const isClickOnHamburger = hamburger?.contains(event.target);

        if (!isClickInsideNav && !isClickOnHamburger && navMenu?.classList.contains('active')) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
            closeMenu();
        }
    });


    // ========================================
    // 3. SMOOTH SCROLL TO ANCHORS
    // ========================================
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#' || href === '#!') return;

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();

                const offsetTop = targetElement.offsetTop - navbarHeight;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                history.pushState(null, null, href);
            }
        });
    });


    // ========================================
    // 4. SCROLL PROGRESS BAR
    // ========================================
    let progressBar = document.querySelector('.scroll-progress');

    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #2E75B5, #00D4FF);
            width: 0%;
            z-index: 10000;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
    }

    function updateScrollProgress() {
        if (!progressBar) return;

        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;

        const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
        progressBar.style.width = Math.min(scrollPercentage, 100) + '%';
    }


    // ========================================
    // 5. COUNTER ANIMATIONS
    // ========================================
    const counters = document.querySelectorAll('.achievement-number[data-count], .counter[data-target]');
    let counterAnimated = new Set();

    function animateCounter(counter) {
        const counterId = counter.getAttribute('data-id') || Math.random().toString(36);
        counter.setAttribute('data-id', counterId);

        if (counterAnimated.has(counterId)) return;

        const target = parseInt(counter.getAttribute('data-count') || counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;

            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
                counterAnimated.add(counterId);
            }
        };

        updateCounter();
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });


    // ========================================
    // 6. INTERSECTION OBSERVER - FADE IN ANIMATIONS
    // ========================================
    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');
    const existingAnimateElements = document.querySelectorAll(`
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

    const allFadeElements = new Set([...fadeElements, ...existingAnimateElements]);

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    allFadeElements.forEach(element => {
        if (!element.style.transition) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        fadeObserver.observe(element);
    });


    // ========================================
    // 7. BACK TO TOP BUTTON
    // ========================================
    let backToTopButton = document.querySelector('.back-to-top') || document.getElementById('backToTop');

    if (!backToTopButton) {
        backToTopButton = document.createElement('button');
        backToTopButton.className = 'back-to-top';
        backToTopButton.innerHTML = '↑';
        backToTopButton.setAttribute('aria-label', 'Back to top');
        backToTopButton.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #2E75B5;
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
        document.body.appendChild(backToTopButton);
    }

    function handleBackToTopVisibility() {
        if (!backToTopButton) return;

        if (window.scrollY > 500) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    }

    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    backToTopButton.addEventListener('mouseenter', () => {
        backToTopButton.style.transform = 'translateY(-4px)';
        backToTopButton.style.boxShadow = '0 6px 16px rgba(46, 117, 181, 0.4)';
    });

    backToTopButton.addEventListener('mouseleave', () => {
        backToTopButton.style.transform = 'translateY(0)';
        backToTopButton.style.boxShadow = '0 4px 12px rgba(46, 117, 181, 0.3)';
    });


    // ========================================
    // 8. CONTACT FORM HANDLING
    // ========================================
    const contactForm = document.getElementById('contactForm') || document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('name') || document.getElementById('name')?.value;
            const email = formData.get('email') || document.getElementById('email')?.value;
            const subject = formData.get('subject') || document.getElementById('subject')?.value;
            const message = formData.get('message') || document.getElementById('message')?.value;

            if (!name || !email || !message) {
                showFormMessage('모든 필수 항목을 입력해주세요.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showFormMessage('올바른 이메일 주소를 입력해주세요.', 'error');
                return;
            }

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = '전송 중...';

            setTimeout(() => {
                showFormMessage('문의가 접수되었습니다! 빠른 시일 내에 답변드리겠습니다.', 'success');
                contactForm.reset();
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }, 1500);
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showFormMessage(message, type) {
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            margin-top: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            transition: opacity 0.3s ease;
            ${type === 'success' ? 'background-color: #D1FAE5; color: #065F46; border: 1px solid #10B981;' : 'background-color: #FEE2E2; color: #991B1B; border: 1px solid #EF4444;'}
        `;

        contactForm.insertAdjacentElement('afterend', messageDiv);

        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }


    // ========================================
    // 9. ACTIVE NAV LINK HIGHLIGHTING
    // ========================================
    const sections = document.querySelectorAll('section[id]');

    function highlightActiveNavLink() {
        const scrollPosition = window.scrollY + navbarHeight + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });

        if (window.scrollY < 100) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLinks.length > 0) {
                navLinks[0].classList.add('active');
            }
        }
    }


    // ========================================
    // 10. PARALLAX EFFECTS
    // ========================================
    const parallaxElements = document.querySelectorAll('.parallax');
    const hero = document.querySelector('.hero');

    function handleParallax() {
        const scrolled = window.scrollY;

        parallaxElements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-speed')) || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });

        if (hero) {
            const heroContent = hero.querySelector('.hero-content');
            if (heroContent && scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
                heroContent.style.opacity = 1 - (scrolled / 700);
            }
        }
    }

    let parallaxTicking = false;
    function requestParallax() {
        if (!parallaxTicking) {
            window.requestAnimationFrame(() => {
                handleParallax();
                parallaxTicking = false;
            });
            parallaxTicking = true;
        }
    }


    // ========================================
    // TAB FUNCTIONALITY
    // ========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            this.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });


    // ========================================
    // LAZY LOADING IMAGES
    // ========================================
    const lazyImages = document.querySelectorAll('img[data-src], img.lazy');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                img.classList.add('loaded');
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));


    // ========================================
    // PERFORMANCE OPTIMIZATION
    // ========================================
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

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

    const optimizedScroll = throttle(() => {
        handleNavbarScroll();
        updateScrollProgress();
        handleBackToTopVisibility();
        highlightActiveNavLink();
        if (parallaxElements.length > 0 || hero) {
            requestParallax();
        }
    }, 16);

    window.addEventListener('scroll', optimizedScroll);


    // ========================================
    // ACCESSIBILITY ENHANCEMENTS
    // ========================================
    const skipLink = document.createElement('a');
    skipLink.href = '#about';
    skipLink.className = 'skip-link';
    skipLink.textContent = '본문으로 건너뛰기';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: #2E75B5;
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        z-index: 10000;
        transition: top 0.3s;
    `;
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);


    // ========================================
    // TABLE RESPONSIVE WRAPPER
    // ========================================
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        if (!table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('table-responsive');
            wrapper.style.overflowX = 'auto';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });


    // ========================================
    // WINDOW RESIZE HANDLER
    // ========================================
    const handleResize = debounce(() => {
        if (window.innerWidth > 768 && navMenu?.classList.contains('active')) {
            closeMenu();
        }
    }, 250);

    window.addEventListener('resize', handleResize);


    // ========================================
    // INITIALIZE ON LOAD
    // ========================================
    updateScrollProgress();
    handleBackToTopVisibility();
    highlightActiveNavLink();

    console.log('%c한국교육컨설팅협회 (KECA)', 'color: #2E75B5; font-size: 24px; font-weight: bold;');
    console.log('%c신뢰받는 교육컨설팅 생태계를 선도합니다', 'color: #6B7280; font-size: 14px;');
    console.log('%cAll interactive features loaded successfully', 'color: #10B981; font-size: 12px;');

});


// ========================================
// SERVICE WORKER REGISTRATION (Optional)
// ========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable PWA features
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('Service Worker registered'))
        //     .catch(error => console.log('Service Worker registration failed:', error));
    });
}
