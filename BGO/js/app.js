// Main Router and Core Controller for BGO Web App

// Hash routes configuration mapping
const ROUTES = {
    "#home": () => BGO_PAGES.home(),
    "#about": () => BGO_PAGES.about(),
    "#founder": () => BGO_PAGES.founder(),
    "#services": () => BGO_PAGES.services(),
    "#jobs": () => BGO_PAGES.jobs(),
    "#medical": () => BGO_PAGES.medical(),
    "#legal": () => BGO_PAGES.legal(),
    "#transfer": () => BGO_PAGES.transfer(),
    "#news": () => BGO_PAGES.news(),
    "#gallery": () => BGO_PAGES.gallery(),
    "#membership": () => BGO_PAGES.membership(),
    "#contact": () => BGO_PAGES.contact(),
    "#contact-page": () => BGO_PAGES.contact(),
    "#dashboard": () => BGO_PAGES.dashboard(),
    "#admin": () => BGO_PAGES.admin(),
    "#privacy": () => BGO_PAGES.privacy(),
    "#terms": () => BGO_PAGES.terms()
};

const PUBLIC_ROUTES = [
    "#home", "#membership"
];

function router() {
    initNavbarAuthStates();
    const hash = window.location.hash || "#home";
    const user = BGO_AUTH.getCurrentUser();

    // 1. Strict Visitor Access Control Guard
    // Only #home and #membership are accessible to visitors who are not logged in.
    if (!BGO_AUTH.isLoggedIn() && hash !== "#home" && hash !== "" && hash !== "#membership") {
        const pageNames = {
            "#about": "About Us",
            "#founder": "EXCOM Founder Message",
            "#services": "Core Services",
            "#jobs": "Verified Job Opportunities",
            "#medical": "Medical Assistance",
            "#legal": "Legal Aid Guidance",
            "#transfer": "Document Transfer",
            "#news": "News & Circulars",
            "#gallery": "Media Gallery",
            "#contact": "Contact Directory",
            "#contact-page": "Contact Directory",
            "#dashboard": "Member Dashboard",
            "#admin": "Admin & Moderator Portal",
            "#privacy": "Privacy Policy",
            "#terms": "Terms & Conditions"
        };
        const pageTitle = pageNames[hash] || "this restricted section";
        
        BGO_DB.addAuditLog("VISITOR_ACCESS_BLOCKED", `Unauthenticated visitor attempted access to restricted route [${hash}]. Redirecting to #membership.`);
        alert(`🔒 Visitor Access Control: Only the Home Page is accessible to visitors. Log in or register as a member to access "${pageTitle}".`);
        window.location.hash = "#membership";
        return;
    }

    // 2. Pending Approval Guard for Logged-In Members
    if (user && (user.status === "pending" || user.status === "visitor")) {
        if (hash === "#dashboard" || hash === "#admin") {
            BGO_DB.addAuditLog("PENDING_USER_ACCESS", `Pending user @${user.username} attempted access to [${hash}] before admin approval.`);
            alert("⏳ Account Pending Approval: Your registration is currently in Visitor / Pending Approval status. Please wait for an Admin or Super Admin to review and approve your application before accessing dashboard features.");
            window.location.hash = "#membership";
            return;
        }
    }
    
    // 3. Role Guard for Moderator / Admin Portal (#admin)
    if (hash === "#admin" && !BGO_AUTH.isAdminOrExecutive()) {
        const username = user ? `@${user.username}` : "Unauthenticated Visitor";
        BGO_DB.addAuditLog("PERMISSION_VIOLATION", `Security Alert: ${username} attempted unauthorized access to restricted #admin route.`);
        alert("Access Denied: You do not have permission to access the Moderator/Admin Portal.");
        window.location.hash = user ? "#dashboard" : "#membership";
        return;
    }

    const routeAction = ROUTES[hash];
    if (routeAction) {
        routeAction();
        updateActiveNav(hash);
    } else {
        // Fallback to home
        window.location.hash = "#home";
    }

    // Dynamic SEO Title & Meta Description updating per route
    const pageSeoData = {
        "#home": { title: "Bahmani Group Oman (BGO) | Connecting Gulbarga People Across Oman", desc: "Bahmani Group Oman (BGO) connects the Kalaburagi/Gulbarga community living in Sultanate of Oman. Verified jobs, medical aid, document transfers & welfare." },
        "#about": { title: "About Us | Bahmani Group Oman (BGO)", desc: "Learn about Bahmani Group Oman (BGO), our mission, community history, and welfare initiatives for Gulbarga expats in Oman." },
        "#founder": { title: "EXCOM Leadership Message | Bahmani Group Oman", desc: "Read the official address and vision from BGO Executive Leadership & Founders." },
        "#services": { title: "Community Welfare Services | BGO Oman", desc: "Explore core services offered by BGO Oman: job verification, medical aid, legal assistance, emergency document transfers & volunteer network." },
        "#jobs": { title: "Verified Job Opportunities | BGO Oman Job Portal", desc: "Browse verified job vacancies in Oman posted by BGO community members and Omani enterprises." },
        "#medical": { title: "Medical Aid & Emergency Support | BGO Oman", desc: "Urgent medical assistance, blood donation requests, and hospital support for Gulbarga residents in Oman." },
        "#legal": { title: "Legal Aid Guidance | BGO Oman", desc: "Legal consultation and guidance for Omani labor laws, visa requirements, and employment rights." },
        "#transfer": { title: "Emergency Document Transfer | BGO Oman", desc: "Coordinate document transfers and urgent deliveries between Muscat, Oman and Gulbarga / Kalaburagi, India." },
        "#news": { title: "News & Community Circulars | BGO Oman", desc: "Stay updated with recent Oman visa rules, Gulbarga flight announcements, and BGO community circulars." },
        "#gallery": { title: "Media Gallery & Event Photos | BGO Oman", desc: "Explore photo highlights from BGO annual meetings, Bahmani Super League cricket, blood donation camps, and family gatherings." },
        "#membership": { title: "Member Registration & Portal | BGO Oman", desc: "Register as an official BGO member or log in to access member services across the Sultanate of Oman." },
        "#contact": { title: "Contact Us & Executive Leadership | BGO Oman", desc: "Get in touch with BGO Executive Committee officers, regional representatives, and emergency helpline coordinators." },
        "#contact-page": { title: "Contact Us & Executive Leadership | BGO Oman", desc: "Get in touch with BGO Executive Committee officers, regional representatives, and emergency helpline coordinators." },
        "#dashboard": { title: "Member Dashboard | BGO Oman", desc: "Manage your BGO member profile, track travel schedules, job listings, and community requests." },
        "#admin": { title: "Moderator & Administrative Portal | BGO Oman", desc: "Administrative control panel for BGO Super Admins, Admins, and Executive Officers." },
        "#privacy": { title: "Privacy Policy | BGO Oman", desc: "Official Privacy Policy of Bahmani Group Oman regarding member data protection and privacy." },
        "#terms": { title: "Terms & Conditions | BGO Oman", desc: "Terms of service and usage conditions for Bahmani Group Oman online services and membership." }
    };

    const targetHash = pageSeoData[hash] ? hash : "#home";
    const seo = pageSeoData[targetHash];
    document.title = seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", seo.desc);
    }

    // Close mobile nav menu if open on page transition
    const navMenu = document.getElementById("nav-menu");
    if (navMenu) {
        navMenu.classList.remove("active");
    }
}

// Nav link highlighting coordinator
function updateActiveNav(activeHash) {
    const navLinks = document.querySelectorAll(".nav-link");
    
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === activeHash || (activeHash === "#contact-page" && href === "#contact") || (activeHash === "#contact" && href === "#contact-page")) {
            link.classList.add("active");
        } else {
            // Also match if sub-page targets match
            if (activeHash === "#dashboard" && href === "#membership") {
                link.classList.add("active");
            } else if (activeHash === "#admin" && href === "#membership") {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        }
    });
}

// Handle login state changes dynamically in the header
function initNavbarAuthStates() {
    const loginCta = document.getElementById("login-cta-container");
    const dashboardLink = document.getElementById("nav-dashboard-link");
    const adminLink = document.getElementById("nav-admin-link");
    
    const user = BGO_AUTH.getCurrentUser();
    
    if (user) {
        // Show Logout button
        if (loginCta) {
            loginCta.innerHTML = `
                <span class="user-greeting-header">
                    Hi, ${user.fullName.split(' ')[0]}
                </span>
                <button onclick="BGO_AUTH.logout()" class="login-action-btn logout-btn" data-i18n="btn_logout" style="background-color:transparent; border:1px solid var(--secondary-color); color:var(--secondary-color); font-weight:700; white-space:nowrap; flex-shrink:0;">
                    Log Out
                </button>
            `;
        }
        
        // Show correct dashboard links based on role
        if (user.role === "admin" || user.role === "superadmin" || user.role === "executive") {
            if (adminLink) {
                adminLink.style.display = "block";
                adminLink.textContent = (user.role === "admin" || user.role === "superadmin") ? "Admin Panel" : "Executive Panel";
            }
            if (dashboardLink) dashboardLink.style.display = "none";
        } else {
            if (adminLink) adminLink.style.display = "none";
            if (dashboardLink) dashboardLink.style.display = "block";
        }
    } else {
        // Show Login button
        if (loginCta) {
            loginCta.innerHTML = `
                <button onclick="window.location.hash='#membership'" class="login-action-btn" data-i18n="btn_login">
                    Member Login
                </button>
            `;
        }
        if (dashboardLink) dashboardLink.style.display = "none";
        if (adminLink) adminLink.style.display = "none";
    }
    
    // Apply translations to the header
    if (typeof applyTranslations === "function") {
        applyTranslations();
    }
}

// Theme management (Dark / Light mode toggle)
function initTheme() {
    const savedTheme = localStorage.getItem("bgo_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("bgo_theme", newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
        themeBtn.innerHTML = theme === "dark" ? "☀️" : "🌙";
    }
}

// Mobile Navbar toggler
function toggleMobileMenu() {
    const navMenu = document.getElementById("nav-menu");
    if (navMenu) {
        navMenu.classList.toggle("active");
    }
}

// Navigation Dropdown Menu Toggler
function toggleNavDropdown(e) {
    if (e) e.stopPropagation();
    const content = document.getElementById("nav-dropdown-content");
    const wrapper = document.getElementById("nav-dropdown-wrapper");
    if (content) {
        content.classList.toggle("show");
    }
    if (wrapper) {
        wrapper.classList.toggle("active");
    }
}

function closeNavDropdown() {
    const content = document.getElementById("nav-dropdown-content");
    const wrapper = document.getElementById("nav-dropdown-wrapper");
    if (content) {
        content.classList.remove("show");
    }
    if (wrapper) {
        wrapper.classList.remove("active");
    }
}

// Interactive Page Zoom Controller Engine
const BGO_APP = {
    currentZoom: 100,

    initZoom() {
        const savedZoom = localStorage.getItem("bgo_zoom_level");
        if (savedZoom) {
            this.currentZoom = parseInt(savedZoom, 10) || 100;
        }
        this.applyZoom();
    },

    zoomOut() {
        if (this.currentZoom > 70) {
            this.currentZoom -= 10;
            this.applyZoom();
        }
    },

    zoomIn() {
        if (this.currentZoom < 140) {
            this.currentZoom += 10;
            this.applyZoom();
        }
    },

    resetZoom() {
        this.currentZoom = 100;
        this.applyZoom();
    },

    applyZoom() {
        const scale = this.currentZoom / 100;
        document.body.style.zoom = scale;
        
        // Fallback scaling for browsers requiring transform
        if (typeof document.body.style.zoom === "undefined" || document.body.style.zoom === "") {
            document.body.style.transform = `scale(${scale})`;
            document.body.style.transformOrigin = "top center";
        }

        const badge = document.getElementById("zoom-level-badge");
        if (badge) {
            badge.innerText = `${this.currentZoom}%`;
        }
        localStorage.setItem("bgo_zoom_level", this.currentZoom);
    }
};

// Listeners Registration
window.addEventListener("hashchange", router);

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    BGO_APP.initZoom();
    initNavbarAuthStates();
    router();
    
    // Set active language selector value
    const langSelect = document.getElementById("lang-selector");
    if (langSelect && typeof currentLang !== "undefined") {
        langSelect.value = currentLang;
    }

    // Global Modal Backdrop Click-to-Dismiss Handler (Prevents UI from freezing/stucking)
    document.addEventListener("click", (e) => {
        if (e.target && e.target.classList && e.target.classList.contains("modal-overlay")) {
            e.target.classList.remove("active");
        }
    });
});
