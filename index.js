// ============================
        // GALAXY LOADER + IRON MAN HUD
        // ============================
        (function() {
            const loader = document.getElementById('galaxyLoader');
            const canvas = document.getElementById('galaxyCanvas');
            const ctx = canvas.getContext('2d');
            const statusEl = document.getElementById('loaderStatus');
            const percentEl = document.getElementById('loaderPercent');
            
            let W = canvas.width = window.innerWidth;
            let H = canvas.height = window.innerHeight;

            // Build HUD ticks
            const ticksContainer = document.getElementById('hudTicks');
            if (ticksContainer) {
                for (let i = 0; i < 60; i++) {
                const tick = document.createElement('span');
                tick.style.transform = `translate(-50%, -50%) rotate(${i * 6}deg) translateY(-138px)`;
                if (i % 5 === 0) {
                    tick.style.height = '14px';
                    tick.style.background = 'rgba(56,189,248,0.8)';
                }
                ticksContainer.appendChild(tick);
                }
            }

            // Stars
            const stars = [];
            const STAR_COUNT = 250;
            for (let i = 0; i < STAR_COUNT; i++) {
                stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.5 + 0.3,
                opacity: Math.random() * 0.8 + 0.2,
                twinkle: Math.random() * 0.02 + 0.005,
                twinkleDir: Math.random() > 0.5 ? 1 : -1,
                });
            }

            // Shooting stars
            const shootingStars = [];
            function spawnShootingStar() {
                const startX = Math.random() * W;
                const startY = Math.random() * H * 0.5;
                const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
                const speed = 8 + Math.random() * 10;
                shootingStars.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                length: 80 + Math.random() * 80,
                life: 1,
                decay: 0.008 + Math.random() * 0.012,
                color: Math.random() > 0.5 ? '#7dd3fc' : '#38bdf8',
                });
            }

            // Galaxy spiral particles
            const galaxyParticles = [];
            const GAL_COUNT = 150;
            const cx = W / 2, cy = H / 2;
            for (let i = 0; i < GAL_COUNT; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 50 + Math.random() * 400;
                galaxyParticles.push({
                angle: angle,
                dist: dist,
                speed: 0.0005 + (1 / dist) * 0.3,
                size: Math.random() * 1.2 + 0.3,
                color: ['#38bdf8', '#7dd3fc', '#0ea5e9', '#ffffff', '#1e40af'][Math.floor(Math.random() * 5)],
                opacity: Math.random() * 0.8 + 0.2,
                });
            }

            let frameCount = 0;
            function animate() {
                if (loader.classList.contains('hidden')) return;
                
                ctx.fillStyle = 'rgba(2, 5, 13, 0.25)';
                ctx.fillRect(0, 0, W, H);

                // Galaxy spiral
                galaxyParticles.forEach(p => {
                p.angle += p.speed;
                const x = cx + Math.cos(p.angle) * p.dist;
                const y = cy + Math.sin(p.angle) * p.dist * 0.4; // flatten for spiral effect
                
                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.shadowBlur = 6;
                ctx.shadowColor = p.color;
                ctx.fill();
                });
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;

                // Stars (twinkle)
                stars.forEach(s => {
                s.opacity += s.twinkle * s.twinkleDir;
                if (s.opacity > 1) { s.opacity = 1; s.twinkleDir = -1; }
                if (s.opacity < 0.1) { s.opacity = 0.1; s.twinkleDir = 1; }
                
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(224, 242, 254, ${s.opacity})`;
                ctx.fill();
                
                if (s.r > 1) {
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(56, 189, 248, ${s.opacity * 0.15})`;
                    ctx.fill();
                }
                });

                // Spawn shooting stars
                if (frameCount % 25 === 0 && Math.random() > 0.3) {
                spawnShootingStar();
                }
                if (frameCount % 80 === 0) {
                // burst of shooting stars
                for (let i = 0; i < 3; i++) spawnShootingStar();
                }

                // Draw shooting stars
                for (let i = shootingStars.length - 1; i >= 0; i--) {
                const ss = shootingStars[i];
                ss.x += ss.vx;
                ss.y += ss.vy;
                ss.life -= ss.decay;

                if (ss.life <= 0 || ss.x > W + 100 || ss.y > H + 100) {
                    shootingStars.splice(i, 1);
                    continue;
                }

                // Trail
                const tailX = ss.x - ss.vx * (ss.length / 10);
                const tailY = ss.y - ss.vy * (ss.length / 10);
                
                const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
                grad.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
                grad.addColorStop(0.3, `${ss.color}`);
                grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
                
                ctx.beginPath();
                ctx.moveTo(ss.x, ss.y);
                ctx.lineTo(tailX, tailY);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.shadowBlur = 12;
                ctx.shadowColor = ss.color;
                ctx.stroke();
                
                // Head glow
                ctx.beginPath();
                ctx.arc(ss.x, ss.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${ss.life})`;
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#7dd3fc';
                ctx.fill();
                
                ctx.shadowBlur = 0;
                }

                frameCount++;
                requestAnimationFrame(animate);
            }
            animate();

            // Resize
            window.addEventListener('resize', () => {
                W = canvas.width = window.innerWidth;
                H = canvas.height = window.innerHeight;
            });

            // Loader status messages
            const statusMessages = [
                'Booting J.A.R.V.I.S',
                'Calibrating arc reactor',
                'Loading neural matrix',
                'Syncing with satellites',
                'Initializing protocols',
                'Engaging suit systems',
                'Welcome back, Sir'
            ];
            let msgIdx = 0;
            let progress = 0;
            
            const progressInterval = setInterval(() => {
                progress += Math.random() * 4 + 1;
                if (progress >= 100) {
                progress = 100;
                percentEl.textContent = '100%';
                statusEl.innerHTML = 'Welcome back, Sir<span class="blink"></span>';
                clearInterval(progressInterval);
                
                // Hide loader after a moment
                setTimeout(() => {
                    loader.classList.add('hidden');
                    document.body.style.overflow = '';
                    // Remove from DOM after transition
                    setTimeout(() => loader.remove(), 900);
                }, 700);
                return;
                }
                percentEl.textContent = Math.floor(progress) + '%';
            }, 80);
            
            const msgInterval = setInterval(() => {
                msgIdx = (msgIdx + 1) % (statusMessages.length - 1);
                statusEl.innerHTML = statusMessages[msgIdx] + '<span class="blink"></span>';
            }, 600);
        
            // Lock scroll while loading
            document.body.style.overflow = 'hidden';
            
            // Cleanup msg interval on hide
            setTimeout(() => clearInterval(msgInterval), 5000);
            })();


            // --- Custom Cursor ---
            const cursor = document.getElementById('cursor');
            const ring = document.getElementById('cursorRing');
            let mx = 0, my = 0, rx = 0, ry = 0;

        document.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            cursor.style.left = mx + 'px';
            cursor.style.top = my + 'px';
        });
        function animateRing() {
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        document.querySelectorAll('a,button,input,textarea,select,.carousel-btn,.theme-toggle').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                ring.style.width = '52px';
                ring.style.height = '52px';
                ring.style.borderColor = 'var(--gold)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '12px';
                cursor.style.height = '12px';
                ring.style.width = '36px';
                ring.style.height = '36px';
                ring.style.borderColor = 'var(--gold)';
            });
        });

        // --- Theme Toggle ---
        const themeToggle = document.getElementById('themeToggle');
        const html = document.documentElement;
        const saved = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', saved);
        themeToggle.setAttribute('aria-label', saved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');

        themeToggle.addEventListener('click', () => {
            const cur = html.getAttribute('data-theme');
            const next = cur === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            themeToggle.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        });

        // --- Hamburger / Mobile Nav ---
        const hamburger = document.getElementById('hamburger');
        const mobileNav = document.getElementById('mobileNav');
        hamburger.addEventListener('click', () => {
            const open = mobileNav.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', open);
            document.body.style.overflow = open ? 'hidden' : '';
            });
        document.querySelectorAll('.mobile-link').forEach(a => {
            a.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', false);
                document.body.style.overflow = '';
            });
        });

        // --- Scroll Reveal ---
        const reveals = document.querySelectorAll('.reveal');
        const revealObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                e.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        reveals.forEach(r => revealObs.observe(r));

        // --- Counter Animation ---
        function animateCounters() {
        document.querySelectorAll('[data-count]').forEach(el => {
                const target = +el.dataset.count;
                let start = 0;
                const duration = 1800;
                const step = target / (duration / 16);
                const timer = setInterval(() => {
                start = Math.min(start + step, target);
                el.textContent = Math.floor(start) + (target >= 10 ? '+' : '');
                if (start >= target) clearInterval(timer);
            }, 16);
        });
        }
        const heroObs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                animateCounters();
                heroObs.disconnect();
            }
        }, { threshold: 0.5 });
        const heroCard = document.querySelector('.hero-card');
        if (heroCard) heroObs.observe(heroCard);

        // --- Carousel ---
        const track = document.getElementById('carouselTrack');
        const cards = track ? track.querySelectorAll('.project-card') : [];
        const dotsContainer = document.getElementById('carouselDots');
        let current = 0;
        const total = cards.length;

        if (total > 0 && dotsContainer) {
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Go to project ${i + 1}`);
            dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        }

        function goTo(n) {
            current = (n + total) % total;
            const gapVal = 32;
            track.style.transform = `translateX(calc(-${current} * (100% + ${gapVal}px)))`;
            dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
            d.setAttribute('aria-selected', i === current ? 'true' : 'false');
            });
        }

        document.getElementById('prevBtn').addEventListener('click', () => goTo(current - 1));
        document.getElementById('nextBtn').addEventListener('click', () => goTo(current + 1));

        let touchStartX = 0;
        track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
        }, { passive: true });

        let autoInterval = setInterval(() => goTo(current + 1), 6000);
        track.addEventListener('mouseenter', () => clearInterval(autoInterval));
        track.addEventListener('mouseleave', () => {
            clearInterval(autoInterval);
            autoInterval = setInterval(() => goTo(current + 1), 6000);
        });
        }

        // --- Multi-Step Form ---
        let currentStep = 1;
        function goToStep(step) {
        document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.form-step-indicator').forEach((s, i) => {
            s.classList.remove('active', 'done');
            if (i + 1 < step) s.classList.add('done');
            if (i + 1 === step) s.classList.add('active');
        });
        const panel = document.getElementById('panel' + step);
        if (panel) panel.classList.add('active');
        currentStep = step;
        }

        function nextStep(step) {
        if (step === 2) {
            const name = document.getElementById('fname').value.trim();
            const email = document.getElementById('femail').value.trim();
            if (!name) { document.getElementById('fname').focus(); return; }
            if (!email || !email.includes('@')) { document.getElementById('femail').focus(); return; }
        }
        goToStep(step);
        }
        function prevStep(step) { goToStep(step); }

        function submitForm() {
        document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
        const success = document.getElementById('formSuccess');
        success.classList.add('visible');
        document.querySelectorAll('.form-step-indicator').forEach(s => {
            s.classList.remove('active');
            s.classList.add('done');
        });
        }

        // --- Service Card Mouse Track ---
        function trackMouse(e, el) {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--mx', x + '%');
        el.style.setProperty('--my', y + '%');
        }

        // --- Orbital Canvas (Profile) - BLUE THEME ---
        (function() {
        const canvas = document.getElementById('orbitalCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = 180, H = 180, CX = W/2, CY = H/2;

        const orbitals = [
            { rx: 82, ry: 22, tilt: 0,   speed: 0.7,  angle: 0,    dotR: 5,   color: '#38bdf8', trail: true,  trailLen: 60 },
            { rx: 72, ry: 20, tilt: 60,  speed: -1.1, angle: 2.1,  dotR: 4,   color: '#0ea5e9', trail: true,  trailLen: 48 },
            { rx: 54, ry: 14, tilt: 120, speed: 1.7,  angle: 1.0,  dotR: 3,   color: '#7dd3fc', trail: false, trailLen: 0  },
            { rx: 88, ry: 28, tilt: 30,  speed: 2.4,  angle: 4.5,  dotR: 2.5, color: '#e0f2fe', trail: false, trailLen: 0  },
            { rx: 88, ry: 28, tilt: 30,  speed: 2.4,  angle: 1.3,  dotR: 2.5, color: '#1e40af', trail: false, trailLen: 0  },
        ];

        orbitals.forEach(o => { if (o.trail) o.history = []; });

        let raf;
        function getEllipsePoint(rx, ry, tiltDeg, angle) {
            const t = tiltDeg * Math.PI / 180;
            const x = rx * Math.cos(angle);
            const y = ry * Math.sin(angle);
            return {
            x: CX + x * Math.cos(t) - y * Math.sin(t),
            y: CY + x * Math.sin(t) + y * Math.cos(t),
            };
        }

        function drawOrbitEllipse(rx, ry, tiltDeg, color) {
            const t = tiltDeg * Math.PI / 180;
            ctx.save();
            ctx.translate(CX, CY);
            ctx.rotate(t);
            ctx.beginPath();
            ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
            ctx.globalAlpha = 0.18;
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function hexToRgb(hex) {
            const r = parseInt(hex.slice(1,3),16);
            const g = parseInt(hex.slice(3,5),16);
            const b = parseInt(hex.slice(5,7),16);
            return `${r},${g},${b}`;
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            const grd = ctx.createRadialGradient(CX, CY, 10, CX, CY, 60);
            grd.addColorStop(0, 'rgba(56,189,248,0.12)');
            grd.addColorStop(1, 'rgba(56,189,248,0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(CX, CY, 60, 0, Math.PI*2);
            ctx.fill();

            orbitals.forEach(o => {
            drawOrbitEllipse(o.rx, o.ry, o.tilt, o.color);
            o.angle += o.speed * 0.012;
            const pt = getEllipsePoint(o.rx, o.ry, o.tilt, o.angle);

            if (o.trail) {
                o.history.push({...pt});
                if (o.history.length > o.trailLen) o.history.shift();
                for (let i = 0; i < o.history.length; i++) {
                const alpha = (i / o.history.length) * 0.55;
                const size = o.dotR * (i / o.history.length) * 0.8;
                ctx.beginPath();
                ctx.arc(o.history[i].x, o.history[i].y, Math.max(size,0.5), 0, Math.PI*2);
                ctx.fillStyle = `rgba(${hexToRgb(o.color)},${alpha})`;
                ctx.fill();
                }
            }

            const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, o.dotR * 3);
            glow.addColorStop(0, `rgba(${hexToRgb(o.color)},0.9)`);
            glow.addColorStop(0.4, `rgba(${hexToRgb(o.color)},0.35)`);
            glow.addColorStop(1, `rgba(${hexToRgb(o.color)},0)`);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, o.dotR * 3, 0, Math.PI*2);
            ctx.fillStyle = glow;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(pt.x, pt.y, o.dotR, 0, Math.PI*2);
            ctx.fillStyle = o.color;
            ctx.fill();
            });

            raf = requestAnimationFrame(draw);
        }

        raf = requestAnimationFrame(draw);

        const visObs = new IntersectionObserver(en => {
            if (!en[0].isIntersecting) { cancelAnimationFrame(raf); }
            else { raf = requestAnimationFrame(draw); }
        }, { threshold: 0.1 });
        visObs.observe(canvas);
        })();

        document.getElementById('year').textContent = new Date().getFullYear();

        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');
        const scrollSpy = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
            navLinks.forEach(l => {
                l.style.color = l.getAttribute('href') === '#' + e.target.id ? 'var(--gold)' : '';
            });
            }
        });
        }, { threshold: 0.4 });
        sections.forEach(s => scrollSpy.observe(s));