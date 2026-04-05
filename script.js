

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // Page Transition Logic
    // ==========================================
    // Create the overlay element dynamically
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);

    // Fade out the overlay when the page loads
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 100);

    // Find all internal links with the class 'transition-link'
    const transitionLinks = document.querySelectorAll('.transition-link');
    
    transitionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Stop instant navigation
            const target = link.href;

            // Fade the overlay back in
            overlay.classList.remove('hidden');

            // Wait for the fade to finish, then change the page
            setTimeout(() => {
                window.location.href = target;
            }, 800); // Matches the 0.8s CSS transition
        });
    });
    // ==========================================
    // NEW: Hero Text Scroll Fade Logic
    // ==========================================
    
    const heroContent = document.getElementById('heroContent');
    
    window.addEventListener('scroll', () => {
        // 当页面向下滚动超过 100px 时，给文字加上消失的 class
        if (window.scrollY > 100) {
            heroContent.classList.add('scrolled-out');
        } else {
            // 回到顶部时，移除 class，文字重新浮现
            heroContent.classList.remove('scrolled-out');
        }
    });

    // ==========================================
    // 1. Hero Canvas: Ink Particle Animation
    // ==========================================
    const canvas = document.getElementById('inkCanvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    // 调色板：基于您的参考图提取的柔和水墨色彩
    const colors = [
        'rgba(235, 100, 80, 0.015)',   // 柔和水红
        'rgba(140, 170, 100, 0.015)',  // 浅草绿
        'rgba(240, 180, 100, 0.015)',  // 暖藤黄
        'rgba(200, 190, 180, 0.01)'    // 灰色水痕
    ];

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = (Math.random() - 0.5) * 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.size = Math.random() * 2 + 0.5; 
            this.life = 0;
            this.maxLife = Math.random() * 300 + 100;
            this.angle = Math.random() * Math.PI * 2;
        }

        update() {
            this.angle += (Math.random() - 0.5) * 0.1;
            this.vx += Math.cos(this.angle) * 0.05;
            this.vy += Math.sin(this.angle) * 0.05;

            this.vx *= 0.98;
            this.vy *= 0.98;

            this.x += this.vx;
            this.y += this.vy;
            this.life++;

            if (this.x < 0 || this.x > width || this.y < 0 || this.y > height || this.life > this.maxLife) {
                this.reset();
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initInk() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        
        ctx.fillStyle = '#F8F7F5'; 
        ctx.fillRect(0, 0, width, height);

        particles = [];
        for (let i = 0; i < 400; i++) {
            particles.push(new Particle());
        }
    }

    function animateInk() {
        ctx.fillStyle = 'rgba(248, 247, 245, 0.02)';
        ctx.fillRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animateInk);
    }

    window.addEventListener('resize', initInk);
    initInk();
    animateInk();


    // ==========================================
    // 2. Spatial Gallery: Pan & Zoom Logic
    // ==========================================
    const world = document.getElementById('world');
    const gallerySection = document.querySelector('.spatial-gallery-section');
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;
    let currentScale = 1, targetScale = 1;
    let isDragging = false;
    let startX, startY;
    
    let mouseDownPos = {x: 0, y: 0};

    gallerySection.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - targetX;
        startY = e.clientY - targetY;
        mouseDownPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => isDragging = false);

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        targetX = e.clientX - startX;
        targetY = e.clientY - startY;
    });

    gallerySection.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSensitivity = 0.001;
        targetScale -= e.deltaY * zoomSensitivity;
        targetScale = Math.max(0.3, Math.min(targetScale, 3)); 
    }, { passive: false });

    function renderGallery() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        currentScale += (targetScale - currentScale) * 0.1;
        world.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
        requestAnimationFrame(renderGallery);
    }
    renderGallery();


    // ==========================================
    // 3. Scroll Reveal Animation (Text & Dividers)
    // ==========================================
    // Updated to include both .reveal-text AND .reveal-divider
    const revealElements = document.querySelectorAll('.reveal-text, .reveal-divider');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); 
            }
        });
    }, { root: null, threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    
    revealElements.forEach(el => revealObserver.observe(el));


    // ==========================================
    // 4. Artwork Modal: Click Details & Close
    // ==========================================
    const artworks = document.querySelectorAll('.artwork');
    const modal = document.getElementById('artworkModal');
    const closeBtn = document.getElementById('closeModalBtn');
    
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalMedium = document.getElementById('modalMedium');
    const modalSize = document.getElementById('modalSize');
    const modalYear = document.getElementById('modalYear');

    artworks.forEach(art => {
        art.addEventListener('mouseup', (e) => {
            const dx = Math.abs(e.clientX - mouseDownPos.x);
            const dy = Math.abs(e.clientY - mouseDownPos.y);
            
            if (dx < 5 && dy < 5) {
                const imgSrc = art.querySelector('img').src;
                
                modalImg.src = imgSrc;
                modalTitle.textContent = art.dataset.title;
                modalMedium.textContent = art.dataset.medium;
                modalSize.textContent = art.dataset.size;
                modalYear.textContent = art.dataset.year;
                
                modal.classList.add('active');
            }
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

});