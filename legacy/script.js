// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navbar = document.getElementById('navbar');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Scroll Effect for Navbar + Active Nav Link Tracking
const sections = document.querySelectorAll('.section, .hero');
const navLinks = document.querySelectorAll('.nav-menu a:not(.nav-cta)');

function updateActiveNav() {
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + id) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Scroll Progress
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('scrollProgress').style.width = scrolled + '%';

    // Active nav link
    updateActiveNav();
});

// Back to Top Button
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Achievements Counter Animation
const counters = document.querySelectorAll('.achievement-number[data-count]');
const speed = 200;

const animateCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-count');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            if (entry.target.classList.contains('achievements')) {
                animateCounters();
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

document.querySelector('.achievements').classList.add('observe-me');
observer.observe(document.querySelector('.achievements'));


// Modal Logic
function openCertModal() {
    const modal = document.getElementById('certModal');
    modal.style.display = 'flex';
    void modal.offsetWidth;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCertModal() {
    const modal = document.getElementById('certModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// Close outside click
window.onclick = function (event) {
    const modal = document.getElementById('certModal');
    if (event.target == modal) {
        closeCertModal();
    }
}

// Contact Form Validation & Submit
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Clear previous states
        const formGroups = contactForm.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
        });

        const formStatus = document.getElementById('formStatus');
        formStatus.className = 'form-status';
        formStatus.style.display = 'none';

        let isValid = true;

        // Validate each required field
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const subjectField = document.getElementById('subject');
        const messageField = document.getElementById('message');

        if (!nameField.value.trim()) {
            nameField.closest('.form-group').classList.add('error');
            isValid = false;
        } else {
            nameField.closest('.form-group').classList.add('success');
        }

        if (!emailField.value.trim() || !emailField.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            emailField.closest('.form-group').classList.add('error');
            isValid = false;
        } else {
            emailField.closest('.form-group').classList.add('success');
        }

        if (!subjectField.value.trim()) {
            subjectField.closest('.form-group').classList.add('error');
            isValid = false;
        } else {
            subjectField.closest('.form-group').classList.add('success');
        }

        if (!messageField.value.trim()) {
            messageField.closest('.form-group').classList.add('error');
            isValid = false;
        } else {
            messageField.closest('.form-group').classList.add('success');
        }

        if (!isValid) return;

        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';

        // Simulate submission
        setTimeout(() => {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';

            formStatus.textContent = '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.';
            formStatus.className = 'form-status success';

            contactForm.reset();
            formGroups.forEach(group => {
                group.classList.remove('error', 'success');
            });
        }, 1500);
    });

    // Real-time validation on blur
    contactForm.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('blur', function () {
            const group = this.closest('.form-group');
            if (this.required && !this.value.trim()) {
                group.classList.add('error');
                group.classList.remove('success');
            } else if (this.type === 'email' && this.value.trim() && !this.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                group.classList.add('error');
                group.classList.remove('success');
            } else if (this.value.trim()) {
                group.classList.remove('error');
                group.classList.add('success');
            }
        });

        field.addEventListener('input', function () {
            const group = this.closest('.form-group');
            if (group.classList.contains('error') && this.value.trim()) {
                if (this.type === 'email') {
                    if (this.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                        group.classList.remove('error');
                    }
                } else {
                    group.classList.remove('error');
                }
            }
        });
    });
}

// Load Executive Images
document.addEventListener('DOMContentLoaded', () => {
    const execCards = document.querySelectorAll('.executive-card');
    const execKeys = ['exec1', 'exec2', 'exec3', 'exec4'];

    // Load Banner Image
    const bannerImage = localStorage.getItem('keca_banner');
    if (bannerImage) {
        const heroBg = document.querySelector('.hero-bg-image');
        if (heroBg) {
            heroBg.src = bannerImage;
        }
    }

    // Check if we are on the page with executive cards
    if (execCards.length > 0) {
        execCards.forEach((card, index) => {
            if (index < execKeys.length) {
                const key = 'keca_' + execKeys[index];
                const storedImage = localStorage.getItem(key);
                if (storedImage) {
                    const avatarCircle = card.querySelector('.avatar-circle');
                    if (avatarCircle) {
                        avatarCircle.innerHTML = `<img src="${storedImage}" alt="Executive Image" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                        avatarCircle.style.background = 'transparent';
                        avatarCircle.style.overflow = 'hidden';
                        avatarCircle.style.padding = '0';
                        avatarCircle.style.display = 'flex';
                        avatarCircle.style.alignItems = 'center';
                        avatarCircle.style.justifyContent = 'center';
                        avatarCircle.style.border = 'none';
                    }
                }
            }
        });
    }

    // Initial active nav state
    updateActiveNav();
});
