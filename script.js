(() => {
    "use strict";

    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const email = "madansingh7@yahoo.com";
    const github = "https://github.com/madansingh7";
    const linkedin = "https://www.linkedin.com/in/madansingh7";
    const leetcode = "https://leetcode.com/u/madansingh7/";

    function initTheme() {
        const toggle = document.getElementById("theme-toggle");
        let preferred;
        try {
            preferred = localStorage.getItem("theme");
        } catch {
            // The theme can still change when storage is unavailable.
        }

        function apply(theme) {
            root.dataset.theme = theme;
            document.querySelector('meta[name="theme-color"]')
                ?.setAttribute("content", theme === "dark" ? "#241b17" : "#f4efe4");
            const nextTheme = theme === "dark" ? "light" : "dark";
            const description = "Switch to " + nextTheme + " theme";
            toggle?.setAttribute("aria-label", description);
            toggle?.setAttribute("title", description);
        }

        apply(preferred === "dark" || preferred === "light" ? preferred : root.dataset.theme || "light");
        const toggleTheme = () => {
            const theme = root.dataset.theme === "dark" ? "light" : "dark";
            apply(theme);
            try {
                localStorage.setItem("theme", theme);
            } catch {
                // Keep the current view usable without storage.
            }
            return theme;
        };

        toggle?.addEventListener("click", toggleTheme);
        return toggleTheme;
    }

    function initNavigation() {
        const menu = document.getElementById("site-nav");
        const toggle = document.getElementById("menu-toggle");
        if (!menu || !toggle) return;

        function setOpen(open) {
            menu.classList.toggle("is-menu-open", open);
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        }

        function isOpen() {
            return toggle.getAttribute("aria-expanded") === "true";
        }

        setOpen(false);
        root.classList.add("is-nav-ready");
        toggle.addEventListener("click", () => setOpen(!isOpen()));
        menu.addEventListener("click", (event) => {
            if (!event.target.closest("a[href]")) return;
            setOpen(false);
        });
        document.addEventListener("click", (event) => {
            if (isOpen() && !menu.contains(event.target) && !toggle.contains(event.target)) {
                setOpen(false);
            }
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && isOpen() && !event.defaultPrevented) {
                setOpen(false);
                toggle.focus();
            }
        });
        window.addEventListener("resize", () => {
            if (isOpen() && !toggle.getClientRects().length) setOpen(false);
        }, { passive: true });
    }

    function initScroll() {
        const progress = document.getElementById("scroll-progress");
        const sections = Array.from(document.querySelectorAll("main [id]"));
        const entries = Array.from(document.querySelectorAll("a[data-nav-link]"))
            .map((link) => ({
                link,
                section: document.getElementById(link.hash.slice(1))
            }))
            .filter(({ section }) => section)
            .sort((left, right) => sections.indexOf(left.section) - sections.indexOf(right.section));

        let scheduled = false;
        let current;
        function update() {
            scheduled = false;
            const scrollable = Math.max(0, root.scrollHeight - root.clientHeight);
            const distance = Math.min(Math.max(0, window.scrollY), scrollable);
            progress?.style.setProperty("--scroll-progress", scrollable ? distance / scrollable : 0);
            root.classList.toggle("is-scrolled", distance > 12);

            const threshold = Math.min(200, window.innerHeight * 0.32);
            const active = scrollable > 0 && distance >= scrollable - 2
                ? entries.at(-1)
                : entries.findLast(({ section }) => section.getBoundingClientRect().top <= threshold);
            if (current !== active) {
                current?.link.removeAttribute("aria-current");
                active?.link.setAttribute("aria-current", "location");
                current = active;
            }
        }

        function schedule() {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(update);
        }

        update();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule, { passive: true });
        window.addEventListener("load", schedule, { once: true });
    }

    function initReveal() {
        if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

        const items = document.querySelectorAll("[data-reveal]");
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        }, { rootMargin: "0px 0px -4% 0px" });

        root.classList.add("is-reveal-ready");
        items.forEach((item) => observer.observe(item));
    }

    function initTilt() {
        const visual = document.querySelector("#hero-visual[data-tilt]");
        if (!visual) return;

        const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)");
        const properties = ["--tilt-x", "--tilt-y", "--pointer-x", "--pointer-y"];
        let bounds;
        function reset() {
            bounds = undefined;
            properties.forEach((property) => visual.style.removeProperty(property));
        }

        visual.addEventListener("pointermove", (event) => {
            if (reducedMotion.matches || !finePointer.matches || event.pointerType === "touch") return;
            bounds ??= visual.getBoundingClientRect();
            const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
            const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
            visual.style.setProperty("--tilt-x", ((0.5 - y) * 8).toFixed(2) + "deg");
            visual.style.setProperty("--tilt-y", ((x - 0.5) * 10).toFixed(2) + "deg");
            visual.style.setProperty("--pointer-x", (x * 100).toFixed(1) + "%");
            visual.style.setProperty("--pointer-y", (y * 100).toFixed(1) + "%");
        }, { passive: true });
        visual.addEventListener("pointerleave", reset);
        visual.addEventListener("pointercancel", reset);
        window.addEventListener("resize", reset, { passive: true });
        window.addEventListener("scroll", () => { bounds = undefined; }, { passive: true });
        reducedMotion.addEventListener("change", reset);
        finePointer.addEventListener("change", reset);
    }

    function initDialogs() {
        document.querySelectorAll("[data-open-dialog]").forEach((trigger) => {
            const dialog = document.getElementById(trigger.dataset.openDialog);
            if (!dialog?.showModal) return;

            trigger.addEventListener("click", () => {
                if (dialog.open) return;
                dialog.showModal();
                dialog.addEventListener("close", () => {
                    const focusTarget = trigger.getClientRects().length
                        ? trigger
                        : document.getElementById("menu-toggle");
                    focusTarget?.focus({ preventScroll: true });
                }, { once: true });
            });
        });

        document.querySelectorAll("dialog").forEach((dialog) => {
            dialog.querySelectorAll("[data-close-dialog]").forEach((button) => {
                button.addEventListener("click", () => dialog.close());
            });

            function outside(event) {
                const { top, right, bottom, left } = dialog.getBoundingClientRect();
                return event.target === dialog && (
                    event.clientX < left || event.clientX > right ||
                    event.clientY < top || event.clientY > bottom
                );
            }

            let backdropPress = false;
            dialog.addEventListener("pointerdown", (event) => {
                backdropPress = outside(event);
            });
            dialog.addEventListener("click", (event) => {
                if (backdropPress && outside(event)) dialog.close();
                backdropPress = false;
            });
        });
    }

    function appendLine(log, className, content) {
        const line = document.createElement("div");
        line.className = className;
        line.append(content);
        log.append(line);
        log.scrollTop = log.scrollHeight;
        return line;
    }

    function initTerminal(toggleTheme) {
        const form = document.getElementById("terminal-form");
        const input = document.getElementById("terminal-input");
        const output = document.getElementById("terminal-output");
        if (!form || !input || !output) return;

        const commandHistory = [];
        let historyIndex = 0;
        let draft = "";
        const responses = {
            help: "about · skills · projects · contact · theme · clear\nUse the up and down keys to revisit commands.",
            about: "Madan Singh Rajpurohit is a computer science and engineering student at SDMCET, Dharwad. First-year CGPA: 9.36/10.",
            skills: "Languages: C++, Java, Python, C\nWeb: HTML, CSS, JavaScript, basic PHP\nAPIs and tools: Gemini, NVIDIA, Git, Linux, VS Code and Eclipse",
            projects: "Investment Scam Detector\nMulti-Modal Evidence Review\nAI Image Detector\nAmazon E-Commerce Clone",
            contact: "Email: " + email + "\nLinkedIn: linkedin.com/in/madansingh7\nGitHub: github.com/madansingh7"
        };

        function run(value) {
            const raw = value.trim();
            if (!raw) return;
            if (commandHistory.at(-1) !== raw) commandHistory.push(raw);
            historyIndex = commandHistory.length;
            draft = "";
            input.value = "";

            const command = raw.toLowerCase();
            if (command === "clear") {
                output.replaceChildren();
                return;
            }

            const prompt = document.createElement("span");
            prompt.className = "terminal-prompt";
            prompt.textContent = "$ ";
            appendLine(output, "terminal-line terminal-echo", prompt).append(raw);
            const response = command === "theme"
                ? "Switched to " + toggleTheme() + " theme."
                : Object.hasOwn(responses, command)
                    ? responses[command]
                    : "Unknown command: " + raw + ". Type help to see available commands.";
            appendLine(output, "terminal-line", response);
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            run(input.value);
        });
        input.addEventListener("keydown", (event) => {
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
            if (!commandHistory.length) return;
            event.preventDefault();
            if (historyIndex === commandHistory.length) draft = input.value;
            const step = event.key === "ArrowUp" ? -1 : 1;
            historyIndex = Math.max(0, Math.min(commandHistory.length, historyIndex + step));
            input.value = commandHistory[historyIndex] ?? draft;
            input.setSelectionRange(input.value.length, input.value.length);
        });
        document.querySelectorAll("[data-command]").forEach((button) => {
            button.addEventListener("click", () => {
                run(button.dataset.command);
                input.focus();
            });
        });
    }

    function initProton() {
        const form = document.getElementById("proton-form");
        const input = document.getElementById("proton-input");
        const output = document.getElementById("proton-output");
        if (!form || !input || !output) return;

        const answers = [
            {
                match: /\b(gpa|cgpa|grade|grades|marks|academic score)\b/i,
                text: "Madan earned a 9.36/10 CGPA in his first year of engineering."
            },
            {
                match: /\b(leetcode|problems solved|coding progress|dsa problems)\b/i,
                text: () => {
                    const count = document.getElementById("leetcode-count")?.dataset.countTo;
                    const live = document.getElementById("leetcode-count-suffix")?.hidden;
                    return count
                        ? "Madan has solved " + (live ? "" : "at least ") + count + " LeetCode problems. His public profile has the latest activity."
                        : "Madan practices data structures and algorithms on LeetCode.";
                },
                links: [["LeetCode", leetcode]]
            },
            {
                match: /\b(projects?|built|build|building|portfolio work|scam detector|evidence review|pipeline|image detector|amazon clone|hackathons?)\b/i,
                text: "Madan’s featured work includes an investment risk checker, a Gemini-based insurance evidence review pipeline, an AI image detector, and an e-commerce layout study.",
                links: [["Selected work", "#projects"]]
            },
            {
                match: /\b(skills?|languages?|technologies|java|python|javascript|html|css|programming|tech stack|stack|tools?)\b|\bc\+\+/i,
                text: "Madan works with C++, Java, Python, HTML, CSS and JavaScript. His projects also use Gemini and NVIDIA APIs. He uses Git, GitHub and Linux in his workflow.",
                links: [["Technical stack", "#skills"]]
            },
            {
                match: /\b(certifications?|certificates?|hackerrank|deloitte|orchestrate|achievements?|credentials?|awards|job simulation)\b/i,
                text: "Madan’s credentials include NPTEL’s Programming in Modern C++, HackerRank Orchestrate, HackerRank Problem Solving (Basic), and Deloitte’s cyber job simulation on Forage.",
                links: [["Credentials", "#certifications"]]
            },
            {
                match: /\b(education|college|study|studying|degree|sdmcet|university|school|academics)\b/i,
                text: "Madan has been studying Computer Science & Engineering at SDM College of Engineering & Technology (SDMCET) in Dharwad since September 2024."
            },
            {
                match: /\b(career|goals|internships?|hiring|job|position|open to work)\b/i,
                text: "Madan is open to software engineering internships and collaborations in backend development, web engineering, and AI integrations.",
                links: [["Email Madan", "mailto:" + email], ["LinkedIn", linkedin]]
            },
            {
                match: /\b(github|git profile|repository|repositories|repos|open source)\b/i,
                text: "Madan’s repositories and contributions are available on GitHub.",
                links: [["GitHub", github]]
            },
            {
                match: /\b(linkedin|professional profile)\b/i,
                text: "You can connect with Madan on LinkedIn.",
                links: [["LinkedIn", linkedin]]
            },
            {
                match: /\b(contact|email|phone|reach|message|mail|connect)\b/i,
                text: "Reach Madan at " + email + " or connect on LinkedIn.",
                links: [["Email Madan", "mailto:" + email], ["LinkedIn", linkedin]]
            },
            {
                match: /\b(about|who is|who are you|biography|profile|madan singh|intro)\b/i,
                text: "Madan Singh Rajpurohit studies Computer Science & Engineering at SDMCET. He’s interested in building for the web, working with AI APIs, and solving algorithmic problems."
            },
            {
                match: /\b(hello|hi|hey|greetings)\b/i,
                text: "Hi, I’m Proton. Ask me about Madan’s projects, skills, education, or how to get in touch."
            }
        ];

        function appendMessage(sender, text) {
            const speaker = document.createElement("span");
            speaker.className = "sr-only";
            speaker.textContent = sender === "user" ? "You: " : "Proton: ";
            const line = appendLine(output, "chat-message chat-" + sender, speaker);
            line.append(text);
            return line;
        }

        function respond(question) {
            const value = question.trim();
            if (!value) return;
            input.value = "";
            appendMessage("user", value);
            const answer = answers.find(({ match }) => match.test(value));
            const reply = answer
                ? (typeof answer.text === "function" ? answer.text() : answer.text)
                : "Try asking about Madan’s projects, technical skills, education, credentials, or contact details.";
            const line = appendMessage("assistant", reply);

            if (answer?.links) {
                const links = document.createElement("div");
                links.className = "chat-links";
                for (const [label, href] of answer.links) {
                    const link = document.createElement("a");
                    link.textContent = label;
                    link.href = href;
                    if (href.startsWith("https:")) {
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";
                    } else if (href.startsWith("#")) {
                        link.addEventListener("click", () => link.closest("dialog")?.close());
                    }
                    links.append(link);
                }
                line.append(links);
            }
            output.scrollTop = output.scrollHeight;
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            respond(input.value);
        });
        document.querySelectorAll("[data-question]").forEach((button) => {
            button.addEventListener("click", () => {
                respond(button.dataset.question);
                input.focus();
            });
        });
    }

    function initContact() {
        const form = document.getElementById("contact-form");
        const nameField = document.getElementById("contact-name");
        const emailField = document.getElementById("contact-email");
        const messageField = document.getElementById("contact-message");
        const status = document.getElementById("contact-status");
        if (!form || !nameField || !emailField || !messageField || !status) return;

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const name = nameField.value.trim();
            const sender = emailField.value.trim();
            const message = messageField.value.trim();
            if (!name || !sender || !message) {
                status.textContent = "Enter your name, email, and message.";
                (!name ? nameField : !sender ? emailField : messageField).focus();
                return;
            }

            const subject = encodeURIComponent("Portfolio inquiry from " + name);
            const body = encodeURIComponent(
                "Hi Madan,\n\n" + message + "\n\nBest regards,\n" + name + "\nEmail: " + sender
            );
            status.textContent = "Opening a draft in your email app.";
            window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;
        });
    }

    function initCounters(counting) {
        if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

        const stats = document.querySelectorAll("[data-count-to]");
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const stat = entry.target;
                observer.unobserve(stat);
                counting.add(stat);
                const start = performance.now();

                function frame(now) {
                    const progress = reducedMotion.matches ? 1 : Math.min(1, (now - start) / 850);
                    const target = Number(stat.dataset.countTo);
                    const precision = stat.dataset.countTo.split(".")[1]?.length ?? 0;
                    const value = target * (1 - Math.pow(1 - progress, 3));
                    stat.textContent = value.toFixed(precision);
                    if (progress < 1) {
                        requestAnimationFrame(frame);
                    } else {
                        counting.delete(stat);
                    }
                }

                requestAnimationFrame(frame);
            }
        }, { threshold: 0.5 });

        stats.forEach((stat) => observer.observe(stat));
    }

    async function loadLeetCodeCount(counting) {
        const count = document.getElementById("leetcode-count");
        if (!count) return;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6500);
        try {
            const response = await fetch("https://leetcode-api-faisalshohag.vercel.app/madansingh7", {
                signal: controller.signal
            });
            if (!response.ok) return;
            const { totalSolved } = await response.json();
            if (!Number.isSafeInteger(totalSolved) || totalSolved < 0) return;

            count.dataset.countTo = String(totalSolved);
            const suffix = document.getElementById("leetcode-count-suffix");
            if (suffix) suffix.hidden = true;
            if (!counting.has(count)) count.textContent = String(totalSolved);
        } catch {
            // The static count stays available if the public API cannot be reached.
        } finally {
            clearTimeout(timeout);
        }
    }

    function init() {
        const toggleTheme = initTheme();
        initNavigation();
        initScroll();
        initReveal();
        initTilt();
        initDialogs();
        initTerminal(toggleTheme);
        initProton();
        initContact();
        const counting = new WeakSet();
        initCounters(counting);
        loadLeetCodeCount(counting);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
