/**
 * Madan Singh - Portfolio Interactive Features (script.js)
 * High-performance, clean vanilla JS for developer portfolio.
 * Features:
 * - Canvas Particle Background (60 FPS optimized)
 * - Interactive Developer Terminal
 * - Animated Stats & SVG Gauges
 * - Dynamic GitHub Contribution Calendar Heatmap
 * - IntersectionObserver Scroll Reveal Animations
 * - Interactive JSON API Contact Card
 */

document.addEventListener('DOMContentLoaded', () => {
    // Always start at the hero section instead of restoring the previous hash/scroll position.
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    const resetToHero = () => {
        if (location.hash) {
            history.replaceState(null, '', location.pathname + location.search);
        }
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    };
    resetToHero();
    window.addEventListener('load', resetToHero, { once: true });
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            resetToHero();
        }
    });

    // Initialize Preloader
    initPreloader();

    // Initialize Theme
    initTheme();

    // Initialize Interactive Background Canvas
    initCanvasBackground();

    // Initialize Typing Effects
    initNameTypingEffect();
    initTypingEffect();

    // Initialize Drawer Menu Navigation
    initDrawerMenu();

    // Initialize Terminal Mock
    initTerminal();


    // Initialize Stats & SVG Gauges on scroll
    initStatsObserver();

    // Initialize Scroll Reveal Animations
    initScrollReveal();

    // Initialize Contact Form
    initContactForm();

    // Initialize Scroll navbar transparent at top
    initNavbarScroll();

    // Initialize AI Recruiter Assistant Chatbot
    initAIChatbot();

    // Fetch live LeetCode stats
    fetchLeetCodeStats();
});

async function fetchLeetCodeStats() {
    try {
        const response = await fetch('https://leetcode-api-faisalshohag.vercel.app/madansingh7');
        if (!response.ok) return;
        const data = await response.json();
        
        if (data && typeof data.totalSolved === 'number') {
            const meter = document.getElementById('leetcode-stat-meter');
            if (meter) {
                const totalSolved = data.totalSolved;
                meter.setAttribute('data-value', totalSolved);
                meter.setAttribute('data-suffix', ''); // Remove the + sign since it's exact
                
                // Set percentage (calculated out of a total of 600)
                // We clamp the percentage between 5% and 100%
                const percent = Math.min(Math.max((totalSolved / 600) * 100, 5), 100);
                meter.setAttribute('data-percent', percent);
            }
        }
    } catch (error) {
        console.error('Failed to fetch LeetCode stats:', error);
    }
}

/* =========================================================================
   1. Theme Management
   ========================================================================= */
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const root = document.documentElement;
    const themeKey = 'theme';

    toggleBtn.setAttribute('aria-pressed', (root.getAttribute('data-theme') || 'dark') === 'dark');

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        toggleBtn.setAttribute('aria-pressed', theme === 'dark');
        localStorage.setItem(themeKey, theme);
        // Refresh canvas colors if active
        if (window.refreshCanvasTheme) {
            window.refreshCanvasTheme();
        }
    }

    toggleBtn.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    });

    // Handle system theme changes if no saved preference
    if (!localStorage.getItem(themeKey)) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem(themeKey)) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

/* =========================================================================
   2. Canvas Particle Background (Optimized)
   ========================================================================= */
function initCanvasBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let resizeTimer;
    let particles = [];
    let particleColor = 'rgba(0, 242, 254, 0.15)'; // Default dark mode cyan
    let lineColor = 'rgba(0, 242, 254, 0.05)';
    const maxParticles = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 24
        : (window.innerWidth < 768 ? 32 : 64);

    // Mouse settings
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Update colors based on active theme
    window.refreshCanvasTheme = function() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            particleColor = 'rgba(0, 242, 254, 0.18)'; // Glowing cyan
            lineColor = 'rgba(99, 102, 241, 0.06)';     // Indigo links
        } else {
            particleColor = 'rgba(2, 132, 199, 0.12)';  // Blue
            lineColor = 'rgba(2, 132, 199, 0.04)';      // Light blue links
        }
    };
    window.refreshCanvasTheme();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.size = Math.random() * 2 + 1.5;
        }

        draw() {
            ctx.fillStyle = particleColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Boundary collision
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Mouse interaction (repelling effect)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.hypot(dx, dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    // Push particle slightly away
                    this.x += Math.cos(angle) * force * 1.5;
                    this.y += Math.sin(angle) * force * 1.5;
                }
            }
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function init() {
        particles = [];
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }
    }

    function connect() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.hypot(dx, dy);

                if (distance < 110) {
                    // Line opacity maps to proximity
                    const opacity = (1 - (distance / 110)) * 0.65;
                    ctx.strokeStyle = lineColor.replace('0.06', opacity.toString()).replace('0.04', opacity.toString());
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        connect();
        animationFrameId = requestAnimationFrame(animate);
    }

    function resize() {
        resizeCanvas();
        init();
    }

    function scheduleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
            resize();
            animate();
        }, 120);
    }

    resizeCanvas();
    init();
    animate();

    window.addEventListener('resize', scheduleResize);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
        } else {
            cancelAnimationFrame(animationFrameId);
            animate();
        }
    });
}

/* =========================================================================
   2b. Preloader
   ========================================================================= */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    
    // Hide preloader after window load
    window.addEventListener('load', () => {
        preloader.classList.add('fade-out');
    });
    
    // Safety fallback: hide preloader after 3 seconds in case load event doesn't trigger
    setTimeout(() => {
        if (!preloader.classList.contains('fade-out')) {
            preloader.classList.add('fade-out');
        }
    }, 2500);
}

/* =========================================================================
   2c. Name Typing Effect on Load
   ========================================================================= */
function initNameTypingEffect() {
    const element = document.getElementById('hero-typing-name');
    if (!element) return;
    
    const fullName = "Madan Singh Rajpurohit";
    let index = 0;
    
    element.innerHTML = "";
    
    function type() {
        if (index < fullName.length) {
            const char = fullName.charAt(index);
            // After index 5 ("Madan "), put characters inside span for gradient theme
            if (index >= 6) {
                let span = element.querySelector('span');
                if (!span) {
                    span = document.createElement('span');
                    element.appendChild(span);
                }
                span.textContent += char;
            } else {
                element.innerHTML += char;
            }
            index++;
            setTimeout(type, 100);
        } else {
            element.classList.add('typing-done');
        }
    }
    
    // Trigger typing effect after preloader finishes fading out
    setTimeout(type, 1000);
}

/* =========================================================================
   2d. Hamburger Drawer Navigation Menu
   ========================================================================= */
function initDrawerMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('nav-overlay');
    const firstLink = navMenu ? navMenu.querySelector('a') : null;
    let lastFocusedElement = null;

    if (navMenu) {
        navMenu.setAttribute('aria-hidden', 'true');
    }
    if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
        lastFocusedElement = document.activeElement;
        mobileToggle.classList.add('active');
        navMenu.classList.add('active');
        if (overlay) overlay.classList.add('active');
        if (navMenu) navMenu.setAttribute('aria-hidden', 'false');
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // lock scroll
        if (firstLink) firstLink.focus();
    }

    function closeMenu() {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (navMenu) navMenu.setAttribute('aria-hidden', 'true');
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // restore scroll
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        } else if (mobileToggle) {
            mobileToggle.focus();
        }
    }

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.contains('active') ? closeMenu() : openMenu();
        });

        // Close on nav link click
        const links = navMenu.querySelectorAll('a');
        links.forEach(link => link.addEventListener('click', closeMenu));

        // Close on overlay click
        if (overlay) overlay.addEventListener('click', closeMenu);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) closeMenu();
        });
    }
}

/* =========================================================================
   3. Typing Effect
   ========================================================================= */
function initTypingEffect() {
    const element = document.getElementById('typing-text');
    if (!element) return;

    const titles = ["B.E. Computer Science Student", "Aspiring Software Engineer", "Tech Enthusiast", "C++ & Web Developer"];
    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentTitle = titles[titleIndex];
        
        if (isDeleting) {
            element.textContent = currentTitle.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40; // delete faster
        } else {
            element.textContent = currentTitle.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 120; // normal type speed
        }

        if (!isDeleting && charIndex === currentTitle.length) {
            isDeleting = true;
            typeSpeed = 1500; // hold before delete
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            typeSpeed = 500; // pause before next word
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

/* =========================================================================
   4. Interactive Terminal
   ========================================================================= */
function initTerminal() {
    const output = document.getElementById('terminal-output');
    const input = document.getElementById('terminal-input');
    const terminalWindow = document.querySelector('.terminal-window');
    if (!output || !input) return;

    // Standard profile JSON output
    const profileJSON = `{
  "name": "Madan Singh R.",
  "role": "Computer Science & Engineering Student",
  "college": "SDMCET, Dharwad",
  "academics": {
    "gpa_1st_year": "9.45 / 10.0"
  },
  "skills": ["Java", "C++", "Python", "Gemini API", "HTML", "CSS", "JavaScript", "PHP", "Linux", "VS Code", "Eclipse", "Antigravity", "Codex"],
  "focus": "Algorithmic Problem Solving & Web Engineering"
}`;

    // Helper to print a line
    function printLine(text, type = 'output', delay = 0) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const line = document.createElement('div');
                line.className = `terminal-line ${type}-line`;
                
                if (type === 'input-echo') {
                    line.innerHTML = `<span class="prompt">visitor@madansingh:~$</span> <span>${text}</span>`;
                } else if (type === 'json') {
                    // Safe and robust JSON syntax highlighting
                    let formatted = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    let highlighted = formatted.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
                        let cls = 'json-num';
                        if (/^"/.test(match)) {
                            if (/:$/.test(match)) {
                                cls = 'json-key';
                                return '<span class="' + cls + '">' + match.replace(/:$/, '') + '</span>:';
                            } else {
                                cls = 'json-val';
                            }
                        } else if (/true|false/.test(match)) {
                            cls = 'json-bool';
                        } else if (/null/.test(match)) {
                            cls = 'json-null';
                        }
                        return '<span class="' + cls + '">' + match + '</span>';
                    });
                    line.innerHTML = `<pre>${highlighted}</pre>`;
                } else {
                    line.innerHTML = text;
                }

                output.appendChild(line);
                output.scrollTop = output.scrollHeight;
                resolve();
            }, delay);
        });
    }

    // Auto-run first command on load
    async function runAutoCommand() {
        await printLine('curl -s https://api.madansingh.dev/profile', 'input-echo', 800);
        await printLine('Fetching developer profile info...', 'system', 400);
        await printLine(profileJSON, 'json', 800);
        await printLine('Welcome to Madan\'s interactive shell! Type <span class="accent-text">help</span> to view all commands.', 'system', 500);
    }

    runAutoCommand();

    // Focus input on terminal click
    terminalWindow.addEventListener('click', () => {
        input.focus();
    });

    const typer = document.getElementById('terminal-typer');
    if (typer) {
        input.addEventListener('input', () => {
            typer.textContent = input.value;
        });
    }

    // Handle enter key on input
    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const rawCmd = input.value;
            const cmd = rawCmd.trim().toLowerCase();
            input.value = '';
            if (typer) {
                typer.textContent = '';
            }

            await printLine(rawCmd, 'input-echo');

            if (cmd === '') return;

            switch (cmd) {
                case 'help':
                    await printLine('Available commands:');
                    await printLine('  <span class="accent-text">about</span>      Print biography and academics');
                    await printLine('  <span class="accent-text">skills</span>     List core developer skills');
                    await printLine('  <span class="accent-text">projects</span>   Show highlight portfolio projects');
                    await printLine('  <span class="accent-text">contact</span>    Print communication endpoints');
                    await printLine('  <span class="accent-text">theme</span>      Toggle dark/light theme setting');
                    await printLine('  <span class="accent-text">clear</span>      Clear the terminal viewport');
                    break;
                case 'about':
                    await printLine('I am a B.E. Computer Science Engineering student at SDM College of Engineering & Technology (SDMCET), Dharwad.');
                    await printLine('Currently maintaining a <span class="accent-text">9.43 CGPA</span> in my undergraduate degree. Deeply passionate about coding, system architectures, and learning algorithmic structures.');
                    break;
                case 'skills':
                    await printLine('★ Languages: Java, C++, Python');
                    await printLine('★ Web Tech/AI: HTML, CSS, JavaScript, Basic PHP, Gemini & NVIDIA APIs');
                    await printLine('★ Workflow/OS: Linux, VS Code, Eclipse, Antigravity, Codex, Git & GitHub');
                    break;
                case 'projects':
                    await printLine('🚀 **Multi-Modal Evidence Review** - Production-grade insurance claim verification pipeline using Gemini (Hackathon Project).');
                    await printLine('🚀 **Investment Scam Detector** - Real-time AI investment risk analysis web application (Hackathon Project).');
                    await printLine('📦 **Amazon Clone** - Highly responsive static front-end replication of the retail layout.');
                    await printLine('Type <span class="accent-text">projects</span> to find their descriptions in the section below!');
                    break;
                case 'contact':
                    await printLine('✉ Email: madansingh7@yahoo.com');
                    await printLine('💼 LinkedIn: linkedin.com/in/madansingh7');
                    await printLine('🐙 GitHub: github.com/madansingh7');
                    break;
                case 'theme':
                    const toggleBtn = document.getElementById('theme-toggle');
                    if (toggleBtn) {
                        toggleBtn.click();
                        await printLine('Theme toggled successfully!');
                    } else {
                        await printLine('Error: Theme toggle mechanism offline.');
                    }
                    break;
                case 'clear':
                    output.innerHTML = '';
                    break;
                default:
                    await printLine(`bash: command not found: ${rawCmd}. Type <span class="accent-text">help</span> for assistance.`);
            }
            output.scrollTop = output.scrollHeight;
        }
    });
}


/* =========================================================================
   6. SVG Gauges and Counter Anim
   ========================================================================= */
function initStatsObserver() {
    const statsSection = document.getElementById('about');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateGauges();
            } else {
                resetGauges();
            }
        });
    }, { threshold: 0.15 });

    observer.observe(statsSection);
}

function resetGauges() {
    const meters = document.querySelectorAll('.stat-radial-meter');
    meters.forEach(meter => {
        const circle = meter.querySelector('.progress-circle');
        const countText = meter.querySelector('.stat-value-text');
        if (!circle || !countText) return;
        
        if (meter.animationId) {
            cancelAnimationFrame(meter.animationId);
        }

        const circumference = 2 * Math.PI * 40;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
        
        const isFloat = meter.getAttribute('data-float') === 'true';
        countText.textContent = isFloat ? "0.00" : "0";
    });
}


function animateGauges() {
    const meters = document.querySelectorAll('.stat-radial-meter');
    
    meters.forEach(meter => {
        const circle = meter.querySelector('.progress-circle');
        const countText = meter.querySelector('.stat-value-text');
        if (!circle || !countText) return;

        if (meter.animationId) {
            cancelAnimationFrame(meter.animationId);
        }

        const targetPercent = parseFloat(meter.getAttribute('data-percent'));
        const targetValue = parseFloat(meter.getAttribute('data-value'));
        const isFloat = meter.getAttribute('data-float') === 'true';
        
        // Circumference is 2 * PI * r = 2 * PI * 40 = 251.2
        const circumference = 2 * Math.PI * 40;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        
        // Dashoffset is how much of the stroke is hidden (0 offset = fully filled circle)
        const offset = circumference - (targetPercent / 100) * circumference;
        
        // CSS transition triggers the stroke fill
        circle.style.strokeDashoffset = circumference;
        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
        }, 100);

        // Counter text animation
        let start = 0;
        const duration = 1500; // ms
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quad formula
            const easeProgress = progress * (2 - progress);
            const currentVal = easeProgress * targetValue;

            if (isFloat) {
                countText.textContent = currentVal.toFixed(2);
            } else {
                countText.textContent = Math.floor(currentVal);
            }

            if (progress < 1) {
                meter.animationId = requestAnimationFrame(updateCounter);
            } else {
                if (isFloat) {
                    countText.textContent = targetValue.toFixed(2);
                } else {
                    countText.textContent = targetValue + (meter.getAttribute('data-suffix') || '');
                }
            }
        }
        
        meter.animationId = requestAnimationFrame(updateCounter);
    });
}

/* =========================================================================
   7. Scroll Reveal Animation Observer
   ========================================================================= */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add active class
                entry.target.classList.add('revealed');
                // Optional: stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element fits in view
    });

    revealElements.forEach(el => observer.observe(el));
}

/* =========================================================================
   8. Contact Form Handler
   ========================================================================= */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const statusMsg = document.getElementById('contact-status-msg');
    const sendBtn = document.getElementById('contact-send-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !email || !message) {
            statusMsg.textContent = "Error: All fields are required.";
            statusMsg.className = "status-msg error";
            return;
        }

        // Processing state
        statusMsg.textContent = "Preparing message and launching mail client...";
        statusMsg.className = "status-msg sending";
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

        setTimeout(() => {
            statusMsg.textContent = "Success! Opening your email client...";
            statusMsg.className = "status-msg success";
            
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';

            // Open mailto link
            const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
            const body = encodeURIComponent(`Hi Madan,\n\n${message}\n\nBest regards,\n${name}\nEmail: ${email}`);
            window.location.href = `mailto:madansingh7@yahoo.com?subject=${subject}&body=${body}`;

            // Reset inputs
            form.reset();
        }, 1200);
    });
}

/**
 * Handle dynamic transparency on top of the page for Navigation Bar
 */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const handleScroll = () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    // Run on initial load
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * =========================================================================
 * 12. Proton AI Chatbot Panel & Floating Button Logic
 * =========================================================================
 */

// Single configuration object storing all chatbot responses, keywords, and metadata.
const MADAN_AI_DATABASE = {
    assistantName: "Proton",
    keywords: {
        about: {
            patterns: ['about', 'who is', 'biography', 'profile', 'madan raj', 'madan singh', 'who are you', 'tell me about madan'],
            response: "Madan Singh Rajpurohit is a B.E. Computer Science & Engineering student at SDM College of Engineering & Technology (SDMCET), Dharwad. He is highly passionate about programming, data structures, algorithms, AI agent pipelines, and responsive front-end engineering."
        },
        education: {
            patterns: ['education', 'college', 'study', 'degree', 'sdmcet', 'university', 'b.e', 'school', 'academics'],
            response: "Madan is pursuing his Bachelor of Engineering (B.E.) in Computer Science & Engineering at SDM College of Engineering & Technology (SDMCET), Dharwad (Sept 2024 - Present)."
        },
        cgpa: {
            patterns: ['cgpa', 'grades', 'percentage', 'marks', 'gpa', 'academic score'],
            response: "Madan currently maintains a stellar **9.45 / 10.0 CGPA** in his undergraduate computer science studies!"
        },
        skills: {
            patterns: ['skills', 'languages', 'technologies', 'java', 'c++', 'python', 'javascript', 'html', 'css', 'programming', 'tech stack', 'know'],
            response: "Madan's developer stack includes:\n\n• **Languages**: Java, C++, Python, Javascript, Basic PHP\n• **Web & AI Tech**: HTML5, CSS3, ES6, Gemini APIs, NVIDIA APIs\n• **Developer Workflows**: Git, GitHub, VS Code, Eclipse, Linux (Ubuntu/Fedora)"
        },
        projects: {
            patterns: ['projects', 'build', 'portfolio', 'portfolio projects', 'scam detector', 'evidence review', 'pipeline', 'works', 'creations', 'image detector'],
            response: "Here are some of the projects featured on Madan's portfolio:\n\n" +
                      "1. **AI Image Detector**: An image detection system integrated with advanced AI models to perform real-time target identification and feature extraction. View repository: [github.com/Madansingh7/image-detector-by-ai-model-integration](https://github.com/Madansingh7/image-detector-by-ai-model-integration).\n" +
                      "2. **Investment Scam Detector**: A real-time AI risk analysis web application helping retail investors avoid scam schemes.\n" +
                      "3. **Multi-Modal Evidence Review**: A Python pipeline generated fully by AI to benchmark AI developer fluency for the HackerRank Orchestrate challenge (not claimed as Madan's programming skills).\n" +
                      "4. **Amazon Clone**: A highly responsive front-end recreation of the Amazon homepage layout."
        },
        certifications: {
            patterns: ['certifications', 'certificates', 'hackerrank', 'deloitte', 'orchestrate', 'job simulation', 'achievements', 'awards'],
            response: "Here are Madan's key achievements and credentials:\n\n• **HackerRank Orchestrate May 2026**: Secured 1117th rank globally for building a multi-domain AI support agent.\n• **HackerRank Problem Solving (Basic)**: Validated core DSA competencies.\n• **Deloitte Cyber Job Simulation**: Completed defensive security scenarios."
        },
        leetcode: {
            patterns: ['leetcode', 'problems solved', 'coding progress', 'dsa problems'],
            response: "Madan is active on LeetCode under the handle **madansingh7**. He has solved over **59+ problems** (synced live from the LeetCode API) focusing on algorithms, arrays, strings, and tree structures."
        },
        github: {
            patterns: ['github', 'git profile', 'repository', 'repos', 'open source'],
            response: "You can check out Madan's open-source projects on GitHub at: [github.com/madansingh7](https://github.com/madansingh7)"
        },
        linkedin: {
            patterns: ['linkedin', 'profile link', 'connect', 'social'],
            response: "Connect with Madan on LinkedIn to discuss internships or collaborations: [linkedin.com/in/madansingh7](https://www.linkedin.com/in/madansingh7)"
        },
        contact: {
            patterns: ['contact', 'email', 'phone', 'reach', 'message', 'mail', 'connect', 'hire', 'internship', 'job'],
            response: "You can reach Madan via:\n\n• **Email**: madansingh7@yahoo.com\n• **LinkedIn**: [linkedin.com/in/madansingh7](https://www.linkedin.com/in/madansingh7)\n• **Message Form**: Scroll to the bottom of this page to send a direct message using the contact form!"
        },
        career: {
            patterns: ['career', 'goals', 'internship', 'hiring', 'job', 'position', 'open for', 'aspire'],
            response: "Madan is currently **open for internship opportunities** in Software Engineering, Backend Development, and AI/Web integration. He is eager to bring his strong DSA fundamentals and build production-ready solutions."
        },
        greetings: {
            patterns: ['hi', 'hello', 'hey', 'greetings', 'hola', 'good morning', 'good afternoon', 'sup', 'yo'],
            response: "Hello! 👋 Welcome to Madan's portfolio. I am Proton. How can I assist you today? You can ask me about his **projects**, **skills**, **education**, or **contact info**!"
        }
    },
    defaultResponse: "I'm not quite sure about that one, but I'd love to help! Try asking about his **skills**, **projects**, **education**, **CGPA**, or how to **contact** him. You can also select one of the suggested prompts below!"
};

function initAIChatbot() {
    const aiChatBtn = document.getElementById('ai-chat-btn');
    const aiChatPanel = document.getElementById('ai-chat-panel');
    const aiPanelClose = document.getElementById('ai-panel-close');
    const aiChatForm = document.getElementById('ai-chat-form');
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiChatMessages = document.getElementById('ai-chat-messages');

    if (!aiChatBtn || !aiChatPanel || !aiPanelClose || !aiChatForm || !aiChatInput || !aiChatMessages) return;

    // Toggle Chat Panel visibility
    aiChatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        aiChatPanel.classList.toggle('active');
        const isActive = aiChatPanel.classList.contains('active');
        aiChatPanel.setAttribute('aria-hidden', !isActive);
        if (isActive) {
            aiChatInput.focus();
        }
    });

    // Close Chat Panel
    aiPanelClose.addEventListener('click', (e) => {
        e.stopPropagation();
        aiChatPanel.classList.remove('active');
        aiChatPanel.setAttribute('aria-hidden', 'true');
    });

    // Close chat panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!aiChatPanel.contains(e.target) && !aiChatBtn.contains(e.target)) {
            aiChatPanel.classList.remove('active');
            aiChatPanel.setAttribute('aria-hidden', 'true');
        }
    });

    // Setup Suggested Prompt Buttons
    const suggestionBtns = document.querySelectorAll('.ai-suggestion-btn');
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const text = btn.textContent;
            handleUserSubmit(text);
        });
    });

    // Chat Submission
    aiChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = aiChatInput.value.trim();
        if (!text) return;
        aiChatInput.value = '';
        handleUserSubmit(text);
    });

    // Handle user submission
    function handleUserSubmit(text) {
        // Render User Message
        appendMessage('user', text);

        // Show typing indicator
        const indicator = showTypingIndicator();

        // Simulate thinking delay
        setTimeout(() => {
            indicator.remove();
            const response = getAIChatResponse(text);
            appendMessage('assistant', response);
        }, 750);
    }

    // Match keywords to find appropriate response
    function getAIChatResponse(userInput) {
        const inputClean = userInput.toLowerCase().trim();
        
        for (const key in MADAN_AI_DATABASE.keywords) {
            const item = MADAN_AI_DATABASE.keywords[key];
            const match = item.patterns.some(pattern => inputClean.includes(pattern));
            if (match) {
                return item.response;
            }
        }
        
        return MADAN_AI_DATABASE.defaultResponse;
    }

    // Append a message bubble to the messages panel
    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-message ${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        // Render simple markdown links and bold formatting
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color: var(--accent-primary); text-decoration: underline;">$1</a>')
            .replace(/\n/g, '<br>');
        
        bubble.innerHTML = formattedText;
        msgDiv.appendChild(bubble);
        aiChatMessages.appendChild(msgDiv);
        
        // Scroll to the bottom
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }

    // Show typing bubble
    function showTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'ai-message assistant typing-indicator-msg';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble typing-indicator';
        bubble.innerHTML = '<span></span><span></span><span></span>';
        
        msgDiv.appendChild(bubble);
        aiChatMessages.appendChild(msgDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        return msgDiv;
    }
}

