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

// Scroll Effect for Navbar
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

document.querySelector('.achievements').classList.add('observe-me'); // Flag for counter
observer.observe(document.querySelector('.achievements'));


// Modal Logic
function openCertModal() {
    const modal = document.getElementById('certModal');
    modal.style.display = 'flex';
    // Trigger reflow
    void modal.offsetWidth;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
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
                        // Replace text content with image
                        avatarCircle.innerHTML = `<img src="${storedImage}" alt="Executive Image" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;

                        // Apply styles to ensure proper display
                        avatarCircle.style.background = 'transparent';
                        avatarCircle.style.overflow = 'hidden';
                        avatarCircle.style.padding = '0';
                        avatarCircle.style.display = 'flex';
                        avatarCircle.style.alignItems = 'center';
                        avatarCircle.style.justifyContent = 'center';
                        avatarCircle.style.border = 'none'; // Optional: remove border if it conflicts
                    }
                }
            }
        });
    }
});
