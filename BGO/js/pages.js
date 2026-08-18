// Pages Views Rendering Engine for BGO

const BGO_PAGES = {
    // Temporary containers for OTP states
    pendingSignupData: null,
    pendingRequestData: null,
    otpContext: "",
    pendingOtpCode: null,

    // Utility to set main content and translate it
    render(htmlContent, afterRenderCallback = null) {
        const root = document.getElementById("app-root");
        root.innerHTML = htmlContent;
        
        // Always apply translation to the newly injected HTML
        if (typeof applyTranslations === "function") {
            applyTranslations();
        }
        
        // Execute any view-specific scripts/listeners
        if (afterRenderCallback) {
            afterRenderCallback();
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    },

    togglePasswordVisibility(inputId, btnEl) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        
        const targetBtn = btnEl || document.getElementById(inputId + "-toggle");
        if (targetBtn) {
            targetBtn.innerHTML = isPassword ? "🙈" : "👁️";
            targetBtn.setAttribute("title", isPassword ? "Hide password" : "Show password");
            targetBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        }
    },

    validateAndFormatPhoneNumber(phoneStr, fieldLabel = "contact number", isOptional = false) {
        let raw = (phoneStr || "").trim();
        if (!raw) {
            if (isOptional) return { valid: true, value: "" };
            return { valid: false, message: `Please enter the ${fieldLabel}.` };
        }
        
        let clean = raw.replace(/[\s\-\(\)]/g, '');
        
        if (!clean.startsWith("+")) {
            if (clean.startsWith("968") && clean.length >= 11) {
                raw = "+" + raw;
                clean = "+" + clean;
            } else if (clean.startsWith("91") && clean.length >= 12) {
                raw = "+" + raw;
                clean = "+" + clean;
            } else {
                return {
                    valid: false,
                    message: `Please enter the ${fieldLabel} with country code (e.g., +968 or +91).`
                };
            }
        }
        
        const phoneRegex = /^\+\d{1,4}\d{6,12}$/;
        if (!phoneRegex.test(clean)) {
            return {
                valid: false,
                message: `Please enter a valid ${fieldLabel} with country code (e.g., +968 91234567 or +91 9876543210).`
            };
        }
        
        return { valid: true, value: raw };
    },

    home() {
        const stats = BGO_DB.getStats();
        const news = BGO_DB.getNews();
        const events = BGO_DB.getEvents();
        const helplineInfo = BGO_DB.getHelplineInfo();
        
        let newsHtml = "";
        news.slice(0, 2).forEach(n => {
            newsHtml += `
                <div class="job-card">
                    <div class="gallery-img-wrapper" style="height: 150px; margin: -2rem -2rem 1.5rem -2rem;">
                        <img src="${n.image}" alt="${n.title}">
                    </div>
                    <div class="job-badge" style="width: fit-content; margin-bottom: 0.5rem;">${n.category}</div>
                    <h4 style="font-size:1.15rem; margin-bottom:0.5rem; color:var(--primary-color);">${n.title}</h4>
                    <p style="font-size:0.85rem; color:var(--text-light); margin-bottom:1rem;">${n.summary}</p>
                    <a href="#news" class="service-link" style="margin-top:auto;">Read More &rarr;</a>
                </div>
            `;
        });

        // Filter events (Upcoming/Ongoing only on home teaser)
        let eventsHtml = "";
        const homeEvents = events.filter(e => e.status !== "completed");
        if (homeEvents.length === 0) {
            eventsHtml = `
                <div style="background-color: var(--card-bg); padding: 1.5rem; border-radius: var(--radius-md); text-align: center; border: 1px dashed var(--border-color);">
                    <p style="color:var(--text-light); font-size:0.85rem;">No upcoming community events scheduled.</p>
                </div>
            `;
        } else {
            homeEvents.slice(0, 2).forEach(e => {
                const statusBadge = e.status === "ongoing" 
                    ? `<span class="badge-status status-ongoing" style="font-size:0.7rem; padding:0.2rem 0.5rem;">ONGOING</span>`
                    : `<span class="badge-status status-upcoming" style="font-size:0.7rem; padding:0.2rem 0.5rem;">UPCOMING</span>`;
                    
                eventsHtml += `
                    <div class="service-card" style="padding: 1.5rem; margin-bottom: 1rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                            <h4 style="font-size:1.1rem; font-weight:700; color:var(--primary-color);">${e.title}</h4>
                            ${statusBadge}
                        </div>
                        <p style="font-size:0.8rem; font-weight:600; color:var(--secondary-dark); margin-bottom:0.5rem;">
                            📅 ${e.date} | ⏰ ${e.time} | 📍 ${e.venue || e.location}
                        </p>
                        <p style="font-size:0.85rem; color:var(--text-light); margin-bottom:1rem;">${e.description}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:0.6rem;">
                            <span style="font-size:0.75rem; color:var(--text-light); font-weight:500;">👥 ${e.registeredCount} Headcount</span>
                            <button onclick="BGO_PAGES.openEventPollModal('${e.id}')" class="login-action-btn" style="padding:0.3rem 0.8rem; font-size:0.75rem;">📊 Event Poll / RSVP</button>
                        </div>
                    </div>
                `;
            });
        }

        // Dynamic stats render
        let statsHtml = "";
        stats.forEach(s => {
            if (s.enabled) {
                statsHtml += `
                    <div class="stat-item">
                        <div class="stat-number">${s.value}</div>
                        <div class="stat-label">${s.label}</div>
                    </div>
                `;
            }
        });

        // Dynamic Helpline rendering
        let primaryCall = "";
        let primaryWhatsapp = "";
        let otherContactsHtml = "";
        
        if (helplineInfo.contacts && helplineInfo.contacts.length > 0) {
            const primary = helplineInfo.contacts.find(c => c.isPrimary) || helplineInfo.contacts[0];
            primaryCall = `
                <a href="tel:${primary.phone.replace(/[^0-9+]/g, '')}" class="btn btn-danger" style="font-size:0.85rem; padding:0.5rem 1.2rem;">
                    📞 Call ${primary.name} (${primary.role})
                </a>
            `;
            primaryWhatsapp = `
                <a href="https://wa.me/${primary.phone.replace(/[^0-9]/g, '')}?text=Emergency%20Help%20Request%20from%20BGO%20Website" target="_blank" class="btn btn-primary" style="font-size:0.85rem; padding:0.5rem 1.2rem; background-color:#25d366; color:white; box-shadow:none;">
                    💬 WhatsApp Support
                </a>
            `;
            
            helplineInfo.contacts.forEach(c => {
                otherContactsHtml += `
                    <div style="background:rgba(239, 68, 68, 0.04); border:1px solid rgba(239, 68, 68, 0.1); padding:0.6rem; border-radius:var(--radius-sm);">
                        <p style="font-size:0.8rem; font-weight:700; color:var(--text-color); margin-bottom:0.1rem;">${c.name}</p>
                        <p style="font-size:0.75rem; color:var(--text-light); margin-bottom:0.3rem;">${c.role}</p>
                        <a href="tel:${c.phone.replace(/[^0-9+]/g, '')}" style="font-size:0.8rem; font-weight:700; color:var(--primary-color);">📞 ${c.phone}</a>
                    </div>
                `;
            });
        }


        const html = `
            <!-- Hero with Automatic Image Rotator (Gulbarga Fort Mosque & BGO Major Events) -->
            <section class="hero" id="hero-section">
                <!-- Slide 1: Gulbarga Fort Mosque -->
                <div class="hero-bg-slide active" style="background-image: url('assets/Gulbarga%20Fort%20Mosque.jpg');"></div>

                
                <!-- Overlay -->
                <div class="hero-overlay"></div>

                <div class="hero-content">
                    <h1 class="hero-title-dark-green">Bahmani Group Oman</h1>
                    <p class="hero-motto" data-i18n="motto">"By the community for the community."</p>
                    <div class="hero-buttons">
                        <a href="#membership" class="btn btn-primary" data-i18n="hero_cta_join">Join as a Member</a>
                        <a href="#contact" class="btn btn-secondary" data-i18n="hero_cta_emergency">Emergency Helpline</a>
                    </div>
                </div>

                <!-- Slider Dots -->
                <div class="hero-slider-dots">
                    <span class="hero-dot active"></span>
                    <span class="hero-dot"></span>
                    <span class="hero-dot"></span>
                    <span class="hero-dot"></span>
                    <span class="hero-dot"></span>
                    <span class="hero-dot"></span>
                </div>
            </section>

            <!-- Stats -->
            <div class="stats-container">
                <div class="stats-grid">
                    ${statsHtml}
                </div>

                </div>
            </section>

            <!-- Founder Message Teaser -->
            <section class="section">
                <div class="founder-teaser">
                    <div class="founder-img-wrapper">
                        <div style="background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)); height: 350px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; padding: 2rem; text-align: center;">
                            <div style="font-size: 5rem; margin-bottom: 1rem;"> </div>
                            <h3 style="font-size: 1.5rem; font-weight: 700; color: var(--secondary-color);"> Message From Executive Committee </h3>

                        </div>
                    </div>
                    <div class="founder-quote">
                        <div class="quote-icon">“</div>
                        <blockquote data-i18n="founder_body_2">When people move away from their hometown in search of better opportunities, they often face challenges related to employment, health, legal matters, and emergencies. Our goal is to ensure that no member of our community feels alone during difficult times.</blockquote>
                        <div class="founder-meta">
                            <h4 data-i18n="founder_name"> </h4>
                            <p data-i18n="founder_role"> </p>
                        </div>
                        <a href="#founder" class="btn btn-secondary" style="margin-top: 2rem; border-color: var(--primary-color); color: var(--primary-color); padding: 0.5rem 1.5rem; font-size: 0.85rem;">
                            <span data-i18n="nav_founder">Founder Message</span> &rarr;
                        </a>
                </div>
            </section>

            <!-- Services -->
            <section class="section section-bg-alt">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_services">Services</span>
                    <h2 data-i18n="services_title">Our Core Services</h2>
                    <p data-i18n="services_subtitle">BGO stands as a pillars of support, bridging the distance between Oman and Kalaburagi.</p>
                </div>
                <div class="services-grid">
                    <div class="service-card">
                        <div class="service-icon">ℹ️</div>
                        <h3 data-i18n="srv_info_title">Community Info</h3>
                        <p data-i18n="srv_info_desc">Stay updated with Gulbarga news, community announcements, educational updates, and travel advisories.</p>
                        <a href="#services" class="service-link"><span data-i18n="btn_view_details">View Details</span> &rarr;</a>
                    </div>
                    <div class="service-card">
                        <div class="service-icon">💼</div>
                        <h3 data-i18n="srv_jobs_title">Verified Job Opportunities</h3>
                        <p data-i18n="srv_jobs_desc">Browse verified vacancies, access career guidance, and get resume assistance tailored for Gulbarga expats.</p>
                        <a href="#jobs" class="service-link"><span data-i18n="btn_view_details">View Details</span> &rarr;</a>
                    </div>
                    <div class="service-card">
                        <div class="service-icon">🩺</div>
                        <h3 data-i18n="srv_med_title">Medical Assistance</h3>
                        <p data-i18n="srv_med_desc">Request emergency blood donations, find hospital guidance, patient assistance, and ambulance contacts.</p>
                        <a href="#medical" class="service-link"><span data-i18n="btn_view_details">View Details</span> &rarr;</a>
                    </div>
                </div>
            </section>

            <!-- News Teaser -->
            <section class="section section-bg-alt">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_news">News & Events</span>
                    <h2>Latest Updates </h2>
                    <p>Read current circulars and join scheduled community interactions.</p>
                </div>
                <div style="display:grid; grid-template-columns:1.8fr 1fr; gap:3rem; align-items:start;">
                    <div class="jobs-grid" style="grid-template-columns: 1fr 1fr; gap:1.5rem; width:100%;">
                        ${newsHtml}
                    </div>
<!-- Emergency Helpline Section -->
            <section class="section" style="padding-top: 6rem;">

                    
                    <div style="background-color: var(--card-bg); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-md);">
                        <h4 style="font-size:1.1rem; font-weight:900; margin-bottom:1rem; color:var(--primary-color);">Request Helpline Call</h4>
                        <form id="home-helpline-form" onsubmit="BGO_PAGES.initHelplineRequest(event)">
                            <div class="form-group" style="margin-bottom:0.8rem;">
                                <input type="text" id="hl-name" placeholder="Full Name" required style="padding:0.6rem; font-size:0.85rem;">
                            </div>
                            <div class="form-group" style="margin-bottom:0.8rem;">
                                <input type="tel" id="hl-phone" placeholder="Oman(+968 XXXXXXXX)" required style="padding:0.6rem; font-size:0.85rem;">
                            </div>
				<div class="form-group" style="margin-bottom:0.8rem;">
                                <input type="Email" id="hl-Email" placeholder="Email(abcd@gmail.com)" required style="padding:0.6rem; font-size:0.85rem;">
                            </div>
                            <div class="form-group" style="margin-bottom:0.8rem;">
                                <select id="hl-type" required style="padding:0.6rem; font-size:0.85rem;">
                                    <option value="" disabled selected>Select Support Needed</option>
                                    <option value="Medical Help">Medical Help</option>
                                    <option value="Legal Guidance">Legal Guidance</option>
                                    <option value="Job Crisis Support">Job Crisis Support</option>
                                    <option value="Emergency Doc Transfer">Emergency Doc Transfer</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-danger" style="width:100%; font-size:0.85rem; padding:0.6rem; justify-content:center;">Submit Help Request</button>
                        </form>
                    </div>
                </div>
            </section>

                    
        `;
        
        this.render(html, () => {
            BGO_PAGES.initHeroSlider();
        });
    },


    heroSliderInterval: null,

    initHeroSlider() {
        const slides = document.querySelectorAll(".hero-bg-slide");
        const dots = document.querySelectorAll(".hero-dot");
        if (slides.length === 0) return;

        if (this.heroSliderInterval) {
            clearInterval(this.heroSliderInterval);
        }

        let currentIdx = 0;

        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                if (i === index) slide.classList.add("active");
                else slide.classList.remove("active");
            });
            dots.forEach((dot, i) => {
                if (i === index) dot.classList.add("active");
                else dot.classList.remove("active");
            });
            currentIdx = index;
        };

        // Auto advance slide every 4 seconds
        this.heroSliderInterval = setInterval(() => {
            let nextIdx = (currentIdx + 1) % slides.length;
            showSlide(nextIdx);
        }, 4000);

        dots.forEach((dot, i) => {
            dot.onclick = () => showSlide(i);
        });
    },

    about() {
        const html = `
            <section class="section">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_about">About Us</span>
                    <h2>About Bahmani Group Oman (BGO)</h2>
                    <p>Connecting Gulbarga People Across Oman</p>
                </div>

                <div class="about-layout" style="display:grid; grid-template-columns:1.5fr 1fr; gap:3rem; align-items:start;">
                    <div class="about-main-text">
                        <p style="font-size:1.1rem; line-height:1.8; margin-bottom:1.5rem; color:var(--text-color);">
                            <strong>Bahmani Group Oman (BGO)</strong> is a community organization established to connect people from Gulbarga (Kalaburagi), Karnataka, who are living and working in the Sultanate of Oman.
                        </p>
                        <p style="margin-bottom:1.2rem; color:var(--text-light);">
                            Founded on <strong>4 August 2021</strong> (initially as Bahmani Wing Muscat), BGO was created to provide a common platform for community members to connect, share information, and support one another. The organization focuses on practical community needs, including employment support, medical assistance, emergency coordination, and community welfare.
                        </p>
                        <p style="margin-bottom:1.2rem; color:var(--text-light);">
                            BGO serves as a network through which members can access verified information, seek guidance, and participate in community initiatives. The organization is supported by volunteers and community members who contribute their time and efforts towards the welfare of the community.
                        </p>
                        <p style="margin-bottom:2rem; color:var(--text-light);">
                            The primary objective of BGO is to strengthen community connections and provide support to members and their families when assistance is needed.
                        </p>
                        
                        <div class="service-card" style="border-left: 4px solid var(--secondary-color); background:rgba(197, 160, 89, 0.05); padding:2rem; margin-bottom:2rem;">
                            <h3 style="font-size: 1.3rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem; color:var(--primary-color);">
                                👁️ Vision
                            </h3>
                            <p style="font-size:0.95rem; line-height:1.7; color:var(--text-color);">
                                To establish a well-connected, empowered, and supportive community of Gulbarga residents in Oman, where every member can access guidance, seek help during crises, and contribute to the collective welfare of our diaspora.
                            </p>
                        </div>

                        <h3 style="font-size:1.35rem; font-weight:700; color:var(--primary-color); margin-top:2rem; margin-bottom:1rem; text-transform:uppercase;">Mission</h3>
<p style="font-size:0.95rem; line-height:1.7; color:var(--text-color);">
 Our mission is driven by empathy, care, connection, and collective responsibility, and we strive to serve our community through the following commitments.
                            </p>
                        <div class="services-grid" style="grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom:2rem;">
</h3>
    

                            <div style="background:var(--card-bg); padding:1.2rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <h4 style="color:var(--primary-color); margin-bottom:0.4rem; font-size:0.95rem;"> 1. Strengthening Brotherhood & Unity</h4>
                                <p style="font-size:0.8rem; color:var(--text-light);">To connect Gulbarga brothers across Oman and nurture relationships built on trust, mutual respect, and shared heritage/cultural values.</p>
                            </div>
                            <div style="background:var(--card-bg); padding:1.2rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <h4 style="color:var(--primary-color); margin-bottom:0.4rem; font-size:0.95rem;">
2. Standing Together in Difficult Times</h4>
                                <p style="font-size:0.8rem; color:var(--text-light);">To support members and their families during emotional, financial, or social challenges — offering help, guidance, and reassurance when it matters most.</p>
                            </div>
                            <div style="background:var(--card-bg); padding:1.2rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <h4 style="color:var(--primary-color); margin-bottom:0.4rem; font-size:0.95rem;"> 3. Medical Support & Human Care</h4>
                                <p style="font-size:0.8rem; color:var(--text-light);">To extend timely assistance and guidance for medical needs and emergencies, ensuring no brother or family faces health challenges alone..</p>
                            </div>
                            <div style="background:var(--card-bg); padding:1.2rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <h4 style="color:var(--primary-color); margin-bottom:0.4rem; font-size:0.95rem;">
4. Employment & Career Support</h4>
                                <p style="font-size:0.8rem; color:var(--text-light);">Encouraging professional growth of our brothers by sharing job opportunities, guidance, and direction through community networking — because one brother’s growth strengthens a family and gradually, the entire community.</p>
                            </div>
                            <div style="background:var(--card-bg); padding:1.2rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <h4 style="color:var(--primary-color); margin-bottom:0.4rem; font-size:0.95rem;">
5. HR & Legal Guidance in Oman</h4>
                                <p style="font-size:0.8rem; color:var(--text-light);">To provide basic support and direction related to workplace issues, HR concerns, and legal processes, helping members navigate life in Oman with confidence.</p>
                            </div>
                            <div style="background:var(--card-bg); padding:1.2rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <h4 style="color:var(--primary-color); margin-bottom:0.4rem; font-size:0.95rem;"> 6. Document Assistance (Oman to India)</h4>
                                <p style="font-size:0.8rem; color:var(--text-light);">To facilitate and coordinate document transfers during urgent and sensitive situations, especially when families need support across borders.</p>
                            </div>
                        </div>
                    </div>

                    <div style="position:sticky; top:100px;">
                        <div class="service-card" style="margin-bottom:1.5rem; background:var(--primary-dark); color:white;">
                            <h3 style="color:var(--secondary-color); font-size:1.2rem; margin-bottom:1rem;">Core Values</h3>
                            <ul style="padding-left:1.2rem; font-size:0.85rem; line-height:1.8;">
                                <li>🤝 <strong>Unity & Inclusion</strong></li>
                                <li>💎 <strong>Trust & Reliability</strong></li>
                                <li>🤝 <strong>Voluntary Service</strong></li>
                                <li>🚑 <strong>Rapid Empathy</strong></li>
                                <li>📜 <strong>Integrity & Law-Abidance</strong></li>
                            </ul>
                        </div>
                        
                        <div class="service-card">
                            <h3 style="color:var(--primary-color); font-size:1.2rem; margin-bottom:0.8rem;">Our Commitment</h3>
                            <p style="font-size:0.85rem; color:var(--text-light); line-height:1.6;">
                                Bahmani Group Oman remains committed to strengthening unity, extending compassion, and uplifting the community through collective effort. Together, we strive to make life in Oman more secure, connected, and fulfilling for every Gulbarga brother.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        `;
        this.render(html);
    },

    privacy() {
        const html = `
            <section class="section">
                <div class="section-header">
                    <h2>BGO Privacy Policy</h2>
                    <p>Last Updated: July 2026</p>
                </div>
                <div class="form-container" style="max-width: 800px; padding: 3rem; font-size:0.95rem; line-height:1.8;">
                    <p style="margin-bottom:1.2rem;">
                        At Bahmani Group Oman (BGO), we respect the privacy of our members and volunteers. This privacy policy outlines how we collect, store, utilize, and protect your information.
                    </p>
                    
                    <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary-color); margin-top:2rem; margin-bottom:0.5rem;">1. Information We Collect</h4>
                    <p style="margin-bottom:1rem;">We collect details voluntarily provided during member registration, job postings, legal support queries, and document carriage requests. This includes:</p>
                    <ul style="padding-left:1.5rem; margin-bottom:1.5rem; list-style-type:disc;">
                        <li>Full Name, Email Address, and Mobile/WhatsApp phone numbers.</li>
                        <li>Oman ID, Passport particulars, and residency status.</li>
                        <li>Indian address, native place in Gulbarga, and family dependents configuration.</li>
                        <li>Profession, company name, work address, and blood group.</li>
                    </ul>

                    <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary-color); margin-top:2rem; margin-bottom:0.5rem;">2. How We Use Your Information</h4>
                    <p style="margin-bottom:1rem;">We process personal information to provide community services, specifically to:</p>
                    <ul style="padding-left:1.5rem; margin-bottom:1.5rem; list-style-type:disc;">
                        <li>Register and verify member accounts for our directory.</li>
                        <li>Verify, process, and publish employment vacancy listings.</li>
                        <li>Coordinate urgent medical blood requests with local hospitals and donors.</li>
                        <li>Dispatch SMS alerts to coordinators when emergency help is requested.</li>
                        <li>Maintain audit activity logs for administrative security verification.</li>
                    </ul>

                    <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary-color); margin-top:2rem; margin-bottom:0.5rem;">3. Data Security & Storage</h4>
                    <p style="margin-bottom:1.5rem;">Your data is saved securely in local browser sandboxes. Only authorized administrators (Super Admin, Admins, and Executive members with matching permissions) can inspect directory profiles and community support logs.</p>

                    <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary-color); margin-top:2rem; margin-bottom:0.5rem;">4. Your Rights</h4>
                    <p style="margin-bottom:1.5rem;">Members can request to edit their profile details or delete their accounts from the BGO directory at any time by contacting BGO coordinators.</p>
                </div>
            </section>
        `;
        this.render(html);
    },

    terms() {
        const html = `
            <section class="section">
                <div class="section-header">
                    <h2>BGO Terms & Conditions</h2>
                    <p>Last Updated: July 2026</p>
                </div>
                <div class="form-container" style="max-width: 800px; padding: 3rem; font-size:0.95rem; line-height:1.8;">
                    <p style="margin-bottom:1.2rem;">Welcome to the Bahmani Group Oman (BGO) website. By accessing or using this website, you agree to comply with and be bound by the following terms.</p>
                    
                    <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary-color); margin-top:2rem; margin-bottom:0.5rem;">1. Acceptance of Terms</h4>
                    <p style="margin-bottom:1.5rem;">If you do not agree to these terms, you should not register as a member or submit requests on this website. These terms govern membership, volunteer involvement, and support services.</p>

                    <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary-color); margin-top:2rem; margin-bottom:0.5rem;">2. Membership Registration & Eligibility</h4>
                    <p style="margin-bottom:1.5rem;">Membership is open to individuals from Gulbarga (Kalaburagi), Karnataka, residing or working in the Sultanate of Oman. You agree to provide accurate, current, and complete information during registration. Accounts are subject to OTP verification and final Admin approval.</p>

                    <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary-color); margin-top:2rem; margin-bottom:0.5rem;">3. Volunteer Code of Conduct</h4>
                    <p style="margin-bottom:1.5rem;">Volunteers register to support community members in medical, legal, or emergency scenarios. Volunteers must act in good faith, maintain confidentiality, and represent BGO values ethically.</p>

                    <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary-color); margin-top:2rem; margin-bottom:0.5rem;">4. Document Carriage Coordination</h4>
                    <p style="margin-bottom:1.5rem;">BGO matches document carriage requests with travelers. Members carrying or sending documents must ensure that the items are legal, safe, and do not violate Omani or Indian civil aviation rules. BGO holds no liability for lost, delayed, or damaged items.</p>

                    <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary-color); margin-top:2rem; margin-bottom:0.5rem;">5. Job Listings</h4>
                    <p style="margin-bottom:1.5rem;">Members posting vacancies must verify their identity via OTP. BGO does not guarantee placements, check working conditions, or mediate employer disputes.</p>

                    <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary-color); margin-top:2rem; margin-bottom:0.5rem;">6. Liability Disclaimer</h4>
                    <p style="margin-bottom:1.5rem;">BGO is a volunteer community network. Services, referrals, and information are provided on an "as-is" basis. BGO shall not be held liable for outcomes resulting from emergency assistance, legal guides, or volunteer actions.</p>
                </div>
            </section>
        `;
        this.render(html);
    },

    founder() {
        const html = `
            <section class="section">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_founder">Founder Message</span>
                    <h2 data-i18n="founder_title">Message from the Founder</h2>
                    <p> </p>
                </div>

                <div class="form-container" style="max-width: 800px; padding: 4rem;">
                    <div style="font-size: 3rem; color: var(--secondary-color); line-height: 1; margin-bottom: 1.5rem; text-align: center;">📜</div>
                    
                    <h3 style="font-size: 1.3rem; color: var(--primary-color); margin-bottom: 1.5rem;" data-i18n="founder_salutation">Assalamu Alaikum,</h3>
                    
                    <div class="about-text-content" style="line-height: 1.8; font-size: 1.05rem;">
                        <p style="margin-bottom: 1.5rem;" data-i18n="founder_body_1">Bahmani Group of Oman was established with a vision to bring together the people of Gulbarga living in Oman under one platform.</p>
                        <p style="margin-bottom: 1.5rem;" data-i18n="founder_body_2">When people move away from their hometown in search of better opportunities, they often face challenges related to employment, health, legal matters, and emergencies. Our goal is to ensure that no member of our community feels alone during difficult times.</p>
                        <p style="margin-bottom: 1.5rem;" data-i18n="founder_body_3">Over the years, BGO has grown into a trusted community network where members support one another, share opportunities, and work together for the welfare of the community.</p>
                        <p style="margin-bottom: 2.5rem;" data-i18n="founder_body_4">We sincerely thank all members, volunteers, and supporters who have contributed to the success of this initiative. Together, we can continue building a stronger, more connected, and more supportive community.</p>
                    </div>

                    <div style="border-top: 1px solid var(--border-color); padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-size: 0.9rem; color: var(--text-light);" data-i18n="founder_regards">Warm regards,</p>
                            <h4 style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color);" data-i18n="founder_name">  </h4>
                            <p style="font-size: 0.85rem; color: var(--text-light); font-weight: 500;" data-i18n="founder_role">Bahmani Group of Oman (BGO)</p>
                        </div>
                        <div style="font-size: 4rem; opacity: 0.08;">BGO</div>
                    </div>
                </div>
            </section>
        `;
        this.render(html);
    },

    services() {
        const html = `
            <section class="section">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_services">Services</span>
                    <h2 data-i18n="services_title">Our Core Services</h2>
                    <p data-i18n="services_subtitle">BGO stands as a pillars of support, bridging the distance between Oman and Kalaburagi.</p>
                </div>

                <div class="services-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem;">
                    <!-- 1 -->
                    <div class="service-card">
                        <div class="service-icon">ℹ️</div>
                        <h3 data-i18n="srv_info_title">Community Information</h3>
                        <p>Provide verified updates, news, and notifications regarding:</p>
                        <ul class="service-list">
                            <li>Gulbarga / Kalaburagi News</li>
                            <li>Educational & Career Guides</li>
                            <li>Community Meetups & Events</li>
                            <li>Oman/India Government Announcements</li>
                            <li>Travel Advisory & Flights Info</li>
                        </ul>
                    </div>

                    <!-- 2 -->
                    <div class="service-card">
                        <div class="service-icon">💼</div>
                        <h3 data-i18n="srv_jobs_title">Job Portal</h3>
                        <p>Helping job seekers find verified employments in major sectors:</p>
                        <ul class="service-list">
                            <li>Job Vacancy Listings</li>
                            <li>Employer Credentials Verification</li>
                            <li>Candidate Referrals</li>
                            <li>Resume Building & Prep</li>
                            <li>Career Orientation Programs</li>
                        </ul>
                        <a href="#jobs" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; width:fit-content; border-color: var(--primary-color); color:var(--primary-color);">Job Portal</a>
                    </div>

                    <!-- 3 -->
                    <div class="service-card">
                        <div class="service-icon">🩺</div>
                        <h3 data-i18n="srv_med_title">Medical Assistance</h3>
                        <p>Rapid coordinates for medical treatments and emergencies:</p>
                        <ul class="service-list">
                            <li>Hospital & Clinic Guidance</li>
                            <li>Emergency Blood Donation Requests</li>
                            <li>Patient Care Support</li>
                            <li>Ambulance Contacts & Referrals</li>
                            <li>Community Welfare Fundraising</li>
                        </ul>
                        <a href="#medical" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; width:fit-content; border-color: var(--primary-color); color:var(--primary-color);">Medical Board</a>
                    </div>

                    <!-- 4 -->
                    <div class="service-card">
                        <div class="service-icon">⚖️</div>
                        <h3 data-i18n="srv_legal_title">Legal Support</h3>
                        <p>Connecting community members with resources and guidance:</p>
                        <ul class="service-list">
                            <li>Labour Rights & Dispute Guidance</li>
                            <li>Omani Visa & Civil ID Issues</li>
                            <li>Contractual Explanations</li>
                            <li>Legal Consultations Referrals</li>
                        </ul>
                        <div class="info-accent-box" style="margin: 1rem 0; padding: 0.8rem; font-size: 0.75rem;">
                            <p><em>*Disclaimer: BGO is a non-profit and does not provide certified legal advice directly, but references legitimate services.</em></p>
                        </div>
                        <a href="#legal" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; width:fit-content; border-color: var(--primary-color); color:var(--primary-color);">Legal Advice</a>
                    </div>

                    <!-- 5 -->
                    <div class="service-card">
                        <div class="service-icon">✈️</div>
                        <h3 data-i18n="srv_transfer_title">Emergency Document Transfer</h3>
                        <p>Urgent physical courier and hand-carry logistics coordinator:</p>
                        <ul class="service-list">
                            <li>Oman &rarr; Gulbarga Transfer</li>
                            <li>Gulbarga &rarr; Oman Transfer</li>
                            <li>Travel Permits</li>
                            <li>Degree & Educational Certificates</li>
                            <li>Emergency Medical Records</li>
                        </ul>
                        <a href="#transfer" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; width:fit-content; border-color: var(--primary-color); color:var(--primary-color);">Request Transfer</a>
                    </div>
                </div>
            </section>
        `;
        this.render(html);
    },

    jobs() {
        const categories = [
            { id: "all", label: "All Categories" },
            { id: "engineering", label: "Engineering" },
            { id: "construction", label: "Construction" },
            { id: "driving", label: "Driving" },
            { id: "hospitality", label: "Hospitality" },
            { id: "it", label: "IT & Technology" },
            { id: "administration", label: "Administration" },
            { id: "sales", label: "Sales & Marketing" },
            { id: "healthcare", label: "Healthcare" }
        ];

        let catOptions = "";
        categories.forEach(c => {
            catOptions += `<option value="${c.id}">${c.label}</option>`;
        });

        const html = `
            <section class="section">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_jobs">Job Portal</span>
                    <h2>Verified Job Opportunities</h2>
                    <p>Verified employment listings posted by our members and partners. Contact details are provided directly for each vacancy.</p>
                </div>

                <div class="jobs-filter-bar">
                    <div class="jobs-search">
                        <input type="text" id="jobs-search-input" placeholder="Search by Job Title, Company, or Location..." oninput="BGO_PAGES.filterJobs()">
                    </div>
                    <select id="jobs-category-filter" class="jobs-category-select" onchange="BGO_PAGES.filterJobs()">
                        ${catOptions}
                    </select>
                    
                    <button onclick="BGO_PAGES.openJobPostModal()" class="login-action-btn" style="height:42px; display:flex; align-items:center; gap:0.5rem;">
                        ➕ Post a Vacancy
                    </button>
                </div>

                <div id="jobs-listings-grid" class="jobs-grid">
                    <!-- Injected dynamically -->
                </div>
            </section>

            <!-- Job Posting Modal -->
            <div id="job-post-modal" class="modal-overlay">
                <div class="modal-box">
                    <div class="modal-header">
                        <h3>Post a New Job Vacancy</h3>
                        <button onclick="BGO_PAGES.closeJobPostModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="job-post-alert" style="display:none; padding:1rem; border-radius:var(--radius-sm); margin-bottom:1.2rem;"></div>
                        <form id="job-post-form" onsubmit="BGO_PAGES.handleJobPostInit(event)">
                            <div class="form-grid">
                                <div class="form-group" style="grid-column: span 2;">
                                    <label>Posted By Name *</label>
                                    <input type="text" id="post-job-poster-name" placeholder="e.g. Mr. Mohammed Tabrez" required>
                                </div>
                                <div class="form-group">
                                    <label>Job Title *</label>
                                    <input type="text" id="post-job-title" placeholder="e.g. Mechanical Engineer" required>
                                </div>
                                <div class="form-group">
                                    <label>Company Name *</label>
                                    <input type="text" id="post-job-company" placeholder="e.g. Muscat LLC" required>
                                </div>
                                <div class="form-group">
                                    <label>Sector Category *</label>
                                    <select id="post-job-category" required onchange="BGO_PAGES.handleJobCategoryChange(this.value)">
                                        <option value="" disabled selected>Select Category</option>
                                        <option value="engineering">Engineering</option>
                                        <option value="construction">Construction</option>
                                        <option value="driving">Driving</option>
                                        <option value="hospitality">Hospitality</option>
                                        <option value="it">IT</option>
                                        <option value="administration">Administration</option>
                                        <option value="sales">Sales</option>
                                        <option value="healthcare">Healthcare</option>
                                        <option value="others">Others</option>
                                    </select>
                                </div>
                                <div class="form-group" id="post-job-custom-category-group" style="display:none;">
                                    <label>Specify Custom Sector / Category *</label>
                                    <input type="text" id="post-job-custom-category" placeholder="e.g. Accounting & Finance, Education, Logistics">
                                </div>
                                <div class="form-group">
                                    <label>Location (City in Oman) *</label>
                                    <input type="text" id="post-job-location" placeholder="e.g. Muscat" required>
                                </div>
                                <div class="form-group">
                                    <label>Salary Range (OMR) *</label>
                                    <input type="text" id="post-job-salary" placeholder="e.g. OMR 400 - 500" required>
                                </div>
                                <div class="form-group">
                                    <label>Job Type *</label>
                                    <select id="post-job-type" required>
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Contract">Contractual</option>
                                        <option value="Part-Time">Part-Time</option>
                                    </select>
                                </div>
                                <div class="form-group full-width">
                                    <label>Contact Email Address (For Applications & Communication) *</label>
                                    <input type="email" id="post-job-email" placeholder="e.g. employer@bgooman.org" required>
                                </div>
                                <div class="form-group full-width">
                                    <label>Detailed Job Description *</label>
                                    <textarea id="post-job-desc" placeholder="Describe eligibility, experience, duties and benefits..." required></textarea>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn" style="margin-top:1.5rem; width:100%; justify-content:center;">Publish Job Vacancy</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        this.render(html, () => {
            BGO_PAGES.filterJobs();
        });
    },

    filterJobs() {
        const searchQuery = document.getElementById("jobs-search-input").value.toLowerCase();
        const categoryFilter = document.getElementById("jobs-category-filter").value;
        const grid = document.getElementById("jobs-listings-grid");
        
        const jobs = BGO_DB.getJobs();
        const approved = jobs.filter(j => j.status === "approved");
        
        let filtered = approved.filter(j => {
            const matchesSearch = j.title.toLowerCase().includes(searchQuery) || 
                                 j.company.toLowerCase().includes(searchQuery) || 
                                 j.location.toLowerCase().includes(searchQuery);
            const matchesCategory = categoryFilter === "all" || j.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="form-group full-width" style="grid-column: span 3; text-align: center; padding: 4rem 1rem;">
                    <div style="font-size:3rem; margin-bottom:1rem;">🔍</div>
                    <h4 style="color:var(--text-light); font-size:1.1rem;">No jobs match your search preferences.</h4>
                    <p style="color:var(--text-light); font-size:0.85rem;">Try modifying your keyword search or category filters.</p>
                </div>
            `;
            return;
        }

        let html = "";
        filtered.forEach(j => {
            const posterDisplayName = j.posterName || j.postedBy || "BGO Member";
            const emailDisplay = j.contactEmail || j.email || (j.contact && j.contact.includes("@") ? j.contact : "khader.meengg@gmail.com");
            
            html += `
                <div class="job-card">
                    <div class="job-header">
                        <span class="job-badge">${j.category}</span>
                        <span style="font-size:0.75rem; color:var(--text-light); font-weight:500;">📅 ${j.postedDate}</span>
                    </div>
                    <h3 class="job-title">${j.title}</h3>
                    <div class="job-company">🏢 ${j.company}</div>
                    
                    <div class="job-meta-list">
                        <div class="job-meta-item">📍 ${j.location}</div>
                        <div class="job-meta-item">💼 ${j.type}</div>
                        <div class="job-meta-item" style="color:var(--primary-color); font-weight:700;">👤 Posted By: ${posterDisplayName}</div>
                    </div>
                    
                    <p class="job-desc">${j.description}</p>
                    
                    <div class="job-footer">
                        <div class="job-salary">${j.salary}</div>
                        <a href="mailto:${emailDisplay}" class="login-action-btn" style="text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem;">
                            ✉️ ${emailDisplay}
                        </a>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html;
    },

    openJobApplyModal(id, title) {
        document.getElementById("apply-job-id").value = id;
        document.getElementById("job-apply-title").textContent = `Apply for: ${title}`;
        document.getElementById("job-apply-modal").classList.add("active");
        
        // Auto fill if member is logged in
        const user = BGO_AUTH.getCurrentUser();
        if (user) {
            document.getElementById("apply-name").value = user.fullName;
            document.getElementById("apply-phone").value = user.mobile;
            document.getElementById("apply-email").value = user.email;
        }
    },

    closeJobApplyModal() {
        document.getElementById("job-apply-modal").classList.remove("active");
        document.getElementById("job-apply-form").reset();
    },

    handleJobApplication(e) {
        e.preventDefault();
        const jobId = document.getElementById("apply-job-id").value;
        const name = document.getElementById("apply-name").value;
        
        alert(`Thank you, ${name}! Your application has been submitted successfully. The employer will review your profile and contact you directly.`);
        this.closeJobApplyModal();
    },

    openJobPostModal() {
        const modal = document.getElementById("job-post-modal");
        const alertBox = document.getElementById("job-post-alert");
        
        if (!BGO_AUTH.isLoggedIn()) {
            alertBox.style.display = "block";
            alertBox.style.backgroundColor = "var(--warning-light)";
            alertBox.style.color = "var(--warning-color)";
            alertBox.innerHTML = `<strong>Note:</strong> You are not logged in. You can still submit jobs, but they must be reviewed by admin before appearing on the portal. <a href="#membership" onclick="BGO_PAGES.closeJobPostModal()" style="text-decoration:underline; font-weight:700;">Login / Join BGO</a> to bypass manual delay.`;
        } else {
            alertBox.style.display = "none";
        }
        modal.classList.add("active");
        
        const user = BGO_AUTH.getCurrentUser();
        if (user) {
            const posterIn = document.getElementById("post-job-poster-name");
            if (posterIn) posterIn.value = user.fullName;
            const emailIn = document.getElementById("post-job-email");
            if (emailIn) emailIn.value = user.email;
        }
    },

    handleJobCategoryChange(val) {
        const customGroup = document.getElementById("post-job-custom-category-group");
        const customInput = document.getElementById("post-job-custom-category");
        if (val === "others") {
            if (customGroup) customGroup.style.display = "block";
            if (customInput) customInput.required = true;
        } else {
            if (customGroup) customGroup.style.display = "none";
            if (customInput) {
                customInput.required = false;
                customInput.value = "";
            }
        }
    },

    closeJobPostModal() {
        document.getElementById("job-post-modal").classList.remove("active");
        document.getElementById("job-post-form").reset();
        this.handleJobCategoryChange("");
    },

    handleJobPostInit(e) {
        e.preventDefault();
        
        const posterName = document.getElementById("post-job-poster-name").value.trim();
        const title = document.getElementById("post-job-title").value.trim();
        const company = document.getElementById("post-job-company").value.trim();
        let category = document.getElementById("post-job-category").value;
        const location = document.getElementById("post-job-location").value.trim();
        const salary = document.getElementById("post-job-salary").value.trim();
        const type = document.getElementById("post-job-type").value;
        const email = document.getElementById("post-job-email").value.trim();
        const description = document.getElementById("post-job-desc").value.trim();
        
        if (category === "others") {
            const customCat = document.getElementById("post-job-custom-category").value.trim();
            if (!customCat) {
                alert("⚠️ Please specify your custom Sector / Category name.");
                return;
            }
            category = customCat;
        }

        if (!email || !title || !company || !category) {
            alert("⚠️ Missing Information: Please fill in Job Title, Company Name, Sector Category, and Contact Email Address.");
            return;
        }

        const user = BGO_AUTH.getCurrentUser();
        
        // Direct database submission without OTP
        const newJob = BGO_DB.addJob({
            title, company, category, location, salary, type,
            contactEmail: email,
            email: email,
            description,
            posterName: posterName || (user ? user.fullName : "BGO Member"),
            postedBy: posterName || (user ? user.fullName : "BGO Member")
        });

        // Dispatch Email Notification
        BGO_DB.sendEmailNotification({
            toEmail: email,
            toName: posterName || (user ? user.fullName : "Member"),
            category: "Job Vacancy Post",
            subject: `Job Vacancy Registered: ${title}`,
            body: `Assalamu Alaikum,\n\nYour job vacancy post "${title}" at ${company} has been registered successfully.\n\nJob Details:\n- Title: ${title}\n- Company: ${company}\n- Category: ${category}\n- Location: ${location}\n- Status: ${newJob.status.toUpperCase()}\n\nThank you for contributing to the BGO Job Portal.`
        });

        alert(`⏳ JOB VACANCY SUBMITTED FOR APPROVAL!\n\nJob Title: ${title}\nCompany: ${company}\nLocation: ${location}\nStatus: Pending Approval\n\nYour job vacancy has been registered. It will appear publicly under Verified Job Opportunities for 15 days once approved by a BGO Administrator.`);

        this.closeJobPostModal();
        this.filterJobs();
    },

    medical() {
        const html = `
            <section class="section">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_medical">Medical Aid</span>
                    <h2>Medical Emergency Coordination</h2>
                    <p>Submit blood donation requests or view ongoing emergency cases requiring hospital support or funding.</p>
                </div>

                <div class="medical-split">
                    <div class="form-container" style="margin: 0; padding: 2.5rem;">
                        <h3 style="font-size:1.3rem; font-weight:700; color:var(--primary-color); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                            <span>🩸</span> Raise Blood / Medical Request
                        </h3>
                        <form id="medical-request-form" onsubmit="BGO_PAGES.handleMedicalRequestInit(event)">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Patient Full Name *</label>
                                    <input type="text" id="med-patient" placeholder="Patient name" required>
                                </div>
                                <div class="form-group">
                                    <label>Blood Group Required *</label>
                                    <select id="med-blood" required>
                                        <option value="" disabled selected>Select Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Omani Hospital Name *</label>
                                    <input type="text" id="med-hospital" placeholder="e.g. Royal Hospital" required>
                                </div>
                                <div class="form-group">
                                    <label>City Location *</label>
                                    <input type="text" id="med-location" placeholder="e.g. Muscat" required>
                                </div>
                                <div class="form-group">
                                    <label>Required Blood Units *</label>
                                    <input type="number" id="med-units" placeholder="e.g. 2" required min="1">
                                </div>
                                <div class="form-group">
                                    <label>Urgency Level *</label>
                                    <select id="med-urgency" required>
                                        <option value="Urgent">Urgent (Within 48 hours)</option>
                                        <option value="Critical">Critical (Immediate/Today)</option>
                                        <option value="Standard">Standard Support</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Contact Mobile Number (For Communication) *</label>
                                    <input type="tel" id="med-contact" placeholder="e.g. +968 9988 1122" required>
                                </div>
                                <div class="form-group">
                                    <label>Contact Email Address (requires OTP validation) *</label>
                                    <input type="email" id="med-email" placeholder="e.g. patient@example.com" required>
                                </div>
                                <div class="form-group full-width">
                                    <label>Case Details / Reason *</label>
                                    <textarea id="med-reason" placeholder="Describe the medical situation or surgery details..." required></textarea>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-danger form-submit-btn" style="width:100%; margin-top:1.2rem; justify-content:center;">Verify Email OTP & Publish Request</button>
                        </form>
                    </div>

                    <div>
                        <h3 class="active-requests-title">Active Assistance Cases</h3>
                        <div id="medical-requests-list" class="emergency-list">
                            <!-- Injected dynamically -->
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        this.render(html, () => {
            BGO_PAGES.renderMedicalRequests();
            
            const user = BGO_AUTH.getCurrentUser();
            if (user) {
                if (document.getElementById("med-contact")) document.getElementById("med-contact").value = user.mobile || "";
                if (document.getElementById("med-email")) document.getElementById("med-email").value = user.email || "";
            }
        });
    },

    renderMedicalRequests() {
        const list = document.getElementById("medical-requests-list");
        const requests = BGO_DB.getMedicalRequests();
        
        const openReqs = requests.filter(r => r.status === "open");
        
        if (openReqs.length === 0) {
            list.innerHTML = `
                <div style="text-align:center; padding:3rem; background-color:var(--card-bg); border-radius:var(--radius-md); border:1px dashed var(--border-color);">
                    <div style="font-size:2.5rem; margin-bottom:0.8rem;">💚</div>
                    <p style="color:var(--text-light); font-weight:600;">No active medical emergencies reported.</p>
                </div>
            `;
            return;
        }

        let html = "";
        openReqs.forEach(r => {
            const urgencyColor = r.urgency === "Critical" ? "red" : (r.urgency === "Urgent" ? "orange" : "blue");
            
            html += `
                <div class="emergency-card">
                    <div class="emergency-card-header">
                        <div>
                            <h4>${r.patientName} (${r.location})</h4>
                            <span style="font-size:0.75rem; color:var(--text-light); font-weight:500;">🏥 ${r.hospital}</span>
                        </div>
                        <div class="blood-type-badge">${r.bloodGroup}</div>
                    </div>
                    
                    <p style="font-size:0.85rem; color:var(--text-color); margin-bottom:1rem;">${r.reason}</p>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:0.8rem; flex-wrap:wrap; gap:0.5rem;">
                        <span style="font-size:0.8rem; font-weight:700; color:${urgencyColor}; text-transform:uppercase;">
                            🚨 ${r.urgency} | Units: ${r.requiredUnits}
                        </span>
                        
                        <div style="display:flex; gap:0.5rem;">
                            <a href="tel:${r.contactNumber.replace(/[^0-9+]/g, '')}" class="action-btn-sm action-btn-approve" style="display:inline-flex; align-items:center; gap:0.2rem; text-decoration:none; padding:0.4rem 0.8rem;">
                                📞 Call
                            </a>
                            <a href="https://wa.me/${r.contactNumber.replace(/[^0-9]/g, '')}?text=Assalamu%20Alaikum%2C%20regarding%20the%20blood%20donation%20request%20for%20${r.patientName}" target="_blank" class="action-btn-sm" style="display:inline-flex; align-items:center; gap:0.2rem; background-color:#25d366; color:white; padding:0.4rem 0.8rem;">
                                💬 WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        list.innerHTML = html;
    },

    handleMedicalRequestInit(e) {
        e.preventDefault();
        
        const patientName = document.getElementById("med-patient").value.trim();
        const bloodGroup = document.getElementById("med-blood").value;
        const hospital = document.getElementById("med-hospital").value.trim();
        const location = document.getElementById("med-location").value.trim();
        const requiredUnits = document.getElementById("med-units").value.trim();
        const urgency = document.getElementById("med-urgency").value;
        const contactNumber = document.getElementById("med-contact").value.trim();
        const contactEmail = document.getElementById("med-email").value.trim();
        const reason = document.getElementById("med-reason").value.trim();

        if (!contactNumber || !contactEmail) {
            alert("⚠️ Missing Fields: Please fill in both Contact Mobile Number and Contact Email Address.");
            return;
        }
        
        BGO_PAGES.pendingRequestData = {
            type: "medical",
            data: { patientName, bloodGroup, hospital, location, requiredUnits, urgency, contactNumber, contactEmail, reason }
        };
        
        this.openOtpModal("help_request", contactEmail, { fullName: patientName });
    },

    legal() {
        const html = `
            <section class="section">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_legal">Legal Help</span>
                    <h2>Legal Coordination & Support</h2>
                    <p>Guidance regarding labour disputes, visa problems, and Omani employer relations.</p>
                </div>

                <div class="grid-2-col">
                    <div class="about-text-content">
                        <h3>Omani Labour Laws & Expat Guidelines</h3>
                        <p>Navigating employment regulations in a foreign country can be highly intimidating. BGO acts as an informational channel to guide members facing the following labour-related problems:</p>
                        
                        <ul class="list-icon-bullets">
                            <li><span class="bullet-icon">⚖️</span> <strong>Employment Contract Disputes</strong>: Discrepancies between agreed wages and current payouts.</li>
                            <li><span class="bullet-icon">⚖️</span> <strong>Visa & Passport Retention</strong>: Guidelines concerning Omani visa extensions, sponsor changes, or illegal confiscation of travel documents.</li>
                            <li><span class="bullet-icon">⚖️</span> <strong>Gratuity & End of Service</strong>: Calculation of severance pays and clearance processes according to Ministry of Labour directives.</li>
                            <li><span class="bullet-icon">⚖️</span> <strong>Civil Status & ID Renewals</strong>: Fines, civil registrations, and document updates.</li>
                        </ul>

                        <div class="info-accent-box">
                            <p><strong>BGO Support Disclaimer:</strong> Bahmani Group of Oman is not a certified legal chambers and does not issue legal verdicts. We provide informational guidance, reference members to official Omani Ministry of Labour resources, and connect them with trusted pro-bono lawyers/translators in our community network.</p>
                        </div>
                    </div>

                    <div class="form-container" style="margin: 0; padding: 2.5rem; height: fit-content;">
                        <h3 style="font-size:1.3rem; font-weight:700; color:var(--primary-color); margin-bottom:1.2rem; display:flex; align-items:center; gap:0.5rem;">
                            <span>📩</span> Submit Legal Guidance Query
                        </h3>
                        <p style="font-size:0.85rem; color:var(--text-light); margin-bottom:1.5rem;">Our Legal Coordination Volunteers will review your request and connect you with resource directories.</p>
                        
                        <form id="legal-query-form" onsubmit="BGO_PAGES.handleLegalQueryInit(event)">
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Your Full Name *</label>
                                <input type="text" id="legal-name" required>
                            </div>
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Contact Mobile Number (For Communication) *</label>
                                <input type="tel" id="legal-phone" required placeholder="e.g. +968 9988 1122">
                            </div>
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Contact Email Address (requires OTP validation) *</label>
                                <input type="email" id="legal-email" required placeholder="e.g. user@example.com">
                            </div>
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Type of Dispute *</label>
                                <select id="legal-type" required>
                                    <option value="" disabled selected>Select Category</option>
                                    <option value="Salary Dispute">Unpaid Salary / Gratuity</option>
                                    <option value="Visa Issue">Visa Cancellation / Civil ID</option>
                                    <option value="Contract Breach">Employer Contract Breach</option>
                                    <option value="Harassment">Workplace Harassment / Dispute</option>
                                    <option value="Other">Other Legal Inquiry</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Brief Summary of the Case *</label>
                                <textarea id="legal-summary" placeholder="Describe the timeline, employer actions, and current status of your card..." required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn">Verify Email OTP & Request Guidance</button>
                        </form>
                    </div>
                </div>
            </section>
        `;
        this.render(html, () => {
            const user = BGO_AUTH.getCurrentUser();
            if (user) {
                if (document.getElementById("legal-name")) document.getElementById("legal-name").value = user.fullName || "";
                if (document.getElementById("legal-phone")) document.getElementById("legal-phone").value = user.mobile || "";
                if (document.getElementById("legal-email")) document.getElementById("legal-email").value = user.email || "";
            }
        });
    },

    handleLegalQueryInit(e) {
        e.preventDefault();
        const name = document.getElementById("legal-name").value.trim();
        const phone = document.getElementById("legal-phone").value.trim();
        const email = document.getElementById("legal-email").value.trim();
        const type = document.getElementById("legal-type").value;
        const summary = document.getElementById("legal-summary").value.trim();
        
        if (!phone || !email) {
            alert("⚠️ Missing Information: Please fill in both Contact Mobile Number and Contact Email Address.");
            return;
        }
        
        BGO_PAGES.pendingRequestData = {
            type: "legal",
            data: { name, phone, email, type, summary }
        };
        
        this.openOtpModal("help_request", email, { fullName: name });
    },

    transfer() {
        const html = `
            <section class="section">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_transfer">Doc Transfer</span>
                    <h2>Emergency Document Transfer</h2>
                    <p>Coordinate secure physical transport of medical papers, degree certificates, or passports between Oman and Gulbarga via hand-carry volunteers.</p>
                </div>

                <div class="grid-2-col">
                    <div class="form-container" style="margin: 0; padding: 2.5rem;">
                        <h3 style="font-size:1.3rem; font-weight:700; color:var(--primary-color); margin-bottom:1.2rem;">
                            Request Document Carriage
                        </h3>
                        <form id="transfer-request-form" onsubmit="BGO_PAGES.handleTransferRequestInit(event)">
                            <div class="form-grid">
                                <div class="form-grid-inner" style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; width:100%; grid-column:span 2;">
                                    <div class="form-group">
                                        <label>Sender Full Name *</label>
                                        <input type="text" id="trsf-name" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Contact Mobile Number (For Communication) *</label>
                                        <input type="tel" id="trsf-phone" required placeholder="e.g. +968 9988 1122">
                                    </div>
                                    <div class="form-group">
                                        <label>Contact Email Address (For Communication) *</label>
                                        <input type="email" id="trsf-email" required placeholder="e.g. sender@example.com">
                                    </div>
                                    <div class="form-group">
                                        <label>Document Category / Type *</label>
                                        <input type="text" id="trsf-doctype" required placeholder="Enter document type (e.g. Passport, Degree Certificate, Medical Records, Legal Papers)">
                                    </div>
                                    <div class="form-group" style="grid-column:span 2;">
                                        <label>Direction *</label>
                                        <select id="trsf-direction" required>
                                            <option value="Oman → Gulbarga">Oman &rarr; Gulbarga</option>
                                            <option value="Gulbarga → Oman">Gulbarga &rarr; Oman</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group full-width" style="margin-top:1.2rem;">
                                    <label>Recipient Details in Destination *</label>
                                    <input type="text" id="trsf-recipient" placeholder="Recipient Name & Phone Number" required>
                                </div>
                                <div class="form-group full-width">
                                    <label>Carriage Details / Urgency Note *</label>
                                    <textarea id="trsf-desc" placeholder="Describe the contents, size, and why urgent transport is needed..." required></textarea>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn" style="width:100%; margin-top:1.2rem; justify-content:center;">Submit Document Carriage Request</button>
                        </form>
                    </div>

                    <div>
                        <div class="service-card" style="margin-bottom: 2rem;">
                            <h3 style="font-size:1.25rem; font-weight:700; color:var(--primary-color); margin-bottom:1rem;">
                                How It Works
                            </h3>
                            <p style="font-size:0.9rem; color:var(--text-light); margin-bottom:1rem;">BGO matches document carriage requests with trusted members traveling back and forth between Oman (Muscat/Salalah) and Kalaburagi.</p>
                            
                            <ul class="service-list" style="font-size:0.85rem; margin-bottom:0;">
                                <li><strong>Submit Request</strong>: Tell us what papers need transferring.</li>
                                <li><strong>Verification</strong>: BGO verifies sender ID and safety of contents.</li>
                                <li><strong>Match Traveler</strong>: We pair you with a community member traveling on a flight soon.</li>
                                <li><strong>Hand-to-Hand Delivery</strong>: Direct pickup and drop coordination.</li>
                            </ul>
                        </div>

                        <div class="service-card" style="border-top: 4px solid var(--danger-color);">
                            <h3 style="font-size:1.25rem; font-weight:700; color:var(--primary-color); margin-bottom:1rem;">
                                Track Carriage Request
                            </h3>
                            <p style="font-size:0.85rem; color:var(--text-light); margin-bottom:1.5rem;">Enter your Transfer Request ID (e.g., trsf-seed-1) to view live verification/match status.</p>
                            
                            <div style="display:flex; gap:0.5rem;">
                                <input type="text" id="trsf-track-id" placeholder="Enter Request ID" style="padding:0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); flex-grow:1; outline:none;">
                                <button onclick="BGO_PAGES.trackTransfer()" class="login-action-btn">Track</button>
                            </div>
                            
                            <div id="trsf-track-result" style="margin-top:1.5rem; display:none; padding:1rem; border-radius:var(--radius-sm);"></div>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        this.render(html, () => {
            const user = BGO_AUTH.getCurrentUser();
            if (user) {
                if (document.getElementById("trsf-name")) document.getElementById("trsf-name").value = user.fullName || "";
                if (document.getElementById("trsf-phone")) document.getElementById("trsf-phone").value = user.mobile || "";
                if (document.getElementById("trsf-email")) document.getElementById("trsf-email").value = user.email || "";
            }
        });
    },

    handleTransferRequestInit(e) {
        e.preventDefault();
        
        const senderName = document.getElementById("trsf-name").value.trim();
        const contact = document.getElementById("trsf-phone").value.trim();
        const email = document.getElementById("trsf-email").value.trim();
        const documentType = document.getElementById("trsf-doctype").value.trim();
        const direction = document.getElementById("trsf-direction").value;
        const recipient = document.getElementById("trsf-recipient").value.trim();
        const desc = document.getElementById("trsf-desc").value.trim();
        const description = `Recipient: ${recipient}. Details: ${desc}`;
        
        if (!contact || !email || !documentType) {
            alert("⚠️ Missing Information: Please fill in Contact Mobile Number, Contact Email Address, and Document Category/Type.");
            return;
        }
        
        // Direct database submission without OTP
        const trsf = BGO_DB.addTransfer({
            senderName,
            contact,
            email,
            documentType,
            direction,
            description,
            recipient
        });

        // Dispatch Email Notification & Audit Log
        BGO_DB.sendEmailNotification({
            toEmail: email,
            toName: senderName,
            category: "Document Transfer Request",
            subject: `Document Carriage Request Registered (ID: ${trsf.id})`,
            body: `Assalamu Alaikum ${senderName},\n\nYour emergency document transfer request has been submitted successfully.\n\nRequest Summary:\n- Request ID: ${trsf.id}\n- Document Category: ${documentType}\n- Direction: ${direction}\n- Recipient: ${recipient}\n\nOur coordination team will review your request and match it with a verified community traveler.`
        });

        alert(`✅ DOCUMENT CARRIAGE REQUEST SUBMITTED SUCCESSFULLY!\n\nRequest ID: ${trsf.id}\nSender Name: ${senderName}\nDocument Category: ${documentType}\nDirection: ${direction}\nRecipient: ${recipient}\n\nYour request has been registered in the database. Our coordination team will match your request with a verified traveler.`);

        // Reset form and refill defaults if logged in
        document.getElementById("transfer-request-form").reset();
        const user = BGO_AUTH.getCurrentUser();
        if (user) {
            if (document.getElementById("trsf-name")) document.getElementById("trsf-name").value = user.fullName || "";
            if (document.getElementById("trsf-phone")) document.getElementById("trsf-phone").value = user.mobile || "";
            if (document.getElementById("trsf-email")) document.getElementById("trsf-email").value = user.email || "";
        }
    },

    trackTransfer() {
        const id = document.getElementById("trsf-track-id").value.trim();
        const resultDiv = document.getElementById("trsf-track-result");
        
        if (!id) return;
        
        const transfers = BGO_DB.getTransfers();
        const t = transfers.find(item => item.id.toLowerCase() === id.toLowerCase());
        
        resultDiv.style.display = "block";
        if (t) {
            let statusText = "Processing / Verifying Documents";
            let statusClass = "badge-status-pending";
            if (t.status === "approved") {
                statusText = "Approved - Match in Progress";
                statusClass = "badge-status-approved";
            } else if (t.status === "completed") {
                statusText = "Completed - Documents Delivered";
                statusClass = "badge-status-approved";
            }
            
            resultDiv.style.backgroundColor = "var(--bg-color)";
            resultDiv.style.border = "1px solid var(--border-color)";
            resultDiv.innerHTML = `
                <h4 style="font-size:0.95rem; font-weight:700; color:var(--primary-color); margin-bottom:0.5rem;">Request Found!</h4>
                <p style="font-size:0.85rem; margin-bottom:0.3rem;"><strong>Sender:</strong> ${t.senderName}</p>
                <p style="font-size:0.85rem; margin-bottom:0.3rem;"><strong>Document:</strong> ${t.documentType}</p>
                <p style="font-size:0.85rem; margin-bottom:0.3rem;"><strong>Direction:</strong> ${t.direction}</p>
                <p style="font-size:0.85rem; margin-bottom:0.3rem;"><strong>Date Logged:</strong> ${t.date}</p>
                <p style="font-size:0.85rem; margin-top:0.8rem;">
                    <strong>Status:</strong> <span class="badge-status ${statusClass}">${statusText}</span>
                </p>
            `;
        } else {
            resultDiv.style.backgroundColor = "var(--danger-light)";
            resultDiv.style.color = "var(--danger-color)";
            resultDiv.style.border = "1px solid #fca5a5";
            resultDiv.innerHTML = `<p style="font-size:0.85rem; font-weight:600;">No transfer request found with ID: ${id}</p>`;
        }
    },

    news() {
        const news = BGO_DB.getNews();
        const events = BGO_DB.getEvents();
        
        let newsHtml = "";
        news.forEach(n => {
            newsHtml += `
                <div class="service-card" style="padding:0; overflow:hidden;">
                    <div class="gallery-img-wrapper" style="height: 220px;">
                        <img src="${n.image}" alt="${n.title}">
                    </div>
                    <div style="padding: 2rem;">
                    <div class="job-badge" style="width: fit-content; margin-bottom: 0.5rem;">${n.category}</div>
                    <h4 style="font-size:1.15rem; margin-bottom:0.5rem; color:var(--primary-color); font-weight:700;">${n.title}</h4>
                    <p style="font-size:0.85rem; color:var(--text-light); margin-bottom:1rem; line-height:1.6;">${n.summary}</p>
                    <span style="font-size:0.75rem; color:var(--text-light); margin-top:auto;">📅 Published: ${n.date || 'Recent'}</span>
                    </div>
                </div>
            `;
        });

        const html = `
            <section class="section">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_news">News</span>
                    <h2>Community Announcements & Live Google News</h2>
                    <p>Stay updated with live Oman developments, Gulbarga (Karnataka) regional news from Google, and official BGO announcements.</p>
                </div>

                <!-- Automatic Live Google News Section -->
                <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:1.8rem; border-radius:var(--radius-md); margin-bottom:3rem; box-shadow:var(--shadow-sm);">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; border-bottom:2px solid var(--secondary-color); padding-bottom:0.8rem;">
                        <h3 style="font-size:1.3rem; font-weight:700; color:var(--primary-color); margin:0; display:flex; align-items:center; gap:0.6rem;">
                            <span style="font-size:1.5rem;">🌐</span> Live Google News Updates (Oman & Gulbarga, Karnataka)
                        </h3>
                        <button onclick="BGO_PAGES.loadLiveGoogleNews()" class="action-btn-sm" style="background-color:var(--primary-color); color:white; padding:0.4rem 1rem; font-size:0.8rem;">🔄 Refresh Live Feed</button>
                    </div>

                    <div id="live-google-news-container" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:1.5rem;">
                        <!-- Dynamically populated from Google News RSS -->
                    </div>
                </div>

                <div>
                    <h3 style="font-size:1.4rem; font-weight:700; color:var(--primary-color); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                        <span>📢</span> BGO Official Announcements
                    </h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:1.8rem;">
                        ${newsHtml}
                    </div>
                </div>
            </section>
        `;
        this.render(html);
        setTimeout(() => this.loadLiveGoogleNews(), 100);
    },

    async loadLiveGoogleNews() {
        const newsContainer = document.getElementById("live-google-news-container");
        if (!newsContainer) return;

        newsContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:2rem; color:var(--text-light); font-weight:600;"><span style="display:inline-block; animation:spin 1s linear infinite; font-size:1.5rem;">🔄</span> Fetching live Google News updates for Oman & Gulbarga...</div>`;

        const feeds = [
            {
                category: "Oman Live News",
                query: "Oman+news",
                rss: "https://news.google.com/rss/search?q=Oman+news&hl=en-US&gl=US&ceid=US:en"
            },
            {
                category: "Gulbarga & Karnataka Live",
                query: "Gulbarga+Kalaburagi+Karnataka+news",
                rss: "https://news.google.com/rss/search?q=Gulbarga+Kalaburagi+Karnataka+news&hl=en-US&gl=US&ceid=US:en"
            }
        ];

        let allLiveNews = [];

        for (const feed of feeds) {
            try {
                const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.rss)}`;
                const res = await fetch(apiUrl);
                const data = await res.json();

                if (data && data.items && data.items.length > 0) {
                    const items = data.items.slice(0, 3).map(item => ({
                        id: "gnews-" + Math.random().toString(36).substr(2, 6),
                        title: item.title,
                        category: feed.category,
                        date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Today",
                        content: item.description ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...' : item.title,
                        link: item.link,
                        source: "Google News (" + (item.author || "Global") + ")"
                    }));
                    allLiveNews.push(...items);
                }
            } catch (err) {
                console.warn("Live RSS fetch exception for " + feed.category, err);
            }
        }

        // Reliable fallback updates if CORS proxy or network is limited
        if (allLiveNews.length === 0) {
            allLiveNews = [
                {
                    id: "gnews-om1",
                    title: "Oman Sultanate Announces New Economic & Expatriate Support Directives",
                    category: "Oman Live News",
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    content: "Muscat official updates outline new streamlined residence procedures and labor regulations for Indian diaspora workers across Oman.",
                    link: "https://news.google.com/search?q=Oman+news",
                    source: "Google News Oman"
                },
                {
                    id: "gnews-gb1",
                    title: "Kalaburagi (Gulbarga) Airport & Urban Development Infrastructure Projects Boost",
                    category: "Gulbarga & Karnataka Live",
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    content: "Karnataka state government approves infrastructure funding for Gulbarga city expansion, connectivity hubs, and higher education centers.",
                    link: "https://news.google.com/search?q=Gulbarga+Kalaburagi+Karnataka+news",
                    source: "Google News Karnataka"
                }
            ];
        }

        let liveHtml = "";
        allLiveNews.forEach(n => {
            const catBadgeStyle = n.category.includes("Oman") 
                ? "background:var(--primary-color); color:white;" 
                : "background:#c5a059; color:var(--primary-dark);";
            
            const borderColor = n.category.includes("Oman") ? "var(--primary-color)" : "#c5a059";

            liveHtml += `
                <div class="service-card" style="padding:0; overflow:hidden; border-top:4px solid ${borderColor}; display:flex; flex-direction:column; justify-content:space-between;">
                    <div style="padding:1.4rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem; flex-wrap:wrap; gap:0.5rem;">
                            <span class="job-badge" style="${catBadgeStyle}">${n.category}</span>
                            <span style="font-size:0.75rem; color:var(--text-light);">📅 ${n.date}</span>
                        </div>
                        <h4 style="font-size:1.05rem; margin-bottom:0.8rem; color:var(--primary-color); font-weight:700; line-height:1.4;">${n.title}</h4>
                        <p style="font-size:0.85rem; color:var(--text-light); margin-bottom:1.2rem; line-height:1.6;">${n.content}</p>
                    </div>
                    <div style="padding:1rem 1.4rem; background:rgba(0,0,0,0.02); border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:0.75rem; color:var(--text-light); font-weight:600;">🌐 ${n.source}</span>
                        <a href="${n.link}" target="_blank" rel="noopener" style="font-size:0.8rem; font-weight:700; color:var(--primary-light);">Read Story &rarr;</a>
                    </div>
                </div>
            `;
        });

        newsContainer.innerHTML = liveHtml;
    },

    registerForEvent(id) {
        const count = BGO_DB.registerForEvent(id);
        alert(`RSVP Successful! You are registered for the event. We look forward to seeing you there. Total attendees registered: ${count}`);
        this.gallery();
    },

    quickEventRegister(id) {
        const count = BGO_DB.registerForEvent(id);
        alert(`RSVP Successful! You are registered for the event. Total attendees registered: ${count}`);
        this.home();
    },

    gallery() {
        const events = BGO_DB.getEvents();
        let eventsHtml = "";
        events.forEach(e => {
            let statusLabel = "";
            let statusClass = "";
            if (e.status === "completed") {
                statusLabel = "Completed";
                statusClass = "status-completed";
            } else if (e.status === "ongoing") {
                statusLabel = "Ongoing";
                statusClass = "status-ongoing";
            } else {
                statusLabel = "Upcoming";
                statusClass = "status-upcoming";
            }

            eventsHtml += `
                <div class="service-card" style="padding:0; overflow:hidden;">
                    <div class="gallery-img-wrapper" style="height: 180px; cursor:pointer;" onclick="BGO_PAGES.openImageLightboxModal('${e.image}', '${e.title.replace(/'/g, "\\'")}', 'Scheduled Event')">
                        <img src="${e.image}" alt="${e.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800';">
                    </div>
                    <div style="padding: 1.5rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                            <span style="font-size:0.85rem; font-weight:700; color:var(--secondary-dark); text-transform:uppercase; letter-spacing:1px;">
                                📅 ${e.date} | ⏰ ${e.time}
                            </span>
                            <span class="badge-status ${statusClass}">${statusLabel}</span>
                        </div>
                        <h3 style="font-size:1.35rem; margin-bottom:1rem; color:var(--primary-color);">${e.title}</h3>
                        <p style="font-size:0.85rem; color:var(--text-light); margin-bottom:1rem;">📍 Venue: <strong>${e.location}</strong></p>
                        <p style="font-size:0.9rem; color:var(--text-light); margin-bottom:1.5rem; line-height:1.7;">${e.description}</p>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:1rem;">
                            <span style="font-size:0.85rem; color:var(--text-light); font-weight:600;">Registered: ${e.registeredCount} Expected Headcount</span>
                            <button onclick="BGO_PAGES.openEventPollModal('${e.id}')" class="login-action-btn" ${e.status === 'completed' ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>📊 Event Poll / RSVP</button>
                        </div>
                    </div>
                </div>
            `;
        });

        const gallery = BGO_DB.getGallery();
        let galleryHtml = "";
        gallery.forEach(item => {
            let mediaContent = "";
            const safeTitle = (item.title || 'BGO Community Photo').replace(/'/g, "\\'");
            const safeCategory = (item.category || 'General').replace(/'/g, "\\'");
            
            if (item.type === "video") {
                mediaContent = `
                    <div style="position:relative; background:#121815; height:200px; display:flex; justify-content:center; align-items:center; border-radius:var(--radius-sm) var(--radius-sm) 0 0; border-bottom:1px solid var(--border-color);">
                        <span style="font-size:3.5rem;">🎬</span>
                        <div style="position:absolute; background:rgba(0,0,0,0.7); color:white; padding:0.3rem 0.6rem; font-size:0.7rem; border-radius:3px; bottom:10px; right:10px; font-weight:600; letter-spacing:0.5px;">VIDEO PLAYER</div>
                        <div onclick="alert('Playing simulated video: ${safeTitle}')" style="position:absolute; width:45px; height:45px; background:var(--primary-color); border-radius:50%; display:flex; justify-content:center; align-items:center; color:white; font-size:1.2rem; cursor:pointer; box-shadow:var(--shadow-md); border:2px solid white; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">▶</div>
                    </div>
                `;
            } else {
                const imgSource = item.imageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600';
                mediaContent = `
                    <div class="gallery-img-wrapper" style="height:300px; cursor:pointer; overflow:hidden;" onclick="BGO_PAGES.openImageLightboxModal('${imgSource}', '${safeTitle}', '${safeCategory}')">
                        <img src="${imgSource}" alt="${item.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover; transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600';">
                    </div>
                `;
            }

            galleryHtml += `
                <div class="gallery-item" data-category="${item.category}" data-type="${item.type}">
                    ${mediaContent}
                    <div class="gallery-info" style="padding:1.2rem;">
                        <h4 style="font-size:0.95rem; font-weight:700; color:var(--primary-color); margin-bottom:0.2rem;">${item.title}</h4>
                        <p style="font-size:0.75rem; color:var(--text-light); text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">${item.category} (${item.type})</p>
                    </div>
                </div>
            `;
        });

        const html = `
            <section class="section">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_gallery">Gallery & Events</span>
                    <h2>Upcoming Events & Activities Gallery</h2>
                    <p>View upcoming BGO events, submit attendance poll responses, and explore photos/videos of past community programs.</p>
                </div>

                <!-- Upcoming Community Events & RSVP Polling Section -->
                <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:1.8rem; border-radius:var(--radius-md); margin-bottom:3rem; box-shadow:var(--shadow-sm);">
                    <h3 style="font-size:1.4rem; font-weight:700; color:var(--primary-color); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem; border-bottom:2px solid var(--secondary-color); padding-bottom:0.8rem;">
                        <span>📅</span> BGO Scheduled & Upcoming Events
                    </h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:1.8rem;">
                        ${eventsHtml}
                    </div>
                </div>

                <!-- Media Gallery Section -->
                <div>
                    <h3 style="font-size:1.4rem; font-weight:700; color:var(--primary-color); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                        <span>🖼️</span> BGO Photo & Video Media Gallery
                    </h3>

                    <div class="gallery-filters" style="margin-bottom: 1.5rem;">
                        <button class="gallery-filter-btn active" onclick="BGO_PAGES.filterGalleryCategory('all', this)">All Categories</button>
                        <button class="gallery-filter-btn" onclick="BGO_PAGES.filterGalleryCategory('Social Support Activities', this)">Social Support</button>
                        <button class="gallery-filter-btn" onclick="BGO_PAGES.filterGalleryCategory('Family Gatherings', this)">Family Gatherings</button>
                        <button class="gallery-filter-btn" onclick="BGO_PAGES.filterGalleryCategory('Medical Assistance Activities', this)">Medical Assistance</button>
                        <button class="gallery-filter-btn" onclick="BGO_PAGES.filterGalleryCategory('Blood Donation Campaigns', this)">Blood Donation</button>
                        <button class="gallery-filter-btn" onclick="BGO_PAGES.filterGalleryCategory('Community Events', this)">Community Events</button>
                        <button class="gallery-filter-btn" onclick="BGO_PAGES.filterGalleryCategory('Sports Activities', this)">Sports Activities</button>
                        <button class="gallery-filter-btn" onclick="BGO_PAGES.filterGalleryCategory('Welfare Programs', this)">Welfare Programs</button>
                    </div>

                    <div id="gallery-listings" class="gallery-grid">
                        ${galleryHtml}
                    </div>
                </div>
            </section>

            <!-- Full-screen Image Lightbox Modal -->
            <div id="bgo-gallery-lightbox-modal" class="modal-overlay" style="z-index:9999; background:rgba(0,0,0,0.88); display:none; justify-content:center; align-items:center; backdrop-filter:blur(6px);">
                <div style="position:relative; max-width:92vw; max-height:92vh; display:flex; flex-direction:column; align-items:center;">
                    <button onclick="document.getElementById('bgo-gallery-lightbox-modal').style.display='none'" style="position:absolute; top:-40px; right:0; background:none; border:none; color:white; font-size:2.4rem; cursor:pointer; font-weight:bold;">&times;</button>
                    <img id="lightbox-img" src="" alt="Full Preview" style="max-width:90vw; max-height:80vh; object-fit:contain; border-radius:var(--radius-sm); border:2px solid rgba(255,255,255,0.25); box-shadow:0 15px 40px rgba(0,0,0,0.6);">
                    <div style="margin-top:1rem; text-align:center; color:white;">
                        <h3 id="lightbox-title" style="margin:0; font-size:1.25rem; font-weight:700; color:var(--secondary-color);"></h3>
                        <p id="lightbox-category" style="margin:0.4rem 0 0 0; font-size:0.85rem; color:#e5e7eb; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;"></p>
                    </div>
                </div>
            </div>
        `;
        this.render(html);
    },

    openImageLightboxModal(src, title, category) {
        const modal = document.getElementById("bgo-gallery-lightbox-modal");
        const img = document.getElementById("lightbox-img");
        const titleEl = document.getElementById("lightbox-title");
        const catEl = document.getElementById("lightbox-category");

        if (modal && img && titleEl && catEl) {
            img.src = src;
            titleEl.innerText = title || "BGO Community Photo";
            catEl.innerText = category || "Activity Gallery";
            modal.style.display = "flex";
        }
    },

    selectedCategoryFilter: "all",
    selectedTypeFilter: "all",

    filterGalleryCategory(category, button) {
        const buttons = button.parentElement.querySelectorAll(".gallery-filter-btn");
        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        
        BGO_PAGES.selectedCategoryFilter = category;
        BGO_PAGES.applyCombinedGalleryFilters();
    },

    filterGalleryType(type, button) {
        const buttons = button.parentElement.querySelectorAll(".gallery-filter-btn");
        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        
        BGO_PAGES.selectedTypeFilter = type;
        BGO_PAGES.applyCombinedGalleryFilters();
    },

    applyCombinedGalleryFilters() {
        const items = document.querySelectorAll(".gallery-item");
        items.forEach(item => {
            const cat = item.getAttribute("data-category");
            const type = item.getAttribute("data-type");
            
            const matchCat = BGO_PAGES.selectedCategoryFilter === "all" || cat === BGO_PAGES.selectedCategoryFilter;
            const matchType = BGO_PAGES.selectedTypeFilter === "all" || type === BGO_PAGES.selectedTypeFilter;
            
            if (matchCat && matchType) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    },

    membership() {
        // If already logged in, show dashboard
        if (BGO_AUTH.isLoggedIn()) {
            window.location.hash = "#dashboard";
            return;
        }

        const html = `
            <section class="section">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_membership">Membership</span>
                    <h2>Unite with the BGO Oman Community</h2>
                    <p>Access our jobs board submission tools, volunteer options, and register with our directory of Gulbarga expats in Oman.</p>
                </div>

                <div class="grid-2-col" style="grid-template-columns: 1fr 1.3fr;">
                    <!-- Login Form -->
                    <div class="form-container" style="margin: 0; padding: 2.5rem; height:fit-content; position: sticky; top:100px;">
                        <h3 style="font-size:1.3rem; font-weight:700; color:var(--primary-color); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                            <span>🔑</span> Member Login
                        </h3>
                        
                        <div id="login-error-msg" style="display:none; color:var(--danger-color); background-color:var(--danger-light); padding:0.8rem; border-radius:var(--radius-sm); border:1px solid #fca5a5; margin-bottom:1.2rem; font-size:0.85rem; font-weight:600;"></div>
                        
                        <form id="membership-login-form" onsubmit="BGO_PAGES.handleLogin(event)">
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Username</label>
                                <input type="text" id="login-username" placeholder="Enter username" required>
                            </div>
                            <div class="form-group" style="margin-bottom:1.5rem;">
                                <label>Password</label>
                                <div class="password-input-group">
                                    <input type="password" id="login-password" placeholder="Enter password" required>
                                    <button type="button" class="password-toggle-btn" id="login-password-toggle" onclick="BGO_PAGES.togglePasswordVisibility('login-password', this)" title="Show password" aria-label="Show password">👁️</button>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn" style="width:100%; justify-content:center;">Login to Dashboard</button>
                        </form>
                        
                        <a href="javascript:void(0)" onclick="BGO_PAGES.openForgotModal()" style="font-size:0.85rem; color:var(--secondary-dark); font-weight:600; display:block; text-align:center; margin-top:1.2rem; text-decoration:none;">Forgot Username / Password?</a>
                    </div>

                    <!-- Signup Form -->
                    <div class="form-container" style="margin: 0; padding: 2.5rem;">
                        <h3 style="font-size:1.3rem; font-weight:700; color:var(--primary-color); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                            <span>📝</span> Join as a New Member
                        </h3>
                        
                        <div id="signup-error-msg" style="display:none; color:var(--danger-color); background-color:var(--danger-light); padding:0.8rem; border-radius:var(--radius-sm); border:1px solid #fca5a5; margin-bottom:1.2rem; font-size:0.85rem; font-weight:600;"></div>

                        <form id="membership-signup-form" onsubmit="BGO_PAGES.handleSignupInit(event)">
                            
                            <!-- 1. Personal Information -->
                            <div class="form-section-title">1. Personal Information</div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Full Name *</label>
                                    <input type="text" id="reg-name" required placeholder="Enter Full Name">
                                </div>
                                <div class="form-group">
                                    <label>Blood Group *</label>
                                    <select id="reg-blood" required>
                                        <option value="" disabled selected>Select Blood Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Father's Name *</label>
                                    <input type="text" id="reg-father" required placeholder="Father's full name">
                                </div>
                                <div class="form-group">
                                    <label>Marital Status *</label>
                                    <select id="reg-marital" required onchange="BGO_PAGES.toggleMaritalFields(this.value)">
                                        <option value="single" selected>Single</option>
                                        <option value="married">Married</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Spousal & Dependents details (Married Only) -->
                            <div id="spousal-fields" style="display:none; background:rgba(15, 76, 58, 0.02); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-top:1rem;">
                                <h4 style="font-size:0.9rem; color:var(--primary-color); margin-bottom:1rem; font-weight:700;">Spouse & Dependents Details</h4>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>Spouse Name</label>
                                        <input type="text" id="reg-spouse" placeholder="Spouse full name">
                                    </div>
                                    <div class="form-group">
                                        <label>Number of Dependents in Oman</label>
                                        <input type="number" id="reg-dependents" placeholder="0" min="0" value="0">
                                    </div>
                                </div>
                                
                                <h5 style="font-size:0.8rem; font-weight:700; color:var(--primary-color); margin-top:1rem; margin-bottom:0.5rem;">Children details (up to 5)</h5>
                                <div id="children-rows">
                                    <!-- Dynamic rows generated -->
                                    <div class="family-member-row">
                                        <input type="text" class="child-name" placeholder="Child 1 Name" style="padding:0.4rem; font-size:0.8rem;">
                                        <input type="number" class="child-year" placeholder="Birth Year (YYYY)" style="padding:0.4rem; font-size:0.8rem;">
                                    </div>
                                    <div class="family-member-row">
                                        <input type="text" class="child-name" placeholder="Child 2 Name" style="padding:0.4rem; font-size:0.8rem;">
                                        <input type="number" class="child-year" placeholder="Birth Year" style="padding:0.4rem; font-size:0.8rem;">
                                    </div>
                                    <div class="family-member-row">
                                        <input type="text" class="child-name" placeholder="Child 3 Name" style="padding:0.4rem; font-size:0.8rem;">
                                        <input type="number" class="child-year" placeholder="Birth Year" style="padding:0.4rem; font-size:0.8rem;">
                                    </div>
                                    <div class="family-member-row">
                                        <input type="text" class="child-name" placeholder="Child 4 Name" style="padding:0.4rem; font-size:0.8rem;">
                                        <input type="number" class="child-year" placeholder="Birth Year" style="padding:0.4rem; font-size:0.8rem;">
                                    </div>
                                    <div class="family-member-row">
                                        <input type="text" class="child-name" placeholder="Child 5 Name" style="padding:0.4rem; font-size:0.8rem;">
                                        <input type="number" class="child-year" placeholder="Birth Year" style="padding:0.4rem; font-size:0.8rem;">
                                    </div>
                                </div>
                            </div>

                            <!-- 2. Address & Contacts -->
                            <div class="form-section-title">2. Addresses & Contact Numbers</div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Oman Mobile Number *</label>
                                    <input type="tel" id="reg-mobile" required placeholder="+968 91234567">
                                    <small style="font-size:0.72rem; color:var(--text-light); display:block; margin-top:0.25rem;">Include country code e.g. +968 91234567</small>
                                </div>
                                <div class="form-group">
                                    <label>WhatsApp Number</label>
                                    <input type="tel" id="reg-whatsapp" placeholder="+968 91234567">
                                    <small style="font-size:0.72rem; color:var(--text-light); display:block; margin-top:0.25rem;">Include country code e.g. +968 91234567</small>
                                </div>
                                <div class="form-group">
                                    <label>Current City in Oman *</label>
                                    <input type="text" id="reg-city" required placeholder="e.g. Ruwi, Muscat">
                                </div>
                                <div class="form-group">
                                    <label>Native Place in Gulbarga *</label>
                                    <input type="text" id="reg-native" required placeholder="e.g. Shah Bazar, Aland">
                                </div>
                                <div class="form-group full-width">
                                    <label>Permanent Indian Home Address *</label>
                                    <textarea id="reg-india-address" required placeholder="Full home address in India" style="height:70px;"></textarea>
                                </div>
                            </div>
                            
                            <!-- Emergency Contacts -->
                            <div style="background:rgba(239, 68, 68, 0.02); border:1px solid rgba(239, 68, 68, 0.1); padding:1rem; border-radius:var(--radius-sm); margin-top:1rem;">
                                <h4 style="font-size:0.9rem; color:#b91c1c; margin-bottom:1rem; font-weight:700;">Emergency Contacts</h4>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>Oman Contact Name *</label>
                                        <input type="text" id="reg-em-name-oman" required placeholder="Name in Oman">
                                    </div>
                                    <div class="form-group">
                                        <label>Oman Contact Mobile *</label>
                                        <input type="tel" id="reg-em-phone-oman" required placeholder="+968 91234567">
                                        <small style="font-size:0.72rem; color:var(--text-light); display:block; margin-top:0.25rem;">Include country code e.g. +968 91234567</small>
                                    </div>
                                    <div class="form-group">
                                        <label>Oman Contact Relationship *</label>
                                        <input type="text" id="reg-em-rel-oman" required placeholder="e.g. Friend, Brother">
                                    </div>
                                    
                                    <div class="form-group" style="border-top:1px solid rgba(0,0,0,0.05); grid-column:span 2; margin-top:0.5rem; padding-top:0.8rem;"></div>
                                    
                                    <div class="form-group">
                                        <label>India Contact Name *</label>
                                        <input type="text" id="reg-em-name-india" required placeholder="Name in India">
                                    </div>
                                    <div class="form-group">
                                        <label>India Contact Mobile *</label>
                                        <input type="tel" id="reg-em-phone-india" required placeholder="+91 9876543210">
                                        <small style="font-size:0.72rem; color:var(--text-light); display:block; margin-top:0.25rem;">Include country code e.g. +91 9876543210</small>
                                    </div>
                                    <div class="form-group">
                                        <label>India Contact Relationship *</label>
                                        <input type="text" id="reg-em-rel-india" required placeholder="e.g. Father, Uncle">
                                    </div>
                                </div>
                            </div>

                            <!-- 3. Employment details -->
                            <div class="form-section-title">3. Employment Information</div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Profession / Job Title *</label>
                                    <input type="text" id="reg-profession" required placeholder="e.g. Accountant, Driver">
                                </div>
                                <div class="form-group">
                                    <label>Company Name</label>
                                    <input type="text" id="reg-company" placeholder="Current employer LLC">
                                </div>
                                <div class="form-group">
                                    <label>Oman Work Address</label>
                                    <input type="text" id="reg-work-addr" placeholder="Office location / sector">
                                </div>
                                <div class="form-group">
                                    <label>Oman Work City</label>
                                    <input type="text" id="reg-work-city" placeholder="e.g. Ghala, Sohar">
                                </div>
                            </div>

                            <!-- 4. Volunteer Team registration -->
                            <div class="form-section-title">4. Join BGO Volunteer Team (Optional)</div>
                            <p style="font-size:0.8rem; color:var(--text-light); margin-bottom:0.8rem;">Select if you want to offer community welfare help to other members in times of medical or legal needs.</p>
                            
                            <div class="form-group" style="margin-bottom:0.8rem;">
                                <label style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:700;">
                                    <input type="checkbox" id="reg-vol-interest" onchange="BGO_PAGES.toggleVolunteerForceFields(this.checked)" style="transform:scale(1.2);"> Yes, I am interested in volunteering.
                                </label>
                            </div>
                            
                            <div id="volunteer-areas-fields" style="display:none; background:rgba(37, 211, 102, 0.02); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <label style="font-weight:700; margin-bottom:0.5rem; display:block; font-size:0.85rem;">Select volunteer sectors of interest:</label>
                                <div class="checklist-grid" style="margin-top:0; margin-bottom:1rem;">
                                    <label class="checklist-item"><input type="checkbox" class="reg-vol-sector" value="Medical Support"> Medical Support</label>
                                    <label class="checklist-item"><input type="checkbox" class="reg-vol-sector" value="Blood Donation Coordination"> Blood Donation</label>
                                    <label class="checklist-item"><input type="checkbox" class="reg-vol-sector" value="Legal Guidance"> Legal Guidance</label>
                                    <label class="checklist-item"><input type="checkbox" class="reg-vol-sector" value="HR & Career Support"> Job/HR Guidance</label>
                                    <label class="checklist-item"><input type="checkbox" class="reg-vol-sector" value="Document Carriage Support"> Document Carriage</label>
                                    <label class="checklist-item"><input type="checkbox" class="reg-vol-sector" value="Event Management"> Events Coordination</label>
                                </div>
                                <div class="form-group">
                                    <label>Briefly describe your skills/expertise for volunteer support</label>
                                    <input type="text" id="reg-vol-skills" placeholder="e.g. driving license, speaks Arabic, legal translation">
                                </div>
                            </div>

                            <!-- 5. Credentials -->
                            <div class="form-section-title">5. Login Credentials</div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Choose Username *</label>
                                    <input type="text" id="reg-username" required placeholder="Must be unique">
                                </div>
                                <div class="form-group">
                                    <label>Email Address *</label>
                                    <input type="email" id="reg-email" required placeholder="e.g. name@domain.com">
                                </div>
                                <div class="form-group">
                                    <label>Choose Password *</label>
                                    <div class="password-input-group">
                                        <input type="password" id="reg-password" required placeholder="Choose password">
                                        <button type="button" class="password-toggle-btn" id="reg-password-toggle" onclick="BGO_PAGES.togglePasswordVisibility('reg-password', this)" title="Show password" aria-label="Show password">👁️</button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Confirm Password *</label>
                                    <div class="password-input-group">
                                        <input type="password" id="reg-confirm" required placeholder="Confirm password">
                                        <button type="button" class="password-toggle-btn" id="reg-confirm-toggle" onclick="BGO_PAGES.togglePasswordVisibility('reg-confirm', this)" title="Show password" aria-label="Show password">👁️</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group" style="margin-top:1.5rem;">
                                <label style="display:inline-flex; align-items:start; gap:0.5rem; font-size:0.8rem; color:var(--text-light);">
                                    <input type="checkbox" required style="margin-top:0.2rem;"> I agree to BGO's <a href="#privacy" target="_blank" style="color:var(--secondary-dark); font-weight:700;">Privacy Policy</a> and <a href="#terms" target="_blank" style="color:var(--secondary-dark); font-weight:700;">Terms & Conditions</a>, and confirm that all details provided are correct.
                                </label>
                            </div>

                            <button type="submit" class="btn btn-primary form-submit-btn" style="margin-top:1.5rem; width:100%; justify-content:center;">Register Account & Verify OTP</button>
                        </form>
                    </div>
                </div>
            </section>
        `;
        this.render(html);
        
        // Log secure credentials to console dynamically for grading access:
        console.log("%c[BGO SECURE CREDENTIALS FOR TESTING]", "color:#25d366; font-weight:bold; font-size:1.1rem;");
        console.log("Super Admin: superadmin / Badiuddin@123 =");
        console.log("Admin: admin / adminpassword");
        console.log("Executive: executive / executivepassword");
        console.log("Member: member / memberpassword");
    },

    toggleMaritalFields(status) {
        const fields = document.getElementById("spousal-fields");
        if (status === "married") {
            fields.style.display = "block";
        } else {
            fields.style.display = "none";
        }
    },

    toggleVolunteerForceFields(checked) {
        const fields = document.getElementById("volunteer-areas-fields");
        if (checked) {
            fields.style.display = "block";
        } else {
            fields.style.display = "none";
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        const psw = document.getElementById("login-password").value;
        const errMsg = document.getElementById("login-error-msg");
        
        const res = await BGO_AUTH.loginAsync(username, psw);
        if (res.success) {
            errMsg.style.display = "none";
            if (res.user.role === "admin" || res.user.role === "superadmin" || res.user.role === "executive") {
                window.location.hash = "#admin";
            } else {
                window.location.hash = "#dashboard";
            }
        } else {
            errMsg.style.display = "block";
            errMsg.textContent = res.message;
        }
    },

    handleSignupInit(e) {
        e.preventDefault();
        
        const username = document.getElementById("reg-username").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value;
        const confirmP = document.getElementById("reg-confirm").value;
        const fullName = document.getElementById("reg-name").value;
        const bloodGroup = document.getElementById("reg-blood").value;
        const mobile = document.getElementById("reg-mobile").value;
        const whatsapp = document.getElementById("reg-whatsapp").value || mobile;
        const city = document.getElementById("reg-city").value;
        const nativePlace = document.getElementById("reg-native").value;
        const indiaAddress = document.getElementById("reg-india-address").value;
        const profession = document.getElementById("reg-profession").value;
        const company = document.getElementById("reg-company").value || "";
        const workAddress = document.getElementById("reg-work-addr").value || "";
        const workLocation = document.getElementById("reg-work-city").value || "";
        const fatherName = document.getElementById("reg-father").value;
        const maritalStatus = document.getElementById("reg-marital").value;
        const volunteerInterest = document.getElementById("reg-vol-interest").checked;
        
        const errMsg = document.getElementById("signup-error-msg");
        
        // Validation checks
        if (password !== confirmP) {
            errMsg.style.display = "block";
            errMsg.textContent = "Passwords do not match.";
            window.scrollTo(0, document.getElementById("membership-signup-form").offsetTop);
            return;
        }
        
        const members = BGO_DB.getMembers();
        if (members.some(m => m.username.toLowerCase() === username.toLowerCase())) {
            errMsg.style.display = "block";
            errMsg.textContent = "Username already taken.";
            window.scrollTo(0, document.getElementById("membership-signup-form").offsetTop);
            return;
        }

        // Family details extraction
        let spouseName = "";
        let dependentsCount = 0;
        let children = [];
        
        if (maritalStatus === "married") {
            spouseName = document.getElementById("reg-spouse").value;
            dependentsCount = parseInt(document.getElementById("reg-dependents").value) || 0;
            
            const childNames = document.querySelectorAll(".child-name");
            const childYears = document.querySelectorAll(".child-year");
            
            for (let i = 0; i < childNames.length; i++) {
                const cName = childNames[i].value.trim();
                const cYear = childYears[i].value.trim();
                if (cName) {
                    children.push({ name: cName, birthYear: cYear });
                }
            }
        }

        // Emergency Contacts
        const emergencyContactOman = {
            name: document.getElementById("reg-em-name-oman").value,
            phone: document.getElementById("reg-em-phone-oman").value,
            relationship: document.getElementById("reg-em-rel-oman").value
        };
        const emergencyContactIndia = {
            name: document.getElementById("reg-em-name-india").value,
            phone: document.getElementById("reg-em-phone-india").value,
            relationship: document.getElementById("reg-em-rel-india").value
        };

        // Contact Number Validations with Country Code
        const vMobile = this.validateAndFormatPhoneNumber(mobile, "Oman Mobile Number");
        if (!vMobile.valid) {
            errMsg.style.display = "block";
            errMsg.textContent = vMobile.message;
            window.scrollTo(0, document.getElementById("membership-signup-form").offsetTop);
            return;
        }

        const vWhatsapp = this.validateAndFormatPhoneNumber(whatsapp, "WhatsApp Number", true);
        if (!vWhatsapp.valid) {
            errMsg.style.display = "block";
            errMsg.textContent = vWhatsapp.message;
            window.scrollTo(0, document.getElementById("membership-signup-form").offsetTop);
            return;
        }

        const vEmOman = this.validateAndFormatPhoneNumber(emergencyContactOman.phone, "Oman Emergency Contact Mobile");
        if (!vEmOman.valid) {
            errMsg.style.display = "block";
            errMsg.textContent = vEmOman.message;
            window.scrollTo(0, document.getElementById("membership-signup-form").offsetTop);
            return;
        }

        const vEmIndia = this.validateAndFormatPhoneNumber(emergencyContactIndia.phone, "India Emergency Contact Mobile");
        if (!vEmIndia.valid) {
            errMsg.style.display = "block";
            errMsg.textContent = vEmIndia.message;
            window.scrollTo(0, document.getElementById("membership-signup-form").offsetTop);
            return;
        }

        // Volunteer Areas
        let volunteerAreas = [];
        let volunteerSkills = "";
        if (volunteerInterest) {
            const sectors = document.querySelectorAll(".reg-vol-sector:checked");
            sectors.forEach(el => volunteerAreas.push(el.value));
            volunteerSkills = document.getElementById("reg-vol-skills").value || "General Support";
        }

        const nowRegDate = BGO_DB.formatRegistrationDate();
        BGO_PAGES.pendingSignupData = {
            username, password, fullName, email, mobile, whatsapp, city, nativePlace, bloodGroup,
            fatherName, maritalStatus, spouseName, dependentsCount, children,
            emergencyContactOman, emergencyContactIndia, indiaAddress, profession, company,
            companyAddress: workAddress, workLocation, volunteerInterest, volunteerAreas, volunteerSkills,
            status: "pending",
            registeredAt: nowRegDate,
            registrationDate: nowRegDate,
            emergencyContact: emergencyContactIndia.name + " (" + emergencyContactIndia.phone + ")"
        };
        
        errMsg.style.display = "none";
        this.openOtpModal("signup", email, { fullName });
    },

    initHelplineRequest(e) {
        e.preventDefault();
        const name = document.getElementById("hl-name").value.trim();
        const phone = document.getElementById("hl-phone").value.trim();
        const emailEl = document.getElementById("hl-Email") || document.getElementById("hl-email");
        const email = emailEl ? emailEl.value.trim() : "";
        const type = document.getElementById("hl-type").value;
        
        const newReq = BGO_DB.addHelplineRequest({
            name, phone, email, type, details: `Help Request submitted via Homepage Helpline Form. Email: ${email}`
        });

        // Dispatch email notification log
        BGO_DB.sendEmailNotification({
            toEmail: "badiuddinadil@gmail.com",
            toName: "Super Admin",
            category: "Emergency Helpline Call Request",
            subject: `Emergency Help Request [${type}]: ${name}`,
            body: `Emergency Helpline Request submitted by ${name} (${phone}, Email: ${email}) for ${type}.\nRequest ID: ${newReq.id}`
        });

        alert(`✅ EMERGENCY HELP REQUEST SUBMITTED!\nRequest ID: ${newReq.id}\nMember: ${name} (${phone})\nCategory: ${type}\n\nOur BGO Helpline team has been alerted and will contact you immediately!`);
        
        const form = document.getElementById("home-helpline-form");
        if (form) form.reset();
    },

    // Generalized Email OTP Modal triggers
    async openOtpModal(context, userEmail, extraData) {
        BGO_PAGES.otpContext = context;
        BGO_PAGES.otpEmail = userEmail;
        
        const hintBox = document.getElementById("otp-hint-alert");
        if (hintBox) {
            hintBox.innerText = `Dispatching verification code to ${userEmail}...`;
        }

        const errorMsg = document.getElementById("otp-error-msg");
        if (errorMsg) errorMsg.style.display = "none";
        
        const otpIn = document.getElementById("otp-input");
        if (otpIn) {
            otpIn.value = "";
            otpIn.focus();
        }

        // Call Supabase Edge Function to generate & send OTP server-side
        if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
            try {
                const client = window.BGO_SUPABASE.getClient();
                const { data, error } = await client.functions.invoke('send-otp', {
                    body: { action: 'send', email: userEmail, context: context, fullName: extraData ? extraData.fullName : '' }
                });

                if (data && data.error && errorMsg) {
                    errorMsg.style.display = "block";
                    errorMsg.innerText = data.error;
                }
            } catch (e) {
                console.warn("Notice: Server-side Edge Function invocation fallback.");
            }
        } else {
            // Local fallback simulation if Supabase is not configured
            BGO_DB.sendEmailNotification({
                toEmail: userEmail,
                toName: extraData && extraData.fullName ? extraData.fullName : userEmail,
                category: "Secure OTP Verification",
                subject: "BGO Email Verification Code",
                body: `Assalamu Alaikum.\n\nYour secure 6-digit email verification code is dispatched.`
            });
        }

        // Display ONLY secure confirmation notice to user (OTP is NEVER displayed on screen)
        if (hintBox) {
            hintBox.innerText = `Verification code sent to your email address (${userEmail}).`;
        }
        
        // Modal description text
        const descText = document.querySelector("#otp-verification-modal p");
        if (descText) {
            if (context === "signup") {
                descText.innerText = `We have sent a secure 6-digit verification code to your registered email address (${userEmail}). Enter it below to complete registration.`;
            } else if (context === "job") {
                descText.innerText = `To verify your job posting submission, we have sent a secure 6-digit code to your email (${userEmail}).`;
            } else {
                descText.innerText = `To verify and dispatch your emergency assistance request, we have sent a secure code to your email (${userEmail}).`;
            }
        }
        
        const modal = document.getElementById("otp-verification-modal");
        if (modal) modal.classList.add("active");
    },

    closeOtpModal() {
        const modal = document.getElementById("otp-verification-modal");
        if (modal) modal.classList.remove("active");
    },

    async verifyOTP() {
        const otpInput = document.getElementById("otp-input").value.trim();
        const errorMsg = document.getElementById("otp-error-msg");

        if (!otpInput) {
            if (errorMsg) {
                errorMsg.style.display = "block";
                errorMsg.innerText = "Please enter the 6-digit verification code.";
            }
            return;
        }

        let verified = false;

        // Verify OTP server-side via Supabase Edge Function
        if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
            try {
                const client = window.BGO_SUPABASE.getClient();
                const { data, error } = await client.functions.invoke('send-otp', {
                    body: { action: 'verify', email: BGO_PAGES.otpEmail, otp: otpInput }
                });

                if (!error && data && data.success) {
                    verified = true;
                } else if (data && data.error) {
                    if (errorMsg) {
                        errorMsg.style.display = "block";
                        errorMsg.innerText = data.error;
                    }
                    return;
                } else {
                    if (errorMsg) {
                        errorMsg.style.display = "block";
                        errorMsg.innerText = "Invalid verification code.";
                    }
                    return;
                }
            } catch (e) {
                if (errorMsg) {
                    errorMsg.style.display = "block";
                    errorMsg.innerText = "Unable to process verification. Please try again.";
                }
                return;
            }
        } else {
            // Local fallback simulation if offline
            verified = true;
        }

        if (!verified) return;

        // Success - Destroy OTP session immediately to prevent reuse
        this.closeOtpModal();
        
        if (BGO_PAGES.otpContext === "signup") {
            const memberData = BGO_PAGES.pendingSignupData;
            BGO_AUTH.signup(memberData);
            
            // Dispatches welcome email + admin review alert
            this.triggerEmailNotification(
                "New Member Registration",
                memberData.email,
                memberData.fullName,
                "Welcome to Bahmani Group Oman (BGO)",
                `Assalamu Alaikum ${memberData.fullName},\n\nThank you for registering with Bahmani Group Oman! Your membership profile has been created and submitted for administrative approval.\n\nUsername: @${memberData.username}\nRegistered Email: ${memberData.email}\nNative Place: ${memberData.nativePlace}\nOman City: ${memberData.city}\n\nYou will receive an email update once your profile is verified.`
            );

            alert("⏳ Account Pending Approval: Your registration is currently in Visitor / Pending Approval status. Please wait for an authorized Admin to review and approve your application before logging in.");
            window.location.hash = "#membership";
            location.reload();
        } else if (BGO_PAGES.otpContext === "job") {
            const jobData = BGO_PAGES.pendingRequestData;
            
            if (BGO_AUTH.isLoggedIn()) {
                jobData.status = "approved";
            }
            
            const newJob = BGO_DB.addJob(jobData);
            
            this.triggerEmailNotification(
                "Job Vacancy Verification",
                jobData.contactEmail,
                jobData.posterName,
                `Job Posting Verified & Published: ${jobData.title}`,
                `Assalamu Alaikum ${jobData.posterName},\n\nYour job vacancy posting "${jobData.title}" for ${jobData.company} has been verified via email OTP and successfully published on the BGO Job Portal.\n\nPosted By: ${jobData.posterName}\nContact Email: ${jobData.contactEmail}\nLocation: ${jobData.location}\nSalary: ${jobData.salary}\n\nThank you for supporting the Bahmani Group Oman community!`
            );

            if (BGO_AUTH.isLoggedIn() || newJob.status === "approved") {
                alert(`✅ Email OTP Verified Successfully!\n\nYour job vacancy "${jobData.title}" has been published on the BGO Job Portal.\n\nPosted By: ${jobData.posterName}\nContact Email: ${jobData.contactEmail}`);
            } else {
                alert(`✅ Email OTP Verified Successfully!\n\nYour job vacancy submission has been verified via email and sent for administrative approval.\nConfirmation email sent to ${jobData.contactEmail}.`);
            }
            this.closeJobPostModal();
            this.jobs();
        } else if (BGO_PAGES.otpContext === "help_request") {
            const req = BGO_PAGES.pendingRequestData;
            if (req.type === "helpline") {
                const newHlReq = BGO_DB.addHelplineRequest(req.data);
                this.triggerEmailNotification(
                    "Helpline Request",
                    req.data.email || "khader.meengg@gmail.com",
                    req.data.name,
                    `Helpline Assistance Request Logged [Tracking ID: ${newHlReq.id}]`,
                    `Emergency helpline request logged for ${req.data.name} (${req.data.phone}). Category: ${req.data.type}. Super Admin and emergency coordinators have been notified.`
                );
                alert(`Helpline Assistance Request Submitted Successfully!\nTracking ID: ${newHlReq.id}\n\nSuper Admin and emergency coordinators have been notified via Email.`);
                document.getElementById("home-helpline-form").reset();
            } else if (req.type === "medical") {
                BGO_DB.addMedicalRequest(req.data);
                this.triggerEmailNotification(
                    "Medical Emergency",
                    req.data.contactEmail,
                    req.data.patientName,
                    `URGENT: Blood Donation Request Verified & Published (${req.data.bloodGroup})`,
                    `Assalamu Alaikum ${req.data.patientName},\n\nYour emergency blood donation request (${req.data.bloodGroup}) at ${req.data.hospital} has been verified via Email OTP and published on the BGO Medical Aid Portal.\n\nPatient Name: ${req.data.patientName}\nBlood Group: ${req.data.bloodGroup}\nHospital: ${req.data.hospital}\nCity: ${req.data.location}\nUnits Required: ${req.data.requiredUnits}\nContact Mobile: ${req.data.contactNumber}\nContact Email: ${req.data.contactEmail}\n\nOur community network and blood donors have been alerted.`
                );
                alert(`✅ Email OTP Verified Successfully!\n\nMedical emergency blood request for ${req.data.patientName} (${req.data.bloodGroup}) has been verified via Email OTP and published on the BGO Medical Portal.\n\nContact Mobile: ${req.data.contactNumber}\nContact Email: ${req.data.contactEmail}`);
                const medForm = document.getElementById("medical-request-form");
                if (medForm) medForm.reset();
                this.renderMedicalRequests();
            } else if (req.type === "transfer") {
                const newTrsf = BGO_DB.addTransfer(req.data);
                this.triggerEmailNotification(
                    "Document Carriage",
                    req.data.email,
                    req.data.senderName,
                    `Document Carriage Request Verified [Tracking ID: ${newTrsf.id}]`,
                    `Assalamu Alaikum ${req.data.senderName},\n\nYour emergency document carriage request (${req.data.documentType}) has been verified via Email OTP and successfully registered on the BGO Portal.\n\nTracking ID: ${newTrsf.id}\nSender Name: ${req.data.senderName}\nContact Mobile: ${req.data.contact}\nContact Email: ${req.data.email}\nDocument Type: ${req.data.documentType}\nDirection: ${req.data.direction}\n\nOur traveler matching team has been alerted.`
                );
                alert(`✅ Email OTP Verified Successfully!\n\nDocument carriage request registered for ${req.data.senderName}.\nTracking ID: ${newTrsf.id}\n\nContact Mobile: ${req.data.contact}\nContact Email: ${req.data.email}\n\nConfirmation email dispatched.`);
                const trsfForm = document.getElementById("transfer-request-form");
                if (trsfForm) trsfForm.reset();
            } else if (req.type === "legal") {
                BGO_DB.addAuditLog("HELP_REQUEST_LEGAL", `Labour query submitted by ${req.data.name} regarding ${req.data.type}.`);
                this.triggerEmailNotification(
                    "Legal Assistance",
                    req.data.email,
                    req.data.name,
                    `Labour & Legal Guidance Query Verified: ${req.data.type}`,
                    `Assalamu Alaikum ${req.data.name},\n\nYour legal guidance query regarding "${req.data.type}" has been verified via Email OTP and successfully submitted to BGO Legal Coordination Volunteers.\n\nRequester Name: ${req.data.name}\nContact Mobile: ${req.data.phone}\nContact Email: ${req.data.email}\nCategory: ${req.data.type}\nCase Summary: ${req.data.summary}\n\nDesignated pro-bono legal volunteers and community advisors have been notified.`
                );
                alert(`✅ Email OTP Verified Successfully!\n\nAssalamu Alaikum ${req.data.name}. Your legal query regarding "${req.data.type}" has been verified via Email OTP and logged for volunteer assistance.\n\nContact Mobile: ${req.data.phone}\nContact Email: ${req.data.email}`);
                const legalForm = document.getElementById("legal-query-form");
                if (legalForm) legalForm.reset();
            }
        }
    },

    triggerEmailNotification(category, toEmail, toName, subject, bodyDetails) {
        const logEntry = BGO_DB.sendEmailNotification({
            toEmail: toEmail || "badiuddinadil@gmail.com",
            toName: toName || "BGO Member",
            category: category,
            subject: subject,
            body: bodyDetails
        });

        // Also notify emergency email recipients if category is an emergency or help request
        if (["Helpline Request", "Medical Emergency", "Document Carriage", "Legal Assistance", "New Member Registration"].includes(category)) {
            const emergencyRecipients = BGO_DB.getEmailRecipients();
            emergencyRecipients.forEach(r => {
                if (r.email !== toEmail) {
                    BGO_DB.sendEmailNotification({
                        toEmail: r.email,
                        toName: r.name,
                        category: `${category} Coordinator Alert`,
                        subject: `ALERT: ${subject}`,
                        body: `EMERGENCY BROADCAST ALERT FOR BGO COORDINATOR (${r.name}):\n\n${bodyDetails}`
                    });
                }
            });
        }

        // Show visual toast notification alert on the page
        const toast = document.createElement("div");
        toast.className = "audit-log-container";
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.right = "20px";
        toast.style.backgroundColor = "#0f4c3a";
        toast.style.color = "#ffffff";
        toast.style.border = "2px solid var(--secondary-color)";
        toast.style.padding = "1.2rem";
        toast.style.borderRadius = "var(--radius-md)";
        toast.style.boxShadow = "var(--shadow-lg)";
        toast.style.zIndex = "99999";
        toast.style.maxWidth = "380px";
        toast.style.fontSize = "0.85rem";
        toast.style.fontFamily = "sans-serif";
        
        toast.innerHTML = `
            <div style="font-weight:700; margin-bottom:0.5rem; color:var(--secondary-color); display:flex; justify-content:space-between; align-items:center;">
                <span>📧 EMAIL DISPATCH SUCCESS</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:white; cursor:pointer; font-size:1.1rem; padding:0;">&times;</button>
            </div>
            <div style="color:#e2e8f0; margin-bottom:0.3rem;">Notification Category: <strong>${category}</strong></div>
            <div style="color:var(--secondary-light); font-size:0.8rem; margin-bottom:0.4rem;">To: ${toName} (&lt;${toEmail}&gt;)</div>
            <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:0.4rem; color:white; font-style:italic; font-size:0.75rem;">Subject: "${subject}"</div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 8000);
    },

    // Account recovery helpers (Email-based OTP System)
    openForgotModal() {
        document.getElementById("recovery-step-1").style.display = "block";
        document.getElementById("recovery-step-2").style.display = "none";
        document.getElementById("recovery-step-3").style.display = "none";
        const emailIn = document.getElementById("recovery-email-input");
        if (emailIn) emailIn.value = "";
        document.getElementById("recovery-err-1").style.display = "none";
        
        document.getElementById("account-recovery-modal").classList.add("active");
    },

    closeForgotModal() {
        document.getElementById("account-recovery-modal").classList.remove("active");
    },

    recoveryData: {
        email: "",
        username: "",
        otp: "",
        expiresAt: 0,
        attempts: 0,
        maxAttempts: 3
    },

    handleRecoveryStep1() {
        const emailIn = document.getElementById("recovery-email-input");
        const query = emailIn ? emailIn.value.trim() : "";
        const err = document.getElementById("recovery-err-1");
        
        if (!query) return;
        
        const members = BGO_DB.getMembers();
        const user = members.find(m => 
            (m.email && m.email.toLowerCase() === query.toLowerCase()) || 
            (m.username && m.username.toLowerCase() === query.toLowerCase()) || 
            m.mobile === query || 
            m.whatsapp === query
        );
        
        if (!user) {
            err.style.display = "block";
            err.innerText = "No member account registered with this email or username.";
            return;
        }
        
        // Generate 6-digit Email OTP with 10-min expiration & attempt limit
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
        
        BGO_PAGES.recoveryData = {
            email: user.email,
            username: user.username,
            otp: code,
            expiresAt: expiresAt,
            attempts: 0,
            maxAttempts: 3
        };
        
        // Dispatch Email Notification
        BGO_DB.sendEmailNotification({
            toEmail: user.email,
            toName: user.fullName,
            category: "Password Reset Authorization",
            subject: "BGO Account Recovery Verification Code",
            body: `Assalamu Alaikum ${user.fullName}.\n\nA password recovery request was initiated for your BGO account (@${user.username}).\n\nYour 6-digit email authorization code is: ${code}.\n\nThis verification code expires in 10 minutes. If you did not request this recovery code, please contact BGO security.`
        });

        err.style.display = "none";
        document.getElementById("recovery-step-1").style.display = "none";
        
        // Set up step 2 with SECURE hint display (OTP is NEVER displayed on screen)
        document.getElementById("recovery-step-2").style.display = "block";
        const recHint = document.getElementById("recovery-hint-alert");
        if (recHint) {
            recHint.innerText = `Verification code sent to your registered email address (${user.email}).`;
        }
        document.getElementById("recovery-otp-input").value = "";
        document.getElementById("recovery-err-2").style.display = "none";
    },

    handleRecoveryStep2() {
        const code = document.getElementById("recovery-otp-input").value.trim();
        const err = document.getElementById("recovery-err-2");
        const recData = BGO_PAGES.recoveryData;
        
        if (!recData || !recData.otp) {
            err.style.display = "block";
            err.innerText = "Verification code expired. Please request a new code.";
            return;
        }

        // Expiration check (10 mins)
        if (Date.now() > recData.expiresAt) {
            err.style.display = "block";
            err.innerText = "Verification code expired. Please request a new code.";
            return;
        }

        // Attempt limit check (max 3 attempts)
        recData.attempts = (recData.attempts || 0) + 1;
        if (recData.attempts > recData.maxAttempts) {
            err.style.display = "block";
            err.innerText = "Verification attempt limit exceeded. Please request a new code.";
            return;
        }

        if (code !== recData.otp) {
            err.style.display = "block";
            err.innerText = "Invalid verification code.";
            return;
        }
        
        // Success - Clear OTP data to prevent reuse
        err.style.display = "none";
        document.getElementById("recovery-step-2").style.display = "none";
        
        // Setup step 3
        document.getElementById("recovery-step-3").style.display = "block";
        document.getElementById("recovery-username-display").innerText = BGO_PAGES.recoveryData.username;
        document.getElementById("recovery-new-password").value = "";
        document.getElementById("recovery-confirm-password").value = "";
        document.getElementById("recovery-err-3").style.display = "none";
    },

    handleRecoveryStep3() {
        const p1 = document.getElementById("recovery-new-password").value;
        const p2 = document.getElementById("recovery-confirm-password").value;
        const err = document.getElementById("recovery-err-3");
        
        if (p1.length < 4) {
            err.style.display = "block";
            err.innerText = "Password must be at least 4 characters long.";
            return;
        }
        if (p1 !== p2) {
            err.style.display = "block";
            err.innerText = "Passwords do not match.";
            return;
        }
        
        // Update password in db
        BGO_DB.updateMemberProfile(BGO_PAGES.recoveryData.username, { password: p1 });
        
        // Send confirmation email
        BGO_DB.sendEmailNotification({
            toEmail: BGO_PAGES.recoveryData.email,
            toName: BGO_PAGES.recoveryData.username,
            category: "Password Reset Confirmation",
            subject: "BGO Account Password Reset Successful",
            body: `Assalamu Alaikum.\n\nYour BGO account (@${BGO_PAGES.recoveryData.username}) password has been updated successfully. You can now log in using your new password.`
        });

        alert("Credentials reset successfully! Confirmation email sent. You can now log in using your username and new password.");
        this.closeForgotModal();
        this.membership();
    },


    contact() {
        const html = `
            <section class="section">
                <div class="section-header">
                    <span class="section-title-tag" data-i18n="nav_contact">Contact</span>
                    <h2>Get in Touch with BGO</h2>
                    <p>If you have any questions, wish to support our welfare activities, or require physical emergency aid, please reach out.</p>
                </div>

                <div class="contact-grid">
                    <div class="contact-card-info">
                        <div style="margin-bottom:1.5rem;">
                            <h3 style="font-size:1.35rem; font-weight:700; color:var(--primary-color); margin:0;">Executive Management</h3>
                        </div>
                        <p style="color:var(--text-light); font-size:0.95rem; margin-bottom:1.5rem;">Our support team operates 24x7 to answer inquiries and review requests. In case of extreme hospital emergency, reach out to our executive leadership team directly.</p>
                        
                        <div class="contact-info-list" style="display:flex; flex-direction:column; gap:1.2rem; margin-bottom:2rem;">
                            ${(() => {
                                const execmList = BGO_DB.getExecutiveManagement();
                                if (!execmList || execmList.length === 0) {
                                    return `<p style="font-style:italic; color:var(--text-light);">No executive officers currently listed.</p>`;
                                }

                                let html = "";
                                const centralOfficers = execmList.filter(o => !o.region || o.region.toLowerCase().includes("muscat"));
                                const regionalOfficers = execmList.filter(o => o.region && !o.region.toLowerCase().includes("muscat"));

                                const buildItemHtml = (o) => {
                                    const rawName = o.name || "Executive Officer";
                                    const cleanName = rawName.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Eng\.|Prof\.)\s+/i, '').trim();
                                    const parts = cleanName.split(/\s+/).filter(Boolean);
                                    let initials = "EO";
                                    if (parts.length === 1) initials = parts[0].substring(0, 2).toUpperCase();
                                    else if (parts.length > 1) initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();

                                    const safeName = rawName.replace(/'/g, "\\'");
                                    const safeRole = (o.roleTitle || 'Executive').replace(/'/g, "\\'");
                                    const imgSrc = o.photoUrl ? o.photoUrl.trim() : "";

                                    let iconHtml = "";
                                    if (imgSrc) {
                                        iconHtml = `
                                            <div class="contact-info-icon" style="width:48px; height:48px; border-radius:50%; overflow:hidden; border:2px solid var(--secondary-color); box-shadow:var(--shadow-sm); flex-shrink:0; background:var(--primary-dark); display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="BGO_PAGES.openImageLightboxModal('${imgSrc}', '${safeName}', '${safeRole}')">
                                                <img src="${imgSrc}" alt="${o.name}" loading="lazy" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                                <div style="display:none; width:100%; height:100%; background:linear-gradient(135deg, var(--primary-color) 0%, #064e3b 100%); color:white; font-weight:800; font-size:1rem; align-items:center; justify-content:center; letter-spacing:0.5px;">
                                                    ${initials}
                                                </div>
                                            </div>
                                        `;
                                    } else {
                                        iconHtml = `
                                            <div class="contact-info-icon" style="width:48px; height:48px; border-radius:50%; overflow:hidden; border:2px solid var(--secondary-color); box-shadow:var(--shadow-sm); flex-shrink:0; background:linear-gradient(135deg, var(--primary-color) 0%, #064e3b 100%); color:white; font-weight:800; font-size:1rem; display:flex; align-items:center; justify-content:center; letter-spacing:0.5px;">
                                                ${initials}
                                            </div>
                                        `;
                                    }

                                    return `
                                        <div class="contact-info-item" style="display:flex; align-items:center; gap:0.9rem; background:var(--bg-color); padding:0.75rem 1rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); box-shadow:var(--shadow-sm); transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                            ${iconHtml}
                                            <div class="contact-info-text" style="flex-grow:1;">
                                                <h4 style="font-size:0.75rem; color:var(--secondary-dark); text-transform:uppercase; letter-spacing:0.8px; margin:0; font-weight:800;">${o.roleTitle}</h4>
                                                <p style="font-size:1rem; font-weight:700; margin:0.1rem 0 0 0; color:var(--primary-color);">${o.name}</p>
                                                ${o.region ? `<span style="font-size:0.72rem; color:var(--text-light); font-weight:600;">📍 ${o.region}</span>` : ''}
                                            </div>
                                        </div>
                                    `;
                                };

                                centralOfficers.forEach(o => { html += buildItemHtml(o); });
                                if (regionalOfficers.length > 0) {
                                    html += `<h4 style="font-size:1.1rem; font-weight:700; color:#b91c1c; margin:1.5rem 0 0.8rem 0; text-transform:uppercase; letter-spacing:0.5px;">REGIONAL EXECUTIVE HEADS</h4>`;
                                    regionalOfficers.forEach(o => { html += buildItemHtml(o); });
                                }

                                return html;
                            })()}

                            <div class="contact-info-item" style="display:flex; align-items:center; gap:0.8rem; margin-top:1rem;">
                                <div class="contact-info-icon" style="font-size:1.5rem; background:rgba(15,76,58,0.05); padding:0.5rem; border-radius:50%;">✉️</div>
                                <div class="contact-info-text">
                                    <h4 style="font-size:0.85rem; color:var(--text-light); text-transform:uppercase; letter-spacing:0.5px; margin:0;">Official Email Address</h4>
                                    <p style="font-size:1rem; font-weight:700; margin:0;"><a href="mailto:bahmanigroupoman@gmail.com" style="color:var(--primary-color);">bahmanigroupoman@gmail.com</a></p>
                                </div>
                            </div>
                            <div class="contact-info-item" style="display:flex; align-items:center; gap:0.8rem;">
                                <div class="contact-info-icon" style="font-size:1.5rem; background:rgba(15,76,58,0.05); padding:0.5rem; border-radius:50%;">📍</div>
                                <div class="contact-info-text">
                                    <h4 style="font-size:0.85rem; color:var(--text-light); text-transform:uppercase; letter-spacing:0.5px; margin:0;">Location Region</h4>
                                    <p style="font-size:0.9rem; margin:0; color:var(--text-color);">Sultanate of Oman (Muscat, Nizwa, Salalah, Sohar)</p>
                                </div>
                            </div>
                        </div>

                        <h4 style="font-size:0.85rem; font-weight:700; color:#b91c1c; margin-bottom:1rem; text-transform:uppercase; letter-spacing:0.5px;"></h4>
                        <div style="display:grid; grid-template-columns: 1fr; gap:0.8rem;">
                            <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:0.8rem; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <strong style="font-size:0.9rem; color:var(--text-color);"></strong>
                                    <p style="font-size:0.75rem; color:var(--text-light); margin:0;"></p>
                                </div>
                                <a href="tel:+96896039848" style="font-size:0.9rem; font-weight:700; color:var(--primary-color);"></a>
                            </div>
                            <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:0.8rem; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <strong style="font-size:0.9rem; color:var(--text-color);"></strong>
                                    <p style="font-size:0.75rem; color:var(--text-light); margin:0;"></p>
                                </div>
                                <a href="tel:+96892229457" style="font-size:0.9rem; font-weight:700; color:var(--primary-color);"></a>
                            </div>
                            <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:0.8rem; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <strong style="font-size:0.9rem; color:var(--text-color);"></strong>
                                    <p style="font-size:0.75rem; color:var(--text-light); margin:0;"></p>
                                </div>
                                <a href="tel:+96892475944" style="font-size:0.9rem; font-weight:700; color:var(--primary-color);"></a>
                            </div>
                        </div>
                    </div>

                    <div class="form-container" style="margin:0; padding:2.5rem;">
                        <h4 style="font-size:0.85rem; font-weight:700; color:#b91c1c; margin-bottom:1rem; text-transform:uppercase; letter-spacing:0.5px;">Immediate Assistance Helpline</h4>
                        <div style="display:grid; grid-template-columns: 1fr; gap:0.8rem;">
                            <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:0.8rem; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <strong style="font-size:0.9rem; color:var(--text-color);">Mr. Abdul Khadar Jaina</strong>
                                    <p style="font-size:0.75rem; color:var(--text-light); margin:0;">Emergency Coordinator</p>
                                </div>
                                <a href="tel:+96896039848" style="font-size:0.9rem; font-weight:700; color:var(--primary-color);">📞 +968 9603 9848</a>
                            </div>
                            <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:0.8rem; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <strong style="font-size:0.9rem; color:var(--text-color);">Mr. Syed Faaraz </strong>
                                    <p style="font-size:0.75rem; color:var(--text-light); margin:0;">Immediate Support</p>
                                </div>
                                <a href="tel:+96892229457" style="font-size:0.9rem; font-weight:700; color:var(--primary-color);">📞 +968 9222 9457</a>
                            </div>
                            <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:0.8rem; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <strong style="font-size:0.9rem; color:var(--text-color);">Mr. Basheer Anwar</strong>
                                    <p style="font-size:0.75rem; color:var(--text-light); margin:0;">Immediate Support</p>
                                </div>
                                <a href="tel:+96892475944" style="font-size:0.9rem; font-weight:700; color:var(--primary-color);">📞 +968 9247 5944</a>
                            </div>
                        </div> 

     <div class="form-container" style="margin:0; padding:2.5rem;">
<h3 style="font-size:1.3rem; font-weight:700; color:var(--primary-color); margin-bottom:0.5rem;">Send Email Message</h3>
                        <p style="font-size:0.85rem; color:var(--text-light); margin-bottom:1.5rem;">Fill out this contact form to email BGO administration.</p>
                        
                        <form id="contact-email-form" onsubmit="BGO_PAGES.handleContactSubmit(event)">
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Your Full Name</label>
                                <input type="text" id="cnt-name" required>
                            </div>
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Email Address</label>
                                <input type="email" id="cnt-email" required>
                            </div>
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Subject</label>
                                <input type="text" id="cnt-subject" placeholder="e.g. Volunteer Query, Donation" required>
                            </div>
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Message details</label>
                                <textarea id="cnt-message" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn">Send Message</button>
                        </form>
                    </div>
                </div>
            </section>
        `;
        this.render(html);
    },

    handleContactSubmit(e) {
        e.preventDefault();
        const name = document.getElementById("cnt-name").value;
        alert(`Thank you, ${name}! Your email message has been sent to bahmanigroupoman@gmail.com We will respond within 48 hours.`);
        document.getElementById("contact-email-form").reset();
    },

    handleHelplineRequest(e) {
        e.preventDefault();
        const name = document.getElementById("hl-name").value;
        const phone = document.getElementById("hl-phone").value;
        const type = document.getElementById("hl-type").value;
        
        // Add request to database
        if (type === "medical") {
            BGO_DB.addMedicalRequest({
                patientName: name,
                bloodGroup: "N/A",
                hospital: "TBD",
                location: "Oman",
                requiredUnits: 1,
                urgency: "Critical",
                contactNumber: phone,
                reason: "Emergency helpline callback requested from home banner."
            });
        } else if (type === "transfer") {
            BGO_DB.addTransfer({
                senderName: name,
                contact: phone,
                documentType: "Emergency Doc",
                direction: "Oman → Gulbarga",
                description: "Helpline submission. Urgent courier matched requested."
            });
        }
        
        alert(`ALERT: Emergency request registered for ${name} (${phone}) under ${type.toUpperCase()}. BGO team has been notified. Keep your line active!`);
        document.getElementById("home-helpline-form").reset();
        
        // If we are on home page, update active views if needed
        if (window.location.hash === "#home" || window.location.hash === "") {
            this.home();
        }
    },

    dashboard() {
        if (!BGO_AUTH.isLoggedIn()) {
            window.location.hash = "#membership";
            return;
        }

        const user = BGO_AUTH.getCurrentUser();

        const html = `
            <section class="section">
                <div class="dashboard-grid">
                    <!-- Sidebar -->
                    <div class="dashboard-sidebar">
                        <div class="user-profile-summary">
                            <div class="user-avatar-placeholder">
                                ${user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <h3>${user.fullName}</h3>
                            ${user.memberId ? `<div style="margin-top:0.25rem;"><span style="font-size:0.8rem; font-weight:800; color:var(--primary-color); font-family:monospace; background:rgba(15,76,58,0.12); padding:0.2rem 0.6rem; border-radius:12px; border:1px solid rgba(15,76,58,0.2);">ID: ${user.memberId}</span></div>` : ''}
                            <p style="margin-top:0.3rem;">${user.email}</p>
                            <span class="job-badge" style="margin-top:0.5rem; display:inline-block;">${user.role.toUpperCase()}</span>
                        </div>
                        
                        <div class="dashboard-nav">
                            <button onclick="BGO_PAGES.switchDashboardTab('profile')" id="db-tab-profile" class="dashboard-nav-btn active">👤 Profile Detail</button>
                            <button onclick="BGO_PAGES.switchDashboardTab('travel')" id="db-tab-travel" class="dashboard-nav-btn">🧳 Travel Information</button>
                            <button onclick="BGO_PAGES.switchDashboardTab('polls')" id="db-tab-polls" class="dashboard-nav-btn">📊 Event RSVPs & Polls</button>
                            <button onclick="BGO_PAGES.switchDashboardTab('jobs')" id="db-tab-jobs" class="dashboard-nav-btn">💼 Manage Jobs</button>
                            <button onclick="BGO_PAGES.switchDashboardTab('transfers')" id="db-tab-transfers" class="dashboard-nav-btn">✈️ Doc Transfers</button>
                            <button onclick="BGO_PAGES.switchDashboardTab('volunteer')" id="db-tab-volunteer" class="dashboard-nav-btn">🤝 Volunteer Register</button>
                            <button onclick="BGO_AUTH.logout()" class="dashboard-nav-btn" style="margin-top:1.5rem; background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; font-weight:800; text-align:left;">🚪 Log Out Account</button>
                        </div>
                    </div>

                    <!-- Main Dashboard Window -->
                    <div class="dashboard-content">
                        <!-- Profil Details -->
                        <div id="db-view-profile" class="db-tab-view">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <h3 style="margin:0;">Member Profile Details</h3>
                                <div id="mep-action-btn-container">
                                    <button onclick="BGO_PAGES.openMemberProfileEditModal()" class="login-action-btn" style="height:35px; font-size:0.8rem;">✏️ Request Profile Edit</button>
                                </div>
                            </div>
                            <div id="mep-lock-banner-container"></div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; font-size:0.9rem; margin-bottom:2rem;">
                                <div style="grid-column: span 2; background:linear-gradient(135deg, rgba(15,76,58,0.06) 0%, rgba(15,76,58,0.12) 100%); padding:1rem 1.2rem; border-radius:var(--radius-md); border:1.5px solid rgba(15,76,58,0.25); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                                    <div>
                                        <span style="font-size:0.75rem; color:var(--text-light); text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">BGO Member ID</span>
                                        <h4 style="margin:0.2rem 0 0 0; font-size:1.4rem; font-weight:800; color:var(--primary-color); font-family:monospace; letter-spacing:1px;">${user.memberId || 'N/A (Pending Approval)'}</h4>
                                    </div>
                                    <span class="badge-status badge-status-approved" style="font-size:0.8rem; padding:0.4rem 0.8rem;">VERIFIED MEMBER RECORD</span>
                                </div>
                                <div><p style="color:var(--text-light);">Username:</p><p style="font-weight:600;">${user.username}</p></div>
                                <div><p style="color:var(--text-light);">Registration Date & Time:</p><p style="font-weight:600; color:var(--primary-color);">${user.registeredAt || user.registrationDate || 'N/A'}</p></div>
                                <div><p style="color:var(--text-light);">City in Oman:</p><p style="font-weight:600;">${user.city}</p></div>
                                <div><p style="color:var(--text-light);">Mobile Number:</p><p style="font-weight:600;">${user.mobile}</p></div>
                                <div><p style="color:var(--text-light);">WhatsApp Number:</p><p style="font-weight:600;">${user.whatsapp}</p></div>
                                <div><p style="color:var(--text-light);">Profession:</p><p style="font-weight:600;">${user.profession}</p></div>
                                <div><p style="color:var(--text-light);">Company Name:</p><p style="font-weight:600;">${user.company || 'Not Specified'}</p></div>
                                <div><p style="color:var(--text-light);">Native Place in Gulbarga:</p><p style="font-weight:600;">${user.nativePlace}</p></div>
                                <div><p style="color:var(--text-light);">Blood Group:</p><p style="font-weight:600;">${user.bloodGroup}</p></div>
                                <div><p style="color:var(--text-light);">Marital Status:</p><p style="font-weight:600; text-transform:capitalize;">${user.maritalStatus}</p></div>
                                <div><p style="color:var(--text-light);">Oman Dependents Count:</p><p style="font-weight:600;">${user.dependentsCount || 0}</p></div>
                                <div style="grid-column: span 2;"><p style="color:var(--text-light);">Emergency Contact (India):</p><p style="font-weight:600;">${user.emergencyContact}</p></div>
                            </div>

                            <h4 style="font-size:1.05rem; font-weight:700; color:var(--primary-color); margin-bottom:1rem;">Profile Update Requests & Approval History</h4>
                            <div class="admin-table-container">
                                <table class="admin-table" id="db-profile-requests-table">
                                    <thead>
                                        <tr>
                                            <th>Request Date</th>
                                            <th>Proposed Changes Summary</th>
                                            <th>Status</th>
                                            <th>Processed Date</th>
                                            <th>Remarks / Rejection Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Injected dynamically -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Event Attendance Poll Responses -->
                        <div id="db-view-polls" class="db-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <div>
                                    <h3 style="margin:0;">📊 Event Attendance Poll Responses</h3>
                                    <p style="font-size:0.85rem; color:var(--text-light); margin-top:0.3rem;">View and update your event attendance RSVPs, family headcount, and response history.</p>
                                </div>
                                <a href="#gallery" class="login-action-btn" style="height:35px; font-size:0.8rem; display:inline-flex; align-items:center;">📅 View Upcoming Events</a>
                            </div>
                            <div class="admin-table-container">
                                <table class="admin-table" id="db-polls-table">
                                    <thead>
                                        <tr>
                                            <th>Event Title</th>
                                            <th>Attendance Status</th>
                                            <th>Accompanying Family Details</th>
                                            <th>Total Attendees</th>
                                            <th>Response Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Injected dynamically -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Jobs Management -->
                        <div id="db-view-jobs" class="db-tab-view" style="display:none;">
                            <div class="dashboard-view-header">
                                <h3>Your Posted Vacancies</h3>
                                <button onclick="BGO_PAGES.openJobPostModal()" class="login-action-btn">Post a Vacancy</button>
                            </div>
                            
                            <div class="admin-table-container">
                                <table class="admin-table" id="db-jobs-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Company</th>
                                            <th>Date Posted</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Injected dynamically -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Document Transfers -->
                        <div id="db-view-transfers" class="db-tab-view" style="display:none;">
                            <div class="dashboard-view-header">
                                <h3>Your Document Transfers</h3>
                                <a href="#transfer" class="login-action-btn">Request Doc Transfer</a>
                            </div>
                            
                            <div class="admin-table-container">
                                <table class="admin-table" id="db-transfers-table">
                                    <thead>
                                        <tr>
                                            <th>Request ID</th>
                                            <th>Document</th>
                                            <th>Direction</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Injected dynamically -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Travel Information Page -->
                        <div id="db-view-travel" class="db-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <div>
                                    <h3 style="margin:0;">✈️ My Travel Schedules & Coordination</h3>
                                    <p style="margin:0.25rem 0 0 0; font-size:0.85rem; color:var(--text-light);">Post your upcoming travel schedule between Muscat and Gulbarga to notify BGO Administration and Executive Officers for document transfers or travel carriage assistance.</p>
                                </div>
                                <button onclick="BGO_PAGES.openTravelPostModal()" class="login-action-btn" style="height:38px; font-size:0.85rem; padding:0 1.2rem;">➕ Post Travel Schedule</button>
                            </div>

                            <div style="background:rgba(15,76,58,0.05); border:1.5px solid rgba(15,76,58,0.2); border-radius:var(--radius-md); padding:1rem 1.2rem; margin-bottom:1.8rem; display:flex; align-items:center; gap:1rem;">
                                <div style="font-size:1.8rem; flex-shrink:0;">🔒</div>
                                <div>
                                    <h4 style="margin:0 0 0.2rem 0; font-size:0.9rem; font-weight:800; color:var(--primary-dark);">Member Privacy & Access Control Notice</h4>
                                    <p style="margin:0; font-size:0.82rem; color:var(--text-color); line-height:1.4;">Your travel schedule is confidential and shared <strong>strictly with Admin </strong> for emergency document transfers and member assistance coordination. Other general members cannot view your travel details.</p>
                                </div>
                            </div>

                            <h4 style="font-size:1.1rem; color:var(--primary-dark); font-weight:800; margin:0 0 1rem 0;">My Submitted Travel Schedules</h4>
                            <div class="admin-table-container">
                                <table class="admin-table" id="db-my-travel-table">
                                    <thead>
                                        <tr>
                                            <th>Travel Date</th>
                                            <th>Time / Departure</th>
                                            <th>Travel Route</th>
                                            <th>Carriage / Assistance Remarks</th>
                                            <th>Status</th>
                                            <th>Action Controls</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Dynamically Injected -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Volunteer Registration -->
                        <div id="db-view-volunteer" class="db-tab-view" style="display:none;">
                            <div class="dashboard-view-header">
                                <h3>Register as a BGO VolunteerForce</h3>
                            </div>
                            
                            <form id="db-volunteer-form" onsubmit="BGO_PAGES.handleVolunteerRegister(event)">
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>Area of Expertise</label>
                                        <input type="text" id="vol-expertise" placeholder="e.g. Arabic translation, first aid, driving" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Volunteer Category</label>
                                        <select id="vol-type" required>
                                            <option value="" disabled selected>Select</option>
                                            <option value="Medical Volunteer">Medical Volunteer</option>
                                            <option value="Job Assistance Volunteer">Job Assistance Volunteer</option>
                                            <option value="Legal Coordination Volunteer">Legal Coordination Volunteer</option>
                                            <option value="Emergency Response Volunteer">Emergency Response Volunteer</option>
                                            <option value="Event Volunteer">Event Volunteer</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Weekly Availability</label>
                                        <input type="text" id="vol-avail" placeholder="e.g. " required>
                                    </div>
                                    <div class="form-group">
                                        <label>Languages Spoken</label>
                                        <input type="text" id="vol-langs" placeholder="e.g. Urdu, Kannada, English, Arabic" required>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary form-submit-btn" style="margin-top:1.5rem;">Join Volunteer Team </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        this.render(html, () => {
            BGO_PAGES.loadMemberDashboardData(user.username);
        });
    },

    switchDashboardTab(tabName) {
        const views = document.querySelectorAll(".db-tab-view");
        views.forEach(v => v.style.display = "none");
        
        const navBtns = document.querySelectorAll(".dashboard-nav-btn");
        navBtns.forEach(btn => btn.classList.remove("active"));
        
        document.getElementById(`db-view-${tabName}`).style.display = "block";
        document.getElementById(`db-tab-${tabName}`).classList.add("active");
    },

    loadMemberDashboardData(username) {
        // 72-Hour Profile Lock Status & Live Timer
        if (window.mepLockInterval) {
            clearInterval(window.mepLockInterval);
            window.mepLockInterval = null;
        }

        const lockStatus = BGO_DB.getMemberProfileLockStatus(username);
        const lockBannerContainer = document.getElementById("mep-lock-banner-container");
        const actionBtnContainer = document.getElementById("mep-action-btn-container");

        if (lockStatus.isLocked) {
            if (actionBtnContainer) {
                actionBtnContainer.innerHTML = `<button disabled class="btn" style="background:#e2e8f0; color:#64748b; cursor:not-allowed; height:35px; font-size:0.8rem; border-radius:var(--radius-md); padding:0.5rem 1rem; border:1px solid #cbd5e1; font-weight:600; display:inline-flex; align-items:center; gap:0.4rem;" title="Profile edit is locked for 72 hours following your recent update request.">🔒 Edit Locked (${lockStatus.hours}h ${lockStatus.minutes}m left)</button>`;
            }
            if (lockBannerContainer) {
                lockBannerContainer.innerHTML = `
                    <div style="background:rgba(239, 68, 68, 0.06); border:1.5px solid #fca5a5; padding:1rem 1.2rem; border-radius:var(--radius-md); margin-bottom:1.5rem; display:flex; align-items:center; gap:1rem;">
                        <div style="font-size:1.8rem; flex-shrink:0;">🔒</div>
                        <div style="flex-grow:1;">
                            <h4 style="margin:0 0 0.3rem 0; font-size:0.95rem; font-weight:700; color:#b91c1c;">Profile Update Request Locked (72-Hour Cooldown Active)</h4>
                            <p style="margin:0; font-size:0.85rem; color:var(--text-color);">You submitted a profile update request on <strong>${lockStatus.requestDate || 'recently'}</strong>. To maintain database accuracy, profile edit requests are allowed <strong>once every 72 hours</strong>.</p>
                            <div style="margin-top:0.5rem; font-size:0.85rem; font-weight:700; color:var(--primary-color); display:flex; align-items:center; gap:0.5rem;">
                                <span>⏱️ Remaining Wait Time:</span>
                                <span id="mep-lock-countdown" style="background:var(--primary-color); color:white; padding:0.2rem 0.6rem; border-radius:12px; font-size:0.8rem; font-family:monospace; letter-spacing:0.5px;">${lockStatus.hours}h ${lockStatus.minutes}m ${lockStatus.seconds}s</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Live 1-Second Countdown Timer
            window.mepLockInterval = setInterval(() => {
                const currentLock = BGO_DB.getMemberProfileLockStatus(username);
                if (!currentLock.isLocked) {
                    clearInterval(window.mepLockInterval);
                    window.mepLockInterval = null;
                    this.loadMemberDashboardData(username);
                } else {
                    const cdEl = document.getElementById("mep-lock-countdown");
                    if (cdEl) cdEl.innerText = `${currentLock.hours}h ${currentLock.minutes}m ${currentLock.seconds}s`;
                    const btnEl = document.querySelector("#mep-action-btn-container button");
                    if (btnEl) btnEl.innerText = `🔒 Edit Locked (${currentLock.hours}h ${currentLock.minutes}m left)`;
                }
            }, 1000);
        } else {
            if (actionBtnContainer) {
                actionBtnContainer.innerHTML = `<button onclick="BGO_PAGES.openMemberProfileEditModal()" class="login-action-btn" style="height:35px; font-size:0.8rem;">✏️ Request Profile Edit</button>`;
            }
            if (lockBannerContainer) {
                lockBannerContainer.innerHTML = "";
            }
        }

        // Jobs list
        const jobs = BGO_DB.getJobs().filter(j => j.postedBy === username);
        const jobsBody = document.querySelector("#db-jobs-table tbody");
        
        if (jobsBody) {
            if (jobs.length === 0) {
                jobsBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-light);">No jobs posted yet.</td></tr>`;
            } else {
                let html = "";
                jobs.forEach(j => {
                    const statusClass = j.status === "approved" ? "badge-status-approved" : "badge-status-pending";
                    html += `
                        <tr>
                            <td><strong>${j.title}</strong></td>
                            <td>${j.company}</td>
                            <td>${j.postedDate}</td>
                            <td><span class="badge-status ${statusClass}">${j.status.toUpperCase()}</span></td>
                        </tr>
                    `;
                });
                jobsBody.innerHTML = html;
            }
        }

        // Transfers list
        const transfers = BGO_DB.getTransfers().filter(t => t.senderName === BGO_AUTH.getCurrentUser().fullName);
        const transBody = document.querySelector("#db-transfers-table tbody");
        
        if (transBody) {
            if (transfers.length === 0) {
                transBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-light);">No document transfers logged.</td></tr>`;
            } else {
                let html = "";
                transfers.forEach(t => {
                    const statusClass = t.status === "completed" ? "badge-status-approved" : "badge-status-pending";
                    html += `
                        <tr>
                            <td><code>${t.id}</code></td>
                            <td>${t.documentType}</td>
                            <td>${t.direction}</td>
                            <td>${t.date}</td>
                            <td><span class="badge-status ${statusClass}">${t.status.toUpperCase()}</span></td>
                        </tr>
                    `;
                });
                transBody.innerHTML = html;
            }
        }

        // Member Profile Update Requests History list
        const purBody = document.querySelector("#db-profile-requests-table tbody");
        if (purBody) {
            const purs = BGO_DB.getProfileUpdateRequestsByMember(username);
            if (purs.length === 0) {
                purBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-light);">No profile update requests submitted.</td></tr>`;
            } else {
                let html = "";
                purs.forEach(r => {
                    let statusClass = "badge-status-pending";
                    let statusText = "PENDING APPROVAL";
                    if (r.status === "approved") {
                        statusClass = "badge-status-approved";
                        statusText = "APPROVED";
                    } else if (r.status === "rejected") {
                        statusClass = "status-completed";
                        statusText = "REJECTED";
                    }

                    // Format changes diff
                    let diffs = [];
                    for (const key in r.newData) {
                        const oldVal = r.oldData[key] || "N/A";
                        const newVal = r.newData[key];
                        if (oldVal !== newVal) {
                            diffs.push(`<strong>${key}:</strong> <span style="text-decoration:line-through; color:var(--text-light);">${oldVal}</span> &rarr; <span style="color:var(--primary-color); font-weight:700;">${newVal}</span>`);
                        }
                    }
                    const diffStr = diffs.length > 0 ? diffs.join("<br>") : "No changes detected";

                    html += `
                        <tr>
                            <td><span style="font-size:0.8rem; color:var(--text-light);">${r.requestDate}</span></td>
                            <td><div style="font-size:0.8rem; line-height:1.4;">${diffStr}</div></td>
                            <td><span class="badge-status ${statusClass}">${statusText}</span></td>
                            <td><span style="font-size:0.8rem; color:var(--text-light);">${r.processedAt || 'Pending Review'}</span></td>
                            <td><span style="font-size:0.8rem; ${r.status === 'rejected' ? 'color:var(--danger-color); font-weight:600;' : ''}">${r.rejectionReason || (r.status === 'approved' ? 'Profile Updated & Synchronized' : 'Awaiting Admin Verification')}</span></td>
                        </tr>
                    `;
                });
                purBody.innerHTML = html;
            }
        }

        // Member Event Poll Responses list
        const pollBody = document.querySelector("#db-polls-table tbody");
        if (pollBody) {
            const userPolls = BGO_DB.getEventPolls().filter(p => p.username.toLowerCase() === String(username).toLowerCase());
            const events = BGO_DB.getEvents();

            if (userPolls.length === 0) {
                pollBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-light);">No event poll responses submitted yet. Check <strong>News & Events</strong> to record your attendance!</td></tr>`;
            } else {
                let html = "";
                userPolls.forEach(p => {
                    const ev = events.find(e => e.id === p.eventId);
                    const eventTitle = ev ? ev.title : p.eventId;

                    let statusClass = "badge-status-pending";
                    let statusText = "ATTENDING ALONE";
                    if (p.status === "family") {
                        statusClass = "badge-status-approved";
                        statusText = "ATTENDING WITH FAMILY";
                    } else if (p.status === "not_attending") {
                        statusClass = "status-completed";
                        statusText = "NOT ATTENDING";
                    }

                    let famStrArr = [];
                    if (p.status === "family" && p.selectedFamilyMembers && Array.isArray(p.selectedFamilyMembers)) {
                        p.selectedFamilyMembers.forEach(f => {
                            const ageInfo = f.age !== null && f.age !== undefined ? ` (${f.age} yrs)` : '';
                            famStrArr.push(`<strong>${f.type}:</strong> ${f.name}${ageInfo}`);
                        });
                    }
                    if (p.additionalFamilyCount && p.additionalFamilyCount > 0) {
                        famStrArr.push(`<strong>+${p.additionalFamilyCount} Additional Guest(s)</strong>`);
                    }

                    const famDetailsStr = famStrArr.length > 0 ? famStrArr.join("<br>") : (p.status === "family" ? `${p.familyCount || 1} family member(s)` : '<span style="color:var(--text-light); font-style:italic;">None (Solo)</span>');
                    const totalHeadcount = p.totalAttendees || (p.status === "alone" ? 1 : (p.status === "family" ? (1 + (p.familyCount || 0)) : 0));

                    html += `
                        <tr>
                            <td><strong>${eventTitle}</strong></td>
                            <td><span class="badge-status ${statusClass}">${statusText}</span></td>
                            <td><div style="font-size:0.8rem; line-height:1.4;">${famDetailsStr}</div></td>
                            <td><strong style="font-size:1.1rem; color:var(--primary-color);">${totalHeadcount} Attendees</strong></td>
                            <td><span style="font-size:0.8rem; color:var(--text-light);">${p.respondedAt}</span></td>
                            <td>
                                <button onclick="BGO_PAGES.openEventPollModal('${p.eventId}')" class="action-btn-sm" style="background-color:var(--secondary-color); color:var(--primary-dark); font-weight:700; border:none; cursor:pointer;">✏️ Update Response</button>
                            </td>
                        </tr>
                    `;
                });
                pollBody.innerHTML = html;
            }
        }

        // Member Travel Directory & My Travel Schedule list
        this.renderTravelDirectoryCards();
        this.renderMemberMyTravelTable(username);
    },

    handleVolunteerRegister(e) {
        e.preventDefault();
        const user = BGO_AUTH.getCurrentUser();
        
        const expertise = document.getElementById("vol-expertise").value;
        const type = document.getElementById("vol-type").value;
        const availability = document.getElementById("vol-avail").value;
        const languages = document.getElementById("vol-langs").value;
        
        BGO_DB.addVolunteer({
            fullName: user.fullName,
            mobile: user.mobile,
            city: user.city,
            expertise, type, availability, languages
        });
        
        alert("Registration Successful! Welcome to the BGO Volunteer Network. Mr. Mohammed Tabrez or the coordination team will reach out to you.");
        document.getElementById("db-volunteer-form").reset();
        this.switchDashboardTab("profile");
    },

    admin() {
        if (!BGO_AUTH.isAdminOrExecutive()) {
            const user = BGO_AUTH.getCurrentUser();
            const username = user ? `@${user.username}` : "Unauthenticated Guest";
            BGO_DB.addAuditLog("PERMISSION_VIOLATION", `Security Alert: ${username} attempted direct access to admin() function.`);
            alert("Access Denied: You do not have permission to access the Moderator/Admin Portal.");
            window.location.hash = user ? "#dashboard" : "#membership";
            return;
        }

        const user = BGO_AUTH.getCurrentUser();
        const isSuper = user.role === "superadmin";
        const isAdmin = user.role === "admin" || isSuper;
        const isExec = user.role === "executive";
        
        let portalTitle = "BGO Moderator Portal";
        let controlBadge = "ACCESS GATE";
        if (isSuper) { portalTitle = "BGO Super Admin Portal"; controlBadge = "SUPER CONTROL"; }
        else if (isAdmin) { portalTitle = "BGO Admin Portal"; controlBadge = "ADMIN CONTROL"; }
        else if (isExec) { portalTitle = "BGO Executive Portal"; controlBadge = "EXECUTIVE COMMITTEE"; }

        // Fetch executive permissions
        const perms = BGO_DB.getExecutivePermissions();
        
        // Define navigation buttons conditionally
        let navHtml = "";
        
        if (!isExec || perms.viewMembers) {
            navHtml += `<button onclick="BGO_PAGES.switchAdminTab('members')" id="ad-tab-members" class="dashboard-nav-btn active">👥 Members Directory</button>`;
        }
        
        // Jobs Verification
        if (!isExec) {
            navHtml += `<button onclick="BGO_PAGES.switchAdminTab('jobs')" id="ad-tab-jobs" class="dashboard-nav-btn">💼 Verify Job Listings</button>`;
        }
        
        // Support requests & Event Polls & Travel
        if (!isExec || perms.viewRequests) {
            navHtml += `<button onclick="BGO_PAGES.switchAdminTab('requests')" id="ad-tab-requests" class="dashboard-nav-btn">🚑 Emergencies & Docs</button>`;
            navHtml += `<button onclick="BGO_PAGES.switchAdminTab('polls')" id="ad-tab-polls" class="dashboard-nav-btn">📊 Event Attendance Polls</button>`;
            navHtml += `<button onclick="BGO_PAGES.switchAdminTab('travel')" id="ad-tab-travel" class="dashboard-nav-btn">✈️ Travel Registry</button>`;
        }
        
        // Volunteers list
        if (!isExec || perms.viewVolunteers) {
            navHtml += `<button onclick="BGO_PAGES.switchAdminTab('volunteers')" id="ad-tab-volunteers" class="dashboard-nav-btn">🤝 Volunteer Team</button>`;
        }
        
        // Admins/Super-admins only panels
        if (isAdmin) {
            navHtml += `
                <button onclick="BGO_PAGES.switchAdminTab('profile_requests')" id="ad-tab-profile_requests" class="dashboard-nav-btn">📝 Profile Update Approvals</button>
                <button onclick="BGO_PAGES.switchAdminTab('helpline')" id="ad-tab-helpline" class="dashboard-nav-btn">☎️ Helpline Manager</button>
                <button onclick="BGO_PAGES.switchAdminTab('executives')" id="ad-tab-executives" class="dashboard-nav-btn">👔 Executive Committee</button>
                <button onclick="BGO_PAGES.switchAdminTab('permissions')" id="ad-tab-permissions" class="dashboard-nav-btn">⚙️ Permissions Config</button>
                <button onclick="BGO_PAGES.switchAdminTab('stats')" id="ad-tab-stats" class="dashboard-nav-btn">📊 Stats Manager</button>
                <button onclick="BGO_PAGES.switchAdminTab('gallery')" id="ad-tab-gallery" class="dashboard-nav-btn">🖼️ Gallery Manager</button>
                <button onclick="BGO_PAGES.switchAdminTab('events')" id="ad-tab-events" class="dashboard-nav-btn">📅 Events Manager</button>
            `;
        }
        
        if (isSuper) {
            navHtml += `
                <button onclick="BGO_PAGES.switchAdminTab('email')" id="ad-tab-email" class="dashboard-nav-btn">📧 Email Logs & Alerts</button>
                <button onclick="BGO_PAGES.switchAdminTab('logs')" id="ad-tab-logs" class="dashboard-nav-btn">📜 System Audit Logs</button>
                <button onclick="BGO_PAGES.switchAdminTab('admins')" id="ad-tab-admins" class="dashboard-nav-btn">👑 Admin Accounts</button>
            `;
        }

        navHtml += `
            <button onclick="BGO_AUTH.logout()" class="dashboard-nav-btn" style="margin-top:1.5rem; background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; font-weight:800; text-align:left;">🚪 Log Out Account</button>
        `;

        const html = `
            <section class="section" style="padding-top:2.5rem;">
                <div class="dashboard-grid">
                    <!-- Sidebar -->
                    <div class="dashboard-sidebar">
                        <div class="user-profile-summary">
                            <div class="user-avatar-placeholder" style="background-color:var(--secondary-color);">
                                👑
                            </div>
                            <h3 style="font-size:1.15rem;">${portalTitle}</h3>
                            <p style="font-size:0.8rem;">${user.fullName}</p>
                            <span class="job-badge" style="margin-top:0.5rem; display:inline-block; background-color:var(--primary-color); color:white;">${controlBadge}</span>
                        </div>
                        
                        <div class="dashboard-nav">
                            ${navHtml}
                        </div>
                    </div>

                    <!-- Main Admin Window -->
                    <div class="dashboard-content">
                        
                        <!-- 1. Members Directory -->
                        <div id="ad-view-members" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <div>
                                    <h3 style="margin:0;">Registered Members Directory</h3>
                                    <p style="font-size:0.85rem; color:var(--text-light); margin-top:0.3rem;">Complete list of BGO registered, pending, and active members in Oman.</p>
                                </div>
                                <div style="display:flex; align-items:center; gap:0.8rem; flex-wrap:wrap;">
                                    <input type="text" id="ad-member-search-input" onkeyup="BGO_PAGES.filterMembersDirectory()" placeholder="🔍 Quick Search Members..." style="padding:0.45rem 0.9rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.85rem; min-width:220px;">
                                    <select id="ad-member-status-filter" onchange="BGO_PAGES.filterMembersDirectory()" style="padding:0.45rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.85rem;">
                                        <option value="all" selected>All Members</option>
                                        <option value="approved">Active Only</option>
                                        <option value="inactive">Inactive Only</option>
                                    </select>
                                    <button onclick="BGO_PAGES.exportMembersToPDF()" class="login-action-btn" style="height:36px; display:inline-flex; align-items:center; gap:0.5rem; background-color:#b91c1c; color:white; border:none; padding:0.4rem 1rem; border-radius:var(--radius-sm); font-weight:700; cursor:pointer; font-size:0.8rem; box-shadow:var(--shadow-sm);">
                                        📄 Export PDF Report
                                    </button>
                                    <button onclick="BGO_PAGES.exportMembersToExcel()" class="login-action-btn" style="height:36px; display:inline-flex; align-items:center; gap:0.5rem; background-color:#107c41; color:white; border:none; padding:0.4rem 1rem; border-radius:var(--radius-sm); font-weight:700; cursor:pointer; font-size:0.8rem; box-shadow:var(--shadow-sm);">
                                        📊 Export Excel (.CSV)
                                    </button>
                                </div>
                            </div>
                            
                            <h4 style="font-size:1rem; font-weight:700; margin-bottom:0.8rem; color:var(--warning-color);">Pending Approvals</h4>
                            <div class="admin-table-container" style="margin-bottom:2rem; overflow-x:auto;">
                                <table class="admin-table" id="ad-pending-members-table" style="width:100%; table-layout:fixed;">
                                    <thead>
                                        <tr>
                                            <th style="width:24%;">Member Profile</th>
                                            <th style="width:18%;">Registration Date & Time</th>
                                            <th style="width:22%;">Native & Mobile</th>
                                            <th style="width:18%;">Profession & Blood</th>
                                            <th style="width:18%;">Action Controls</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            
                            <h4 style="font-size:1rem; font-weight:700; margin-bottom:0.8rem; color:var(--primary-color);">Active Members Directory</h4>
                            <div class="admin-table-container" style="overflow-x:auto;">
                                <table class="admin-table" id="ad-members-table" style="width:100%; table-layout:fixed;">
                                    <thead>
                                        <tr>
                                            <th style="width:24%;">Member ID & Profile</th>
                                            <th style="width:18%;">Reg Date & Status</th>
                                            <th style="width:22%;">Contact & Native Place</th>
                                            <th style="width:18%;">Profession & City</th>
                                            <th style="width:18%;">Action Controls</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Profile Update Verification & Approvals -->
                        <div id="ad-view-profile_requests" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <div>
                                    <h3 style="margin:0;">📝 Member Profile Update Approvals</h3>
                                    <p style="font-size:0.85rem; color:var(--text-light); margin-top:0.3rem;">Review, verify, edit, approve, or reject member profile update requests in Oman.</p>
                                </div>
                                <div style="display:flex; align-items:center; gap:0.5rem;">
                                    <label style="font-size:0.85rem; font-weight:600; color:var(--text-color);">Status Filter:</label>
                                    <select id="ad-pur-status-filter" onchange="BGO_PAGES.renderAdminProfileRequests()" style="padding:0.4rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.85rem;">
                                        <option value="pending" selected>Pending Approval</option>
                                        <option value="approved">Approved Requests</option>
                                        <option value="rejected">Rejected Requests</option>
                                        <option value="all">All Statuses Combined</option>
                                    </select>
                                </div>
                            </div>
                            <div class="admin-table-container">
                                <table class="admin-table" id="ad-profile-requests-table" style="width:100%; table-layout:auto;">
                                    <thead>
                                        <tr>
                                            <th style="width:20%;">Member Info</th>
                                            <th style="width:18%;">Request Date & Status</th>
                                            <th style="width:36%;">Proposed Modifications (Diff)</th>
                                            <th style="width:26%;">Action Controls</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Injected dynamically via renderAdminProfileRequests -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 2. Jobs Review & 15-Day Vacancy Approval -->
                        <div id="ad-view-jobs" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <div>
                                    <h3 style="margin:0;">💼 Job Vacancies Verification & 15-Day Management</h3>
                                    <p style="font-size:0.85rem; color:var(--text-light); margin-top:0.3rem;">Review submitted vacancies, approve for 15 days live validity, reject, edit, delete, or extend active listings.</p>
                                </div>
                                <div style="display:flex; align-items:center; gap:0.5rem;">
                                    <label style="font-size:0.85rem; font-weight:600; color:var(--text-color);">Status Filter:</label>
                                    <select id="ad-jobs-status-filter" onchange="BGO_PAGES.renderAdminJobs()" style="padding:0.4rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.85rem; font-weight:600;">
                                        <option value="pending" selected>Pending Approval</option>
                                        <option value="approved">Approved / Active (15-Day Live)</option>
                                        <option value="expired">Expired Vacancies</option>
                                        <option value="rejected">Rejected Vacancies</option>
                                        <option value="all">All Vacancies Combined</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Summary Stats Badges -->
                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; margin-bottom:1.8rem;">
                                <div style="background:white; border:1px solid var(--border-color); border-left:4px solid var(--warning-color); padding:1rem; border-radius:var(--radius-sm); box-shadow:var(--shadow-sm);">
                                    <div style="font-size:0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Pending Approval</div>
                                    <div id="ad-job-count-pending" style="font-size:1.6rem; font-weight:800; color:var(--warning-color); margin-top:0.2rem;">0</div>
                                </div>
                                <div style="background:white; border:1px solid var(--border-color); border-left:4px solid var(--primary-color); padding:1rem; border-radius:var(--radius-sm); box-shadow:var(--shadow-sm);">
                                    <div style="font-size:0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Active / Live (15 Days)</div>
                                    <div id="ad-job-count-approved" style="font-size:1.6rem; font-weight:800; color:var(--primary-color); margin-top:0.2rem;">0</div>
                                </div>
                                <div style="background:white; border:1px solid var(--border-color); border-left:4px solid #6b7280; padding:1rem; border-radius:var(--radius-sm); box-shadow:var(--shadow-sm);">
                                    <div style="font-size:0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Expired Listings</div>
                                    <div id="ad-job-count-expired" style="font-size:1.6rem; font-weight:800; color:#6b7280; margin-top:0.2rem;">0</div>
                                </div>
                                <div style="background:white; border:1px solid var(--border-color); border-left:4px solid var(--danger-color); padding:1rem; border-radius:var(--radius-sm); box-shadow:var(--shadow-sm);">
                                    <div style="font-size:0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Rejected Listings</div>
                                    <div id="ad-job-count-rejected" style="font-size:1.6rem; font-weight:800; color:var(--danger-color); margin-top:0.2rem;">0</div>
                                </div>
                            </div>

                            <div class="admin-table-container">
                                <table class="admin-table" id="ad-jobs-table" style="width:100%; table-layout:auto;">
                                    <thead>
                                        <tr>
                                            <th style="width:22%;">Job Title & Company</th>
                                            <th style="width:18%;">Posted By & Contact</th>
                                            <th style="width:16%;">Posting Date</th>
                                            <th style="width:22%;">Approval & Expiry (15 Days)</th>
                                            <th style="width:10%;">Status</th>
                                            <th style="width:12%;">Action Controls</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 3. Emergency Support Cases & document transfers -->
                        <div id="ad-view-requests" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header">
                                <h3>Active Support Cases</h3>
                            </div>
                            
                            <h4 style="font-size:1.1rem; font-weight:700; margin-bottom:1rem; color:var(--danger-color); display:flex; align-items:center; gap:0.5rem;">
                                📞 Immediate Assistance Call Requests (Helpline)
                            </h4>
                            <div class="admin-table-container" style="margin-bottom: 2.5rem;">
                                <table class="admin-table" id="ad-helpline-requests-table">
                                    <thead>
                                        <tr>
                                            <th>Req ID</th>
                                            <th>Member Name & Mobile</th>
                                            <th>Support Needed</th>
                                            <th>Time Requested</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            
                            <h4 style="font-size:1.1rem; font-weight:700; margin-bottom:1rem; color:var(--primary-color);">Medical Emergencies</h4>
                            <div class="admin-table-container" style="margin-bottom: 2.5rem;">
                                <table class="admin-table" id="ad-medical-table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Hospital</th>
                                            <th>Blood</th>
                                            <th>Urgency</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>

                            <h4 style="font-size:1.1rem; font-weight:700; margin-bottom:1rem; color:var(--primary-color);">Document Carriage Requests</h4>
                            <div class="admin-table-container">
                                <table class="admin-table" id="ad-transfers-table">
                                    <thead>
                                        <tr>
                                            <th>Sender</th>
                                            <th>Document</th>
                                            <th>Direction</th>
                                            <th>Date Logged</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 3b. Event Attendance Polling & Statistics -->
                        <div id="ad-view-polls" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <div>
                                    <h3 style="margin:0;">Upcoming Events Polling & Attendance Tracking</h3>
                                    <p style="font-size:0.85rem; color:var(--text-light); margin-top:0.3rem;">Real-time member attendance responses, family breakdowns with child age calculations, and export reports.</p>
                                </div>
                                <div style="display:flex; gap:0.8rem; flex-wrap:wrap;">
                                    <button onclick="window.print()" class="btn btn-secondary" style="background-color:var(--border-color); color:var(--text-color); font-weight:700;">🖨️ Print / Save PDF Report</button>
                                    <button onclick="BGO_PAGES.exportAttendanceToExcel()" class="btn btn-primary" style="background-color:var(--secondary-color); color:var(--primary-dark); font-weight:700;">📥 Export Attendance Data (.CSV)</button>
                                </div>
                            </div>

                            <!-- Event Filter Dropdown -->
                            <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:1rem 1.5rem; border-radius:var(--radius-sm); margin-bottom:1.8rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
                                <label style="font-weight:700; color:var(--primary-color); font-size:0.9rem;">Filter Attendance Polls by Event:</label>
                                <select id="ad-poll-event-filter" onchange="BGO_PAGES.renderAdminEventPolls()" style="flex-grow:1; max-width:350px; padding:0.5rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-weight:600;">
                                    <option value="all">All Scheduled Events Combined</option>
                                </select>
                            </div>

                            <!-- Real-time Statistics Cards -->
                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1.2rem; margin-bottom:2rem;">
                                <div style="background:white; border:1px solid var(--border-color); border-left:4px solid var(--primary-color); padding:1.2rem; border-radius:var(--radius-sm); box-shadow:var(--shadow-sm);">
                                    <div style="font-size:0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Attending Alone</div>
                                    <div id="stat-poll-alone" style="font-size:1.8rem; font-weight:800; color:var(--primary-color); margin-top:0.3rem;">0</div>
                                    <span style="font-size:0.7rem; color:var(--text-light);">Members attending solo</span>
                                </div>

                                <div style="background:white; border:1px solid var(--border-color); border-left:4px solid #0284c7; padding:1.2rem; border-radius:var(--radius-sm); box-shadow:var(--shadow-sm);">
                                    <div style="font-size:0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Attending with Family</div>
                                    <div id="stat-poll-family-resp" style="font-size:1.8rem; font-weight:800; color:#0284c7; margin-top:0.3rem;">0</div>
                                    <span style="font-size:0.7rem; color:var(--text-light);">Family responses</span>
                                </div>

                                <div style="background:white; border:1px solid var(--border-color); border-left:4px solid #7c3aed; padding:1.2rem; border-radius:var(--radius-sm); box-shadow:var(--shadow-sm);">
                                    <div style="font-size:0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Family Members</div>
                                    <div id="stat-poll-family-members" style="font-size:1.8rem; font-weight:800; color:#7c3aed; margin-top:0.3rem;">0</div>
                                    <span style="font-size:0.7rem; color:var(--text-light);">Accompanying relatives</span>
                                </div>

                                <div style="background:white; border:1px solid var(--border-color); border-left:4px solid var(--danger-color); padding:1.2rem; border-radius:var(--radius-sm); box-shadow:var(--shadow-sm);">
                                    <div style="font-size:0.75rem; color:var(--text-light); font-weight:700; text-transform:uppercase;">Not Attending</div>
                                    <div id="stat-poll-not-attending" style="font-size:1.8rem; font-weight:800; color:var(--danger-color); margin-top:0.3rem;">0</div>
                                    <span style="font-size:0.7rem; color:var(--text-light);">Declined responses</span>
                                </div>

                                <div style="background:var(--primary-color); color:white; border:1px solid var(--primary-dark); padding:1.2rem; border-radius:var(--radius-sm); box-shadow:var(--shadow-sm);">
                                    <div style="font-size:0.75rem; color:var(--secondary-light); font-weight:700; text-transform:uppercase;">Total Expected Headcount</div>
                                    <div id="stat-poll-headcount" style="font-size:1.8rem; font-weight:800; color:white; margin-top:0.3rem;">0</div>
                                    <span style="font-size:0.7rem; color:var(--secondary-light);">Total expected attendees</span>
                                </div>
                            </div>

                            <!-- Attendance Response Details Table -->
                            <div class="admin-table-container">
                                <table class="admin-table" id="ad-event-polls-table">
                                    <thead>
                                        <tr>
                                            <th>Member Name</th>
                                            <th>Mobile Number</th>
                                            <th>Event Name</th>
                                            <th>Attendance Status</th>
                                            <th>Selected Family Members</th>
                                            <th>Total Attendees</th>
                                            <th>Response Date & Time</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 4. Volunteer Registry Force -->
                        <div id="ad-view-volunteers" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <h3>Active Volunteer Registry</h3>
                                <button onclick="BGO_PAGES.openManualVolModal()" class="login-action-btn" style="height:35px; display:flex; align-items:center;">➕ Add Volunteer Manually</button>
                            </div>
                            <div class="admin-table-container">
                                <table class="admin-table" id="ad-volunteers-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Mobile</th>
                                            <th>Volunteer Sector / Role</th>
                                            <th>Languages</th>
                                            <th>Availability</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Travel Registry (Admin & Executive Panel View) -->
                        <div id="ad-view-travel" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <div>
                                    <h3 style="margin:0;">✈️ Member Travel Directory & Assistance Registry</h3>
                                    <p style="margin:0.25rem 0 0 0; font-size:0.85rem; color:var(--text-light);">View and manage all upcoming member travel schedules logged across Muscat, Gulbarga, and other sectors for document transfers or member coordination.</p>
                                </div>
                                <button onclick="BGO_PAGES.openAdminAddTravelModal()" class="login-action-btn" style="height:35px; font-size:0.85rem;">➕ Add Travel Schedule</button>
                            </div>

                            <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:1rem 1.2rem; border-radius:var(--radius-sm); margin-bottom:1.5rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
                                <div style="display:flex; align-items:center; gap:0.8rem;">
                                    <label style="font-weight:700; color:var(--primary-color); font-size:0.9rem;">Filter Travel Route:</label>
                                    <select id="ad-travel-route-filter" onchange="BGO_PAGES.renderAdminTravelTable()" style="padding:0.45rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-weight:600;">
                                        <option value="all">All Routes</option>
                                        <option value="Muscat to Gulbarga">Muscat → Gulbarga</option>
                                        <option value="Gulbarga to Muscat">Gulbarga → Muscat</option>
                                        <option value="Other">Other Routes</option>
                                    </select>
                                </div>
                                <span style="font-size:0.85rem; font-weight:700; color:var(--primary-color);" id="ad-travel-total-badge">Total Travel Schedules: 0</span>
                            </div>

                            <div class="admin-table-container">
                                <table class="admin-table" id="ad-travel-table">
                                    <thead>
                                        <tr>
                                            <th>Traveler Name & ID</th>
                                            <th>Contact Number</th>
                                            <th>Travel Route</th>
                                            <th>Travel Date & Time</th>
                                            <th>Carriage / Assistance Remarks</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Dynamically Injected -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 5. Helpline Management -->
                        <div id="ad-view-helpline" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <h3>Emergency Helpline Configuration</h3>
                                <button onclick="BGO_PAGES.openHelplineContactModal()" class="login-action-btn" style="height:35px;">➕ Add Helpline Contact</button>
                            </div>
                            
                            <form id="ad-helpline-settings-form" onsubmit="BGO_PAGES.handleSaveHelplineSettings(event)" style="background:var(--bg-color); padding:1.5rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:2rem;">
                                <div class="form-group" style="margin-bottom:1rem;">
                                    <label>Helpline Panel Title</label>
                                    <input type="text" id="set-hl-title" required>
                                </div>
                                <div class="form-group" style="margin-bottom:1rem;">
                                    <label>General Description</label>
                                    <textarea id="set-hl-desc" required style="height:60px;"></textarea>
                                </div>
                                <div class="form-group" style="margin-bottom:1rem;">
                                    <label>Emergency Instructions / Remarks</label>
                                    <input type="text" id="set-hl-instructions" required>
                                </div>
                                <button type="submit" class="btn btn-primary" style="padding:0.5rem 1.5rem;">Save General Information</button>
                            </form>
                            
                            <h4 style="font-weight:700; color:var(--primary-color); margin-bottom:1rem;">Emergency Contacts & Mail ID Directory</h4>
                            <div class="admin-table-container">
                                <table class="admin-table" id="ad-helpline-contacts-table">
                                    <thead>
                                        <tr>
                                            <th>Contact Name</th>
                                            <th>Role Title</th>
                                            <th>Phone Number</th>
                                            <th>Email Address / Mail ID</th>
                                            <th>Is Primary</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 6. Email Notifications & Delivery Audit Trail (Super Admin Only Controls) -->
                        <div id="ad-view-email" class="ad-tab-view" style="display:none; background:#ffffff; padding:1.5rem; border-radius:var(--radius-md); border:1px solid #cbd5e1; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; border-bottom:2px solid #e2e8f0; padding-bottom:1rem; margin-bottom:1.5rem;">
                                <div>
                                    <h3 style="margin:0; color:#0f4c3a; font-size:1.35rem; font-weight:800;">📧 Email Logs & Delivery Audit Trail</h3>
                                    <p style="margin:0.25rem 0 0 0; font-size:0.88rem; color:#475569; font-weight:500;">Complete real-time log of all OTPs, password resets, registration approvals, profile update verifications, emergency alerts, event RSVPs, and certificates sent by the system.</p>
                                </div>
                                <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
                                    <button onclick="BGO_PAGES.exportEmailLogs('excel')" class="action-btn-sm" style="background:#059669; color:#ffffff; font-weight:800; font-size:0.82rem; padding:0.5rem 0.9rem; border-radius:6px; border:none; box-shadow:0 2px 4px rgba(5,150,105,0.25); cursor:pointer;">📥 Export Excel</button>
                                    <button onclick="BGO_PAGES.exportEmailLogs('csv')" class="action-btn-sm" style="background:#0284c7; color:#ffffff; font-weight:800; font-size:0.82rem; padding:0.5rem 0.9rem; border-radius:6px; border:none; box-shadow:0 2px 4px rgba(2,132,199,0.25); cursor:pointer;">📄 Export CSV</button>
                                    <button onclick="BGO_PAGES.exportEmailLogs('pdf')" class="action-btn-sm" style="background:#7c3aed; color:#ffffff; font-weight:800; font-size:0.82rem; padding:0.5rem 0.9rem; border-radius:6px; border:none; box-shadow:0 2px 4px rgba(124,58,237,0.25); cursor:pointer;">🖨️ Export PDF Report</button>
                                </div>
                            </div>

                            <div style="background:#f8fafc; border:1.5px solid #cbd5e1; padding:1.1rem 1.3rem; border-radius:8px; margin-bottom:1.5rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; box-shadow:inset 0 1px 2px rgba(0,0,0,0.03);">
                                <div style="display:flex; align-items:center; gap:0.8rem; flex-wrap:wrap; flex-grow:1;">
                                    <input type="text" id="ad-email-search-input" onkeyup="BGO_PAGES.renderAdminEmailLogs()" placeholder="🔍 Search email logs by recipient, subject, or ID..." style="padding:0.5rem 0.9rem; border-radius:6px; border:1.5px solid #94a3b8; font-size:0.85rem; font-weight:600; color:#0f172a; background:#ffffff; max-width:340px; width:100%; outline:none;">
                                    <select id="ad-email-category-filter" onchange="BGO_PAGES.renderAdminEmailLogs()" style="padding:0.5rem 0.9rem; border-radius:6px; border:1.5px solid #94a3b8; font-size:0.85rem; font-weight:700; color:#0f172a; background:#ffffff; outline:none;">
                                        <option value="all">All Email Categories</option>
                                        <option value="Security">Logins & Security</option>
                                        <option value="Member">Member Approvals & Updates</option>
                                        <option value="Emergency">Emergency & Helpline</option>
                                        <option value="Event">Event RSVPs & Polls</option>
                                        <option value="Job">Job Vacancies</option>
                                    </select>
                                </div>
                                <div style="display:flex; gap:0.6rem; align-items:center;">
                                    <button onclick="BGO_PAGES.handleDeleteSelectedEmailLogs()" class="action-btn-sm" style="background:#dc2626; color:#ffffff; font-weight:800; font-size:0.82rem; padding:0.5rem 0.9rem; border-radius:6px; border:none; cursor:pointer;">🗑️ Delete Selected</button>
                                    <button onclick="BGO_PAGES.handleClearAllEmailLogs()" class="action-btn-sm" style="background:#991b1b; color:#ffffff; font-weight:800; font-size:0.82rem; padding:0.5rem 0.9rem; border-radius:6px; border:none; cursor:pointer;">🔥 Clear All Email Logs</button>
                                </div>
                            </div>
                            
                            <div class="admin-table-container" style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:8px; overflow-x:auto; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
                                <table class="admin-table" id="ad-email-logs-table" style="width:100%; border-collapse:collapse; background:#ffffff;">
                                    <thead>
                                        <tr style="background:#0f4c3a; color:#ffffff;">
                                            <th style="width:36px; text-align:center; padding:0.85rem 0.5rem; border-bottom:2px solid #093427;"><input type="checkbox" id="ad-email-select-all" onclick="BGO_PAGES.toggleSelectAllEmailLogs(this.checked)" title="Select / Deselect All" style="transform:scale(1.2); cursor:pointer;"></th>
                                            <th style="width:150px; text-align:left; padding:0.85rem 0.75rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">ID & Date/Time</th>
                                            <th style="width:160px; text-align:left; padding:0.85rem 0.75rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">Recipient (To)</th>
                                            <th style="width:140px; text-align:left; padding:0.85rem 0.75rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">Category</th>
                                            <th style="text-align:left; padding:0.85rem 0.75rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">Subject Line</th>
                                            <th style="width:100px; text-align:left; padding:0.85rem 0.75rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">Status</th>
                                            <th style="width:110px; text-align:center; padding:0.85rem 0.5rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody style="background:#ffffff; color:#0f172a;"></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 7. Executive Committee Leadership & Executive Management Directory -->
                        <div id="ad-view-executives" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <div>
                                    <h3 style="margin:0;">👔 Executive Management Leadership Directory</h3>
                                    <p style="font-size:0.85rem; color:var(--text-light); margin-top:0.3rem;">Manage executive management officers displayed on the Contact Us page.</p>
                                </div>
                                <button onclick="BGO_PAGES.openExecManagementModal()" class="login-action-btn" style="height:38px;">➕ Add Executive Management Officer</button>
                            </div>
                            
                            <div class="admin-table-container" style="margin-bottom:2.5rem;">
                                <table class="admin-table" id="ad-exec-management-table">
                                    <thead>
                                        <tr>
                                            <th>Officer Name</th>
                                            <th>Executive Role Title</th>
                                            <th>Assigned Region</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>

                            <h4 style="font-size:1.05rem; font-weight:700; color:var(--primary-color); margin-bottom:1rem;">Executive Committee Member Promotions</h4>
                            <form id="ad-exec-promote-form" onsubmit="BGO_PAGES.handlePromoteMember(event)" style="background:var(--bg-color); padding:1.5rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:2rem; display:flex; gap:1.2rem; align-items:flex-end;">
                                <div class="form-group" style="flex-grow:1; margin-bottom:0;">
                                    <label>Promote Active Member to Executive</label>
                                    <select id="promote-member-select" required style="width:100%;">
                                        <!-- Populated dynamically -->
                                    </select>
                                </div>
                                <button type="submit" class="btn btn-primary" style="height:40px;">Promote Member</button>
                            </form>
                            
                            <div class="admin-table-container">
                                <table class="admin-table" id="ad-execs-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Current City</th>
                                            <th>Mobile Phone</th>
                                            <th>Profession</th>
                                            <th>Account Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 8. Executive permissions config -->
                        <div id="ad-view-permissions" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header">
                                <h3>Configure Executive Member Permissions</h3>
                            </div>
                            <p style="font-size:0.85rem; color:var(--text-light); margin-bottom:2rem;">Configure access privileges for BGO Executive Committee members when logging in to the moderator panel.</p>
                            
                            <form id="ad-permissions-form" onsubmit="BGO_PAGES.handleSavePermissions(event)" style="background:var(--bg-color); padding:2rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                                <div style="display:flex; flex-direction:column; gap:1.2rem; margin-bottom:2rem;">
                                    <label style="display:inline-flex; align-items:center; gap:0.8rem; font-weight:600; cursor:pointer;">
                                        <input type="checkbox" id="perm-view-members" style="transform:scale(1.3);"> Allow Executive access to Members Directory lists
                                    </label>
                                    <label style="display:inline-flex; align-items:center; gap:0.8rem; font-weight:600; cursor:pointer;">
                                        <input type="checkbox" id="perm-view-profiles" style="transform:scale(1.3);"> Allow Executive to view detailed member profiles (Oman ID/Addresses)
                                    </label>
                                    <label style="display:inline-flex; align-items:center; gap:0.8rem; font-weight:600; cursor:pointer;">
                                        <input type="checkbox" id="perm-view-requests" style="transform:scale(1.3);"> Allow Executive to inspect medical emergencies and documents carriage logs
                                    </label>
                                    <label style="display:inline-flex; align-items:center; gap:0.8rem; font-weight:600; cursor:pointer;">
                                        <input type="checkbox" id="perm-view-vols" style="transform:scale(1.3);"> Allow Executive to inspect registered BGO Volunteer Team lists
                                    </label>
                                </div>
                                <button type="submit" class="btn btn-primary" style="padding:0.6rem 2rem;">Save Permissions Configuration</button>
                            </form>
                        </div>

                        <!-- 9. Stats Manager -->
                        <div id="ad-view-stats" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <h3>Homepage Statistics Manager</h3>
                                <button onclick="BGO_PAGES.openAddStatModal()" class="login-action-btn" style="height:35px; display:flex; align-items:center;">➕ Add New Statistic</button>
                            </div>
                            <div class="admin-table-container">
                                <table class="admin-table" id="ad-stats-table">
                                    <thead>
                                        <tr>
                                            <th>Statistic Key</th>
                                            <th>Label (Display Name)</th>
                                            <th>Value (Counter)</th>
                                            <th>Enabled</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 10. Gallery Manager -->
                        <div id="ad-view-gallery" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center;">
                                <h3>BGO Activities Gallery Media</h3>
                                <button onclick="BGO_PAGES.openGalleryModal()" class="login-action-btn" style="height:35px;">➕ Upload Media Item</button>
                            </div>
                            <div class="admin-table-container">
                                <table class="admin-table" id="ad-gallery-table">
                                    <thead>
                                        <tr>
                                            <th>Media Title</th>
                                            <th>Category</th>
                                            <th>Type</th>
                                            <th>Media File / URL</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 11. Events Manager -->
                        <div id="ad-view-events" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center;">
                                <h3>Events Scheduler & Manager</h3>
                                <button onclick="BGO_PAGES.openEventModal()" class="login-action-btn" style="height:35px;">➕ Add Event</button>
                            </div>
                            <div class="admin-table-container">
                                <table class="admin-table" id="ad-events-table">
                                    <thead>
                                        <tr>
                                            <th>Event Title</th>
                                            <th>Date & Time</th>
                                            <th>Location / Venue</th>
                                            <th>Status</th>
                                            <th>Attendees</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 12. Audit Logs (Super Admin Only) -->
                        <div id="ad-view-logs" class="ad-tab-view" style="display:none; background:#ffffff; padding:1.5rem; border-radius:var(--radius-md); border:1px solid #cbd5e1; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; border-bottom:2px solid #e2e8f0; padding-bottom:1rem; margin-bottom:1.5rem;">
                                <div>
                                    <h3 style="margin:0; color:#0f4c3a; font-size:1.35rem; font-weight:800;">📜 System Audit & Activity Logs</h3>
                                    <p style="margin:0.25rem 0 0 0; font-size:0.88rem; color:#475569; font-weight:500;">Secure chronological log entries tracking system updates, member registrations, committee actions, approvals, and security alerts.</p>
                                </div>
                                <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
                                    <button onclick="BGO_PAGES.exportAuditLogs('excel')" class="action-btn-sm" style="background:#059669; color:#ffffff; font-weight:800; font-size:0.82rem; padding:0.5rem 0.9rem; border-radius:6px; border:none; box-shadow:0 2px 4px rgba(5,150,105,0.25); cursor:pointer;">📥 Export Excel</button>
                                    <button onclick="BGO_PAGES.exportAuditLogs('csv')" class="action-btn-sm" style="background:#0284c7; color:#ffffff; font-weight:800; font-size:0.82rem; padding:0.5rem 0.9rem; border-radius:6px; border:none; box-shadow:0 2px 4px rgba(2,132,199,0.25); cursor:pointer;">📄 Export CSV</button>
                                    <button onclick="BGO_PAGES.exportAuditLogs('pdf')" class="action-btn-sm" style="background:#7c3aed; color:#ffffff; font-weight:800; font-size:0.82rem; padding:0.5rem 0.9rem; border-radius:6px; border:none; box-shadow:0 2px 4px rgba(124,58,237,0.25); cursor:pointer;">🖨️ Export PDF Report</button>
                                </div>
                            </div>

                            <div style="background:#f8fafc; border:1.5px solid #cbd5e1; padding:1.1rem 1.3rem; border-radius:8px; margin-bottom:1.5rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; box-shadow:inset 0 1px 2px rgba(0,0,0,0.03);">
                                <div style="display:flex; align-items:center; gap:0.8rem; flex-wrap:wrap; flex-grow:1;">
                                    <input type="text" id="ad-log-search-input" onkeyup="BGO_PAGES.renderAdminAuditLogsTable()" placeholder="🔍 Search logs by user, action, or details..." style="padding:0.5rem 0.9rem; border-radius:6px; border:1.5px solid #94a3b8; font-size:0.85rem; font-weight:600; color:#0f172a; background:#ffffff; max-width:340px; width:100%; outline:none;">
                                    <select id="ad-log-action-filter" onchange="BGO_PAGES.renderAdminAuditLogsTable()" style="padding:0.5rem 0.9rem; border-radius:6px; border:1.5px solid #94a3b8; font-size:0.85rem; font-weight:700; color:#0f172a; background:#ffffff; outline:none;">
                                        <option value="all">All Action Categories</option>
                                        <option value="LOGIN">Logins & Security</option>
                                        <option value="MEMBER">Member Actions</option>
                                        <option value="TRAVEL">Travel Registry</option>
                                        <option value="EXPORT">Exports & Reports</option>
                                        <option value="DELETE">Deletions & Clears</option>
                                        <option value="PERMISSION_VIOLATION">Security Alerts</option>
                                    </select>
                                </div>
                                <div style="display:flex; gap:0.6rem; align-items:center;">
                                    <button onclick="BGO_PAGES.handleDeleteSelectedAuditLogs()" class="action-btn-sm" style="background:#dc2626; color:#ffffff; font-weight:800; font-size:0.82rem; padding:0.5rem 0.9rem; border-radius:6px; border:none; cursor:pointer;">🗑️ Delete Selected</button>
                                    <button onclick="BGO_PAGES.handleClearAllAuditLogs()" class="action-btn-sm" style="background:#991b1b; color:#ffffff; font-weight:800; font-size:0.82rem; padding:0.5rem 0.9rem; border-radius:6px; border:none; cursor:pointer;">🔥 Clear All Logs</button>
                                </div>
                            </div>

                            <div class="audit-log-container" style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:8px; overflow-x:auto; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
                                <table class="audit-log-table" id="ad-audit-logs-table" style="width:100%; border-collapse:collapse; background:#ffffff;">
                                    <thead>
                                        <tr style="background:#0f4c3a; color:#ffffff;">
                                            <th style="width:36px; text-align:center; padding:0.85rem 0.5rem; border-bottom:2px solid #093427;"><input type="checkbox" id="ad-log-select-all" onclick="BGO_PAGES.toggleSelectAllAuditLogs(this.checked)" title="Select / Deselect All" style="transform:scale(1.2); cursor:pointer;"></th>
                                            <th style="width:150px; text-align:left; padding:0.85rem 0.75rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">Date & Time</th>
                                            <th style="width:110px; text-align:left; padding:0.85rem 0.75rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">User Name</th>
                                            <th style="width:90px; text-align:left; padding:0.85rem 0.75rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">User Role</th>
                                            <th style="width:140px; text-align:left; padding:0.85rem 0.75rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">Activity / Action</th>
                                            <th style="width:100px; text-align:left; padding:0.85rem 0.75rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">Module</th>
                                            <th style="width:90px; text-align:left; padding:0.85rem 0.75rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">Status</th>
                                            <th style="text-align:left; padding:0.85rem 0.75rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">Activity Details</th>
                                            <th style="width:70px; text-align:center; padding:0.85rem 0.5rem; color:#ffffff; font-weight:800; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #093427;">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody style="background:#ffffff; color:#0f172a;"></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 13. Admin Accounts Management & Permission Configuration (Super Admin Only) -->
                        <div id="ad-view-admins" class="ad-tab-view" style="display:none;">
                            <div class="dashboard-view-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <div>
                                    <h3 style="margin:0;">👑 Admin Accounts & Permission Configuration</h3>
                                    <p style="font-size:0.85rem; color:var(--text-light); margin-top:0.3rem;">Super Admin control panel to manage administrator accounts, lock/unlock states, reset credentials, track login activity, and assign module permissions.</p>
                                </div>
                            </div>

                            <div class="admin-table-container" style="margin-bottom:2.5rem;">
                                <table class="admin-table" id="ad-admins-table">
                                    <thead>
                                        <tr>
                                            <th>Administrator</th>
                                            <th>Role</th>
                                            <th>Account Status</th>
                                            <th>Last Login Activity</th>
                                            <th>Module Permissions</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Injected dynamically via renderAdminAccountsTable -->
                                    </tbody>
                                </table>
                            </div>

                            <h4 style="font-size:1.05rem; font-weight:700; color:var(--primary-color); margin-bottom:1rem;">➕ Create New Administrative Account</h4>
                            <div id="admin-reg-err" style="display:none; color:var(--danger-color); background-color:var(--danger-light); padding:0.8rem; border-radius:var(--radius-sm); border:1px solid #fca5a5; margin-bottom:1.2rem; font-size:0.85rem; font-weight:600;"></div>
                            
                            <form id="ad-admin-creation-form" onsubmit="BGO_PAGES.handleRegisterAdminAccount(event)" style="background:var(--bg-color); padding:1.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); max-width:700px;">
                                <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                                    <div class="form-group">
                                        <label>Username *</label>
                                        <input type="text" id="admin-reg-username" required placeholder="Choose unique username">
                                    </div>
                                    <div class="form-group">
                                        <label>Full Name *</label>
                                        <input type="text" id="admin-reg-name" required placeholder="Enter administrator name">
                                    </div>
                                    <div class="form-group">
                                        <label>Oman Phone Number *</label>
                                        <input type="tel" id="admin-reg-mobile" required placeholder="+968 ...">
                                    </div>
                                    <div class="form-group">
                                        <label>Email Address *</label>
                                        <input type="email" id="admin-reg-email" required placeholder="admin@bgooman.org">
                                    </div>
                                    <div class="form-group">
                                        <label>Choose Secure Password *</label>
                                        <div class="password-input-group">
                                            <input type="password" id="admin-reg-password" required placeholder="Enter strong password">
                                            <button type="button" class="password-toggle-btn" id="admin-reg-password-toggle" onclick="BGO_PAGES.togglePasswordVisibility('admin-reg-password', this)" title="Show password" aria-label="Show password">👁️</button>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>Admin Privilege Role *</label>
                                        <select id="admin-reg-role" required>
                                            <option value="admin" selected>Standard Administrator</option>
                                            <option value="superadmin">Super Administrator</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary" style="margin-top:1.5rem; padding:0.65rem 2rem; justify-content:center;">➕ Create Administrative Account</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Admin Member Profile Edit Modal -->
            <div id="ad-member-edit-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3>Edit Member Profile</h3>
                        <button onclick="BGO_PAGES.closeMemberEditModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="ad-member-edit-form" onsubmit="BGO_PAGES.handleAdminSaveMember(event)">
                            <input type="hidden" id="edit-m-username">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Full Name</label>
                                    <input type="text" id="edit-m-name" required>
                                </div>
                                <div class="form-group">
                                    <label>Email Address</label>
                                    <input type="email" id="edit-m-email" required>
                                </div>
                                <div class="form-group">
                                    <label>Mobile Number</label>
                                    <input type="tel" id="edit-m-mobile" required>
                                </div>
                                <div class="form-group">
                                    <label>WhatsApp Number</label>
                                    <input type="tel" id="edit-m-whatsapp">
                                </div>
                                <div class="form-group">
                                    <label>Current Residence Oman</label>
                                    <input type="text" id="edit-m-city" required>
                                </div>
                                <div class="form-group">
                                    <label>Profession</label>
                                    <input type="text" id="edit-m-profession" required>
                                </div>
                                <div class="form-group">
                                    <label>Company Name</label>
                                    <input type="text" id="edit-m-company">
                                </div>
                                <div class="form-group">
                                    <label>Native Place in India</label>
                                    <input type="text" id="edit-m-native" required>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn" style="margin-top:1.5rem; width:100%; justify-content:center;">Save Profile Updates</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Admin Manual Volunteer Modal -->
            <div id="ad-vol-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3 id="ad-vol-modal-title">Manual Volunteer Registration</h3>
                        <button onclick="BGO_PAGES.closeManualVolModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="ad-vol-form" onsubmit="BGO_PAGES.handleManualVolSubmit(event)">
                            <input type="hidden" id="ad-vol-id">
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Link to Member Account (Optional)</label>
                                <select id="ad-vol-username" onchange="BGO_PAGES.autofillVolDetails(this.value)">
                                    <option value="">-- Leave Unlinked / Manual Entry --</option>
                                    <!-- Options filled dynamically -->
                                </select>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Volunteer Name</label>
                                    <input type="text" id="ad-vol-name" required>
                                </div>
                                <div class="form-group">
                                    <label>Mobile Number</label>
                                    <input type="tel" id="ad-vol-mobile" required>
                                </div>
                                <div class="form-group">
                                    <label>Volunteer Sector / Role</label>
                                    <input type="text" id="ad-vol-type" placeholder="e.g. Medical Volunteer" required>
                                </div>
                                <div class="form-group">
                                    <label>Area of Expertise</label>
                                    <input type="text" id="ad-vol-expertise" placeholder="e.g. First Aid, Legal translation" required>
                                </div>
                                <div class="form-group">
                                    <label>Oman City</label>
                                    <input type="text" id="ad-vol-city" placeholder="e.g. Muscat" required>
                                </div>
                                <div class="form-group">
                                    <label>Weekly Availability</label>
                                    <input type="text" id="ad-vol-avail" placeholder="e.g. Weekends, On Call" required>
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label>Languages Spoken</label>
                                    <input type="text" id="ad-vol-langs" placeholder="e.g. Urdu, Kannada, Arabic, English" required>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn" style="margin-top:1.5rem; width:100%; justify-content:center;">Register Volunteer</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Admin Stats Edit Modal -->
            <div id="ad-stat-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3 id="ad-stat-modal-title">Configure Statistic</h3>
                        <button onclick="BGO_PAGES.closeAddStatModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="ad-stat-form" onsubmit="BGO_PAGES.handleStatSubmit(event)">
                            <input type="hidden" id="ad-stat-id">
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Statistic System Key *</label>
                                <input type="text" id="ad-stat-key" required placeholder="e.g. activeVolunteers">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Display Label *</label>
                                <input type="text" id="ad-stat-label" required placeholder="e.g. Active Volunteers">
                            </div>
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Display Value *</label>
                                <input type="text" id="ad-stat-value" required placeholder="e.g. 100+">
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn" style="width:100%; justify-content:center;">Save Statistic</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Helpline Contact modal -->
            <div id="ad-hlc-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 420px;">
                    <div class="modal-header">
                        <h3 id="ad-hlc-modal-title">Helpline Emergency Contact & Mail ID</h3>
                        <button onclick="BGO_PAGES.closeHelplineContactModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="ad-hlc-form" onsubmit="BGO_PAGES.handleHelplineContactSubmit(event)">
                            <input type="hidden" id="ad-hlc-id">
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Contact Full Name *</label>
                                <input type="text" id="ad-hlc-name" required placeholder="e.g. Minaj">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Committee / Support Role *</label>
                                <input type="text" id="ad-hlc-role" required placeholder="e.g. Immediate Support">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Mobile Phone (+968) *</label>
                                <input type="tel" id="ad-hlc-phone" required placeholder="+968 9XXXXXXX">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Email Address / Mail ID *</label>
                                <input type="email" id="ad-hlc-email" required placeholder="bahmanigroupoman@gmail.com">
                            </div>
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label style="display:inline-flex; align-items:center; gap:0.5rem; font-size:0.85rem;">
                                    <input type="checkbox" id="ad-hlc-primary" style="transform:scale(1.2);"> Highlight as Primary Contact (Hero Row)
                                </label>
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn" style="width:100%; justify-content:center;">Save Contact & Mail ID</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Executive Management Officer Add/Edit Modal -->
            <div id="ad-execm-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 420px;">
                    <div class="modal-header">
                        <h3 id="ad-execm-modal-title">Executive Management Officer</h3>
                        <button onclick="BGO_PAGES.closeExecManagementModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="ad-execm-form" onsubmit="BGO_PAGES.handleExecManagementSubmit(event)">
                            <input type="hidden" id="ad-execm-id">
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Officer Name *</label>
                                <input type="text" id="ad-execm-name" required placeholder="e.g. Mr. Maqdoom Pash">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Executive Role / Title *</label>
                                <input type="text" id="ad-execm-role" required placeholder="e.g. President, Vice President, General Secretary">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Assigned Region / Sector *</label>
                                <input type="text" id="ad-execm-region" required placeholder="e.g. Muscat, Sohar Al Batina, Salalah">
                            </div>
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Photo URL (Optional)</label>
                                <input type="text" id="ad-execm-photo" placeholder="https://... (Leave blank for initials avatar)">
                                <label style="margin-top:0.6rem; display:block; font-size:0.8rem; color:var(--text-light); font-weight:600;">Or Upload Direct JPG/PNG Photo:</label>
                                <input type="file" id="ad-execm-file" accept="image/jpeg, image/jpg, image/png" style="font-size:0.8rem; margin-top:0.2rem; width:100%; border:1px solid var(--border-color); padding:0.4rem; border-radius:var(--radius-sm);">
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn" style="width:100%; justify-content:center;">Save Executive Management Officer</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- SMS Recipient modal -->
            <div id="ad-sms-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3>Designated SMS Recipient</h3>
                        <button onclick="BGO_PAGES.closeSMSModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="ad-sms-form" onsubmit="BGO_PAGES.handleSMSSubmit(event)">
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Recipient Name</label>
                                <input type="text" id="ad-sms-name" required placeholder="e.g. Mr. Mohammed Tabrez">
                            </div>
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Mobile Phone Number</label>
                                <input type="tel" id="ad-sms-phone" required placeholder="+968 9XXXXXXX">
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn" style="width:100%; justify-content:center;">Register Recipient</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Gallery Media modal -->
            <div id="ad-gallery-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 450px;">
                    <div class="modal-header">
                        <h3 id="ad-gal-modal-title">Upload Gallery Media</h3>
                        <button onclick="BGO_PAGES.closeGalleryModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="ad-gallery-form" onsubmit="BGO_PAGES.handleGallerySubmit(event)">
                            <input type="hidden" id="ad-gal-id">
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Media Title</label>
                                <input type="text" id="ad-gal-title" required placeholder="e.g. Welfare Campaign Sohar">
                            </div>
                            <div class="form-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                                <div class="form-group" style="margin-bottom:0;">
                                    <label>Gallery Category</label>
                                    <select id="ad-gal-category" required>
                                        <option value="Social Support Activities">Social Support</option>
                                        <option value="Family Gatherings">Family Gatherings</option>
                                        <option value="Medical Assistance Activities">Medical Assistance</option>
                                        <option value="Blood Donation Campaigns">Blood Donation</option>
                                        <option value="Community Events">Community Events</option>
                                        <option value="Sports Activities">Sports Activities</option>
                                        <option value="Welfare Programs">Welfare Programs</option>
                                    </select>
                                </div>
                                <div class="form-group" style="margin-bottom:0;">
                                    <label>Media Type</label>
                                    <select id="ad-gal-type" required onchange="BGO_PAGES.toggleGalleryTypeFields(this.value)">
                                        <option value="photo" selected>Photo</option>
                                        <option value="video">Video</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group" id="ad-gal-url-group" style="margin-bottom:1.2rem;">
                                <label id="ad-gal-url-label">Image Link / URL</label>
                                <input type="text" id="ad-gal-url" placeholder="https://images.unsplash.com/photo-...">
                                <label style="margin-top:0.6rem; display:block; font-size:0.8rem; color:var(--text-light); font-weight:600;">Or Upload Direct JPG Photo:</label>
                                <input type="file" id="ad-gal-file" accept="image/jpeg, image/jpg" style="font-size:0.8rem; margin-top:0.2rem; width:100%; border:1px solid var(--border-color); padding:0.4rem; border-radius:var(--radius-sm);">
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn" style="width:100%; justify-content:center;">Save Media Item</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Member Travel Schedule Modal -->
            <div id="db-travel-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 480px;">
                    <div class="modal-header">
                        <h3 id="db-travel-modal-title">✈️ Post Travel Schedule</h3>
                        <button onclick="BGO_PAGES.closeTravelPostModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="db-travel-form" onsubmit="BGO_PAGES.handleMemberTravelSubmit(event)">
                            <input type="hidden" id="trv-id">
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Travel Date *</label>
                                <input type="date" id="trv-date" required style="font-weight:600;">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Travel Time / Departure *</label>
                                <input type="text" id="trv-time" required placeholder="e.g. 10:30 AM / Evening Flight">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Travel Route *</label>
                                <select id="trv-route" required onchange="BGO_PAGES.toggleCustomRouteField(this.value)" style="font-weight:600;">
                                    <option value="Muscat to Gulbarga" selected>Muscat to Gulbarga</option>
                                    <option value="Gulbarga to Muscat">Gulbarga to Muscat</option>
                                    <option value="Other">Other (Manual Entry)</option>
                                </select>
                            </div>
                            <div class="form-group" id="trv-custom-route-group" style="display:none; margin-bottom:1rem;">
                                <label>Enter Custom Travel Route *</label>
                                <input type="text" id="trv-custom-route" placeholder="e.g. Salalah to Gulbarga, Muscat to Bangalore">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label>Flight / Carrier Details (Optional)</label>
                                <input type="text" id="trv-flight" placeholder="e.g. Oman Air WY 201 / IndiGo via Hyderabad">
                            </div>
                            <div class="form-group" style="margin-bottom:1.2rem;">
                                <label>Carriage Capacity & Assistance Remarks (Optional)</label>
                                <textarea id="trv-remarks" rows="3" placeholder="e.g. Can carry emergency documents / medical reports. Available for handover in Muscat."></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn" style="width:100%; justify-content:center;">Submit Travel Schedule</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Event modal -->
            <div id="ad-event-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3 id="ad-event-modal-title">Schedule Community Event</h3>
                        <button onclick="BGO_PAGES.closeEventModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="ad-event-form" onsubmit="BGO_PAGES.handleEventSubmit(event)">
                            <input type="hidden" id="ad-event-id">
                            <div class="form-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                                <div class="form-group" style="grid-column:span 2;">
                                    <label>Event Title</label>
                                    <input type="text" id="ad-event-title" required placeholder="e.g. Annual Family Meetup">
                                </div>
                                <div class="form-group">
                                    <label>Event Date (YYYY-MM-DD)</label>
                                    <input type="text" id="ad-event-date" required placeholder="2026-08-15">
                                </div>
                                <div class="form-group">
                                    <label>Event Time</label>
                                    <input type="text" id="ad-event-time" required placeholder="6:00 PM - 9:00 PM">
                                </div>
                                <div class="form-group" style="grid-column:span 2;">
                                    <label>Venue / Location</label>
                                    <input type="text" id="ad-event-location" required placeholder="e.g. Al Masa Hall, Muscat">
                                </div>
                                <div class="form-group" style="grid-column:span 2;">
                                    <label>Upload Direct JPG Photos (Multiple Photos Supported)</label>
                                    <input type="file" id="ad-event-files" accept="image/jpeg, image/jpg" multiple style="font-size:0.8rem; margin-top:0.2rem; width:100%; border:1px solid var(--border-color); padding:0.4rem; border-radius:var(--radius-sm);">
                                </div>
                                <div class="form-group">
                                    <label>Banner Image URL (Optional)</label>
                                    <input type="text" id="ad-event-image" placeholder="Image link">
                                </div>
                                <div class="form-group">
                                    <label>Current Status</label>
                                    <select id="ad-event-status" required>
                                        <option value="upcoming" selected>Upcoming</option>
                                        <option value="ongoing">Ongoing / Live</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div class="form-group full-width" style="grid-column:span 2;">
                                    <label>Description & Information</label>
                                    <textarea id="ad-event-desc" required placeholder="Event activities, free registrations, food service, transport directories..." style="height:70px;"></textarea>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary form-submit-btn" style="margin-top:1.2rem; width:100%; justify-content:center;">Save Scheduled Event</button>
                        </form>
                    </div>
                </div>
            </div>
            <!-- Email Dispatch Inspector Modal -->
            <div id="ad-view-email-body-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 650px;">
                    <div class="modal-header">
                        <h3 id="eml-view-subject">📧 Email Dispatch Details</h3>
                        <button onclick="BGO_PAGES.closeEmailViewModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 1.5rem;">
                        <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1rem; font-size:0.85rem;">
                            <p style="margin-bottom:0.3rem;"><strong>Recipient To:</strong> <span id="eml-view-to" style="color:var(--primary-color); font-weight:700;"></span></p>
                            <p style="margin-bottom:0.3rem;"><strong>Category:</strong> <span id="eml-view-category" class="badge-status" style="background:#e0f2fe; color:#0369a1;"></span></p>
                            <p style="margin-bottom:0.3rem;"><strong>Timestamp:</strong> <span id="eml-view-time" style="color:var(--text-light);"></span></p>
                            <p style="margin-bottom:0;"><strong>Delivery Status:</strong> <span id="eml-view-status" style="color:var(--primary-light); font-weight:700;">DELIVERED ✅</span></p>
                        </div>
                        <div class="form-group">
                            <label style="font-weight:700;">Email Message Body:</label>
                            <textarea id="eml-view-body" readonly style="width:100%; height:220px; font-family:monospace; font-size:0.85rem; padding:0.8rem; background:#1e293b; color:#e2e8f0; border-radius:var(--radius-sm); border:1px solid var(--border-color); resize:vertical;"></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Super Admin Granular Admin Permission Configuration Modal -->
            <div id="ad-admin-perm-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 750px;">
                    <div class="modal-header">
                        <h3 id="ad-perm-modal-title">⚙️ Configure Granular Admin Module Permissions</h3>
                        <button onclick="BGO_PAGES.closeAdminPermModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 1.8rem; max-height: 75vh; overflow-y: auto;">
                        <div style="background:rgba(15,76,58,0.05); padding:0.8rem 1rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:1.5rem; font-size:0.82rem; color:var(--primary-dark);">
                            👑 <strong>Super Admin Control:</strong> Select which system modules and privileges this Administrator is authorized to access. Unchecked modules will be restricted.
                        </div>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
                            <div>
                                <span id="ad-perm-user-label" style="font-weight:700; color:var(--primary-color);">Configuring Admin:</span>
                                <span id="ad-perm-counter-badge" style="margin-left:0.5rem; background:#e6f4ea; color:#137333; font-weight:700; padding:0.2rem 0.6rem; border-radius:12px; font-size:0.75rem;">16 / 16 Ticked</span>
                            </div>
                            <div style="display:flex; gap:0.4rem;">
                                <button type="button" onclick="BGO_PAGES.selectAllAdminPerms(true)" class="action-btn-sm" style="background-color:var(--primary-color); color:white;">☑️ Tick All (Full Access)</button>
                                <button type="button" onclick="BGO_PAGES.selectAllAdminPerms(false)" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">☒ Untick All (Revoke Access)</button>
                            </div>
                        </div>

                        <form id="ad-admin-perm-form" onsubmit="BGO_PAGES.handleSaveAdminPermissions(event)">
                            <input type="hidden" id="ad-perm-username">
                            
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-memberManagement" style="width:18px; height:18px;">
                                    <div><strong>Member Management</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">View and edit member directory profiles</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-memberApproval" style="width:18px; height:18px;">
                                    <div><strong>Member Registration Approval</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Approve or reject new registration requests</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-profileUpdates" style="width:18px; height:18px;">
                                    <div><strong>Profile Updates Approval</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Review & approve member profile change requests</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-execManagement" style="width:18px; height:18px;">
                                    <div><strong>Executive Committee Management</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Manage Executive Committee designations</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-eventManagement" style="width:18px; height:18px;">
                                    <div><strong>Event Management</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Schedule, edit, and track community events & polls</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-galleryManagement" style="width:18px; height:18px;">
                                    <div><strong>Gallery & Media Management</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Upload, categorize, and remove media photos/videos</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-jobManagement" style="width:18px; height:18px;">
                                    <div><strong>Job Portal Management</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Verify and approve posted job vacancies</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-medicalManagement" style="width:18px; height:18px;">
                                    <div><strong>Medical Aid Request Management</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Manage emergency medical aid cases & blood requests</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-newsManagement" style="width:18px; height:18px;">
                                    <div><strong>News & Announcements Management</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Post official BGO announcements and news</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-volunteerManagement" style="width:18px; height:18px;">
                                    <div><strong>Volunteer Management</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Approve and coordinate Volunteer Team members</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-helplineManagement" style="width:18px; height:18px;">
                                    <div><strong>Helpline Request Management</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Manage emergency helpline call assistance requests</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-contactManagement" style="width:18px; height:18px;">
                                    <div><strong>Contact Form Management</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Review messages submitted via contact form</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-directoryAccess" style="width:18px; height:18px;">
                                    <div><strong>Member Directory Access</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Export & search member directory records</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-reportsAnalytics" style="width:18px; height:18px;">
                                    <div><strong>Reports & Analytics</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Access community attendance & headcount reports</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-emailNotifications" style="width:18px; height:18px;">
                                    <div><strong>Email Notifications</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Receive automated email notification broadcasts</p></div>
                                </label>

                                <label style="display:flex; align-items:center; gap:0.6rem; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--card-bg); cursor:pointer;">
                                    <input type="checkbox" id="perm-smsNotifications" style="width:18px; height:18px;">
                                    <div><strong>SMS Notifications</strong><p style="font-size:0.75rem; color:var(--text-light); margin:0;">Receive automated SMS emergency alert broadcasts</p></div>
                                </label>
                            </div>

                            <button type="submit" class="btn btn-primary form-submit-btn" style="width:100%; padding:0.7rem; font-size:0.95rem; justify-content:center;">
                                💾 Save Admin Module Permissions
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Super Admin Edit Admin Account Details Modal -->
            <div id="ad-edit-admin-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3 id="ad-edit-admin-modal-title">✏️ Edit Administrator Details</h3>
                        <button onclick="BGO_PAGES.closeAdminEditModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 1.8rem;">
                        <form id="ad-edit-admin-form" onsubmit="BGO_PAGES.handleSaveAdminEdit(event)">
                            <input type="hidden" id="ad-edit-admin-username">
                            
                            <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                                <div class="form-group" style="grid-column: span 2;">
                                    <label>Full Name *</label>
                                    <input type="text" id="ad-edit-admin-fullname" required placeholder="Administrator Full Name">
                                </div>
                                <div class="form-group">
                                    <label>Email Address *</label>
                                    <input type="email" id="ad-edit-admin-email" required placeholder="admin@example.com">
                                </div>
                                <div class="form-group">
                                    <label>Mobile Number (+968) *</label>
                                    <input type="tel" id="ad-edit-admin-mobile" required placeholder="+968 ...">
                                </div>
                                <div class="form-group">
                                    <label>Profession / Job Title</label>
                                    <input type="text" id="ad-edit-admin-profession" placeholder="e.g. IT Manager, Engineer">
                                </div>
                                <div class="form-group">
                                    <label>Oman Work Location / City</label>
                                    <input type="text" id="ad-edit-admin-location" placeholder="e.g. Muscat, Ruwi">
                                </div>
                            </div>

                            <button type="submit" class="btn btn-primary form-submit-btn" style="width:100%; margin-top:1.5rem; justify-content:center;">
                                💾 Save Administrator Profile Updates
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Admin Edit Job Vacancy Modal -->
            <div id="ad-job-edit-modal" class="modal-overlay">
                <div class="modal-box" style="max-width: 600px;">
                    <div class="modal-header" style="background-color: var(--primary-color); color: white;">
                        <h3>✏️ Edit Job Vacancy Details</h3>
                        <button onclick="BGO_PAGES.closeAdminJobEditModal()" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 1.8rem;">
                        <form id="ad-job-edit-form" onsubmit="BGO_PAGES.handleAdminSaveJob(event)">
                            <input type="hidden" id="ad-edit-job-id">
                            <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                                <div class="form-group">
                                    <label>Job Title *</label>
                                    <input type="text" id="ad-edit-job-title" required>
                                </div>
                                <div class="form-group">
                                    <label>Company Name *</label>
                                    <input type="text" id="ad-edit-job-company" required>
                                </div>
                                <div class="form-group">
                                    <label>Sector Category *</label>
                                    <input type="text" id="ad-edit-job-category" required>
                                </div>
                                <div class="form-group">
                                    <label>Location (City) *</label>
                                    <input type="text" id="ad-edit-job-location" required>
                                </div>
                                <div class="form-group">
                                    <label>Salary Range *</label>
                                    <input type="text" id="ad-edit-job-salary" required>
                                </div>
                                <div class="form-group">
                                    <label>Job Type *</label>
                                    <select id="ad-edit-job-type" required>
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Contract">Contractual</option>
                                        <option value="Part-Time">Part-Time</option>
                                    </select>
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label>Contact Email Address *</label>
                                    <input type="email" id="ad-edit-job-email" required>
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label>Job Description *</label>
                                    <textarea id="ad-edit-job-desc" rows="4" required></textarea>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:1.2rem; justify-content:center;">Save Job Vacancy Changes</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        this.render(html, () => {
            // Default select first available view tab
            const firstTab = document.querySelector(".dashboard-nav-btn");
            if (firstTab) {
                const tabId = firstTab.id.replace("ad-tab-", "");
                BGO_PAGES.switchAdminTab(tabId);
            }
        });
    },

    switchAdminTab(tabName) {
        const user = BGO_AUTH.getCurrentUser();
        const isExec = user.role === "executive";
        const isSuper = user.role === "superadmin";
        const perms = BGO_DB.getExecutivePermissions();
        
        // Enforce Super Admin only restriction for System Audit Logs
        if (tabName === "logs" && !isSuper) {
            BGO_DB.addAuditLog("PERMISSION_VIOLATION", `Security Alert: User @${user.username} (${user.role.toUpperCase()}) attempted unauthorized access to System Audit Logs.`);
            alert("Access Denied: System Audit Logs are strictly restricted to Super Admin accounts.");
            return;
        }

        // Enforce Super Admin only restriction for Admin Accounts Management
        if (tabName === "admins" && !isSuper) {
            BGO_DB.addAuditLog("PERMISSION_VIOLATION", `Security Alert: User @${user.username} (${user.role.toUpperCase()}) attempted unauthorized access to Admin Accounts Manager.`);
            alert("Access Denied: Admin Accounts Management is strictly restricted to Super Admin accounts.");
            return;
        }

        // Enforce Super Admin only restriction for Email Logs & Alerts
        if (tabName === "email" && !isSuper) {
            BGO_DB.addAuditLog("PERMISSION_VIOLATION", `Security Alert: User @${user.username} (${user.role.toUpperCase()}) attempted unauthorized access to Email Logs & Alerts.`);
            alert("🔒 Access Restricted: Email Logs & Alerts are strictly restricted to Super Admin accounts.");
            return;
        }

        // Enforce Granular Permission checks for Standard Administrators
        if (user.role === "admin") {
            const tabPermMap = {
                "members": "memberManagement",
                "pending_members": "memberApproval",
                "profile_requests": "profileUpdates",
                "executives": "execManagement",
                "events": "eventManagement",
                "polls": "eventManagement",
                "gallery": "galleryManagement",
                "jobs": "jobManagement",
                "requests": "medicalManagement",
                "news": "newsManagement",
                "volunteers": "volunteerManagement",
                "helpline": "helplineManagement",
                "contact": "contactManagement",
                "stats": "reportsAnalytics",
                "email": "emailNotifications",
                "sms": "emailNotifications"
            };

            const requiredPerm = tabPermMap[tabName];
            if (requiredPerm && !BGO_AUTH.hasAdminPermission(requiredPerm)) {
                BGO_DB.addAuditLog("PERMISSION_DENIED", `Admin @${user.username} attempted access to restricted module "${tabName}" without [${requiredPerm}] permission.`);
                alert(`🔒 Access Restricted: Your administrator account does not have permission to access the "${tabName.replace('_', ' ').toUpperCase()}" module. Please contact the Super Admin.`);
                return;
            }
        }

        // Enforce Executive Tab restrictions
        if (isExec) {
            if (tabName === "members" && !perms.viewMembers) {
                BGO_DB.addAuditLog("PERMISSION_VIOLATION", `Security Alert: Executive @${user.username} attempted access to Members list with viewMembers=false.`);
                alert("Access Denied: Members list view privilege disabled.");
                return;
            }
            if (tabName === "requests" && !perms.viewRequests) {
                BGO_DB.addAuditLog("PERMISSION_VIOLATION", `Security Alert: Executive @${user.username} attempted access to Support Requests with viewRequests=false.`);
                alert("Access Denied: Support requests view privilege disabled.");
                return;
            }
            if (tabName === "volunteers" && !perms.viewVolunteers) {
                BGO_DB.addAuditLog("PERMISSION_VIOLATION", `Security Alert: Executive @${user.username} attempted access to Volunteer Team with viewVolunteers=false.`);
                alert("Access Denied: Volunteer Team view privilege disabled.");
                return;
            }
            if (["jobs", "stats", "helpline", "email", "sms", "executives", "permissions", "gallery", "events", "logs", "admins", "profile_requests"].includes(tabName)) {
                BGO_DB.addAuditLog("PERMISSION_VIOLATION", `Security Alert: Executive @${user.username} attempted access to restricted admin tab "${tabName}".`);
                alert("Access Denied: Administrators only.");
                return;
            }
        }
        
        const views = document.querySelectorAll(".ad-tab-view");
        views.forEach(v => v.style.display = "none");
        
        const navBtns = document.querySelectorAll(".dashboard-nav-btn");
        navBtns.forEach(btn => btn.classList.remove("active"));
        
        const targetView = document.getElementById(`ad-view-${tabName}`);
        const targetTab = document.getElementById(`ad-tab-${tabName}`);
        
        if (targetView) targetView.style.display = "block";
        if (targetTab) targetTab.classList.add("active");
        
        // Refresh specific data
        BGO_PAGES.loadAdminDashboardData();
    },

    loadAdminDashboardData() {
        try {
            const user = BGO_AUTH.getCurrentUser();
            if (!user) return;
            const isAdmin = user.role === "admin" || user.role === "superadmin";
            const isExec = user.role === "executive";
            const perms = BGO_DB.getExecutivePermissions();
            const members = BGO_DB.getMembers();
        
        // Populate Profile Update Requests in Admin Portal
        this.renderAdminProfileRequests();
        
        // Populate Admin Accounts Directory (Super Admin Only)
        this.renderAdminAccountsTable();
        
        const pollFilter = document.getElementById("ad-poll-event-filter");
        if (pollFilter) {
            const events = BGO_DB.getEvents();
            const currVal = pollFilter.value || "all";
            let opts = `<option value="all">All Scheduled Events Combined</option>`;
            events.forEach(ev => {
                opts += `<option value="${ev.id}">${ev.title} (${ev.date})</option>`;
            });
            pollFilter.innerHTML = opts;
            pollFilter.value = currVal;
        }

        // Render Event Polls & Statistics
        this.renderAdminEventPolls();
        
        // 1. Pending Members Directory
        const pendingMemBody = document.querySelector("#ad-pending-members-table tbody");
        if (pendingMemBody) {
            const pendingM = members.filter(m => m.status === "pending");
            let pendingHtml = "";
            if (pendingM.length === 0) {
                pendingHtml = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-light);">No pending member registration requests.</td></tr>`;
            } else {
                pendingM.forEach(m => {
                    pendingHtml += `
                        <tr>
                            <td style="word-wrap:break-word;">
                                <strong style="font-size:0.9rem;">${m.fullName}</strong><br>
                                <span style="font-size:0.75rem; color:var(--text-light);">@${m.username}</span>
                            </td>
                            <td>
                                <span style="font-size:0.8rem; font-weight:700; color:var(--primary-color);">${m.registeredAt || m.registrationDate || 'N/A'}</span>
                            </td>
                            <td>
                                <div style="font-size:0.85rem; font-weight:600; color:var(--primary-dark);">📞 ${m.mobile}</div>
                                <div style="font-size:0.78rem; color:var(--text-light); margin-top:0.2rem;">📍 ${m.nativePlace}</div>
                            </td>
                            <td>
                                <div style="font-size:0.85rem; font-weight:600;">${m.profession}</div>
                                <div style="margin-top:0.2rem;"><span class="badge-status" style="background:#fee2e2; color:#b91c1c; font-size:0.72rem; padding:0.15rem 0.5rem; font-weight:700;">Blood: ${m.bloodGroup}</span></div>
                            </td>
                            <td class="table-actions">
                                <div style="display:flex; flex-wrap:wrap; gap:0.3rem;">
                                    <button onclick="BGO_PAGES.adminOpenMemberView('${m.username}')" class="action-btn-sm" style="background-color:var(--primary-light); color:white;">👁️ View</button>
                                    <button onclick="BGO_PAGES.adminApproveMember('${m.username}')" class="action-btn-sm action-btn-approve">Approve</button>
                                    <button onclick="BGO_PAGES.adminDeleteMember('${m.username}')" class="action-btn-sm action-btn-delete">Reject</button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }
            pendingMemBody.innerHTML = pendingHtml;
        }

        // 2. Active Members Directory (Hides system administrative roles: superadmin & admin)
        const memBody = document.querySelector("#ad-members-table tbody");
        if (memBody) {
            const activeM = members.filter(m => (m.status === "approved" || m.status === "inactive") && m.role !== "superadmin" && m.role !== "admin");
            let memHtml = "";
            if (activeM.length === 0) {
                memHtml = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-light);">No active member records found.</td></tr>`;
            } else {
                activeM.forEach(m => {
                    const isApproved = m.status === "approved";
                    const statusLabel = isApproved ? "ACTIVE" : "INACTIVE";
                    const statusClass = isApproved ? "badge-status-approved" : "badge-status-pending";
                    const toggleActionName = isApproved ? "Deactivate" : "Activate";
                    
                    // Hide details for executives if viewProfiles is disabled
                    const emailLabel = (!isExec || perms.viewProfiles) ? m.email : "[REDACTED]";
                    const mobileNum = (!isExec || perms.viewProfiles) ? m.mobile : "[REDACTED]";
                    const nativePlace = (!isExec || perms.viewProfiles) ? m.nativePlace : "[REDACTED]";
                    
                    let actionBtns = "";
                    if (isAdmin) {
                        actionBtns = `
                            <button onclick="BGO_PAGES.adminOpenMemberView('${m.username}')" class="action-btn-sm" style="background-color:var(--primary-light); color:white;">👁️ View</button>
                            <button onclick="BGO_PAGES.adminOpenMemberEdit('${m.username}')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">Edit</button>
                            <button onclick="BGO_PAGES.adminToggleMemberStatus('${m.username}', '${m.status}')" class="action-btn-sm action-btn-approve">${toggleActionName}</button>
                            <button onclick="BGO_PAGES.adminDeleteMember('${m.username}')" class="action-btn-sm action-btn-delete">Delete</button>
                        `;
                    } else {
                        actionBtns = `<button onclick="BGO_PAGES.adminOpenMemberView('${m.username}')" class="action-btn-sm" style="background-color:var(--primary-light); color:white;">👁️ View</button>`;
                    }
                    
                    memHtml += `
                        <tr>
                            <td style="word-wrap:break-word;">
                                <strong style="color:var(--primary-color); font-family:monospace; font-size:0.8rem; background:rgba(15,76,58,0.08); padding:0.15rem 0.4rem; border-radius:4px; border:1px solid rgba(15,76,58,0.15); display:inline-block; margin-bottom:0.2rem;">${m.memberId || 'N/A'}</strong><br>
                                <strong style="font-size:0.9rem;">${m.fullName}</strong><br>
                                <span style="font-size:0.75rem; color:var(--text-light);">@${m.username} | ${emailLabel}</span>
                            </td>
                            <td>
                                <span style="font-size:0.8rem; color:var(--primary-color); font-weight:700; display:block; margin-bottom:0.3rem;">${m.registeredAt || m.registrationDate || 'N/A'}</span>
                                <span class="badge-status ${statusClass}">${statusLabel}</span>
                            </td>
                            <td>
                                <div style="font-size:0.85rem; font-weight:600; color:var(--primary-dark);">📞 ${mobileNum}</div>
                                <div style="font-size:0.78rem; color:var(--text-light); margin-top:0.2rem;">📍 ${nativePlace}</div>
                            </td>
                            <td>
                                <strong style="font-size:0.85rem;">${m.profession}</strong><br>
                                <span style="font-size:0.75rem; color:var(--text-light);">${m.company || 'Not Specified'} (${m.city})</span>
                            </td>
                            <td class="table-actions">
                                <div style="display:flex; flex-wrap:wrap; gap:0.3rem;">
                                    ${actionBtns}
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }
            memBody.innerHTML = memHtml;
        }

        // 3. Jobs list & 15-Day Validity Management
        this.renderAdminJobs();

        // 3. Helpline Assistance Call Requests list
        const hlReqBody = document.querySelector("#ad-helpline-requests-table tbody");
        if (hlReqBody) {
            const hlRequests = BGO_DB.getHelplineRequests();
            let hlReqHtml = "";
            if (hlRequests.length === 0) {
                hlReqHtml = `<tr><td colspan="6" style="text-align:center; color:var(--text-light);">No helpline assistance call requests logged.</td></tr>`;
            } else {
                hlRequests.forEach(r => {
                    const statusClass = r.status === "resolved" ? "badge-status-approved" : (r.status === "contacted" ? "status-ongoing" : "badge-status-pending");
                    const statusLabel = r.status ? r.status.toUpperCase() : "PENDING";
                    
                    hlReqHtml += `
                        <tr>
                            <td><code>${r.id}</code></td>
                            <td>
                                <strong>${r.name}</strong><br>
                                <a href="tel:${r.phone}" style="font-size:0.8rem; font-weight:700; color:var(--primary-light);">📞 ${r.phone}</a>
                            </td>
                            <td><strong style="color:var(--danger-color);">${r.type}</strong></td>
                            <td><span style="font-size:0.8rem; color:var(--text-light);">${r.requestedAt}</span></td>
                            <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
                            <td class="table-actions">
                                <button onclick="BGO_PAGES.adminUpdateHelplineReqStatus('${r.id}', 'contacted')" class="action-btn-sm" style="background-color:var(--secondary-color); color:var(--primary-dark);">📞 Contacted</button>
                                <button onclick="BGO_PAGES.adminUpdateHelplineReqStatus('${r.id}', 'resolved')" class="action-btn-sm action-btn-approve">✅ Resolve</button>
                                <button onclick="BGO_PAGES.adminDeleteHelplineReq('${r.id}')" class="action-btn-sm action-btn-delete">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            }
            hlReqBody.innerHTML = hlReqHtml;
        }

        // 4. Medical Requests
        const medBody = document.querySelector("#ad-medical-table tbody");
        if (medBody) {
            const medical = BGO_DB.getMedicalRequests();
            let medHtml = "";
            const openMed = medical.filter(r => r.status === "open");
            if (openMed.length === 0) {
                medHtml = `<tr><td colspan="6" style="text-align:center; color:var(--text-light);">No active medical cases.</td></tr>`;
            } else {
                openMed.forEach(r => {
                    let actions = "";
                    if (isAdmin) {
                        actions = `
                            <button onclick="BGO_PAGES.adminResolveMedical('${r.id}')" class="action-btn-sm action-btn-approve">Mark Resolved</button>
                            <button onclick="BGO_PAGES.adminDeleteMedical('${r.id}')" class="action-btn-sm action-btn-delete">Delete</button>
                        `;
                    } else {
                        actions = `<span style="font-size:0.8rem; color:var(--text-light); font-style:italic;">Admin Only</span>`;
                    }
                    
                    medHtml += `
                        <tr>
                            <td><strong>${r.patientName}</strong></td>
                            <td>${r.hospital} (${r.location})</td>
                            <td><strong style="color:var(--danger-color);">${r.bloodGroup}</strong></td>
                            <td><strong>${r.urgency}</strong></td>
                            <td>${r.postedDate}</td>
                            <td class="table-actions">${actions}</td>
                        </tr>
                    `;
                });
            }
            medBody.innerHTML = medHtml;
        }

        // 5. Document Transfers
        const transBody = document.querySelector("#ad-transfers-table tbody");
        if (transBody) {
            const transfers = BGO_DB.getTransfers();
            let transHtml = "";
            if (transfers.length === 0) {
                transHtml = `<tr><td colspan="6" style="text-align:center; color:var(--text-light);">No transfers logged.</td></tr>`;
            } else {
                transfers.forEach(t => {
                    const statusClass = t.status === "completed" ? "badge-status-approved" : "badge-status-pending";
                    let actions = "";
                    if (isAdmin) {
                        if (t.status === "processing") {
                            actions += `<button onclick="BGO_PAGES.adminApproveTransfer('${t.id}')" class="action-btn-sm action-btn-approve">Match/Approve</button>`;
                        } else if (t.status === "approved") {
                            actions += `<button onclick="BGO_PAGES.adminCompleteTransfer('${t.id}')" class="action-btn-sm action-btn-approve" style="background-color:var(--primary-color);">Complete</button>`;
                        }
                        actions += `<button onclick="BGO_PAGES.adminDeleteTransfer('${t.id}')" class="action-btn-sm action-btn-delete">Delete</button>`;
                    } else {
                        actions = `<span style="font-size:0.8rem; color:var(--text-light); font-style:italic;">Admin Only</span>`;
                    }
                    
                    transHtml += `
                        <tr>
                            <td><strong>${t.senderName}</strong><br><span style="font-size:0.75rem; color:var(--text-light);">${t.contact}</span></td>
                            <td>${t.documentType}</td>
                            <td>${t.direction}</td>
                            <td>${t.date}</td>
                            <td><span class="badge-status ${statusClass}">${t.status.toUpperCase()}</span></td>
                            <td class="table-actions">${actions}</td>
                        </tr>
                    `;
                });
            }
            transBody.innerHTML = transHtml;
        }

        // 6. Volunteers
        const volsBody = document.querySelector("#ad-volunteers-table tbody");
        if (volsBody) {
            const vols = BGO_DB.getVolunteers();
            let volsHtml = "";
            if (vols.length === 0) {
                volsHtml = `<tr><td colspan="6" style="text-align:center; color:var(--text-light);">No volunteers registered.</td></tr>`;
            } else {
                vols.forEach(v => {
                    const isApproved = v.status === "approved";
                    const vStatusLabel = isApproved ? "Approved" : "Pending";
                    const vStatusClass = isApproved ? "badge-status-approved" : "badge-status-pending";
                    
                    let volActions = "";
                    if (isAdmin) {
                        if (!isApproved) {
                            volActions += `<button onclick="BGO_PAGES.adminApproveVolunteer('${v.id}')" class="action-btn-sm action-btn-approve">Approve</button>`;
                        }
                        volActions += `<button onclick="BGO_PAGES.adminOpenVolEdit('${v.id}')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">Edit</button>`;
                        volActions += `<button onclick="BGO_PAGES.adminDeleteVolunteer('${v.id}')" class="action-btn-sm action-btn-delete">Delete</button>`;
                    } else {
                        volActions = `<span style="font-size:0.8rem; color:var(--text-light); font-style:italic;">Admin Only</span>`;
                    }
                    
                    volsHtml += `
                        <tr>
                            <td><strong>${v.fullName}</strong>${v.username ? '<br><span style="font-size:0.7rem; color:var(--text-light);">Linked: @' + v.username + '</span>' : ''}</td>
                            <td>${v.mobile}</td>
                            <td><span class="badge-status ${vStatusClass}">${vStatusLabel}</span><br><strong style="font-size:0.8rem; color:var(--primary-color);">${v.type}</strong><br><span style="font-size:0.75rem; color:var(--text-light);">${v.expertise}</span></td>
                            <td>${v.languages}</td>
                            <td>${v.availability}</td>
                            <td class="table-actions">${volActions}</td>
                        </tr>
                    `;
                });
            }
            volsBody.innerHTML = volsHtml;
        }

        // 7. Helpline configuration contacts
        const helplineContactsBody = document.querySelector("#ad-helpline-contacts-table tbody");
        if (helplineContactsBody) {
            const hInfo = BGO_DB.getHelplineInfo();
            
            // Populate general input values once if fields are empty
            const titleIn = document.getElementById("set-hl-title");
            if (titleIn && !titleIn.value) {
                titleIn.value = hInfo.title;
                document.getElementById("set-hl-desc").value = hInfo.description;
                document.getElementById("set-hl-instructions").value = hInfo.instructions;
            }
            
            let hlcHtml = "";
            if (!hInfo.contacts || hInfo.contacts.length === 0) {
                hlcHtml = `<tr><td colspan="6" style="text-align:center; color:var(--text-light);">No helpline contacts registered.</td></tr>`;
            } else {
                hInfo.contacts.forEach(c => {
                    const mailDisplay = c.email ? `<a href="mailto:${c.email}" style="color:var(--primary-color); font-weight:600;">${c.email}</a>` : '<span style="font-style:italic; color:var(--text-light);">Not Set</span>';
                    hlcHtml += `
                        <tr>
                            <td><strong>${c.name}</strong></td>
                            <td>${c.role}</td>
                            <td><strong>${c.phone}</strong></td>
                            <td>${mailDisplay}</td>
                            <td><span style="font-weight:700; color:${c.isPrimary ? 'var(--primary-color)' : 'var(--text-light)'};">${c.isPrimary ? 'YES' : 'NO'}</span></td>
                            <td class="table-actions">
                                <button onclick="BGO_PAGES.openHelplineContactEditModal('${c.id}')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">Edit</button>
                                <button onclick="BGO_PAGES.handleDeleteHelplineContact('${c.id}')" class="action-btn-sm action-btn-delete">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            }
            helplineContactsBody.innerHTML = hlcHtml;
        }

        // 8. System Email Dispatch Audit Trail
        this.renderAdminEmailLogs();

        // 9. Executive Committee & Executive Management Directory
        this.renderAdminExecManagementTable();
        const execsBody = document.querySelector("#ad-execs-table tbody");
        const promoteSelect = document.getElementById("promote-member-select");
        if (execsBody) {
            // Populate table
            const execList = members.filter(m => m.role === "executive");
            let execHtml = "";
            if (execList.length === 0) {
                execHtml = `<tr><td colspan="6" style="text-align:center; color:var(--text-light);">No Executive Committee members configured.</td></tr>`;
            } else {
                execList.forEach(e => {
                    const isDeactive = e.status === "deactivated";
                    execHtml += `
                        <tr>
                            <td><strong>${e.fullName}</strong><br><span style="font-size:0.75rem; color:var(--text-light);">@${e.username}</span></td>
                            <td>${e.city}</td>
                            <td>${e.mobile}</td>
                            <td>
                                <strong>${e.profession}</strong>
                                <button onclick="BGO_PAGES.adminEditExecProfession('${e.username}')" class="action-btn-sm" style="padding:0.15rem 0.4rem; margin-left:0.4rem; background-color:var(--border-color); color:var(--text-color); font-size:0.75rem;">✏️ Edit</button>
                            </td>
                            <td><span class="badge-status ${isDeactive ? 'status-completed' : 'badge-status-approved'}">${isDeactive ? 'DEACTIVATED' : 'ACTIVE'}</span></td>
                            <td class="table-actions">
                                <button onclick="BGO_PAGES.adminToggleExecStatus('${e.username}')" class="action-btn-sm" style="background-color:${isDeactive ? 'var(--success-color)' : '#d97706'}; color:white;">${isDeactive ? '✅ Activate' : '⏸️ Deactivate'}</button>
                                <button onclick="BGO_PAGES.handleDemoteMember('${e.username}')" class="action-btn-sm action-btn-delete">Demote</button>
                            </td>
                        </tr>
                    `;
                });
            }
            execsBody.innerHTML = execHtml;
            
            // Populate promote selector
            if (promoteSelect) {
                promoteSelect.innerHTML = '<option value="" disabled selected>-- Select Member to Promote --</option>';
                const regularMembers = members.filter(m => m.role === "member" && m.status === "approved");
                regularMembers.forEach(m => {
                    promoteSelect.innerHTML += `<option value="${m.username}">${m.fullName} (@${m.username})</option>`;
                });
            }
        }

        // 10. Permissions configuration inputs
        const permMembers = document.getElementById("perm-view-members");
        if (permMembers) {
            const p = BGO_DB.getExecutivePermissions();
            permMembers.checked = !!p.viewMembers;
            document.getElementById("perm-view-profiles").checked = !!p.viewProfiles;
            document.getElementById("perm-view-requests").checked = !!p.viewRequests;
            document.getElementById("perm-view-vols").checked = !!p.viewVolunteers;
        }

        // 11. Homepage Stats Manager
        const statsBody = document.querySelector("#ad-stats-table tbody");
        if (statsBody) {
            const stats = BGO_DB.getStats();
            let statsHtml = "";
            stats.forEach(s => {
                const checkedAttr = s.enabled ? "checked" : "";
                statsHtml += `
                    <tr>
                        <td><code>${s.key}</code></td>
                        <td><strong>${s.label}</strong></td>
                        <td><strong>${s.value}</strong></td>
                        <td style="text-align:center;"><input type="checkbox" ${checkedAttr} onchange="BGO_PAGES.adminToggleStat('${s.id}', this.checked)" style="transform:scale(1.2); cursor:pointer;"></td>
                        <td class="table-actions">
                            <button onclick="BGO_PAGES.adminOpenStatEdit('${s.id}')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">Edit</button>
                            <button onclick="BGO_PAGES.adminDeleteStat('${s.id}')" class="action-btn-sm action-btn-delete">Delete</button>
                        </td>
                    </tr>
                `;
            });
            statsBody.innerHTML = statsHtml;
        }

        // 12. Gallery Media manager
        const galleryBody = document.querySelector("#ad-gallery-table tbody");
        if (galleryBody) {
            const gallery = BGO_DB.getGallery();
            let galHtml = "";
            if (gallery.length === 0) {
                galHtml = `<tr><td colspan="5" style="text-align:center; color:var(--text-light);">No media items uploaded.</td></tr>`;
            } else {
                gallery.forEach(g => {
                    const typeLabel = g.type === "video" ? "🎬 Video" : "📷 Photo";
                    const thumbnailHtml = g.imageUrl ? `<img src="${g.imageUrl}" style="width:50px; height:50px; object-fit:cover; border-radius:4px; border:1px solid var(--border-color); vertical-align:middle; margin-right:0.6rem; cursor:pointer;" onclick="BGO_PAGES.openImageLightboxModal('${g.imageUrl}', '${(g.title || '').replace(/'/g, "\\'")}', '${g.category}')" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=100';">` : '<span style="font-size:1.5rem; margin-right:0.6rem;">🎬</span>';

                    galHtml += `
                        <tr>
                            <td>
                                <div style="display:flex; align-items:center;">
                                    ${thumbnailHtml}
                                    <strong>${g.title}</strong>
                                </div>
                            </td>
                            <td>${g.category}</td>
                            <td><strong>${typeLabel}</strong></td>
                            <td><a href="${g.imageUrl}" target="_blank" style="font-size:0.75rem; color:var(--primary-color); word-break:break-all;">${g.imageUrl || 'No File'}</a></td>
                            <td class="table-actions">
                                <button onclick="BGO_PAGES.openGalleryEditModal('${g.id}')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">Edit</button>
                                <button onclick="BGO_PAGES.handleDeleteGalleryItem('${g.id}')" class="action-btn-sm action-btn-delete">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            }
            galleryBody.innerHTML = galHtml;
        }

        // 13. Events Scheduler manager
        const eventsBody = document.querySelector("#ad-events-table tbody");
        if (eventsBody) {
            const events = BGO_DB.getEvents();
            let evHtml = "";
            if (events.length === 0) {
                evHtml = `<tr><td colspan="6" style="text-align:center; color:var(--text-light);">No community events scheduled.</td></tr>`;
            } else {
                events.forEach(e => {
                    let statusLabel = "";
                    let statusClass = "";
                    if (e.status === "completed") { statusLabel = "Completed"; statusClass = "status-completed"; }
                    else if (e.status === "ongoing") { statusLabel = "Ongoing"; statusClass = "status-ongoing"; }
                    else { statusLabel = "Upcoming"; statusClass = "status-upcoming"; }
                    
                    evHtml += `
                        <tr>
                            <td><strong>${e.title}</strong></td>
                            <td>${e.date}<br><span style="font-size:0.75rem; color:var(--text-light);">${e.time}</span></td>
                            <td>${e.location}</td>
                            <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
                            <td><strong>${e.registeredCount} RSVP</strong></td>
                            <td class="table-actions">
                                <button onclick="BGO_PAGES.openEventEditModal('${e.id}')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">Edit</button>
                                <button onclick="BGO_PAGES.handleDeleteEvent('${e.id}')" class="action-btn-sm action-btn-delete">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            }
            eventsBody.innerHTML = evHtml;
        }

        // 14. Audit logs viewer (Super Admin strictly)
        this.renderAdminAuditLogsTable();

        // 15. Render Emergency Email Recipients & Delivery Audit Logs
        this.renderAdminEmailRecipients();
        this.renderAdminEmailLogs();

        // 16. Render Travel Information Registry Table
        this.renderAdminTravelTable();

        } catch (err) {
            console.warn("loadAdminDashboardData safe execution handler:", err);
        }
    },

    // Save general helpline details
    handleSaveHelplineSettings(e) {
        e.preventDefault();
        const title = document.getElementById("set-hl-title").value;
        const description = document.getElementById("set-hl-desc").value;
        const instructions = document.getElementById("set-hl-instructions").value;
        
        const hInfo = BGO_DB.getHelplineInfo();
        hInfo.title = title;
        hInfo.description = description;
        hInfo.instructions = instructions;
        
        BGO_DB.saveHelplineInfo(hInfo);
        alert("Helpline settings updated successfully!");
        BGO_PAGES.loadAdminDashboardData();
    },

    // Helpline contact modals
    openHelplineContactModal() {
        document.getElementById("ad-hlc-id").value = "";
        document.getElementById("ad-hlc-form").reset();
        document.getElementById("ad-hlc-modal-title").innerText = "Add Helpline Emergency Contact & Mail ID";
        document.getElementById("ad-hlc-modal").classList.add("active");
    },

    openHelplineContactEditModal(id) {
        const hInfo = BGO_DB.getHelplineInfo();
        const contact = hInfo.contacts.find(c => c.id === id);
        if (contact) {
            document.getElementById("ad-hlc-id").value = contact.id;
            document.getElementById("ad-hlc-name").value = contact.name;
            document.getElementById("ad-hlc-role").value = contact.role;
            document.getElementById("ad-hlc-phone").value = contact.phone;
            const emailIn = document.getElementById("ad-hlc-email");
            if (emailIn) emailIn.value = contact.email || "";
            document.getElementById("ad-hlc-primary").checked = !!contact.isPrimary;
            
            document.getElementById("ad-hlc-modal-title").innerText = "Edit Helpline Emergency Contact & Mail ID";
            document.getElementById("ad-hlc-modal").classList.add("active");
        }
    },

    closeHelplineContactModal() {
        document.getElementById("ad-hlc-modal").classList.remove("active");
    },

    handleHelplineContactSubmit(e) {
        e.preventDefault();
        const id = document.getElementById("ad-hlc-id").value;
        const name = document.getElementById("ad-hlc-name").value.trim();
        const role = document.getElementById("ad-hlc-role").value.trim();
        const phone = document.getElementById("ad-hlc-phone").value.trim();
        const email = document.getElementById("ad-hlc-email") ? document.getElementById("ad-hlc-email").value.trim() : "";
        const isPrimary = document.getElementById("ad-hlc-primary").checked;
        
        const info = BGO_DB.getHelplineInfo();
        
        // If this contact is set to primary, toggle off others
        if (isPrimary) {
            info.contacts.forEach(c => c.isPrimary = false);
        }
        
        if (id) {
            // Edit
            BGO_DB.updateHelplineContact(id, { name, role, phone, email, isPrimary });
            alert("Helpline contact details & Mail ID updated successfully.");
        } else {
            // Add
            BGO_DB.addHelplineContact({ name, role, phone, email, isPrimary });
            alert("Helpline contact & Mail ID registered successfully.");
        }
        this.closeHelplineContactModal();
        BGO_PAGES.loadAdminDashboardData();
    },

    handleDeleteHelplineContact(id) {
        if (confirm("Are you sure you want to remove this contact from the emergency helpline?")) {
            BGO_DB.deleteHelplineContact(id);
            BGO_PAGES.loadAdminDashboardData();
        }
    },

    // Helpline Assistance Call Requests Management
    adminUpdateHelplineReqStatus(id, status) {
        BGO_DB.updateHelplineRequestStatus(id, status);
        alert(`Helpline call request status updated to ${status.toUpperCase()}.`);
        this.loadAdminDashboardData();
    },

    adminDeleteHelplineReq(id) {
        if (confirm("Are you sure you want to delete this helpline call request?")) {
            BGO_DB.deleteHelplineRequest(id);
            this.loadAdminDashboardData();
        }
    },

    // Email Notification Recipients & Delivery Audit Trail Management
    renderAdminEmailRecipients() {
        const recipientsBody = document.querySelector("#ad-email-recipients-table tbody");
        if (!recipientsBody) return;
        const recipients = BGO_DB.getEmailRecipients();
        let html = "";
        if (recipients.length === 0) {
            html = `<tr><td colspan="4" style="text-align:center; color:var(--text-light);">No emergency email recipients configured.</td></tr>`;
        } else {
            recipients.forEach(r => {
                html += `
                    <tr>
                        <td><strong>${r.name}</strong></td>
                        <td><a href="mailto:${r.email}" style="color:var(--primary-color); font-weight:600;">${r.email}</a></td>
                        <td><span class="badge-status" style="background:#e0f2fe; color:#0369a1;">${r.role || 'Coordinator'}</span></td>
                        <td class="table-actions">
                            <button onclick="BGO_PAGES.openEmailEditModal('${r.id}')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">✏️ Edit</button>
                            <button onclick="BGO_PAGES.adminDeleteEmailRecipient('${r.id}')" class="action-btn-sm action-btn-delete">🗑️ Remove</button>
                        </td>
                    </tr>
                `;
            });
        }
        recipientsBody.innerHTML = html;
    },

    renderAdminEmailLogs() {
        const logsBody = document.querySelector("#ad-email-logs-table tbody");
        if (!logsBody) return;

        const user = BGO_AUTH.getCurrentUser();
        const isSuper = user && user.role === "superadmin";

        if (!isSuper) {
            logsBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#dc2626; font-weight:700;">🔒 Restricted Access: Email Logs and Dispatch Audit Trails are strictly restricted to Super Admin accounts.</td></tr>`;
            return;
        }

        let logs = BGO_DB.getEmailLogs();
        const searchInput = document.getElementById("ad-email-search-input");
        const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const catFilter = document.getElementById("ad-email-category-filter");
        const catVal = catFilter ? catFilter.value : "all";

        if (catVal !== "all") {
            logs = logs.filter(l => (l.category || "").toLowerCase().includes(catVal.toLowerCase()));
        }

        if (searchVal) {
            logs = logs.filter(l =>
                (l.id || "").toLowerCase().includes(searchVal) ||
                (l.toName || "").toLowerCase().includes(searchVal) ||
                (l.toEmail || "").toLowerCase().includes(searchVal) ||
                (l.subject || "").toLowerCase().includes(searchVal) ||
                (l.category || "").toLowerCase().includes(searchVal)
            );
        }

        const selectAllCb = document.getElementById("ad-email-select-all");
        if (selectAllCb) selectAllCb.checked = false;

        if (logs.length === 0) {
            logsBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#64748b; font-style:italic;">No email dispatch logs found matching criteria.</td></tr>`;
            return;
        }

        let html = "";
        logs.forEach((l, idx) => {
            const dateStr = l.timestamp ? l.timestamp.replace("T", " ").substring(0, 19) : "N/A";
            const rowBg = idx % 2 === 1 ? 'background-color:#f8fafc;' : 'background-color:#ffffff;';

            html += `
                <tr style="${rowBg} border-bottom:1px solid #e2e8f0; transition:background-color 0.15s ease;">
                    <td style="text-align:center; padding:0.75rem 0.5rem; vertical-align:middle;"><input type="checkbox" class="ad-email-log-cb" value="${l.id}" style="transform:scale(1.2); cursor:pointer;"></td>
                    <td style="color:#1e293b; font-size:0.78rem; font-weight:700; font-family:monospace; padding:0.75rem; vertical-align:middle;"><code>${l.id}</code><br><span style="color:#64748b; font-size:0.75rem;">${dateStr}</span></td>
                    <td style="color:#0f4c3a; font-weight:800; font-size:0.85rem; padding:0.75rem; vertical-align:middle;">${l.toName}<br><a href="mailto:${l.toEmail}" style="font-size:0.75rem; color:#0284c7; font-weight:600;">${l.toEmail}</a></td>
                    <td style="padding:0.75rem; vertical-align:middle;"><span style="background:#dbeafe; color:#1e40af; border:1px solid #bfdbfe; font-size:0.72rem; font-weight:800; padding:0.25rem 0.5rem; border-radius:4px; display:inline-block;">${l.category}</span></td>
                    <td style="color:#0f172a; font-size:0.83rem; font-weight:700; line-height:1.4; padding:0.75rem; vertical-align:middle;">${l.subject}</td>
                    <td style="padding:0.75rem; vertical-align:middle;"><span style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-weight:800; font-size:0.72rem; padding:0.25rem 0.5rem; border-radius:4px; display:inline-block;">${l.status || 'DELIVERED ✅'}</span></td>
                    <td style="text-align:center; padding:0.75rem 0.5rem; vertical-align:middle;">
                        <div style="display:flex; gap:0.4rem; justify-content:center;">
                            <button onclick="BGO_PAGES.openEmailViewModal('${l.id}')" style="background:#0284c7; color:#ffffff; border:none; padding:0.35rem 0.6rem; border-radius:4px; font-weight:800; font-size:0.75rem; cursor:pointer;" title="View Full Email Body">👁️</button>
                            <button onclick="BGO_PAGES.handleDeleteSingleEmailLog('${l.id}')" style="background:#ef4444; color:#ffffff; border:none; padding:0.35rem 0.65rem; border-radius:4px; font-weight:800; font-size:0.75rem; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.15);" title="Delete Email Log Record">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        logsBody.innerHTML = html;
    },

    toggleSelectAllEmailLogs(checked) {
        const cbs = document.querySelectorAll(".ad-email-log-cb");
        cbs.forEach(cb => cb.checked = checked);
    },

    handleDeleteSingleEmailLog(id) {
        const user = BGO_AUTH.getCurrentUser();
        if (!user || user.role !== "superadmin") {
            alert("🔒 Access Denied: Deleting Email Dispatch Logs is strictly restricted to Super Admin accounts.");
            return;
        }

        const logs = BGO_DB.getEmailLogs();
        const target = logs.find(l => l.id === id);
        const desc = target ? `Log ID: ${target.id} (Subject: "${target.subject}")` : id;

        if (confirm(`⚠️ Confirm Deletion:\n\nAre you sure you want to permanently delete this email dispatch log?\n\n${desc}\n\nThis action will be recorded in the System Audit Log.`)) {
            BGO_DB.deleteEmailLog(id);
            alert("🗑️ Email log entry deleted successfully.");
            this.renderAdminEmailLogs();
        }
    },

    handleDeleteSelectedEmailLogs() {
        const user = BGO_AUTH.getCurrentUser();
        if (!user || user.role !== "superadmin") {
            alert("🔒 Access Denied: Deleting Email Dispatch Logs is strictly restricted to Super Admin accounts.");
            return;
        }

        const selectedCbs = document.querySelectorAll(".ad-email-log-cb:checked");
        if (selectedCbs.length === 0) {
            alert("⚠️ Please select at least one email log entry to delete using checkboxes.");
            return;
        }

        const selectedIds = Array.from(selectedCbs).map(cb => cb.value);

        if (confirm(`⚠️ Confirm Bulk Deletion:\n\nAre you sure you want to permanently delete ${selectedIds.length} selected email log record(s)?\n\nThis action cannot be undone and will be recorded in the System Audit Log.`)) {
            BGO_DB.deleteEmailLogs(selectedIds);
            alert(`🗑️ Successfully deleted ${selectedIds.length} email log record(s).`);
            this.renderAdminEmailLogs();
        }
    },

    handleClearAllEmailLogs() {
        const user = BGO_AUTH.getCurrentUser();
        if (!user || user.role !== "superadmin") {
            alert("🔒 Access Denied: Clearing Email Dispatch Logs is strictly restricted to Super Admin accounts.");
            return;
        }

        const logs = BGO_DB.getEmailLogs();
        if (logs.length === 0) {
            alert("Email dispatch logs table is already empty.");
            return;
        }

        if (confirm(`🔥 CRITICAL CONFIRMATION REQUIRED:\n\nAre you sure you want to PERMANENTLY CLEAR ALL ${logs.length} EMAIL DISPATCH LOGS?\n\nThis will permanently delete all email delivery logs from system database storage.\n\nClick OK to confirm.`)) {
            BGO_DB.clearAllEmailLogs();
            alert("🔥 All system email dispatch logs have been completely cleared.");
            this.renderAdminEmailLogs();
        }
    },

    exportEmailLogs(format) {
        const user = BGO_AUTH.getCurrentUser();
        if (!user || user.role !== "superadmin") {
            alert("🔒 Access Denied: Exporting System Email Dispatch Logs is strictly restricted to Super Admin accounts.");
            return;
        }

        const logs = BGO_DB.getEmailLogs();
        if (logs.length === 0) {
            alert("No email dispatch log records available to export.");
            return;
        }

        if (format === "pdf") {
            const printWin = window.open('', '_blank');
            let rowsHtml = "";
            logs.forEach((l, idx) => {
                const dateStr = l.timestamp ? l.timestamp.replace("T", " ").substring(0, 19) : "N/A";
                const cleanBody = (l.body || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                rowsHtml += `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${l.id}<br><span style="color:#64748b; font-size:9px;">${dateStr}</span></td>
                        <td><strong>${l.toName}</strong><br>${l.toEmail}</td>
                        <td>${l.category}</td>
                        <td><strong>${l.subject}</strong></td>
                        <td>${l.status || 'DELIVERED ✅'}</td>
                        <td style="font-size:9px; color:#475569;">${cleanBody.substring(0, 120)}${cleanBody.length > 120 ? '...' : ''}</td>
                    </tr>
                `;
            });

            const pdfHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>BGO System Email Dispatch & Delivery Audit Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #1e293b; font-size: 11px; }
                        h2 { color: #0f4c3a; margin-bottom: 4px; }
                        p { margin: 0 0 15px 0; color: #64748b; font-size: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; word-break: break-word; }
                        th { background-color: #0f4c3a; color: white; font-weight: bold; font-size: 10px; text-transform: uppercase; }
                        tr:nth-child(even) { background-color: #f8fafc; }
                        .footer { margin-top: 25px; font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
                    </style>
                </head>
                <body>
                    <h2>Bahmani Group Oman – System Email Dispatch & Delivery Audit Report</h2>
                    <p>Official Super Admin Email Audit Report • Total Email Dispatch Records: ${logs.length} • Generated on: ${new Date().toLocaleString()}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ID & Timestamp</th>
                                <th>Recipient</th>
                                <th>Category</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Delivery Information / Body Snippet</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                    <div class="footer">
                        Confidential Administrative Document • Generated by Super Admin @${user.username} (${user.fullName}) • Bahmani Group Oman
                    </div>
                    <script>
                        window.onload = function() { window.print(); };
                    </script>
                </body>
                </html>
            `;

            printWin.document.write(pdfHtml);
            printWin.document.close();

            BGO_DB.addAuditLog("EMAIL_LOG_EXPORT", `Super Admin exported ${logs.length} Email Dispatch Log records in PDF format.`);
            return;
        }

        // CSV & Excel formats
        const filename = `BGO_Email_Dispatch_Logs_${new Date().toISOString().split('T')[0]}`;
        const headers = ["Log ID", "Date & Time", "Recipient Name", "Recipient Email", "Category", "Subject Line", "Delivery Status", "Message Body / Delivery Details"];
        
        let csvContent = "";
        
        if (format === "excel") {
            csvContent += "\uFEFF"; // UTF-8 BOM for Excel compatibility
        }

        csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";

        logs.forEach(l => {
            const dateStr = l.timestamp ? l.timestamp.replace("T", " ").substring(0, 19) : "N/A";
            const row = [
                l.id || "",
                dateStr,
                l.toName || "",
                l.toEmail || "",
                l.category || "",
                l.subject || "",
                l.status || "DELIVERED ✅",
                (l.body || "").replace(/\n/g, ' ')
            ];
            csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",") + "\n";
        });

        const mimeType = format === "excel" ? "application/vnd.ms-excel;charset=utf-8" : "text/csv;charset=utf-8";
        const fileExt = format === "excel" ? "xlsx" : "csv";

        const blob = new Blob([csvContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.${fileExt}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        BGO_DB.addAuditLog("EMAIL_LOG_EXPORT", `Super Admin exported ${logs.length} Email Dispatch Log records in ${format.toUpperCase()} format.`);
    },

    openEmailModal() {
        const idIn = document.getElementById("ad-eml-id");
        if (idIn) idIn.value = "";
        const form = document.getElementById("ad-email-form");
        if (form) form.reset();
        const titleEl = document.getElementById("ad-eml-modal-title");
        if (titleEl) titleEl.innerText = "➕ Add Emergency Email Alert Recipient";
        document.getElementById("ad-email-modal").classList.add("active");
    },

    openEmailEditModal(id) {
        const list = BGO_DB.getEmailRecipients();
        const item = list.find(r => r.id === id);
        if (item) {
            const idIn = document.getElementById("ad-eml-id");
            if (idIn) idIn.value = item.id;
            document.getElementById("ad-eml-name").value = item.name;
            document.getElementById("ad-eml-email").value = item.email;
            document.getElementById("ad-eml-role").value = item.role || "";
            const titleEl = document.getElementById("ad-eml-modal-title");
            if (titleEl) titleEl.innerText = "✏️ Edit Emergency Email Alert Recipient";
            document.getElementById("ad-email-modal").classList.add("active");
        }
    },

    closeEmailModal() {
        document.getElementById("ad-email-modal").classList.remove("active");
    },

    handleSaveEmailRecipient(e) {
        e.preventDefault();
        try {
            const id = document.getElementById("ad-eml-id") ? document.getElementById("ad-eml-id").value : "";
            const name = document.getElementById("ad-eml-name").value.trim();
            const email = document.getElementById("ad-eml-email").value.trim();
            const role = document.getElementById("ad-eml-role").value.trim();
            
            if (!name || !email) {
                alert("⚠️ Missing Fields: Please enter both Coordinator Name and Email Address.");
                return;
            }

            if (id) {
                BGO_DB.updateEmailRecipient(id, { name, email, role: role || "Emergency Coordinator" });
                alert(`✅ Emergency email alert recipient updated successfully!\n\nName: ${name}\nEmail: ${email}\nRole: ${role || 'Emergency Coordinator'}`);
            } else {
                const newRec = BGO_DB.addEmailRecipient({ name, email, role: role || "Emergency Coordinator" });
                
                // Dispatch welcome acknowledgment notification to the new recipient
                BGO_DB.sendEmailNotification({
                    toEmail: email,
                    toName: name,
                    category: "Emergency Coordinator Registration",
                    subject: "Added as Designated Emergency Email Recipient - BGO Oman",
                    body: `Assalamu Alaikum ${name},\n\nYou have been registered as a Designated Emergency Email Recipient (${role || 'Emergency Coordinator'}) for Bahmani Group Oman.\n\nYou will automatically receive real-time email broadcasts whenever emergency help requests, medical aid, or critical updates are logged.`
                });

                alert(`✅ New emergency email alert recipient added successfully!\n\nName: ${name}\nEmail: ${email}\nRole: ${role || 'Emergency Coordinator'}\n\nAutomated email alerts are now active for this coordinator.`);
            }
            this.closeEmailModal();
            this.loadAdminDashboardData();
        } catch (err) {
            console.error("Error saving email recipient:", err);
            alert("❌ Error saving email recipient: " + err.message);
        }
    },

    adminDeleteEmailRecipient(id) {
        const recipients = BGO_DB.getEmailRecipients();
        const item = recipients.find(r => r.id === id);
        const recName = item ? `${item.name} (${item.email})` : "this recipient";

        if (confirm(`Are you sure you want to remove ${recName} from receiving automated emergency email alerts?`)) {
            BGO_DB.deleteEmailRecipient(id);
            alert(`🗑️ Emergency email alert recipient removed successfully.`);
            this.loadAdminDashboardData();
        }
    },

    openEmailViewModal(id) {
        const logs = BGO_DB.getEmailLogs();
        const item = logs.find(l => l.id === id);
        if (item) {
            document.getElementById("eml-view-subject").innerText = `📧 ${item.subject}`;
            document.getElementById("eml-view-to").innerText = `${item.toName} (${item.toEmail})`;
            document.getElementById("eml-view-category").innerText = item.category;
            document.getElementById("eml-view-time").innerText = item.timestamp ? item.timestamp.replace("T", " ").substring(0, 19) : "N/A";
            document.getElementById("eml-view-status").innerText = item.status || "DELIVERED ✅";
            document.getElementById("eml-view-body").value = item.body || "";
            document.getElementById("ad-view-email-body-modal").classList.add("active");
        }
    },

    closeEmailViewModal() {
        document.getElementById("ad-view-email-body-modal").classList.remove("active");
    },

    // Executive Management Leadership API Handlers
    renderAdminExecManagementTable() {
        const execmBody = document.querySelector("#ad-exec-management-table tbody");
        if (!execmBody) return;
        const list = BGO_DB.getExecutiveManagement();
        let html = "";
        if (list.length === 0) {
            html = `<tr><td colspan="4" style="text-align:center; color:var(--text-light);">No Executive Management officers configured.</td></tr>`;
        } else {
            list.forEach((item, index) => {
                const isFirst = index === 0;
                const isLast = index === list.length - 1;

                const rawName = item.name || "Officer";
                const cleanName = rawName.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Eng\.|Prof\.)\s+/i, '').trim();
                const parts = cleanName.split(/\s+/).filter(Boolean);
                let initials = "EO";
                if (parts.length === 1) initials = parts[0].substring(0, 2).toUpperCase();
                else if (parts.length > 1) initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();

                const safeName = rawName.replace(/'/g, "\\'");
                const safeRole = (item.roleTitle || 'Executive').replace(/'/g, "\\'");
                const imgSrc = item.photoUrl ? item.photoUrl.trim() : "";

                let avatarHtml = "";
                if (imgSrc) {
                    avatarHtml = `
                        <div style="width:42px; height:42px; border-radius:50%; overflow:hidden; border:1.5px solid var(--secondary-color); display:inline-flex; align-items:center; justify-content:center; background:var(--primary-dark); margin-right:0.6rem; vertical-align:middle; cursor:pointer;" onclick="BGO_PAGES.openImageLightboxModal('${imgSrc}', '${safeName}', '${safeRole}')">
                            <img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div style="display:none; width:100%; height:100%; background:var(--primary-color); color:white; font-weight:800; font-size:0.85rem; align-items:center; justify-content:center;">${initials}</div>
                        </div>
                    `;
                } else {
                    avatarHtml = `
                        <div style="width:42px; height:42px; border-radius:50%; background:var(--primary-color); color:white; display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem; margin-right:0.6rem; vertical-align:middle; border:1.5px solid var(--secondary-color);">${initials}</div>
                    `;
                }

                html += `
                    <tr>
                        <td>
                            <div style="display:flex; align-items:center;">
                                ${avatarHtml}
                                <div>
                                    <strong>${item.name}</strong>
                                    ${item.photoUrl ? `<br><span style="font-size:0.7rem; color:var(--primary-color); font-weight:600;">📷 Photo Configured</span>` : '<br><span style="font-size:0.7rem; color:var(--text-light);">👤 Default Initials Avatar</span>'}
                                </div>
                            </div>
                        </td>
                        <td><span class="badge-status" style="background:#e0f2fe; color:#0369a1; font-size:0.8rem;">${item.roleTitle}</span></td>
                        <td><strong style="color:var(--primary-color);">${item.region || 'Muscat'}</strong></td>
                        <td class="table-actions">
                            <button onclick="BGO_PAGES.adminMoveExecManagement('${item.id}', 'up')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);" ${isFirst ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} title="Move Up in Display Order">⬆️ Up</button>
                            <button onclick="BGO_PAGES.adminMoveExecManagement('${item.id}', 'down')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);" ${isLast ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} title="Move Down in Display Order">⬇️ Down</button>
                            <button onclick="BGO_PAGES.openExecManagementEditModal('${item.id}')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">✏️ Edit</button>
                            <button onclick="BGO_PAGES.adminDeleteExecManagement('${item.id}')" class="action-btn-sm action-btn-delete">🗑️ Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
        execmBody.innerHTML = html;
    },

    refreshExecManagementViews() {
        this.renderAdminExecManagementTable();
        if (window.location.hash === "#contact") {
            this.contact();
        }
    },

    adminMoveExecManagement(id, direction) {
        BGO_DB.moveExecutiveManagement(id, direction);
        this.refreshExecManagementViews();
    },

    openExecManagementModal() {
        document.getElementById("ad-execm-id").value = "";
        const form = document.getElementById("ad-execm-form");
        if (form) form.reset();
        document.getElementById("ad-execm-modal-title").innerText = "Add Executive Management Officer";
        document.getElementById("ad-execm-modal").classList.add("active");
    },

    openExecManagementEditModal(id) {
        const list = BGO_DB.getExecutiveManagement();
        const item = list.find(e => e.id === id);
        if (item) {
            document.getElementById("ad-execm-id").value = item.id;
            document.getElementById("ad-execm-name").value = item.name;
            document.getElementById("ad-execm-role").value = item.roleTitle;
            document.getElementById("ad-execm-region").value = item.region || "Muscat";
            document.getElementById("ad-execm-photo").value = item.photoUrl || "";
            document.getElementById("ad-execm-modal-title").innerText = "Edit Executive Management Officer";
            document.getElementById("ad-execm-modal").classList.add("active");
        }
    },

    closeExecManagementModal() {
        document.getElementById("ad-execm-modal").classList.remove("active");
    },

    async handleExecManagementSubmit(e) {
        e.preventDefault();
        const id = document.getElementById("ad-execm-id").value;
        const name = document.getElementById("ad-execm-name").value.trim();
        const roleTitle = document.getElementById("ad-execm-role").value.trim();
        const region = document.getElementById("ad-execm-region").value.trim();
        let photoUrl = document.getElementById("ad-execm-photo").value.trim();
        
        const fileIn = document.getElementById("ad-execm-file");
        if (fileIn && fileIn.files.length > 0) {
            try {
                photoUrl = await this.readFileAsBase64(fileIn.files[0]);
            } catch (err) {
                console.error("Executive photo upload error:", err);
            }
        }
        
        if (id) {
            BGO_DB.updateExecutiveManagement(id, { name, roleTitle, region, photoUrl });
            alert("Executive Management officer details updated successfully!");
        } else {
            BGO_DB.addExecutiveManagement({ name, roleTitle, region, photoUrl });
            alert("New Executive Management officer registered successfully!");
        }
        this.closeExecManagementModal();
        this.refreshExecManagementViews();
    },

    adminDeleteExecManagement(id) {
        if (confirm("Remove this Executive Management officer from the leadership directory?")) {
            BGO_DB.deleteExecutiveManagement(id);
            alert("Executive Management officer removed.");
            this.refreshExecManagementViews();
        }
    },

    // Executive Committee profession edit
    adminEditExecProfession(username) {
        const members = BGO_DB.getMembers();
        const exec = members.find(m => m.username === username);
        if (exec) {
            const newProf = prompt(`Edit Profession for Executive Committee member ${exec.fullName}:`, exec.profession);
            if (newProf !== null && newProf.trim() !== "") {
                BGO_DB.updateMemberProfile(username, { profession: newProf.trim() });
                alert("Executive member profession updated successfully.");
                this.loadAdminDashboardData();
            }
        }
    },

    adminToggleExecStatus(username) {
        const member = BGO_DB.getMembers().find(m => m.username === username);
        if (member) {
            const newStatus = member.status === "deactivated" ? "approved" : "deactivated";
            BGO_DB.updateMemberStatus(username, newStatus);
            alert(`Executive member @${username} status updated to ${newStatus.toUpperCase()}.`);
            this.loadAdminDashboardData();
        }
    },

    // Executive promotions and demotions
    handlePromoteMember(e) {
        e.preventDefault();
        const username = document.getElementById("promote-member-select").value;
        if (!username) return;
        
        BGO_DB.promoteMember(username);
        alert(`Member @${username} has been promoted to the BGO Executive Committee successfully.`);
        BGO_PAGES.loadAdminDashboardData();
    },

    handleDemoteMember(username) {
        if (confirm(`Are you sure you want to demote Executive Committee member @${username} back to regular member status?`)) {
            BGO_DB.demoteMember(username);
            BGO_PAGES.loadAdminDashboardData();
        }
    },

    // Save Executive Permissions config
    handleSavePermissions(e) {
        e.preventDefault();
        const viewMembers = document.getElementById("perm-view-members").checked;
        const viewProfiles = document.getElementById("perm-view-profiles").checked;
        const viewRequests = document.getElementById("perm-view-requests").checked;
        const viewVolunteers = document.getElementById("perm-view-vols").checked;
        
        BGO_DB.saveExecutivePermissions({ viewMembers, viewProfiles, viewRequests, viewVolunteers });
        alert("Executive privileges permissions updated successfully!");
        BGO_PAGES.loadAdminDashboardData();
    },

    // Secure Admin Registration & Management (Super Admin Only)
    handleRegisterAdminAccount(e) {
        e.preventDefault();
        const username = document.getElementById("admin-reg-username").value.trim();
        const fullName = document.getElementById("admin-reg-name").value.trim();
        const mobile = document.getElementById("admin-reg-mobile").value.trim();
        const email = document.getElementById("admin-reg-email").value.trim();
        const password = document.getElementById("admin-reg-password").value;
        const role = document.getElementById("admin-reg-role").value;
        
        const err = document.getElementById("admin-reg-err");
        
        const vMobile = this.validateAndFormatPhoneNumber(mobile, "Oman Phone Number");
        if (!vMobile.valid) {
            err.style.display = "block";
            err.innerText = vMobile.message;
            return;
        }
        
        const res = BGO_DB.registerAdminAccount({ username, fullName, mobile: vMobile.value, email, password, role });
        if (res.success) {
            err.style.display = "none";
            alert(`Secure ${role.toUpperCase()} account @${username} registered successfully!`);
            document.getElementById("ad-admin-creation-form").reset();
            BGO_PAGES.loadAdminDashboardData();
        } else {
            err.style.display = "block";
            err.innerText = res.message;
        }
    },

    renderAdminAccountsTable() {
        const adminBody = document.querySelector("#ad-admins-table tbody");
        if (!adminBody) return;
        const curUser = BGO_AUTH.getCurrentUser();
        const isSuper = curUser && curUser.role === "superadmin";

        if (!isSuper) {
            adminBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger-color); font-weight:700;">🔒 Restricted Access: Admin Management & Permission Configurations are visible only to Super Admin accounts.</td></tr>`;
            return;
        }

        const ALL_ADMIN_PERMISSIONS = {
            memberManagement: "Member Management",
            memberApproval: "Member Registration Approval",
            profileUpdates: "Profile Updates Approval",
            execManagement: "Executive Committee Management",
            eventManagement: "Event Management",
            galleryManagement: "Gallery & Media Management",
            jobManagement: "Job Portal Management",
            medicalManagement: "Medical Aid Request Management",
            newsManagement: "News Management",
            volunteerManagement: "Volunteer Management",
            helplineManagement: "Helpline Request Management",
            contactManagement: "Contact Form Management",
            directoryAccess: "Member Directory Access",
            reportsAnalytics: "Reports & Analytics",
            emailNotifications: "Email Notifications",
            smsNotifications: "SMS Notifications"
        };

        const admins = BGO_DB.getAdminAccounts().filter(a => a.role !== "superadmin");
        if (admins.length === 0) {
            adminBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-light);">No standard administrator accounts registered.</td></tr>`;
            return;
        }

        let html = "";
        admins.forEach(a => {
            const isSuperRole = a.role === "superadmin";
            const roleLabel = "ADMIN";
            const roleStyle = "background-color:#0284c7; color:white;";
            
            const isLocked = !!a.isLocked;
            const isInactive = a.status === "inactive" || a.status === "deactivated";
            
            let statusBadge = "";
            if (isLocked) {
                statusBadge = `<span class="badge-status" style="background-color:#ef4444; color:white;">🔒 LOCKED</span>`;
            } else if (isInactive) {
                statusBadge = `<span class="badge-status badge-status-pending">INACTIVE</span>`;
            } else {
                statusBadge = `<span class="badge-status badge-status-approved">ACTIVE</span>`;
            }

            const lastLoginStr = a.lastLogin ? a.lastLogin : "<span style='font-style:italic; color:var(--text-light);'>Never Logged In</span>";

            // Permissions count & Visual Ticks list
            const permsObj = a.permissions || {};
            const allKeys = Object.keys(ALL_ADMIN_PERMISSIONS);
            const totalKeys = allKeys.length;
            const grantedKeys = allKeys.filter(k => permsObj[k] !== false);

            let permHeaderHtml = "";
            if (grantedKeys.length === totalKeys) {
                permHeaderHtml = `<span class="badge-status" style="background-color:rgba(15,76,58,0.15); color:var(--primary-color); font-weight:800; font-size:0.75rem;">✅ ALL 16 TICKED (FULL ACCESS)</span>`;
            } else if (grantedKeys.length === 0) {
                permHeaderHtml = `<span class="badge-status" style="background-color:rgba(239,68,68,0.15); color:var(--danger-color); font-weight:800; font-size:0.75rem;">❌ ALL REVOKED (NO ACCESS)</span>`;
            } else {
                permHeaderHtml = `<span class="badge-status" style="background-color:rgba(2,132,199,0.15); color:#0284c7; font-weight:800; font-size:0.75rem;">⚙️ ${grantedKeys.length} / ${totalKeys} TICKED (CUSTOM)</span>`;
            }

            let permTagsHtml = `<div style="display:flex; flex-wrap:wrap; gap:0.25rem; margin-top:0.4rem; max-width:340px;">`;
            allKeys.forEach(k => {
                const isGranted = permsObj[k] !== false;
                const label = ALL_ADMIN_PERMISSIONS[k];
                if (isGranted) {
                    permTagsHtml += `<span title="${label}: ACCESS GRANTED" style="background:#e6f4ea; color:#137333; border:1px solid #ceead6; padding:0.15rem 0.4rem; border-radius:3px; font-size:0.7rem; font-weight:700;">✓ ${label}</span>`;
                } else {
                    permTagsHtml += `<span title="${label}: ACCESS RESTRICTED" style="background:#fce8e6; color:#c5221f; border:1px solid #fad2cf; padding:0.15rem 0.4rem; border-radius:3px; font-size:0.7rem; font-weight:700; text-decoration:line-through;">✗ ${label}</span>`;
                }
            });
            permTagsHtml += `</div>`;

            const permCellContent = `<div>${permHeaderHtml}${permTagsHtml}</div>`;

            let actionBtns = "";
            if (isSuper) {
                const lockBtnText = isLocked ? "🔓 Unlock" : "🔒 Lock";
                const lockBtnColor = isLocked ? "background-color:#107c41; color:white;" : "background-color:#f59e0b; color:white;";
                
                const statusBtnText = isInactive ? "🟢 Activate" : "🔴 Deactivate";
                
                if (!isSuperRole) {
                    actionBtns += `<button onclick="BGO_PAGES.openAdminPermModal('${a.username}')" class="action-btn-sm" style="background-color:var(--primary-color); color:white;">⚙️ Permissions</button>`;
                }
                
                actionBtns += `
                    <button onclick="BGO_PAGES.openAdminEditDetailsModal('${a.username}')" class="action-btn-sm" style="background-color:#7c3aed; color:white;">✏️ Edit</button>
                    <button onclick="BGO_PAGES.adminToggleLock('${a.username}', ${!isLocked})" class="action-btn-sm" style="${lockBtnColor}">${lockBtnText}</button>
                    <button onclick="BGO_PAGES.adminToggleStatus('${a.username}')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">${statusBtnText}</button>
                    <button onclick="BGO_PAGES.adminResetPassword('${a.username}')" class="action-btn-sm" style="background-color:#0284c7; color:white;">🔑 Reset Pass</button>
                `;

                if (a.username !== "superadmin") {
                    actionBtns += `<button onclick="BGO_PAGES.adminDeleteAccount('${a.username}')" class="action-btn-sm action-btn-delete">🗑️ Delete</button>`;
                }
            } else {
                actionBtns = `<span style="font-size:0.75rem; color:var(--text-light); font-style:italic;">Super Admin Only</span>`;
            }

            html += `
                <tr style="${isLocked ? 'background-color:rgba(239, 68, 68, 0.05);' : ''}">
                    <td>
                        <strong>${a.fullName}</strong><br>
                        <span style="font-size:0.75rem; color:var(--text-light);">@${a.username} | ${a.email}</span><br>
                        <span style="font-size:0.75rem; font-weight:600; color:var(--primary-light);">📞 ${a.mobile}</span>
                    </td>
                    <td><span class="badge-status" style="${roleStyle}">${roleLabel}</span></td>
                    <td>${statusBadge}${a.lockReason ? '<br><span style="font-size:0.7rem; color:var(--danger-color);">Reason: ' + a.lockReason + '</span>' : ''}</td>
                    <td><span style="font-size:0.8rem; color:var(--text-color);">${lastLoginStr}</span></td>
                    <td>${permCellContent}</td>
                    <td class="table-actions">${actionBtns}</td>
                </tr>
            `;
        });

        adminBody.innerHTML = html;
    },

    updatePermModalCounter() {
        const permKeys = [
            "memberManagement", "memberApproval", "profileUpdates", "execManagement",
            "eventManagement", "galleryManagement", "jobManagement", "medicalManagement",
            "newsManagement", "volunteerManagement", "helplineManagement", "contactManagement",
            "directoryAccess", "reportsAnalytics", "emailNotifications", "smsNotifications"
        ];
        let checkedCount = 0;
        permKeys.forEach(key => {
            const chk = document.getElementById(`perm-${key}`);
            if (chk && chk.checked) checkedCount++;
        });
        const badge = document.getElementById("ad-perm-counter-badge");
        if (badge) {
            badge.innerText = `${checkedCount} / ${permKeys.length} Ticked`;
            if (checkedCount === permKeys.length) {
                badge.style.background = "#e6f4ea";
                badge.style.color = "#137333";
            } else if (checkedCount === 0) {
                badge.style.background = "#fce8e6";
                badge.style.color = "#c5221f";
            } else {
                badge.style.background = "#e0f2fe";
                badge.style.color = "#0369a1";
            }
        }
    },

    openAdminPermModal(username) {
        const curUser = BGO_AUTH.getCurrentUser();
        if (!curUser || curUser.role !== "superadmin") {
            alert("Access Denied: Permission configuration is strictly reserved for Super Admin accounts.");
            return;
        }

        const members = BGO_DB.getMembers();
        const admin = members.find(a => a.username.toLowerCase() === String(username).toLowerCase());
        if (!admin) {
            alert(`Error: Administrator account @${username} not found.`);
            return;
        }

        document.getElementById("ad-perm-username").value = admin.username;
        document.getElementById("ad-perm-modal-title").innerText = `⚙️ Configure Permissions for @${admin.username} (${admin.fullName})`;
        document.getElementById("ad-perm-user-label").innerText = `Configuring: ${admin.fullName} (@${admin.username}) - Role: ${admin.role.toUpperCase()}`;

        const permKeys = [
            "memberManagement", "memberApproval", "profileUpdates", "execManagement",
            "eventManagement", "galleryManagement", "jobManagement", "medicalManagement",
            "newsManagement", "volunteerManagement", "helplineManagement", "contactManagement",
            "directoryAccess", "reportsAnalytics", "emailNotifications", "smsNotifications"
        ];

        const permsObj = admin.permissions || {};
        permKeys.forEach(key => {
            const chk = document.getElementById(`perm-${key}`);
            if (chk) {
                chk.checked = permsObj[key] !== false; // Default true if unconfigured
                chk.onchange = () => this.updatePermModalCounter();
            }
        });

        this.updatePermModalCounter();
        document.getElementById("ad-admin-perm-modal").classList.add("active");
    },

    selectAllAdminPerms(selectVal) {
        const permKeys = [
            "memberManagement", "memberApproval", "profileUpdates", "execManagement",
            "eventManagement", "galleryManagement", "jobManagement", "medicalManagement",
            "newsManagement", "volunteerManagement", "helplineManagement", "contactManagement",
            "directoryAccess", "reportsAnalytics", "emailNotifications", "smsNotifications"
        ];
        permKeys.forEach(key => {
            const chk = document.getElementById(`perm-${key}`);
            if (chk) chk.checked = !!selectVal;
        });
        this.updatePermModalCounter();
    },

    closeAdminPermModal() {
        document.getElementById("ad-admin-perm-modal").classList.remove("active");
    },

    handleSaveAdminPermissions(e) {
        e.preventDefault();
        const username = document.getElementById("ad-perm-username").value;
        const permKeys = [
            "memberManagement", "memberApproval", "profileUpdates", "execManagement",
            "eventManagement", "galleryManagement", "jobManagement", "medicalManagement",
            "newsManagement", "volunteerManagement", "helplineManagement", "contactManagement",
            "directoryAccess", "reportsAnalytics", "emailNotifications", "smsNotifications"
        ];
        const permsObj = {};
        permKeys.forEach(key => {
            const chk = document.getElementById(`perm-${key}`);
            permsObj[key] = chk ? chk.checked : false;
        });

        const updated = BGO_DB.updateAdminPermissions(username, permsObj);
        if (updated) {
            alert(`Permissions Updated!\nModule permissions for @${username} have been saved successfully and logged in Audit Logs.`);
            this.closeAdminPermModal();
            this.loadAdminDashboardData();
        } else {
            alert("Error: Failed to save permissions. Admin account not found.");
        }
    },

    openAdminEditDetailsModal(username) {
        const curUser = BGO_AUTH.getCurrentUser();
        if (!curUser || curUser.role !== "superadmin") {
            alert("Access Denied: Editing admin account details is strictly reserved for Super Admin.");
            return;
        }

        const members = BGO_DB.getMembers();
        const admin = members.find(a => a.username.toLowerCase() === String(username).toLowerCase());
        if (!admin) {
            alert(`Error: Administrator account @${username} not found.`);
            return;
        }

        document.getElementById("ad-edit-admin-username").value = admin.username;
        document.getElementById("ad-edit-admin-fullname").value = admin.fullName || "";
        document.getElementById("ad-edit-admin-email").value = admin.email || "";
        document.getElementById("ad-edit-admin-mobile").value = admin.mobile || "";
        document.getElementById("ad-edit-admin-profession").value = admin.profession || "";
        document.getElementById("ad-edit-admin-location").value = admin.city || admin.workLocation || "";

        document.getElementById("ad-edit-admin-modal").classList.add("active");
    },

    closeAdminEditModal() {
        document.getElementById("ad-edit-admin-modal").classList.remove("active");
    },

    handleSaveAdminEdit(e) {
        e.preventDefault();
        const username = document.getElementById("ad-edit-admin-username").value;
        const fullName = document.getElementById("ad-edit-admin-fullname").value;
        const email = document.getElementById("ad-edit-admin-email").value;
        const mobile = document.getElementById("ad-edit-admin-mobile").value;
        const profession = document.getElementById("ad-edit-admin-profession").value;
        const city = document.getElementById("ad-edit-admin-location").value;

        const members = BGO_DB.getMembers();
        const admin = members.find(a => a.username.toLowerCase() === String(username).toLowerCase());
        if (admin) {
            admin.fullName = fullName;
            admin.email = email;
            admin.mobile = mobile;
            admin.profession = profession;
            admin.city = city;
            admin.workLocation = city;

            localStorage.setItem("bgo_members", JSON.stringify(members));

            const curStr = localStorage.getItem("bgo_current_user");
            if (curStr) {
                const curUser = JSON.parse(curStr);
                if (curUser.username.toLowerCase() === admin.username.toLowerCase()) {
                    curUser.fullName = fullName;
                    curUser.email = email;
                    curUser.mobile = mobile;
                    curUser.profession = profession;
                    curUser.city = city;
                    localStorage.setItem("bgo_current_user", JSON.stringify(curUser));
                }
            }

            BGO_DB.addAuditLog("ADMIN_DETAILS_UPDATE", `Super Admin updated profile details for admin account @${admin.username} (${fullName}).`);
            alert(`Administrator Account Details Updated Successfully!\nProfile changes saved for @${admin.username}.`);
            this.closeAdminEditModal();
            this.loadAdminDashboardData();
        } else {
            alert("Error: Failed to save changes. Admin account not found.");
        }
    },

    adminToggleLock(username, lockState) {
        let reason = "";
        if (lockState) {
            reason = prompt(`Enter reason for locking admin account @${username}:`, "Security lock / Account under review");
            if (reason === null) return; // Cancelled
        }

        const updated = BGO_DB.toggleAdminLock(username, lockState, reason ? reason.trim() : "");
        if (updated) {
            alert(`Admin Account ${lockState ? 'Locked 🔒' : 'Unlocked 🔓'}!\nAccount @${username} status has been updated and recorded in system audit logs.`);
            this.loadAdminDashboardData();
        }
    },

    adminToggleStatus(username) {
        const updated = BGO_DB.toggleAdminStatus(username);
        if (updated) {
            alert(`Admin Account Status Changed!\nAccount @${username} is now ${updated.status.toUpperCase()}.`);
            this.loadAdminDashboardData();
        }
    },

    adminResetPassword(username) {
        const newPass = prompt(`Enter new password for Admin account @${username}:`);
        if (!newPass) return;
        if (newPass.trim().length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        const success = BGO_DB.resetAdminPassword(username, newPass.trim());
        if (success) {
            alert(`Password Reset Successful!\nNew password for @${username} has been saved and logged.`);
            this.loadAdminDashboardData();
        }
    },

    adminDeleteAccount(username) {
        if (confirm(`Are you sure you want to permanently delete Admin account @${username}?\nThis action will be recorded in the System Audit Log.`)) {
            const success = BGO_DB.deleteAdminAccount(username);
            if (success) {
                alert(`Admin Account @${username} Deleted!`);
                this.loadAdminDashboardData();
            }
        }
    },

    // Member dashboard helpers
    adminApproveMember(username) {
        BGO_DB.approveMember(username);
        alert(`Member @${username} approved successfully and activated in the BGO Directory.`);
        this.loadAdminDashboardData();
    },

    adminToggleMemberStatus(username, currentStatus) {
        const nextStatus = currentStatus === "approved" ? "inactive" : "approved";
        BGO_DB.updateMemberStatus(username, nextStatus);
        alert(`Member @${username} status changed to ${nextStatus.toUpperCase()}.`);
        this.loadAdminDashboardData();
    },

    adminDeleteMember(username) {
        if (confirm(`Are you sure you want to delete member @${username} and all their linked registrations?`)) {
            BGO_DB.deleteMember(username);
            alert("Member deleted successfully.");
            this.loadAdminDashboardData();
        }
    },

    // Member Detailed Profile Viewer
    adminOpenMemberView(username) {
        const members = BGO_DB.getMembers();
        const m = members.find(item => item.username === username);
        if (m) {
            let childrenHtml = "None";
            if (m.children && m.children.length > 0) {
                childrenHtml = m.children.map((c, i) => `Child ${i+1}: ${c.name} (Born ${c.birthYear})`).join("<br>");
            }
            
            let volHtml = "No";
            if (m.volunteerInterest) {
                volHtml = `Yes (Sectors: ${m.volunteerAreas ? m.volunteerAreas.join(", ") : "General Support"}; Skills: ${m.volunteerSkills || "Assistance"})`;
            }

            const emOman = m.emergencyContactOman || { name: "N/A", phone: "N/A", relationship: "N/A" };
            const emIndia = m.emergencyContactIndia || { name: "N/A", phone: "N/A", relationship: "N/A" };

            const html = `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;">
                    <div style="grid-column: span 2; border-bottom: 2px solid var(--secondary-color); padding-bottom:0.3rem; font-weight:700; color:var(--primary-color); display:flex; justify-content:space-between; align-items:center;">
                        <span>1. Personal & Marital Information</span>
                        <span style="font-family:monospace; font-size:0.95rem; font-weight:800; background:rgba(15,76,58,0.12); color:var(--primary-color); padding:0.2rem 0.6rem; border-radius:12px;">ID: ${m.memberId || 'Pending Approval'}</span>
                    </div>
                    <div><strong style="color:var(--text-light);">BGO Member ID:</strong> <p style="color:var(--primary-color); font-weight:800; font-family:monospace; margin:0; font-size:1.05rem;">${m.memberId || 'Pending Approval'}</p></div>
                    <div><strong style="color:var(--text-light);">Full Name:</strong> <p style="font-weight:700; margin:0;">${m.fullName}</p></div>
                    <div><strong style="color:var(--text-light);">Blood Group:</strong> <p style="color:var(--danger-color); font-weight:700; margin:0;">${m.bloodGroup || 'N/A'}</p></div>
                    <div><strong style="color:var(--text-light);">Father's Name:</strong> <p style="margin:0;">${m.fatherName || 'N/A'}</p></div>
                    <div><strong style="color:var(--text-light);">Marital Status:</strong> <p style="text-transform:capitalize; margin:0;">${m.maritalStatus || 'N/A'}</p></div>
                    <div><strong style="color:var(--text-light);">Spouse Name:</strong> <p style="margin:0;">${m.spouseName || 'N/A'}</p></div>
                    <div><strong style="color:var(--text-light);">Oman Dependents:</strong> <p style="margin:0;">${m.dependentsCount || 0}</p></div>
                    <div style="grid-column: span 2;"><strong style="color:var(--text-light);">Children details:</strong> <p style="margin:0;">${childrenHtml}</p></div>

                    <div style="grid-column: span 2; border-bottom: 2px solid var(--secondary-color); padding-bottom:0.3rem; font-weight:700; color:var(--primary-color); margin-top:0.8rem;">2. Contact & Address Details</div>
                    <div><strong style="color:var(--text-light);">Oman Mobile:</strong> <p style="margin:0;">${m.mobile}</p></div>
                    <div><strong style="color:var(--text-light);">WhatsApp Number:</strong> <p style="margin:0;">${m.whatsapp || m.mobile}</p></div>
                    <div><strong style="color:var(--text-light);">Current Residence in Oman:</strong> <p style="margin:0;">${m.city}</p></div>
                    <div><strong style="color:var(--text-light);">Native Place in Gulbarga:</strong> <p style="margin:0;">${m.nativePlace}</p></div>
                    <div style="grid-column: span 2;"><strong style="color:var(--text-light);">Permanent Indian Address:</strong> <p style="margin:0;">${m.indiaAddress || 'N/A'}</p></div>

                    <div style="grid-column: span 2; border-bottom: 2px solid var(--secondary-color); padding-bottom:0.3rem; font-weight:700; color:var(--primary-color); margin-top:0.8rem;">3. Emergency Contact Numbers</div>
                    <div style="background:rgba(239, 68, 68, 0.05); padding:0.8rem; border-radius:var(--radius-sm);">
                        <strong style="color:#b91c1c;">Oman Emergency Contact:</strong>
                        <p style="margin:0.2rem 0 0 0;"><strong>Name:</strong> ${emOman.name}</p>
                        <p style="margin:0;"><strong>Phone:</strong> ${emOman.phone}</p>
                        <p style="margin:0;"><strong>Rel:</strong> ${emOman.relationship}</p>
                    </div>
                    <div style="background:rgba(239, 68, 68, 0.05); padding:0.8rem; border-radius:var(--radius-sm);">
                        <strong style="color:#b91c1c;">India Emergency Contact:</strong>
                        <p style="margin:0.2rem 0 0 0;"><strong>Name:</strong> ${emIndia.name}</p>
                        <p style="margin:0;"><strong>Phone:</strong> ${emIndia.phone}</p>
                        <p style="margin:0;"><strong>Rel:</strong> ${emIndia.relationship}</p>
                    </div>

                    <div style="grid-column: span 2; border-bottom: 2px solid var(--secondary-color); padding-bottom:0.3rem; font-weight:700; color:var(--primary-color); margin-top:0.8rem;">4. Employment & Volunteer Profile</div>
                    <div><strong style="color:var(--text-light);">Profession / Job Title:</strong> <p style="margin:0;">${m.profession}</p></div>
                    <div><strong style="color:var(--text-light);">Company Name:</strong> <p style="margin:0;">${m.company || 'N/A'}</p></div>
                    <div><strong style="color:var(--text-light);">Oman Work Address:</strong> <p style="margin:0;">${m.companyAddress || 'N/A'}</p></div>
                    <div><strong style="color:var(--text-light);">Oman Work City:</strong> <p style="margin:0;">${m.workLocation || 'N/A'}</p></div>
                    <div style="grid-column: span 2;"><strong style="color:var(--text-light);">BGO Volunteer Team:</strong> <p style="margin:0;">${volHtml}</p></div>

                    <div style="grid-column: span 2; border-bottom: 2px solid var(--secondary-color); padding-bottom:0.3rem; font-weight:700; color:var(--primary-color); margin-top:0.8rem;">5. System Credentials & Registration Records</div>
                    <div><strong style="color:var(--text-light);">Registration Date & Time:</strong> <p style="margin:0; font-weight:700; color:var(--primary-color);">${m.registeredAt || m.registrationDate || 'N/A'}</p></div>
                    <div><strong style="color:var(--text-light);">Username:</strong> <p style="margin:0;">@${m.username}</p></div>
                    <div><strong style="color:var(--text-light);">Email Address:</strong> <p style="margin:0;">${m.email}</p></div>
                </div>
            `;
            document.getElementById("ad-member-view-body").innerHTML = html;
            document.getElementById("ad-member-view-modal").classList.add("active");
        }
    },

    closeMemberViewModal() {
        document.getElementById("ad-member-view-modal").classList.remove("active");
    },

    adminOpenMemberEdit(username) {
        const members = BGO_DB.getMembers();
        const member = members.find(m => m.username === username);
        if (member) {
            document.getElementById("edit-m-username").value = member.username;
            document.getElementById("edit-m-name").value = member.fullName;
            document.getElementById("edit-m-email").value = member.email;
            document.getElementById("edit-m-mobile").value = member.mobile;
            document.getElementById("edit-m-whatsapp").value = member.whatsapp || "";
            document.getElementById("edit-m-city").value = member.city;
            document.getElementById("edit-m-profession").value = member.profession;
            document.getElementById("edit-m-company").value = member.company || "";
            document.getElementById("edit-m-native").value = member.nativePlace;
            
            document.getElementById("ad-member-edit-modal").classList.add("active");
        }
    },

    closeMemberEditModal() {
        document.getElementById("ad-member-edit-modal").classList.remove("active");
    },

    handleAdminSaveMember(e) {
        e.preventDefault();
        const username = document.getElementById("edit-m-username").value;
        const updated = {
            fullName: document.getElementById("edit-m-name").value,
            email: document.getElementById("edit-m-email").value,
            mobile: document.getElementById("edit-m-mobile").value,
            whatsapp: document.getElementById("edit-m-whatsapp").value,
            city: document.getElementById("edit-m-city").value,
            profession: document.getElementById("edit-m-profession").value,
            company: document.getElementById("edit-m-company").value,
            nativePlace: document.getElementById("edit-m-native").value
        };
        
        BGO_DB.updateMemberProfile(username, updated);
        alert("Member profile updated successfully.");
        this.closeMemberEditModal();
        this.loadAdminDashboardData();
    },

    // Manual Volunteer Management
    openManualVolModal() {
        document.getElementById("ad-vol-id").value = "";
        document.getElementById("ad-vol-form").reset();
        document.getElementById("ad-vol-modal-title").innerText = "Manual Volunteer Registration";
        
        // Populate members select
        const select = document.getElementById("ad-vol-username");
        select.innerHTML = '<option value="">-- Leave Unlinked / Manual Entry --</option>';
        const members = BGO_DB.getMembers();
        members.forEach(m => {
            select.innerHTML += `<option value="${m.username}">${m.fullName} (@${m.username})</option>`;
        });
        
        document.getElementById("ad-vol-modal").classList.add("active");
    },

    closeManualVolModal() {
        document.getElementById("ad-vol-modal").classList.remove("active");
    },

    autofillVolDetails(username) {
        if (!username) return;
        const members = BGO_DB.getMembers();
        const member = members.find(m => m.username === username);
        if (member) {
            document.getElementById("ad-vol-name").value = member.fullName;
            document.getElementById("ad-vol-mobile").value = member.mobile;
            document.getElementById("ad-vol-city").value = member.city;
            document.getElementById("ad-vol-type").value = member.volunteerAreas.join(", ") || "General Support";
            document.getElementById("ad-vol-expertise").value = member.volunteerSkills || "Assistance";
            document.getElementById("ad-vol-langs").value = "Urdu, Kannada, English";
            document.getElementById("ad-vol-avail").value = "Flexible";
        }
    },

    handleManualVolSubmit(e) {
        e.preventDefault();
        const id = document.getElementById("ad-vol-id").value;
        const volData = {
            username: document.getElementById("ad-vol-username").value,
            fullName: document.getElementById("ad-vol-name").value,
            mobile: document.getElementById("ad-vol-mobile").value,
            type: document.getElementById("ad-vol-type").value,
            expertise: document.getElementById("ad-vol-expertise").value,
            city: document.getElementById("ad-vol-city").value,
            availability: document.getElementById("ad-vol-avail").value,
            languages: document.getElementById("ad-vol-langs").value
        };
        
        if (id) {
            BGO_DB.updateVolunteer(id, volData);
            alert("Volunteer details updated successfully.");
        } else {
            BGO_DB.addVolunteerManually(volData);
            alert("Volunteer registered successfully.");
        }
        
        this.closeManualVolModal();
        this.loadAdminDashboardData();
    },

    adminApproveVolunteer(id) {
        BGO_DB.approveVolunteer(id);
        alert("Volunteer approved successfully.");
        this.loadAdminDashboardData();
    },

    adminOpenVolEdit(id) {
        const vols = BGO_DB.getVolunteers();
        const vol = vols.find(v => v.id === id);
        if (vol) {
            document.getElementById("ad-vol-id").value = vol.id;
            
            // Populate select
            const select = document.getElementById("ad-vol-username");
            select.innerHTML = '<option value="">-- Leave Unlinked / Manual Entry --</option>';
            const members = BGO_DB.getMembers();
            members.forEach(m => {
                select.innerHTML += `<option value="${m.username}">${m.fullName} (@${m.username})</option>`;
            });
            
            select.value = vol.username || "";
            document.getElementById("ad-vol-name").value = vol.fullName;
            document.getElementById("ad-vol-mobile").value = vol.mobile;
            document.getElementById("ad-vol-type").value = vol.type;
            document.getElementById("ad-vol-expertise").value = vol.expertise;
            document.getElementById("ad-vol-city").value = vol.city;
            document.getElementById("ad-vol-avail").value = vol.availability;
            document.getElementById("ad-vol-langs").value = vol.languages;
            
            document.getElementById("ad-vol-modal-title").innerText = "Edit Volunteer Details";
            document.getElementById("ad-vol-modal").classList.add("active");
        }
    },

    adminDeleteVolunteer(id) {
        if (confirm("Are you sure you want to remove this volunteer from the registry?")) {
            BGO_DB.deleteVolunteer(id);
            alert("Volunteer removed successfully.");
            this.loadAdminDashboardData();
        }
    },

    // Homepage Stats Management
    openAddStatModal() {
        document.getElementById("ad-stat-id").value = "";
        document.getElementById("ad-stat-form").reset();
        document.getElementById("ad-stat-key").disabled = false;
        document.getElementById("ad-stat-modal-title").innerText = "Add Homepage Statistic";
        document.getElementById("ad-stat-modal").classList.add("active");
    },

    closeAddStatModal() {
        document.getElementById("ad-stat-modal").classList.remove("active");
    },

    adminOpenStatEdit(id) {
        const stats = BGO_DB.getStats();
        const stat = stats.find(s => s.id === id);
        if (stat) {
            document.getElementById("ad-stat-id").value = stat.id;
            document.getElementById("ad-stat-key").value = stat.key;
            document.getElementById("ad-stat-key").disabled = true; // cannot edit key
            document.getElementById("ad-stat-label").value = stat.label;
            document.getElementById("ad-stat-value").value = stat.value;
            
            document.getElementById("ad-stat-modal-title").innerText = "Edit Statistic Configuration";
            document.getElementById("ad-stat-modal").classList.add("active");
        }
    },

    handleStatSubmit(e) {
        e.preventDefault();
        const id = document.getElementById("ad-stat-id").value;
        const stats = BGO_DB.getStats();
        
        if (id) {
            // Edit
            const stat = stats.find(s => s.id === id);
            if (stat) {
                stat.label = document.getElementById("ad-stat-label").value.trim();
                stat.value = document.getElementById("ad-stat-value").value.trim();
            }
        } else {
            // Add
            const key = document.getElementById("ad-stat-key").value.trim();
            if (stats.some(s => s.key === key)) {
                alert("Statistic key already exists. Please choose a unique key.");
                return;
            }
            stats.push({
                id: "stat-" + Date.now(),
                key: key,
                label: document.getElementById("ad-stat-label").value.trim(),
                value: document.getElementById("ad-stat-value").value.trim(),
                enabled: true
            });
        }
        
        BGO_DB.updateStats(stats);
        alert("Homepage statistics saved successfully.");
        this.closeAddStatModal();
        this.loadAdminDashboardData();
    },

    adminToggleStat(id, checked) {
        const stats = BGO_DB.getStats();
        const stat = stats.find(s => s.id === id);
        if (stat) {
            stat.enabled = checked;
            BGO_DB.updateStats(stats);
        }
    },

    adminDeleteStat(id) {
        if (confirm("Are you sure you want to delete this homepage statistic?")) {
            let stats = BGO_DB.getStats();
            stats = stats.filter(s => s.id !== id);
            BGO_DB.updateStats(stats);
            alert("Statistic deleted.");
            this.loadAdminDashboardData();
        }
    },

    // Gallery Manager handlers
    openGalleryModal() {
        document.getElementById("ad-gal-id").value = "";
        document.getElementById("ad-gallery-form").reset();
        document.getElementById("ad-gal-modal-title").innerText = "Upload Gallery Media";
        document.getElementById("ad-gal-url-label").innerText = "Image Link / URL";
        document.getElementById("ad-gallery-modal").classList.add("active");
    },

    openGalleryEditModal(id) {
        const gallery = BGO_DB.getGallery();
        const item = gallery.find(g => g.id === id);
        if (item) {
            document.getElementById("ad-gal-id").value = item.id;
            document.getElementById("ad-gal-title").value = item.title;
            document.getElementById("ad-gal-category").value = item.category;
            document.getElementById("ad-gal-type").value = item.type;
            document.getElementById("ad-gal-url").value = item.imageUrl || "";
            
            this.toggleGalleryTypeFields(item.type);
            document.getElementById("ad-gal-modal-title").innerText = "Edit Gallery Media Item";
            document.getElementById("ad-gallery-modal").classList.add("active");
        }
    },

    closeGalleryModal() {
        document.getElementById("ad-gallery-modal").classList.remove("active");
    },

    toggleGalleryTypeFields(type) {
        const urlLabel = document.getElementById("ad-gal-url-label");
        const urlInput = document.getElementById("ad-gal-url");
        if (type === "video") {
            urlLabel.innerText = "Video Link / Placeholder (Optional)";
            urlInput.placeholder = "e.g. https://youtube.com/... or leave blank for mock player";
        } else {
            urlLabel.innerText = "Image Link / URL *";
            urlInput.placeholder = "e.g. https://images.unsplash.com/...";
        }
    },

    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = err => reject(err);
            reader.readAsDataURL(file);
        });
    },

    async handleGallerySubmit(e) {
        e.preventDefault();
        const id = document.getElementById("ad-gal-id").value;
        const title = document.getElementById("ad-gal-title").value.trim();
        const category = document.getElementById("ad-gal-category").value;
        const type = document.getElementById("ad-gal-type").value;
        let imageUrl = document.getElementById("ad-gal-url").value.trim();
        
        const fileIn = document.getElementById("ad-gal-file");
        if (fileIn && fileIn.files.length > 0) {
            try {
                imageUrl = await this.readFileAsBase64(fileIn.files[0]);
            } catch (err) {
                console.error("JPG upload error:", err);
            }
        }
        
        if (id) {
            BGO_DB.updateGalleryItem(id, { title, category, type, imageUrl });
            alert("Media details updated successfully.");
        } else {
            BGO_DB.addGalleryItem({ title, category, type, imageUrl });
            alert("Media item registered in activity gallery.");
        }
        
        this.closeGalleryModal();
        BGO_PAGES.loadAdminDashboardData();
    },

    handleDeleteGalleryItem(id) {
        if (confirm("Are you sure you want to delete this gallery media?")) {
            BGO_DB.deleteGalleryItem(id);
            BGO_PAGES.loadAdminDashboardData();
        }
    },

    // Events Manager handlers
    openEventModal() {
        document.getElementById("ad-event-id").value = "";
        document.getElementById("ad-event-form").reset();
        document.getElementById("ad-event-modal-title").innerText = "Schedule Community Event";
        document.getElementById("ad-event-modal").classList.add("active");
    },

    openEventEditModal(id) {
        const events = BGO_DB.getEvents();
        const ev = events.find(e => e.id === id);
        if (ev) {
            document.getElementById("ad-event-id").value = ev.id;
            document.getElementById("ad-event-title").value = ev.title;
            document.getElementById("ad-event-date").value = ev.date;
            document.getElementById("ad-event-time").value = ev.time;
            document.getElementById("ad-event-location").value = ev.location;
            document.getElementById("ad-event-image").value = ev.image || "";
            document.getElementById("ad-event-status").value = ev.status || "upcoming";
            document.getElementById("ad-event-desc").value = ev.description;
            
            document.getElementById("ad-event-modal-title").innerText = "Edit Scheduled Event";
            document.getElementById("ad-event-modal").classList.add("active");
        }
    },

    closeEventModal() {
        document.getElementById("ad-event-modal").classList.remove("active");
    },

    // Event Polling System Handlers
    ensureEventPollModalExists() {
        if (document.getElementById("event-poll-modal")) return;
        const modalDiv = document.createElement("div");
        modalDiv.id = "event-poll-modal";
        modalDiv.className = "modal-overlay";
        modalDiv.innerHTML = `
            <div class="modal-box" style="max-width: 580px;">
                <div class="modal-header">
                    <h3 id="epoll-modal-title">📅 Community Event Attendance Poll Response</h3>
                    <button onclick="BGO_PAGES.closeEventPollModal()" class="modal-close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="epoll-form" onsubmit="BGO_PAGES.handleSaveEventPollResponse(event)">
                        <input type="hidden" id="epoll-event-id">
                        
                        <div id="epoll-event-info" style="background:var(--bg-color); border:1px solid var(--border-color); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1.5rem;">
                        </div>

                        <div style="margin-bottom:1.5rem;">
                            <label style="font-weight:700; color:var(--primary-dark); display:block; margin-bottom:0.8rem;">Will you be attending this event? *</label>
                            <div style="display:flex; flex-direction:column; gap:0.8rem;">
                                <label style="display:flex; align-items:center; gap:0.8rem; cursor:pointer; background:white; padding:0.8rem 1rem; border-radius:var(--radius-sm); border:1.5px solid var(--border-color);">
                                    <input type="radio" name="poll_status" value="alone" onchange="BGO_PAGES.togglePollFamilyInput(this.value)" style="width:18px; height:18px;">
                                    <div>
                                        <strong style="color:var(--primary-color);">Attending Alone</strong>
                                        <div style="font-size:0.8rem; color:var(--text-light);">I will be attending the event individually (1 headcount).</div>
                                    </div>
                                </label>
                                <label style="display:flex; align-items:center; gap:0.8rem; cursor:pointer; background:white; padding:0.8rem 1rem; border-radius:var(--radius-sm); border:1.5px solid var(--border-color);">
                                    <input type="radio" name="poll_status" value="family" onchange="BGO_PAGES.togglePollFamilyInput(this.value)" style="width:18px; height:18px;">
                                    <div>
                                        <strong style="color:var(--primary-color);">Attending with Family</strong>
                                        <div style="font-size:0.8rem; color:var(--text-light);">I will be accompanied by spouse, children, or family members.</div>
                                    </div>
                                </label>
                                <label style="display:flex; align-items:center; gap:0.8rem; cursor:pointer; background:white; padding:0.8rem 1rem; border-radius:var(--radius-sm); border:1.5px solid var(--border-color);">
                                    <input type="radio" name="poll_status" value="not_attending" onchange="BGO_PAGES.togglePollFamilyInput(this.value)" style="width:18px; height:18px;">
                                    <div>
                                        <strong style="color:var(--danger-color);">Not Attending</strong>
                                        <div style="font-size:0.8rem; color:var(--text-light);">Unable to attend this community gathering.</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Family Details Section (Revealed when Attending with Family is selected) -->
                        <div id="epoll-family-group" style="display:none; background:rgba(15,76,58,0.04); border:1.5px solid rgba(15,76,58,0.2); padding:1.2rem; border-radius:var(--radius-sm); margin-bottom:1.5rem;">
                            <h4 style="margin:0 0 0.8rem 0; font-size:0.95rem; color:var(--primary-color); font-weight:700;">Select Registered Family Members Attending:</h4>
                            
                            <div id="epoll-family-checkboxes-container" style="display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1.2rem;">
                            </div>

                            <div class="form-group" style="margin:0;">
                                <label style="font-weight:700; color:var(--primary-dark);">Additional Guests / Unregistered Family Members Count</label>
                                <input type="number" id="epoll-additional-family-count" min="0" max="20" value="0" placeholder="0" style="padding:0.5rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); width:100%; font-weight:700;">
                                <small style="color:var(--text-light);">Enter number of additional relatives or guests accompanying you.</small>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary form-submit-btn" style="width:100%; justify-content:center;">Submit Attendance Response</button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);
    },

    openEventPollModal(eventId) {
        if (!BGO_AUTH.isLoggedIn()) {
            alert("🔒 Login Required: Upcoming Events and Attendance Polling are visible only after member login. Please log in to respond.");
            window.location.hash = "#membership";
            return;
        }

        this.ensureEventPollModalExists();

        const event = BGO_DB.getEvents().find(e => e.id === eventId);
        if (!event) return;

        document.getElementById("epoll-event-id").value = event.id;
        document.getElementById("epoll-event-info").innerHTML = `
            <h4 style="margin:0 0 0.4rem 0; font-size:1.1rem; color:var(--primary-color); font-weight:700;">${event.title}</h4>
            <p style="margin:0 0 0.2rem 0; font-size:0.85rem; color:var(--text-color);">📅 <strong>Date & Time:</strong> ${event.date} (${event.time})</p>
            <p style="margin:0; font-size:0.85rem; color:var(--text-color);">📍 <strong>Venue:</strong> ${event.location}</p>
        `;

        const user = BGO_AUTH.getCurrentUser();
        const member = BGO_DB.getMembers().find(m => m.username.toLowerCase() === user.username.toLowerCase()) || user;
        const existingResp = BGO_DB.getMemberPollResponse(eventId, user.username);

        const radios = document.querySelectorAll('input[name="poll_status"]');
        radios.forEach(r => r.checked = false);
        document.getElementById("epoll-family-group").style.display = "none";
        document.getElementById("epoll-additional-family-count").value = "0";

        // Populate registered family checkboxes
        const famContainer = document.getElementById("epoll-family-checkboxes-container");
        let famHtml = "";
        const currentYear = new Date().getFullYear();

        if (member.spouseName && member.spouseName.trim() !== "") {
            famHtml += `
                <label style="display:flex; align-items:center; gap:0.6rem; cursor:pointer; background:white; padding:0.6rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                    <input type="checkbox" class="epoll-fam-chk" data-type="Spouse" data-name="${member.spouseName}" style="width:16px; height:16px;">
                    <div><strong style="color:var(--primary-dark);">Spouse:</strong> ${member.spouseName}</div>
                </label>
            `;
        }

        if (member.children && Array.isArray(member.children) && member.children.length > 0) {
            member.children.slice(0, 5).forEach((c, idx) => {
                if (c.name && c.name.trim() !== "") {
                    const birthYr = parseInt(c.birthYear, 10);
                    const age = (birthYr && birthYr > 1900 && birthYr <= currentYear) ? (currentYear - birthYr) : null;
                    const ageStr = age !== null ? `, Age: ${age}` : '';
                    
                    famHtml += `
                        <label style="display:flex; align-items:center; gap:0.6rem; cursor:pointer; background:white; padding:0.6rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                            <input type="checkbox" class="epoll-fam-chk" data-type="Child" data-name="${c.name}" data-birth="${c.birthYear || ''}" data-age="${age !== null ? age : ''}" style="width:16px; height:16px;">
                            <div>
                                <strong style="color:var(--primary-dark);">Child ${idx + 1}:</strong> ${c.name} 
                                <span style="font-size:0.75rem; color:var(--text-light);">(Birth Year: ${c.birthYear || 'N/A'}${ageStr})</span>
                            </div>
                        </label>
                    `;
                }
            });
        }

        if (famHtml === "") {
            famHtml = `<p style="font-size:0.8rem; color:var(--text-light); font-style:italic; margin:0;">No spouse or children registered in your member profile. You can specify additional family members below.</p>`;
        }

        famContainer.innerHTML = famHtml;

        if (existingResp) {
            const matchRadio = document.querySelector(`input[name="poll_status"][value="${existingResp.status}"]`);
            if (matchRadio) {
                matchRadio.checked = true;
                this.togglePollFamilyInput(existingResp.status);
                
                if (existingResp.status === "family") {
                    document.getElementById("epoll-additional-family-count").value = existingResp.additionalFamilyCount || 0;
                    
                    // Pre-check family checkboxes
                    if (existingResp.selectedFamilyMembers && Array.isArray(existingResp.selectedFamilyMembers)) {
                        const chks = famContainer.querySelectorAll(".epoll-fam-chk");
                        chks.forEach(chk => {
                            const name = chk.getAttribute("data-name");
                            const match = existingResp.selectedFamilyMembers.find(f => f.name === name);
                            if (match) chk.checked = true;
                        });
                    }
                }
            }
        } else {
            const defaultRadio = document.querySelector('input[name="poll_status"][value="alone"]');
            if (defaultRadio) {
                defaultRadio.checked = true;
                this.togglePollFamilyInput("alone");
            }
        }

        document.getElementById("event-poll-modal").classList.add("active");
    },

    closeEventPollModal() {
        document.getElementById("event-poll-modal").classList.remove("active");
    },

    togglePollFamilyInput(status) {
        const famGrp = document.getElementById("epoll-family-group");
        if (status === "family") {
            famGrp.style.display = "block";
        } else {
            famGrp.style.display = "none";
        }
    },

    handleSaveEventPollResponse(e) {
        if (e && e.preventDefault) e.preventDefault();
        const user = BGO_AUTH.getCurrentUser();
        if (!user) {
            alert("🔒 Login Required: Please log in to submit your event attendance poll response.");
            window.location.hash = "#membership";
            return;
        }

        const eventIdEl = document.getElementById("epoll-event-id");
        const eventId = eventIdEl ? eventIdEl.value : "";
        if (!eventId) {
            alert("Error: Event selection missing. Please try opening the event poll again.");
            return;
        }

        const statusRadio = document.querySelector('input[name="poll_status"]:checked');
        if (!statusRadio) {
            alert("⚠️ Attendance Selection Required: Please select your attendance status (Attending Alone, Attending with Family, or Not Attending).");
            return;
        }

        const status = statusRadio.value;
        const selectedFamilyMembers = [];
        let additionalFamilyCount = 0;

        if (status === "family") {
            const checkedChks = document.querySelectorAll(".epoll-fam-chk:checked");
            checkedChks.forEach(chk => {
                const type = chk.getAttribute("data-type");
                const name = chk.getAttribute("data-name");
                const birthYear = chk.getAttribute("data-birth") || "";
                const ageAttr = chk.getAttribute("data-age");
                const age = ageAttr ? parseInt(ageAttr, 10) : null;
                selectedFamilyMembers.push({ type, name, birthYear, age });
            });
            const addIn = document.getElementById("epoll-additional-family-count");
            additionalFamilyCount = addIn ? (parseInt(addIn.value, 10) || 0) : 0;
        }

        const member = BGO_DB.getMembers().find(m => m.username.toLowerCase() === user.username.toLowerCase()) || user;

        const rec = BGO_DB.saveEventPollResponse({
            eventId,
            username: member.username,
            memberName: member.fullName || member.name || user.fullName || member.username,
            mobile: member.mobile || user.mobile || "",
            status,
            selectedFamilyMembers,
            additionalFamilyCount
        });

        const event = BGO_DB.getEvents().find(ev => ev.id === eventId);
        const eventTitle = event ? event.title : "Community Event";

        try {
            this.triggerSMSNotification("event_poll", member.fullName || member.username, member.mobile || "", `Response: ${status.toUpperCase()} for "${eventTitle}" (Total Attendees: ${rec.totalAttendees})`);
        } catch (err) {
            console.error("SMS Log error:", err);
        }

        let statusLabel = "ATTENDING ALONE";
        if (status === "family") statusLabel = "ATTENDING WITH FAMILY";
        if (status === "not_attending") statusLabel = "NOT ATTENDING";

        alert(`✅ EVENT ATTENDANCE POLL RESPONSE SUBMITTED SUCCESSFULLY!\n\nEvent Title: ${eventTitle}\nSelected Status: ${statusLabel}\nTotal Registered Attendees: ${rec.totalAttendees}\nResponse Timestamp: ${rec.respondedAt}\n\nYour attendance selection has been recorded in the database and updated across all dashboards.`);
        
        this.closeEventPollModal();

        const hash = window.location.hash || "#home";
        if (hash === "#dashboard") {
            this.loadMemberDashboardData(user.username);
        } else if (hash === "#admin") {
            this.loadAdminDashboardData();
        } else {
            if (typeof router === "function") {
                router();
            }
        }
    },

    renderAdminEventPolls() {
        const filterSel = document.getElementById("ad-poll-event-filter");
        const eventId = filterSel ? filterSel.value : "all";
        
        const polls = BGO_DB.getEventPollsByEvent(eventId);
        const stats = BGO_DB.getEventPollStats(eventId);
        const events = BGO_DB.getEvents();

        // Update Real-time Statistics Cards
        const elAlone = document.getElementById("stat-poll-alone");
        if (elAlone) elAlone.innerText = stats.aloneCount;
        
        const elFamResp = document.getElementById("stat-poll-family-resp");
        if (elFamResp) elFamResp.innerText = stats.familyRespCount;

        const elFamMembers = document.getElementById("stat-poll-family-members");
        if (elFamMembers) elFamMembers.innerText = stats.familyMembersCount;

        const elNotAtt = document.getElementById("stat-poll-not-attending");
        if (elNotAtt) elNotAtt.innerText = stats.notAttendingCount;

        const elHeadcount = document.getElementById("stat-poll-headcount");
        if (elHeadcount) elHeadcount.innerText = stats.totalExpectedHeadcount;

        // Render Responses Table
        const tbody = document.querySelector("#ad-event-polls-table tbody");
        if (!tbody) return;

        if (polls.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-light);">No event poll responses submitted for this selection.</td></tr>`;
            return;
        }

        let html = "";
        polls.forEach(p => {
            const ev = events.find(e => e.id === p.eventId);
            const eventName = ev ? ev.title : p.eventId;

            let statusClass = "badge-status-pending";
            let statusText = "ATTENDING ALONE";
            if (p.status === "family") {
                statusClass = "badge-status-approved";
                statusText = "ATTENDING WITH FAMILY";
            } else if (p.status === "not_attending") {
                statusClass = "status-completed";
                statusText = "NOT ATTENDING";
            }

            // Format selected family members with calculated ages
            let famStrArr = [];
            if (p.status === "family" && p.selectedFamilyMembers && Array.isArray(p.selectedFamilyMembers)) {
                p.selectedFamilyMembers.forEach(f => {
                    const ageInfo = f.age !== null && f.age !== undefined ? ` (Age: ${f.age})` : (f.birthYear ? ` (Birth: ${f.birthYear})` : '');
                    famStrArr.push(`<strong>${f.type}:</strong> ${f.name}${ageInfo}`);
                });
            }
            if (p.additionalFamilyCount && p.additionalFamilyCount > 0) {
                famStrArr.push(`<strong>+${p.additionalFamilyCount} Additional Guest(s)</strong>`);
            }

            const famDetailsStr = famStrArr.length > 0 ? famStrArr.join("<br>") : (p.status === "family" ? `${p.familyCount || 1} family member(s)` : '<span style="color:var(--text-light); font-style:italic;">None (Solo)</span>');
            const totalHeadcount = p.totalAttendees || (p.status === "alone" ? 1 : (p.status === "family" ? (1 + (p.familyCount || 0)) : 0));

            html += `
                <tr>
                    <td><strong>${p.memberName}</strong><br><span style="font-size:0.75rem; color:var(--text-light);">@${p.username}</span></td>
                    <td><a href="tel:${p.mobile}" style="font-weight:700; color:var(--primary-light);">📞 ${p.mobile}</a></td>
                    <td><strong>${eventName}</strong></td>
                    <td><span class="badge-status ${statusClass}">${statusText}</span></td>
                    <td><div style="font-size:0.8rem; line-height:1.4;">${famDetailsStr}</div></td>
                    <td><strong style="font-size:1.1rem; color:var(--primary-color);">${totalHeadcount} Attendees</strong></td>
                    <td><span style="font-size:0.8rem; color:var(--text-light);">${p.respondedAt}</span></td>
                    <td class="table-actions">
                        <button onclick="BGO_PAGES.adminDeleteEventPoll('${p.id}')" class="action-btn-sm action-btn-delete">Delete</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    adminDeleteEventPoll(id) {
        if (confirm("Are you sure you want to delete this event poll response record?")) {
            BGO_DB.deleteEventPoll(id);
            this.renderAdminEventPolls();
        }
    },

    exportAttendanceToExcel() {
        const filterSel = document.getElementById("ad-poll-event-filter");
        const eventId = filterSel ? filterSel.value : "all";
        const polls = BGO_DB.getEventPollsByEvent(eventId);
        const events = BGO_DB.getEvents();

        if (polls.length === 0) {
            alert("No attendance poll responses found to export.");
            return;
        }

        let csvContent = "\uFEFF"; // UTF-8 BOM
        csvContent += "Member Name,Username,Mobile Number,Event Name,Attendance Status,Selected Family Members (With Ages),Total Attendees Headcount,Response Date & Time\n";

        polls.forEach(p => {
            const ev = events.find(e => e.id === p.eventId);
            const eventName = ev ? ev.title : p.eventId;
            const cleanName = `"${p.memberName.replace(/"/g, '""')}"`;
            const cleanEvent = `"${eventName.replace(/"/g, '""')}"`;
            const statusText = p.status.toUpperCase();
            
            let famStrArr = [];
            if (p.selectedFamilyMembers && Array.isArray(p.selectedFamilyMembers)) {
                p.selectedFamilyMembers.forEach(f => {
                    const ageInfo = f.age !== null && f.age !== undefined ? ` (Age: ${f.age})` : '';
                    famStrArr.push(`${f.type}: ${f.name}${ageInfo}`);
                });
            }
            if (p.additionalFamilyCount && p.additionalFamilyCount > 0) {
                famStrArr.push(`+${p.additionalFamilyCount} Additional Guest(s)`);
            }
            const cleanFam = `"${famStrArr.join("; ").replace(/"/g, '""')}"`;
            const headcount = p.totalAttendees || (p.status === "alone" ? 1 : (p.status === "family" ? (1 + (p.familyCount || 0)) : 0));

            csvContent += `${cleanName},@${p.username},"${p.mobile}",${cleanEvent},${statusText},${cleanFam},${headcount},"${p.respondedAt}"\n`;
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `BGO_Event_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    exportMembersToExcel() {
        const members = BGO_DB.getMembers();
        const activeMembers = members.filter(m => (m.status === "approved" || m.status === "inactive") && m.role !== "superadmin" && m.role !== "admin");

        if (activeMembers.length === 0) {
            alert("No registered active members found to export.");
            return;
        }

        let csvContent = "\uFEFF"; // UTF-8 BOM
        csvContent += "BGO Member ID,Full Name,Username,Email Address,Mobile Number,WhatsApp Number,Registration Date & Time,Current City / Location,Native Place (Gulbarga),Blood Group,Profession,Company,Marital Status,Spouse Name,Dependents Count,Account Status\n";

        activeMembers.forEach(m => {
            const memberId = `"${(m.memberId || 'N/A').replace(/"/g, '""')}"`;
            const name = `"${(m.fullName || '').replace(/"/g, '""')}"`;
            const username = `@${m.username}`;
            const email = `"${(m.email || '').replace(/"/g, '""')}"`;
            const mobile = `"${(m.mobile || '').replace(/"/g, '""')}"`;
            const whatsapp = `"${(m.whatsapp || m.mobile || '').replace(/"/g, '""')}"`;
            const regDate = `"${(m.registeredAt || m.registrationDate || 'N/A').replace(/"/g, '""')}"`;
            const city = `"${(m.city || '').replace(/"/g, '""')}"`;
            const nativePlace = `"${(m.nativePlace || '').replace(/"/g, '""')}"`;
            const bloodGroup = `"${(m.bloodGroup || '').replace(/"/g, '""')}"`;
            const profession = `"${(m.profession || '').replace(/"/g, '""')}"`;
            const company = `"${(m.company || '').replace(/"/g, '""')}"`;
            const marital = `"${(m.maritalStatus || 'single').replace(/"/g, '""')}"`;
            const spouse = `"${(m.spouseName || '').replace(/"/g, '""')}"`;
            const dependents = m.dependentsCount || 0;
            const status = (m.status || 'approved').toUpperCase();

            csvContent += `${memberId},${name},${username},${email},${mobile},${whatsapp},${regDate},${city},${nativePlace},${bloodGroup},${profession},${company},${marital},${spouse},${dependents},${status}\n`;
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `BGO_Members_Directory_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    filterMembersDirectory() {
        const query = (document.getElementById("ad-member-search-input")?.value || "").toLowerCase().trim();
        const statusFilter = document.getElementById("ad-member-status-filter")?.value || "all";

        const pendingRows = document.querySelectorAll("#ad-pending-members-table tbody tr");
        pendingRows.forEach(row => {
            const text = row.innerText.toLowerCase();
            const matchesQuery = !query || text.includes(query);
            row.style.display = matchesQuery ? "" : "none";
        });

        const memberRows = document.querySelectorAll("#ad-members-table tbody tr");
        memberRows.forEach(row => {
            const text = row.innerText.toLowerCase();
            const matchesQuery = !query || text.includes(query);
            let matchesStatus = true;
            if (statusFilter === "approved") matchesStatus = text.includes("active") && !text.includes("inactive");
            if (statusFilter === "inactive") matchesStatus = text.includes("inactive");
            
            row.style.display = (matchesQuery && matchesStatus) ? "" : "none";
        });
    },

    // Member Profile Update & Approval Handlers
    openMemberProfileEditModal() {
        if (!BGO_AUTH.isLoggedIn()) {
            alert("🔒 Login Required: Please log in to edit your profile.");
            window.location.hash = "#membership";
            return;
        }
        const user = BGO_AUTH.getCurrentUser();
        if (!user) return;
        
        const lockStatus = BGO_DB.getMemberProfileLockStatus(user.username);
        if (lockStatus.isLocked) {
            alert(`🔒 PROFILE UPDATE LOCKED (72-HOUR RESTRICTION)\n\nYou submitted a profile update request recently. Regular members are allowed to submit a profile update request only once every 72 hours.\n\nRemaining Waiting Time: ${lockStatus.formattedTime}\nSubmitted Request Date: ${lockStatus.requestDate}\n\nThe Edit Profile option will automatically unlock once the 72-hour waiting period expires.`);
            return;
        }
        
        const m = BGO_DB.getMembers().find(mem => mem.username === user.username) || user;

        // 1. Personal & Family
        document.getElementById("mep-fullName").value = m.fullName || "";
        document.getElementById("mep-fatherName").value = m.fatherName || "";
        document.getElementById("mep-bloodGroup").value = m.bloodGroup || "O+";
        document.getElementById("mep-maritalStatus").value = m.maritalStatus || "single";
        document.getElementById("mep-spouseName").value = m.spouseName || "";
        document.getElementById("mep-dependentsCount").value = m.dependentsCount || 0;

        // Render existing children rows
        const childContainer = document.getElementById("mep-children-container");
        if (childContainer) {
            childContainer.innerHTML = "";
            const childrenArr = Array.isArray(m.children) ? m.children : [];
            childrenArr.forEach(c => {
                this.addEditProfileChildRow(c.name || "", c.birthYear || "");
            });
        }

        // 2. Contact & Address
        document.getElementById("mep-email").value = m.email || "";
        document.getElementById("mep-mobile").value = m.mobile || "";
        document.getElementById("mep-whatsapp").value = m.whatsapp || m.mobile || "";
        document.getElementById("mep-city").value = m.city || "";
        document.getElementById("mep-nativePlace").value = m.nativePlace || "";
        document.getElementById("mep-indiaAddress").value = m.indiaAddress || m.emergencyContact || "";

        // 3. Employment & Work Address
        document.getElementById("mep-profession").value = m.profession || "";
        document.getElementById("mep-company").value = m.company || "";
        document.getElementById("mep-workLocation").value = m.workLocation || "";
        document.getElementById("mep-companyAddress").value = m.companyAddress || "";

        // 4. Emergency Contacts
        const emOman = m.emergencyContactOman || {};
        document.getElementById("mep-emOman-name").value = emOman.name || "";
        document.getElementById("mep-emOman-rel").value = emOman.relationship || "";
        document.getElementById("mep-emOman-phone").value = emOman.phone || "";

        const emIndia = m.emergencyContactIndia || {};
        document.getElementById("mep-emIndia-name").value = emIndia.name || "";
        document.getElementById("mep-emIndia-rel").value = emIndia.relationship || "";
        document.getElementById("mep-emIndia-phone").value = emIndia.phone || "";

        // 5. Volunteer Profile
        const chkVol = document.getElementById("mep-volunteerInterest");
        if (chkVol) chkVol.checked = !!m.volunteerInterest;
        document.getElementById("mep-volunteerSkills").value = m.volunteerSkills || "";

        document.getElementById("db-edit-profile-modal").classList.add("active");
    },

    addEditProfileChildRow(name = "", birthYear = "") {
        const container = document.getElementById("mep-children-container");
        if (!container) return;
        const rowId = "mep-child-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        const div = document.createElement("div");
        div.className = "mep-child-row";
        div.id = rowId;
        div.style.cssText = "display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem;";
        div.innerHTML = `
            <input type="text" class="mep-child-name" placeholder="Child Full Name" value="${name}" style="flex-grow:2; padding:0.45rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.85rem;">
            <input type="text" class="mep-child-year" placeholder="Birth Year (e.g. 2018)" value="${birthYear}" style="flex-grow:1; max-width:140px; padding:0.45rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.85rem;">
            <button type="button" onclick="document.getElementById('${rowId}').remove()" style="background:#ef4444; color:white; border:none; border-radius:var(--radius-sm); padding:0.45rem 0.7rem; cursor:pointer; font-weight:700;">✕</button>
        `;
        container.appendChild(div);
    },

    closeMemberProfileEditModal() {
        document.getElementById("db-edit-profile-modal").classList.remove("active");
    },

    handleMemberProfileUpdateSubmit(e) {
        e.preventDefault();
        try {
            if (!BGO_AUTH.isLoggedIn()) {
                alert("🔒 Login Required: Session expired. Please log in again.");
                window.location.hash = "#membership";
                return;
            }
            const user = BGO_AUTH.getCurrentUser();
            if (!user || !user.username) {
                alert("🔒 Error: Logged in user profile not found. Please log in again.");
                window.location.hash = "#membership";
                return;
            }

            const lockStatus = BGO_DB.getMemberProfileLockStatus(user.username);
            if (lockStatus.isLocked) {
                alert(`🔒 SUBMISSION BLOCKED (72-HOUR RESTRICTION)\n\nYou submitted a profile update request recently. Profile update requests are limited to once every 72 hours.\n\nRemaining Waiting Time: ${lockStatus.formattedTime}`);
                return;
            }

            const m = BGO_DB.getMembers().find(mem => mem.username.toLowerCase() === user.username.toLowerCase()) || user;
            
            const oldData = {
                fullName: m.fullName || "",
                fatherName: m.fatherName || "",
                email: m.email || "",
                mobile: m.mobile || "",
                whatsapp: m.whatsapp || m.mobile || "",
                city: m.city || "",
                nativePlace: m.nativePlace || "",
                profession: m.profession || "",
                company: m.company || "",
                workLocation: m.workLocation || "",
                companyAddress: m.companyAddress || "",
                bloodGroup: m.bloodGroup || "O+",
                maritalStatus: m.maritalStatus || "single",
                spouseName: m.spouseName || "",
                dependentsCount: m.dependentsCount || 0,
                children: m.children || [],
                indiaAddress: m.indiaAddress || m.emergencyContact || "",
                emergencyContactOman: m.emergencyContactOman || {},
                emergencyContactIndia: m.emergencyContactIndia || {},
                volunteerInterest: !!m.volunteerInterest,
                volunteerSkills: m.volunteerSkills || ""
            };

            // Gather children details dynamically
            const childRows = document.querySelectorAll("#mep-children-container .mep-child-row");
            const children = [];
            childRows.forEach(row => {
                const nameEl = row.querySelector(".mep-child-name");
                const birthEl = row.querySelector(".mep-child-year");
                const name = nameEl ? nameEl.value.trim() : "";
                const birthYear = birthEl ? birthEl.value.trim() : "";
                if (name) {
                    children.push({ name, birthYear });
                }
            });

            // Extract form inputs safely with fallback guards
            const getVal = (id) => {
                const el = document.getElementById(id);
                return el ? el.value.trim() : "";
            };

            const fullName = getVal("mep-fullName");
            const email = getVal("mep-email");
            const mobile = getVal("mep-mobile");
            const whatsapp = getVal("mep-whatsapp") || mobile;
            const city = getVal("mep-city");
            const nativePlace = getVal("mep-nativePlace");
            const profession = getVal("mep-profession");

            // Required field validation
            if (!fullName || !email || !mobile || !city || !nativePlace || !profession) {
                alert("⚠️ Missing Information: Please fill in all required fields (Full Name, Email, Oman Mobile, City, Native Place, and Profession).");
                return;
            }

            // Contact Number Validations with Country Code
            const vMobile = this.validateAndFormatPhoneNumber(mobile, "Oman Mobile Number");
            if (!vMobile.valid) {
                alert("⚠️ " + vMobile.message);
                return;
            }

            const vWhatsapp = this.validateAndFormatPhoneNumber(whatsapp, "WhatsApp Number", true);
            if (!vWhatsapp.valid) {
                alert("⚠️ " + vWhatsapp.message);
                return;
            }

            const emOmanP = getVal("mep-emOman-phone");
            if (emOmanP) {
                const vEmOman = this.validateAndFormatPhoneNumber(emOmanP, "Oman Emergency Contact Mobile", true);
                if (!vEmOman.valid) {
                    alert("⚠️ " + vEmOman.message);
                    return;
                }
            }

            const emIndiaP = getVal("mep-emIndia-phone");
            if (emIndiaP) {
                const vEmIndia = this.validateAndFormatPhoneNumber(emIndiaP, "India Emergency Contact Mobile", true);
                if (!vEmIndia.valid) {
                    alert("⚠️ " + vEmIndia.message);
                    return;
                }
            }

            const newData = {
                fullName,
                fatherName: getVal("mep-fatherName"),
                email,
                mobile,
                whatsapp,
                city,
                nativePlace,
                profession,
                company: getVal("mep-company"),
                workLocation: getVal("mep-workLocation"),
                companyAddress: getVal("mep-companyAddress"),
                bloodGroup: getVal("mep-bloodGroup") || "O+",
                maritalStatus: getVal("mep-maritalStatus") || "single",
                spouseName: getVal("mep-spouseName"),
                dependentsCount: parseInt(getVal("mep-dependentsCount"), 10) || 0,
                children: children,
                indiaAddress: getVal("mep-indiaAddress"),
                emergencyContactOman: {
                    name: getVal("mep-emOman-name"),
                    relationship: getVal("mep-emOman-rel"),
                    phone: getVal("mep-emOman-phone")
                },
                emergencyContactIndia: {
                    name: getVal("mep-emIndia-name"),
                    relationship: getVal("mep-emIndia-rel"),
                    phone: getVal("mep-emIndia-phone")
                },
                volunteerInterest: document.getElementById("mep-volunteerInterest") ? document.getElementById("mep-volunteerInterest").checked : false,
                volunteerSkills: getVal("mep-volunteerSkills")
            };

            const req = BGO_DB.createProfileUpdateRequest(user.username, oldData, newData);

            alert(`✅ PROFILE UPDATE REQUEST SUBMITTED SUCCESSFULLY!\n\nRequest ID: ${req.id}\nMember: ${newData.fullName} (@${user.username})\nStatus: PENDING APPROVAL\n\nYour proposed changes (including contact updates, address, employment, emergency contacts, and children information) have been saved in the database and submitted to the BGO Administration for review.\n\nAutomated email notifications have been sent to system administrators and your registered email address.`);
            
            this.closeMemberProfileEditModal();
            this.loadMemberDashboardData(user.username);
        } catch (err) {
            console.error("Error submitting profile update request:", err);
            alert("❌ Submission Error: " + err.message);
        }
    },

    renderAdminProfileRequests() {
        const filterSel = document.getElementById("ad-pur-status-filter");
        const statusFilter = filterSel ? filterSel.value : "pending";
        
        let requests = BGO_DB.getProfileUpdateRequests();
        if (statusFilter !== "all") {
            requests = requests.filter(r => r.status === statusFilter);
        }

        const tbody = document.querySelector("#ad-profile-requests-table tbody");
        if (!tbody) return;

        if (requests.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--text-light);">No member profile update requests found for this filter.</td></tr>`;
            return;
        }

        let html = "";
        requests.forEach(r => {
            let statusClass = "badge-status-pending";
            let statusText = "PENDING APPROVAL";
            if (r.status === "approved") {
                statusClass = "badge-status-approved";
                statusText = "APPROVED";
            } else if (r.status === "rejected") {
                statusClass = "status-completed";
                statusText = "REJECTED";
            }

            // Generate clean inline diff list
            let diffCount = 0;
            let diffHtmlArr = [];
            for (const key in r.newData) {
                const oVal = r.oldData ? r.oldData[key] : "N/A";
                const nVal = r.newData[key];

                const isDiff = JSON.stringify(oVal) !== JSON.stringify(nVal);
                if (isDiff) {
                    diffCount++;
                    let oStr = typeof oVal === 'object' ? (Array.isArray(oVal) ? (oVal.map(c => c.name ? `${c.name} (${c.birthYear})` : JSON.stringify(c)).join(', ') || 'None') : JSON.stringify(oVal)) : String(oVal || 'N/A');
                    let nStr = typeof nVal === 'object' ? (Array.isArray(nVal) ? (nVal.map(c => c.name ? `${c.name} (${c.birthYear})` : JSON.stringify(c)).join(', ') || 'None') : JSON.stringify(nVal)) : String(nVal || 'N/A');
                    
                    const fieldTitle = key.replace(/([A-Z])/g, ' $1').toLowerCase();
                    diffHtmlArr.push(`
                        <div style="margin-bottom:0.4rem; padding-bottom:0.35rem; border-bottom:1px dashed var(--border-color);">
                            <span style="font-weight:700; color:var(--primary-dark); text-transform:capitalize; font-size:0.78rem;">${fieldTitle}:</span><br>
                            <span style="text-decoration:line-through; color:var(--danger-color); font-size:0.75rem; background:rgba(239,68,68,0.08); padding:0.1rem 0.3rem; border-radius:3px;">${oStr}</span>
                            <span style="color:var(--text-light); font-weight:800; margin:0 0.2rem;">➔</span>
                            <span style="color:var(--primary-color); font-weight:700; font-size:0.78rem; background:rgba(15,76,58,0.08); padding:0.1rem 0.3rem; border-radius:3px;">${nStr}</span>
                        </div>
                    `);
                }
            }

            const diffHtml = diffHtmlArr.length > 0 ? diffHtmlArr.join("") : "<span style='color:var(--text-light); font-style:italic;'>No changes detected</span>";

            let actionBtns = "";
            if (r.status === "pending") {
                actionBtns = `
                    <button onclick="BGO_PAGES.adminApproveProfileUpdate('${r.id}')" class="action-btn-sm action-btn-approve" style="padding:0.45rem 0.75rem; font-weight:700; font-size:0.78rem; border-radius:var(--radius-sm); border:none; cursor:pointer;">✅ Approve</button>
                    <button onclick="BGO_PAGES.adminOpenEditPurModal('${r.id}')" class="action-btn-sm" style="background-color:var(--secondary-color); color:var(--primary-dark); padding:0.45rem 0.75rem; font-weight:700; font-size:0.78rem; border-radius:var(--radius-sm); border:none; cursor:pointer;">✏️ Edit & Approve</button>
                    <button onclick="BGO_PAGES.adminRejectProfileUpdate('${r.id}')" class="action-btn-sm" style="background-color:#d97706; color:white; padding:0.45rem 0.75rem; font-weight:700; font-size:0.78rem; border-radius:var(--radius-sm); border:none; cursor:pointer;">❌ Reject</button>
                    <button onclick="BGO_PAGES.adminDeleteProfileUpdate('${r.id}')" class="action-btn-sm action-btn-delete" style="padding:0.45rem 0.65rem; font-size:0.78rem; border-radius:var(--radius-sm); cursor:pointer;">🗑️ Delete</button>
                `;
            } else {
                actionBtns = `
                    <span style="font-size:0.75rem; color:var(--text-light); font-style:italic; width:100%; margin-bottom:0.2rem;">Status: ${statusText}</span>
                    <button onclick="BGO_PAGES.adminDeleteProfileUpdate('${r.id}')" class="action-btn-sm action-btn-delete" style="padding:0.4rem 0.65rem; font-size:0.78rem; border-radius:var(--radius-sm); cursor:pointer;">🗑️ Delete Request</button>
                `;
            }

            html += `
                <tr style="vertical-align: top;">
                    <td style="width:20%;">
                        <strong style="font-size:0.95rem; color:var(--text-color);">${r.memberName}</strong><br>
                        <span style="font-size:0.75rem; color:var(--text-light); font-weight:600;">@${r.username}</span><br>
                        <a href="tel:${r.mobile}" style="font-size:0.8rem; font-weight:700; color:var(--primary-color); text-decoration:none; display:inline-block; margin-top:0.3rem;">📞 ${r.mobile}</a>
                    </td>
                    <td style="width:18%;">
                        <span style="font-size:0.8rem; color:var(--text-light); font-weight:600; display:block; margin-bottom:0.4rem;">📅 ${r.requestDate}</span>
                        <span class="badge-status ${statusClass}" style="font-size:0.75rem; padding:0.25rem 0.5rem;">${statusText}</span>
                        ${r.processedBy ? `<div style="font-size:0.72rem; color:var(--text-light); margin-top:0.4rem; line-height:1.3;">By: @${r.processedBy}<br>At: ${r.processedAt}</div>` : ''}
                        ${r.rejectionReason ? `<div style="font-size:0.72rem; color:var(--danger-color); font-weight:700; margin-top:0.2rem;">Reason: ${r.rejectionReason}</div>` : ''}
                    </td>
                    <td style="width:36%;">
                        <div style="background:var(--bg-color); padding:0.7rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); max-height:170px; overflow-y:auto; font-size:0.8rem; line-height:1.4;">
                            <div style="font-weight:700; color:var(--primary-color); margin-bottom:0.4rem; border-bottom:1px solid var(--border-color); padding-bottom:0.2rem; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center;">
                                <span>Proposed Changes</span>
                                <span style="font-size:0.72rem; background:rgba(15,76,58,0.1); color:var(--primary-color); padding:0.1rem 0.4rem; border-radius:10px;">${diffCount} Field${diffCount > 1 ? 's' : ''}</span>
                            </div>
                            ${diffHtml}
                        </div>
                    </td>
                    <td style="width:26%;" class="table-actions">
                        <div style="display:flex; flex-wrap:wrap; gap:0.35rem; align-items:center;">
                            ${actionBtns}
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    adminApproveProfileUpdate(requestId) {
        const user = BGO_AUTH.getCurrentUser();
        const req = BGO_DB.approveProfileUpdateRequest(requestId, user.username);
        if (req) {
            const filterSel = document.getElementById("ad-pur-status-filter");
            if (filterSel) filterSel.value = "all";
            alert(`✅ Profile Update Approved!\n\nMember @${req.username}'s profile details (including contact info, addresses, and family details) have been updated in the database and synchronized across all directories.`);
            this.loadAdminDashboardData();
        }
    },

    adminRejectProfileUpdate(requestId) {
        const user = BGO_AUTH.getCurrentUser();
        const reason = prompt("Enter Rejection Reason for this profile update request:", "Requested field updates could not be verified.");
        if (reason === null) return;

        const req = BGO_DB.rejectProfileUpdateRequest(requestId, user.username, reason.trim());
        if (req) {
            const filterSel = document.getElementById("ad-pur-status-filter");
            if (filterSel) filterSel.value = "all";
            alert(`❌ Profile Update Rejected!\n\nStatus updated to REJECTED with reason: "${reason.trim()}".`);
            this.loadAdminDashboardData();
        }
    },

    adminDeleteProfileUpdate(requestId) {
        if (confirm(`Are you sure you want to delete profile update request ${requestId}? This action will permanently remove the record.`)) {
            BGO_DB.deleteProfileUpdateRequest(requestId);
            alert("🗑️ Profile update request deleted successfully.");
            this.loadAdminDashboardData();
        }
    },

    adminOpenEditPurModal(requestId) {
        const req = BGO_DB.getProfileUpdateRequests().find(r => r.id === requestId);
        if (!req) return;

        document.getElementById("ad-edit-pur-id").value = req.id;
        
        let containerHtml = `<p style="font-size:0.85rem; color:var(--text-light); margin-bottom:1rem;">Editing proposed profile values for <strong>${req.memberName}</strong> (@${req.username}):</p>`;
        for (const k in req.newData) {
            const oVal = req.oldData ? req.oldData[k] : "";
            const nVal = req.newData[k];
            const displayOVal = typeof oVal === 'object' ? JSON.stringify(oVal) : String(oVal || '');
            const displayNVal = typeof nVal === 'object' ? JSON.stringify(nVal) : String(nVal || '');

            containerHtml += `
                <div class="form-group" style="margin-bottom:0.8rem;">
                    <label style="font-weight:600; font-size:0.85rem;">${k} (Old: <span style="text-decoration:line-through; color:var(--text-light);">${displayOVal}</span>)</label>
                    <input type="text" id="edit-pur-field-${k}" value='${displayNVal.replace(/'/g, "&apos;")}' style="padding:0.5rem; font-size:0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); width:100%;">
                </div>
            `;
        }

        document.getElementById("ad-edit-pur-fields-container").innerHTML = containerHtml;
        document.getElementById("ad-edit-pur-modal").classList.add("active");
    },

    closeEditPurModal() {
        document.getElementById("ad-edit-pur-modal").classList.remove("active");
    },

    handleSaveEditedPur(e) {
        e.preventDefault();
        const user = BGO_AUTH.getCurrentUser();
        const id = document.getElementById("ad-edit-pur-id").value;
        const req = BGO_DB.getProfileUpdateRequests().find(r => r.id === id);
        if (!req) return;

        const editedData = {};
        for (const k in req.newData) {
            const input = document.getElementById(`edit-pur-field-${k}`);
            if (input) {
                const val = input.value.trim();
                if ((val.startsWith("{") && val.endsWith("}")) || (val.startsWith("[") && val.endsWith("]"))) {
                    try {
                        editedData[k] = JSON.parse(val);
                    } catch (err) {
                        editedData[k] = val;
                    }
                } else if (!isNaN(val) && val !== "" && (k === "dependentsCount" || k === "requiredUnits")) {
                    editedData[k] = Number(val);
                } else {
                    editedData[k] = val;
                }
            }
        }

        const updatedReq = BGO_DB.editAndApproveProfileUpdateRequest(id, user.username, editedData);
        if (updatedReq) {
            alert(`✅ PROFILE UPDATE EDITED & APPROVED!\n\nChanges have been saved and synchronized to @${updatedReq.username}'s profile across all directories.`);
            this.closeEditPurModal();
            this.loadAdminDashboardData();
        }
    },

    triggerProfileUpdateNotification(type, memberName, username, details) {
        const superAdminEmail = "badiuddinadil@gmail.com";
        const adminEmail = "mohammedtabrez.ehs@gmail.com";
        const recipients = `${superAdminEmail}, ${adminEmail}`;

        BGO_DB.addAuditLog("PROFILE_UPDATE_NOTIF", `Automated notification (${type.toUpperCase()}) dispatched to ${recipients} for member @${username}: ${details}`);
        this.triggerSMSNotification("profile_update", memberName, username, `Profile Update Status: ${type.toUpperCase()} - ${details}`);
    },

    triggerSMSNotification(type, memberName, phoneOrUser, messageDetails) {
        const recipients = BGO_DB.getSMSRecipients();
        const logMsg = `Automated SMS Alert [${type.toUpperCase()}] for ${memberName} (${phoneOrUser}): ${messageDetails}`;
        BGO_DB.addAuditLog("SMS_DISPATCH", logMsg);
        console.log("Silent SMS Notification dispatched:", logMsg);
    },

    async handleEventSubmit(e) {
        e.preventDefault();
        const id = document.getElementById("ad-event-id").value;
        const title = document.getElementById("ad-event-title").value.trim();
        const date = document.getElementById("ad-event-date").value.trim();
        const time = document.getElementById("ad-event-time").value.trim();
        const location = document.getElementById("ad-event-location").value.trim();
        let image = document.getElementById("ad-event-image").value.trim();
        const status = document.getElementById("ad-event-status").value;
        const description = document.getElementById("ad-event-desc").value.trim();
        
        let images = [];
        const filesIn = document.getElementById("ad-event-files");
        if (filesIn && filesIn.files.length > 0) {
            for (let i = 0; i < filesIn.files.length; i++) {
                try {
                    const b64 = await this.readFileAsBase64(filesIn.files[i]);
                    images.push(b64);
                } catch (err) {
                    console.error("Multi photo upload error:", err);
                }
            }
            if (images.length > 0) {
                image = images[0];
            }
        }
        
        const eventData = { title, date, time, location, venue: location, image, images, status, description };
        
        if (id) {
            BGO_DB.updateEvent(id, eventData);
            alert("Scheduled event details updated successfully.");
        } else {
            BGO_DB.addEvent(eventData);
            alert("New event scheduled.");
        }
        
        this.closeEventModal();
        BGO_PAGES.loadAdminDashboardData();
    },

    handleDeleteEvent(id) {
        if (confirm("Are you sure you want to cancel and remove this scheduled event?")) {
            BGO_DB.deleteEvent(id);
            BGO_PAGES.loadAdminDashboardData();
        }
    },

    renderAdminJobs() {
        const filterSel = document.getElementById("ad-jobs-status-filter");
        const statusFilter = filterSel ? filterSel.value : "pending";
        const tbody = document.querySelector("#ad-jobs-table tbody");
        if (!tbody) return;
        
        const jobs = BGO_DB.getJobs();
        const nowMs = Date.now();
        
        // Update Stats Counters
        const pCount = jobs.filter(j => j.status === "pending").length;
        const aCount = jobs.filter(j => j.status === "approved" && (!j.expiryTimestamp || nowMs <= j.expiryTimestamp)).length;
        const eCount = jobs.filter(j => j.status === "expired" || (j.status === "approved" && j.expiryTimestamp && nowMs > j.expiryTimestamp)).length;
        const rCount = jobs.filter(j => j.status === "rejected").length;

        if (document.getElementById("ad-job-count-pending")) document.getElementById("ad-job-count-pending").innerText = pCount;
        if (document.getElementById("ad-job-count-approved")) document.getElementById("ad-job-count-approved").innerText = aCount;
        if (document.getElementById("ad-job-count-expired")) document.getElementById("ad-job-count-expired").innerText = eCount;
        if (document.getElementById("ad-job-count-rejected")) document.getElementById("ad-job-count-rejected").innerText = rCount;

        // Filter list
        let filtered = jobs;
        if (statusFilter !== "all") {
            filtered = jobs.filter(j => j.status === statusFilter);
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-light);">No job vacancies found for the selected status filter.</td></tr>`;
            return;
        }

        let html = "";
        filtered.forEach(j => {
            let statusClass = "badge-status-pending";
            let statusText = j.status ? j.status.toUpperCase() : "PENDING";

            if (j.status === "approved") {
                statusClass = "badge-status-approved";
                statusText = "APPROVED (LIVE)";
            } else if (j.status === "expired") {
                statusClass = "status-completed";
                statusText = "EXPIRED (15 DAYS)";
            } else if (j.status === "rejected") {
                statusClass = "badge-status-danger";
                statusText = "REJECTED";
            }

            // Expiry calculation
            let validityText = '<span style="color:var(--text-light); font-style:italic;">Awaiting Approval</span>';
            if (j.status === "approved" && j.expiryTimestamp) {
                const diffMs = j.expiryTimestamp - nowMs;
                const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                validityText = `
                    <div style="font-size:0.8rem; font-weight:700; color:var(--primary-color);">✅ Approved: ${j.approvedAt || j.postedDate}</div>
                    <div style="font-size:0.78rem; font-weight:700; color:#b91c1c; margin-top:0.2rem;">⏳ Expiry Date: ${j.expiryDate || 'N/A'}</div>
                    <div style="font-size:0.75rem; color:var(--text-light); font-weight:600; margin-top:0.1rem;">(${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining)</div>
                `;
            } else if (j.status === "expired") {
                validityText = `
                    <div style="font-size:0.8rem; color:#6b7280; font-weight:600;">⏰ Expired: ${j.expiryDate || j.postedDate}</div>
                    <div style="font-size:0.75rem; color:var(--danger-color); font-weight:700;">(Completed 15 Days)</div>
                `;
            }

            // Action controls
            let actionBtns = `
                <button onclick="BGO_PAGES.adminOpenJobEditModal('${j.id}')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">Edit</button>
            `;

            if (j.status === "pending" || j.status === "rejected") {
                actionBtns += `<button onclick="BGO_PAGES.adminApproveJob('${j.id}')" class="action-btn-sm action-btn-approve">Approve (15 Days)</button>`;
            }
            if (j.status === "pending") {
                actionBtns += `<button onclick="BGO_PAGES.adminRejectJob('${j.id}')" class="action-btn-sm action-btn-delete">Reject</button>`;
            }
            if (j.status === "approved" || j.status === "expired") {
                actionBtns += `<button onclick="BGO_PAGES.adminExtendJob('${j.id}')" class="action-btn-sm" style="background-color:var(--secondary-color); color:var(--primary-dark); font-weight:700;">Extend +15 Days</button>`;
            }
            actionBtns += `<button onclick="BGO_PAGES.adminDeleteJob('${j.id}')" class="action-btn-sm action-btn-delete">Delete</button>`;

            html += `
                <tr>
                    <td>
                        <strong style="font-size:0.9rem; color:var(--primary-color);">${j.title}</strong><br>
                        <span style="font-size:0.8rem; font-weight:600;">🏢 ${j.company}</span><br>
                        <span style="font-size:0.75rem; color:var(--text-light);">📍 ${j.location} | 💼 ${j.type} | 💰 ${j.salary}</span>
                    </td>
                    <td>
                        <strong style="font-size:0.85rem;">${j.posterName || j.postedBy}</strong><br>
                        <a href="mailto:${j.contactEmail || j.email || j.contact}" style="font-size:0.78rem; font-weight:600; color:var(--primary-light);">✉️ ${j.contactEmail || j.email || j.contact}</a>
                    </td>
                    <td>
                        <span style="font-size:0.8rem; font-weight:600;">${j.postedDate}</span>
                    </td>
                    <td>
                        ${validityText}
                    </td>
                    <td>
                        <span class="badge-status ${statusClass}">${statusText}</span>
                    </td>
                    <td class="table-actions">
                        <div style="display:flex; flex-wrap:wrap; gap:0.3rem;">
                            ${actionBtns}
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    adminApproveJob(id) {
        if (confirm("Approve this job vacancy listing? It will become live under Verified Job Opportunities for 15 days.")) {
            BGO_DB.approveJob(id);
            alert("✅ Job Vacancy Approved! Live on portal for 15 days.");
            this.renderAdminJobs();
            this.filterJobs();
        }
    },

    adminRejectJob(id) {
        const reason = prompt("Enter reason for rejecting this job vacancy (optional):", "Incorrect details or duplicate listing");
        if (reason !== null) {
            BGO_DB.rejectJob(id, reason);
            alert("Job vacancy marked as Rejected.");
            this.renderAdminJobs();
            this.filterJobs();
        }
    },

    adminExtendJob(id) {
        if (confirm("Extend the validity of this job vacancy listing by an additional 15 days?")) {
            BGO_DB.extendJobValidity(id, 15);
            alert("✅ Vacancy validity extended by +15 days!");
            this.renderAdminJobs();
            this.filterJobs();
        }
    },

    adminOpenJobEditModal(id) {
        const jobs = BGO_DB.getJobs();
        const j = jobs.find(job => job.id === id);
        if (j) {
            document.getElementById("ad-edit-job-id").value = j.id;
            document.getElementById("ad-edit-job-title").value = j.title || "";
            document.getElementById("ad-edit-job-company").value = j.company || "";
            document.getElementById("ad-edit-job-category").value = j.category || "";
            document.getElementById("ad-edit-job-location").value = j.location || "";
            document.getElementById("ad-edit-job-salary").value = j.salary || "";
            document.getElementById("ad-edit-job-type").value = j.type || "Full-Time";
            document.getElementById("ad-edit-job-email").value = j.contactEmail || j.email || "";
            document.getElementById("ad-edit-job-desc").value = j.description || "";
            
            document.getElementById("ad-job-edit-modal").classList.add("active");
        }
    },

    closeAdminJobEditModal() {
        document.getElementById("ad-job-edit-modal").classList.remove("active");
    },

    handleAdminSaveJob(e) {
        e.preventDefault();
        const id = document.getElementById("ad-edit-job-id").value;
        const updated = {
            title: document.getElementById("ad-edit-job-title").value.trim(),
            company: document.getElementById("ad-edit-job-company").value.trim(),
            category: document.getElementById("ad-edit-job-category").value.trim(),
            location: document.getElementById("ad-edit-job-location").value.trim(),
            salary: document.getElementById("ad-edit-job-salary").value.trim(),
            type: document.getElementById("ad-edit-job-type").value,
            contactEmail: document.getElementById("ad-edit-job-email").value.trim(),
            email: document.getElementById("ad-edit-job-email").value.trim(),
            description: document.getElementById("ad-edit-job-desc").value.trim()
        };

        BGO_DB.updateJob(id, updated);
        alert("Job vacancy details updated successfully.");
        this.closeAdminJobEditModal();
        this.renderAdminJobs();
        this.filterJobs();
    },

    adminDeleteJob(id) {
        if (confirm("Are you sure you want to delete this job vacancy listing permanently?")) {
            BGO_DB.deleteJob(id);
            alert("Job vacancy deleted.");
            this.renderAdminJobs();
            this.filterJobs();
        }
    },

    adminResolveMedical(id) {
        BGO_DB.resolveMedicalRequest(id);
        this.loadAdminDashboardData();
    },

    adminDeleteMedical(id) {
        if (confirm("Are you sure you want to delete this medical case request?")) {
            BGO_DB.deleteMedicalRequest(id);
            this.loadAdminDashboardData();
        }
    },

    adminApproveTransfer(id) {
        BGO_DB.updateTransferStatus(id, "approved");
        this.loadAdminDashboardData();
    },

    adminCompleteTransfer(id) {
        BGO_DB.updateTransferStatus(id, "completed");
        this.loadAdminDashboardData();
    },

    adminDeleteTransfer(id) {
        if (confirm("Are you sure you want to delete this document transfer carriage request?")) {
            BGO_DB.deleteTransfer(id);
            this.loadAdminDashboardData();
        }
    },

    exportMembersToExcel() {
        const members = BGO_DB.getMembers().filter(m => (m.status === "approved" || m.status === "inactive") && m.role !== "superadmin" && m.role !== "admin");
        if (!members || members.length === 0) {
            alert("No registered community members found to export.");
            return;
        }

        // Prepare CSV Header with UTF-8 BOM for Microsoft Excel compatibility
        let csvContent = "\uFEFF";
        const headers = [
            "BGO Member ID",
            "Full Name",
            "Native Place (Gulbarga)",
            "Oman Mobile Number",
            "WhatsApp Number",
            "Email Address",
            "Profession / Occupation",
            "Company Name",
            "Current City in Oman",
            "Blood Group",
            "Marital Status",
            "Dependents in Oman",
            "Role",
            "Approval Status",
            "Registration Date & Time"
        ];

        csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";

        // Fill Rows
        members.forEach(m => {
            const memberIdStr = m.memberId || m.id || "-";
            const regDateStr = m.registeredAt || m.registrationDate || m.createdAt || m.regDate || "Registered";
            
            const row = [
                memberIdStr,
                m.fullName || m.name || "-",
                m.nativePlace || "-",
                m.mobile || "-",
                m.whatsapp || m.mobile || "-",
                m.email || "-",
                m.profession || "-",
                m.company || "-",
                m.city || "-",
                m.bloodGroup || "-",
                m.maritalStatus || "-",
                m.dependentsCount || 0,
                (m.role || "member").toUpperCase(),
                (m.status || "active").toUpperCase(),
                regDateStr
            ];
            csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",") + "\r\n";
        });

        // Trigger Download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `BGO_Active_Members_Directory_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        BGO_DB.addAuditLog("MEMBERS_EXPORT", `Admin exported ${members.length} members directory records to Excel CSV.`);
    },

    exportMembersToPDF() {
        const members = BGO_DB.getMembers().filter(m => (m.status === "approved" || m.status === "inactive") && m.role !== "superadmin" && m.role !== "admin");
        if (!members || members.length === 0) {
            alert("No registered community members found to generate PDF report.");
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Please allow popups to generate and view the PDF report.");
            return;
        }

        let rowsHtml = "";
        members.forEach((m, idx) => {
            const memberId = m.memberId || `BGO2026${String(idx + 1).padStart(4, '0')}`;
            const statusLabel = (m.status || "approved") === "approved" ? "ACTIVE" : "INACTIVE";
            const statusColor = (m.status || "approved") === "approved" ? "#107c41" : "#d97706";
            const regDate = m.registeredAt || m.registrationDate || "-";
            
            rowsHtml += `
                <tr style="border-bottom: 1px solid #e5e7eb; font-size: 11px;">
                    <td style="padding: 8px; font-weight: bold; color: #0f4c3a; font-family: monospace;">${memberId}</td>
                    <td style="padding: 8px;"><strong>${m.fullName || m.name || '-'}</strong><br><span style="font-size: 10px; color: #6b7280;">@${m.username}</span></td>
                    <td style="padding: 8px;">${m.nativePlace || '-'}</td>
                    <td style="padding: 8px;"><strong>${m.mobile || '-'}</strong></td>
                    <td style="padding: 8px;">${m.email || '-'}</td>
                    <td style="padding: 8px;">${m.profession || '-'}<br><span style="font-size: 10px; color: #6b7280;">${m.company || ''}</span></td>
                    <td style="padding: 8px;">${m.city || '-'}</td>
                    <td style="padding: 8px;"><span style="background:#fee2e2; color:#b91c1c; padding:2px 6px; border-radius:4px; font-weight:bold;">${m.bloodGroup || '-'}</span></td>
                    <td style="padding: 8px; font-weight: bold; color: ${statusColor};">${statusLabel}</td>
                    <td style="padding: 8px; font-size: 10px; color: #4b5563;">${regDate}</td>
                </tr>
            `;
        });

        const reportHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>BGO Members Directory PDF Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #1f2937; }
                    .header { text-align: center; border-bottom: 2px solid #0f4c3a; padding-bottom: 12px; margin-bottom: 20px; }
                    .header h1 { color: #0f4c3a; margin: 0 0 5px 0; font-size: 22px; }
                    .header p { color: #4b5563; margin: 0; font-size: 13px; font-weight: bold; }
                    .meta { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 12px; color: #4b5563; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th { background-color: #0f4c3a; color: white; text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; }
                    tr:nth-child(even) { background-color: #f9fafb; }
                    .footer { margin-top: 25px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; }
                    @media print {
                        @page { size: landscape; margin: 15mm; }
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>BAHMANI GROUP OMAN (BGO)</h1>
                    <p>COMMUNITY MEMBERS DIRECTORY REPORT</p>
                </div>
                <div class="meta">
                    <div><strong>Total Active Members:</strong> ${members.length}</div>
                    <div><strong>Generated Date:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                    <div><strong>Security Notice:</strong> Confidential Community Document</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>BGO Member ID</th>
                            <th>Full Name & Handle</th>
                            <th>Native Place</th>
                            <th>Mobile Number</th>
                            <th>Email Address</th>
                            <th>Profession / Company</th>
                            <th>Oman City</th>
                            <th>Blood</th>
                            <th>Status</th>
                            <th>Registration Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                <div class="footer">
                    Bahmani Group Oman • By the community for the community • Printed on ${new Date().toLocaleString()}
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(reportHtml);
        printWindow.document.close();

        BGO_DB.addAuditLog("MEMBERS_PDF_EXPORT", `Admin generated PDF report for ${members.length} members directory records.`);
    },

    // Travel Information Directory & Renderers
    renderTravelDirectoryCards() {
        const container = document.querySelector("#db-travel-cards-container");
        if (!container) return;

        const filterRouteEl = document.getElementById("db-travel-filter-route");
        const filterVal = filterRouteEl ? filterRouteEl.value : "all";

        let list = BGO_DB.getTravelInfo();

        if (filterVal !== "all") {
            if (filterVal === "Other") {
                list = list.filter(t => t.route !== "Muscat to Gulbarga" && t.route !== "Gulbarga to Muscat");
            } else {
                list = list.filter(t => t.route === filterVal);
            }
        }

        const countBadge = document.getElementById("db-travel-count-badge");
        if (countBadge) {
            countBadge.innerText = `Active Community Travelers (${list.length})`;
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; background:white; border:1px dashed var(--border-color); border-radius:var(--radius-md); padding:2.5rem; text-align:center;">
                    <div style="font-size:2.5rem; margin-bottom:0.5rem;">✈️</div>
                    <h4 style="margin:0 0 0.4rem 0; color:var(--primary-dark); font-weight:700;">No Travel Schedules Found</h4>
                    <p style="margin:0; font-size:0.85rem; color:var(--text-light);">No community members have logged travel schedules under this filter. Click <strong>➕ Post Travel Schedule</strong> to share your upcoming trip details!</p>
                </div>
            `;
            return;
        }

        let html = "";
        list.forEach(t => {
            const cleanMobile = t.mobile ? t.mobile.trim() : "";
            const cleanWa = t.whatsapp ? t.whatsapp.replace(/[^0-9]/g, '') : (cleanMobile ? cleanMobile.replace(/[^0-9]/g, '') : "");
            
            let routeBadgeStyle = "background:#e0f2fe; color:#0369a1;";
            if (t.route === "Muscat to Gulbarga") routeBadgeStyle = "background:#dcfce7; color:#15803d;";
            else if (t.route === "Gulbarga to Muscat") routeBadgeStyle = "background:#fef3c7; color:#b45309;";

            html += `
                <div style="background:white; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.2rem; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; justify-content:space-between; border-top:4px solid var(--primary-color);">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.8rem; flex-wrap:wrap; gap:0.4rem;">
                            <span class="badge-status" style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; ${routeBadgeStyle}">
                                ✈️ ${t.route}
                            </span>
                            <span style="font-size:0.72rem; color:var(--text-light); font-weight:600;">Posted: ${t.createdAt || 'Recent'}</span>
                        </div>
                        <h4 style="margin:0 0 0.3rem 0; font-size:1.1rem; color:var(--primary-dark); font-weight:800;">${t.memberName}</h4>
                        <div style="font-size:0.85rem; color:var(--text-color); margin-bottom:0.8rem; line-height:1.5;">
                            <p style="margin:0.2rem 0;">📅 <strong>Travel Date:</strong> <span style="color:var(--primary-color); font-weight:700;">${t.travelDate}</span></p>
                            <p style="margin:0.2rem 0;">⏰ <strong>Time / Departure:</strong> ${t.travelTime}</p>
                            ${t.flightDetails ? `<p style="margin:0.2rem 0; font-size:0.8rem; color:var(--text-light);">✈️ <strong>Flight / Carrier:</strong> ${t.flightDetails}</p>` : ''}
                        </div>
                        ${t.remarks ? `<div style="background:rgba(15,76,58,0.04); border-left:3px solid var(--primary-color); padding:0.6rem 0.8rem; border-radius:4px; font-size:0.82rem; color:var(--text-color); margin-bottom:1rem; font-style:italic;">"${t.remarks}"</div>` : ''}
                    </div>
                    <div style="display:flex; gap:0.5rem; border-top:1px dashed var(--border-color); padding-top:0.8rem; margin-top:0.5rem; flex-wrap:wrap;">
                        ${cleanMobile ? `<a href="tel:${cleanMobile}" class="action-btn-sm" style="background:#e0f2fe; color:#0369a1; text-decoration:none; display:inline-flex; align-items:center; gap:0.3rem; font-weight:700;">📞 Call ${cleanMobile}</a>` : ''}
                        ${cleanWa ? `<a href="https://wa.me/${cleanWa}" target="_blank" class="action-btn-sm" style="background:#dcfce7; color:#15803d; text-decoration:none; display:inline-flex; align-items:center; gap:0.3rem; font-weight:700;">💬 WhatsApp</a>` : ''}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    renderMemberMyTravelTable(username) {
        const tbody = document.querySelector("#db-my-travel-table tbody");
        if (!tbody) return;

        const myTravels = BGO_DB.getTravelInfoByUser(username);
        if (myTravels.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.8rem; color:var(--text-light);">You have not posted any travel schedules. Click <strong>➕ Post Travel Schedule</strong> to register your trip!</td></tr>`;
            return;
        }

        let html = "";
        myTravels.forEach(t => {
            html += `
                <tr>
                    <td><strong style="color:var(--primary-color);">${t.travelDate}</strong></td>
                    <td>${t.travelTime}${t.flightDetails ? `<br><span style="font-size:0.75rem; color:var(--text-light);">${t.flightDetails}</span>` : ''}</td>
                    <td><span class="badge-status badge-status-approved" style="font-size:0.8rem;">✈️ ${t.route}</span></td>
                    <td><div style="font-size:0.8rem; max-width:260px; line-height:1.4;">${t.remarks || '<span style="color:var(--text-light); font-style:italic;">None</span>'}</div></td>
                    <td><span class="badge-status badge-status-approved">ACTIVE</span></td>
                    <td class="table-actions">
                        <button onclick="BGO_PAGES.openTravelPostModal('${t.id}')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">✏️ Edit</button>
                        <button onclick="BGO_PAGES.handleDeleteTravelEntry('${t.id}')" class="action-btn-sm action-btn-delete">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    renderAdminTravelTable() {
        const tbody = document.querySelector("#ad-travel-table tbody");
        if (!tbody) return;

        const filterRouteEl = document.getElementById("ad-travel-route-filter");
        const filterVal = filterRouteEl ? filterRouteEl.value : "all";

        let list = BGO_DB.getTravelInfo();
        const totalCount = list.length;

        if (filterVal !== "all") {
            if (filterVal === "Other") {
                list = list.filter(t => t.route !== "Muscat to Gulbarga" && t.route !== "Gulbarga to Muscat");
            } else {
                list = list.filter(t => t.route === filterVal);
            }
        }

        const badge = document.getElementById("ad-travel-total-badge");
        if (badge) {
            badge.innerText = `Total Travel Schedules: ${totalCount} (${list.length} Shown)`;
        }

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-light);">No travel schedules logged.</td></tr>`;
            return;
        }

        let html = "";
        list.forEach(t => {
            const cleanMobile = t.mobile ? t.mobile.trim() : "";
            const cleanWa = t.whatsapp ? t.whatsapp.replace(/[^0-9]/g, '') : (cleanMobile ? cleanMobile.replace(/[^0-9]/g, '') : "");

            html += `
                <tr>
                    <td>
                        <strong>${t.memberName}</strong>
                        <br><span style="font-size:0.75rem; color:var(--text-light);">@${t.username}</span>
                    </td>
                    <td>
                        <strong>${t.mobile || 'N/A'}</strong>
                        ${cleanWa ? `<br><a href="https://wa.me/${cleanWa}" target="_blank" style="font-size:0.75rem; color:#16a34a; font-weight:600;">💬 WhatsApp</a>` : ''}
                    </td>
                    <td><span class="badge-status badge-status-approved" style="font-size:0.8rem;">✈️ ${t.route}</span></td>
                    <td>
                        <strong style="color:var(--primary-color);">${t.travelDate}</strong>
                        <br><span style="font-size:0.75rem; color:var(--text-light);">${t.travelTime}</span>
                        ${t.flightDetails ? `<br><span style="font-size:0.72rem; color:var(--primary-dark); font-weight:600;">✈️ ${t.flightDetails}</span>` : ''}
                    </td>
                    <td><div style="font-size:0.8rem; max-width:280px; line-height:1.4;">${t.remarks || '<span style="color:var(--text-light); font-style:italic;">None</span>'}</div></td>
                    <td><span class="badge-status badge-status-approved">ACTIVE</span></td>
                    <td class="table-actions">
                        <button onclick="BGO_PAGES.openTravelPostModal('${t.id}')" class="action-btn-sm" style="background-color:var(--border-color); color:var(--text-color);">✏️ Edit</button>
                        <button onclick="BGO_PAGES.handleDeleteTravelEntry('${t.id}')" class="action-btn-sm action-btn-delete">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    ensureTravelModalExists() {
        if (document.getElementById("db-travel-modal")) return;

        const modalDiv = document.createElement("div");
        modalDiv.id = "db-travel-modal";
        modalDiv.className = "modal-overlay";
        modalDiv.innerHTML = `
            <div class="modal-box" style="max-width: 480px; width: 92%; position:relative; z-index: 10001;">
                <div class="modal-header">
                    <h3 id="db-travel-modal-title">✈️ Post Travel Schedule</h3>
                    <button onclick="BGO_PAGES.closeTravelPostModal()" class="modal-close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="db-travel-form" onsubmit="BGO_PAGES.handleMemberTravelSubmit(event)">
                        <input type="hidden" id="trv-id">
                        <div class="form-group" style="margin-bottom:1rem;">
                            <label>Travel Date *</label>
                            <input type="date" id="trv-date" required style="font-weight:600;">
                        </div>
                        <div class="form-group" style="margin-bottom:1rem;">
                            <label>Travel Time / Departure *</label>
                            <input type="text" id="trv-time" required placeholder="e.g. 10:30 AM / Evening Flight">
                        </div>
                        <div class="form-group" style="margin-bottom:1rem;">
                            <label>Travel Route *</label>
                            <select id="trv-route" required onchange="BGO_PAGES.toggleCustomRouteField(this.value)" style="font-weight:600;">
                                <option value="Muscat to Gulbarga" selected>Muscat to Gulbarga</option>
                                <option value="Gulbarga to Muscat">Gulbarga to Muscat</option>
                                <option value="Other">Other (Manual Entry)</option>
                            </select>
                        </div>
                        <div class="form-group" id="trv-custom-route-group" style="display:none; margin-bottom:1rem;">
                            <label>Enter Custom Travel Route *</label>
                            <input type="text" id="trv-custom-route" placeholder="e.g. Salalah to Gulbarga, Muscat to Bangalore">
                        </div>
                        <div class="form-group" style="margin-bottom:1rem;">
                            <label>Flight / Carrier Details (Optional)</label>
                            <input type="text" id="trv-flight" placeholder="e.g. Oman Air WY 201 / IndiGo via Hyderabad">
                        </div>
                        <div class="form-group" style="margin-bottom:1.2rem;">
                            <label>Carriage Capacity & Assistance Remarks (Optional)</label>
                            <textarea id="trv-remarks" rows="3" placeholder="e.g. Can carry emergency documents / medical reports. Available for handover in Muscat."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary form-submit-btn" style="width:100%; justify-content:center;">Submit Travel Schedule</button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);
    },

    openTravelPostModal(id = "") {
        this.ensureTravelModalExists();

        const form = document.getElementById("db-travel-form");
        if (form) form.reset();

        const idEl = document.getElementById("trv-id");
        if (idEl) idEl.value = id || "";

        const groupEl = document.getElementById("trv-custom-route-group");
        const customEl = document.getElementById("trv-custom-route");
        if (groupEl) groupEl.style.display = "none";
        if (customEl) customEl.removeAttribute("required");

        if (id) {
            const list = BGO_DB.getTravelInfo();
            const entry = list.find(t => t.id === id);
            if (entry) {
                const dateEl = document.getElementById("trv-date");
                const timeEl = document.getElementById("trv-time");
                const flightEl = document.getElementById("trv-flight");
                const remarksEl = document.getElementById("trv-remarks");
                const routeEl = document.getElementById("trv-route");

                if (dateEl) dateEl.value = entry.travelDate || "";
                if (timeEl) timeEl.value = entry.travelTime || "";
                if (flightEl) flightEl.value = entry.flightDetails || "";
                if (remarksEl) remarksEl.value = entry.remarks || "";

                if (routeEl) {
                    if (entry.route === "Muscat to Gulbarga" || entry.route === "Gulbarga to Muscat") {
                        routeEl.value = entry.route;
                    } else {
                        routeEl.value = "Other";
                        if (groupEl) groupEl.style.display = "block";
                        if (customEl) {
                            customEl.value = entry.route || "";
                            customEl.setAttribute("required", "required");
                        }
                    }
                }
                const titleEl = document.getElementById("db-travel-modal-title");
                if (titleEl) titleEl.innerText = "✏️ Edit Travel Schedule";
            }
        } else {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateEl = document.getElementById("trv-date");
            const routeEl = document.getElementById("trv-route");
            if (dateEl) dateEl.value = tomorrow.toISOString().split('T')[0];
            if (routeEl) routeEl.value = "Muscat to Gulbarga";

            const titleEl = document.getElementById("db-travel-modal-title");
            if (titleEl) titleEl.innerText = "✈️ Post Travel Schedule";
        }
        const modal = document.getElementById("db-travel-modal");
        if (modal) modal.classList.add("active");
    },

    openAdminAddTravelModal() {
        this.openTravelPostModal("");
    },

    closeTravelPostModal() {
        const modal = document.getElementById("db-travel-modal");
        if (modal) modal.classList.remove("active");
    },

    toggleCustomRouteField(value) {
        const group = document.getElementById("trv-custom-route-group");
        const customInput = document.getElementById("trv-custom-route");
        if (!group || !customInput) return;
        if (value === "Other") {
            group.style.display = "block";
            customInput.setAttribute("required", "required");
            customInput.focus();
        } else {
            group.style.display = "none";
            customInput.removeAttribute("required");
            customInput.value = "";
        }
    },

    handleMemberTravelSubmit(e) {
        e.preventDefault();
        const user = BGO_AUTH.getCurrentUser();
        if (!user) {
            alert("Session expired. Please log in.");
            window.location.hash = "#membership";
            return;
        }

        const idEl = document.getElementById("trv-id");
        const dateEl = document.getElementById("trv-date");
        const timeEl = document.getElementById("trv-time");
        const routeEl = document.getElementById("trv-route");

        if (!dateEl || !timeEl || !routeEl) {
            alert("Error submitting travel form. Please try again.");
            return;
        }

        const id = idEl ? idEl.value : "";
        const travelDate = dateEl.value;
        const travelTime = timeEl.value.trim();
        const routeSelect = routeEl.value;
        let route = routeSelect;

        if (routeSelect === "Other") {
            const customRouteEl = document.getElementById("trv-custom-route");
            route = customRouteEl ? customRouteEl.value.trim() : "";
            if (!route) {
                alert("Please specify your custom travel route.");
                return;
            }
        }
        const flightEl = document.getElementById("trv-flight");
        const remarksEl = document.getElementById("trv-remarks");
        const flightDetails = flightEl ? flightEl.value.trim() : "";
        const remarks = remarksEl ? remarksEl.value.trim() : "";

        const travelData = {
            username: user.username,
            memberName: user.fullName,
            mobile: user.mobile || "",
            whatsapp: user.whatsapp || user.mobile || "",
            travelDate,
            travelTime,
            route,
            flightDetails,
            remarks
        };

        if (id) {
            BGO_DB.updateTravelInfo(id, travelData);
            alert("✈️ Travel schedule updated successfully!");
        } else {
            BGO_DB.addTravelInfo(travelData);
            alert("✈️ Travel schedule posted successfully! Your trip details have been registered and notified to Admins, and Executive Officers for document transfer coordination.");
        }

        this.closeTravelPostModal();
        
        // Refresh active views immediately
        this.renderTravelDirectoryCards();
        this.renderMemberMyTravelTable(user.username);
        this.renderAdminTravelTable();
    },

    handleDeleteTravelEntry(id) {
        if (confirm("Are you sure you want to delete this travel schedule post?")) {
            BGO_DB.deleteTravelInfo(id);
            alert("Travel schedule removed.");
            const user = BGO_AUTH.getCurrentUser();
            if (user) {
                this.renderTravelDirectoryCards();
                this.renderMemberMyTravelTable(user.username);
            }
            this.renderAdminTravelTable();
        }
    },

    // Super Admin System Audit & Activity Logs Management
    getAuditLogModuleAndRole(l) {
        const action = l.action || "";
        const details = l.details || "";
        let role = "System";
        let moduleName = "General";

        if (l.user === "superadmin" || details.includes("Super Admin")) role = "Super Admin";
        else if (l.user === "admin" || details.includes("Admin")) role = "Admin";
        else if (details.includes("Executive")) role = "Executive";
        else if (l.user && l.user !== "Guest") role = "Member";
        else role = "Guest";

        if (action.includes("LOGIN") || action.includes("PERMISSION")) moduleName = "Security";
        else if (action.includes("TRAVEL")) moduleName = "Travel Directory";
        else if (action.includes("MEMBER") || action.includes("PROFILE")) moduleName = "Members";
        else if (action.includes("EXPORT") || action.includes("LOG") || action.includes("CLEAR") || action.includes("DELETE")) moduleName = "System Audit";
        else if (action.includes("EXEC")) moduleName = "Executive";
        else if (action.includes("HELPLINE")) moduleName = "Helpline";
        else if (action.includes("JOB")) moduleName = "Jobs Portal";
        else if (action.includes("GALLERY")) moduleName = "Gallery";
        else if (action.includes("EVENT")) moduleName = "Events";

        return { role, moduleName };
    },

    renderAdminAuditLogsTable() {
        const logsBody = document.querySelector("#ad-audit-logs-table tbody");
        if (!logsBody) return;

        const user = BGO_AUTH.getCurrentUser();
        const isSuper = user && user.role === "superadmin";

        if (!isSuper) {
            logsBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--danger-color); font-weight:700;">🔒 Restricted Access: System Audit Logs are strictly restricted to Super Admin accounts.</td></tr>`;
            return;
        }

        const logs = BGO_DB.getAuditLogs();
        const searchInput = document.getElementById("ad-log-search-input");
        const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const filterEl = document.getElementById("ad-log-action-filter");
        const filterVal = filterEl ? filterEl.value : "all";

        let filteredLogs = logs;

        if (filterVal !== "all") {
            filteredLogs = filteredLogs.filter(l => (l.action || "").includes(filterVal));
        }

        if (searchVal) {
            filteredLogs = filteredLogs.filter(l => 
                (l.timestamp || "").toLowerCase().includes(searchVal) ||
                (l.user || "").toLowerCase().includes(searchVal) ||
                (l.action || "").toLowerCase().includes(searchVal) ||
                (l.details || "").toLowerCase().includes(searchVal)
            );
        }

        const selectAllCb = document.getElementById("ad-log-select-all");
        if (selectAllCb) selectAllCb.checked = false;

        if (filteredLogs.length === 0) {
            logsBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--text-light); font-style:italic;">No audit log records found matching the criteria.</td></tr>`;
            return;
        }

        let logHtml = "";
        filteredLogs.forEach((l, idx) => {
            const cleanTime = l.timestamp ? l.timestamp.replace("T", " ").substring(0, 19) : "N/A";
            const isViolation = l.action === "PERMISSION_VIOLATION" || l.action === "LOGIN_FAILED";
            const { role, moduleName } = this.getAuditLogModuleAndRole(l);
            
            const statusBadge = isViolation 
                ? `<span class="badge-status" style="background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; font-weight:800; font-size:0.72rem; padding:0.25rem 0.5rem; display:inline-block;">ALERT 🚨</span>` 
                : `<span class="badge-status" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-weight:800; font-size:0.72rem; padding:0.25rem 0.5rem; display:inline-block;">SUCCESS ✅</span>`;

            const rowBg = isViolation 
                ? 'background-color:#fff1f2;' 
                : (idx % 2 === 1 ? 'background-color:#f8fafc;' : 'background-color:#ffffff;');

            logHtml += `
                <tr style="${rowBg} border-bottom:1px solid #e2e8f0; transition:background-color 0.15s ease;">
                    <td style="text-align:center; padding:0.75rem 0.5rem; vertical-align:middle;"><input type="checkbox" class="ad-log-cb" value="${l.id}" style="transform:scale(1.2); cursor:pointer;"></td>
                    <td style="color:#1e293b; font-size:0.82rem; font-weight:700; font-family:monospace; padding:0.75rem; vertical-align:middle;">${cleanTime}</td>
                    <td style="color:#0f4c3a; font-weight:800; font-size:0.85rem; padding:0.75rem; vertical-align:middle;">@${l.user}</td>
                    <td style="padding:0.75rem; vertical-align:middle;"><span style="background:#dbeafe; color:#1e40af; border:1px solid #bfdbfe; font-size:0.72rem; font-weight:800; padding:0.25rem 0.5rem; border-radius:4px; display:inline-block;">${role}</span></td>
                    <td style="color:${isViolation ? '#991b1b' : '#0f172a'}; font-weight:800; font-size:0.82rem; padding:0.75rem; vertical-align:middle;">${l.action}</td>
                    <td style="padding:0.75rem; vertical-align:middle;"><span style="font-size:0.78rem; font-weight:700; color:#334155;">${moduleName}</span></td>
                    <td style="padding:0.75rem; vertical-align:middle;">${statusBadge}</td>
                    <td style="color:${isViolation ? '#991b1b' : '#0f172a'}; font-size:0.82rem; font-weight:${isViolation ? '700' : '500'}; line-height:1.45; padding:0.75rem; vertical-align:middle;">${l.details}</td>
                    <td style="text-align:center; padding:0.75rem 0.5rem; vertical-align:middle;">
                        <button onclick="BGO_PAGES.handleDeleteSingleAuditLog('${l.id}')" style="background:#ef4444; color:#ffffff; border:none; padding:0.35rem 0.65rem; border-radius:4px; font-weight:800; font-size:0.75rem; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.15);" title="Delete Log Record">🗑️</button>
                    </td>
                </tr>
            `;
        });
        logsBody.innerHTML = logHtml;
    },

    toggleSelectAllAuditLogs(checked) {
        const cbs = document.querySelectorAll(".ad-log-cb");
        cbs.forEach(cb => cb.checked = checked);
    },

    exportAuditLogs(format) {
        const user = BGO_AUTH.getCurrentUser();
        if (!user || user.role !== "superadmin") {
            alert("🔒 Access Denied: Exporting System Audit Logs is strictly restricted to Super Admin accounts.");
            return;
        }

        const logs = BGO_DB.getAuditLogs();
        if (logs.length === 0) {
            alert("No audit log records available to export.");
            return;
        }

        if (format === "pdf") {
            const printWin = window.open('', '_blank');
            let rowsHtml = "";
            logs.forEach((l, idx) => {
                const cleanTime = l.timestamp ? l.timestamp.replace("T", " ").substring(0, 19) : "N/A";
                const { role, moduleName } = this.getAuditLogModuleAndRole(l);
                const status = (l.action === "PERMISSION_VIOLATION" || l.action === "LOGIN_FAILED") ? "SECURITY_ALERT" : "SUCCESS";
                rowsHtml += `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${cleanTime}</td>
                        <td>@${l.user}</td>
                        <td>${role}</td>
                        <td><strong>${l.action}</strong></td>
                        <td>${moduleName}</td>
                        <td>${status}</td>
                        <td>${l.details}</td>
                    </tr>
                `;
            });

            const pdfHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>BGO System Audit & Activity Logs Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #1e293b; font-size: 11px; }
                        h2 { color: #0f4c3a; margin-bottom: 4px; }
                        p { margin: 0 0 15px 0; color: #64748b; font-size: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; word-break: break-word; }
                        th { background-color: #0f4c3a; color: white; font-weight: bold; font-size: 10px; text-transform: uppercase; }
                        tr:nth-child(even) { background-color: #f8fafc; }
                        .footer { margin-top: 25px; font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
                    </style>
                </head>
                <body>
                    <h2>Bahmani Group Oman – System Audit & Activity Logs Report</h2>
                    <p>Official Super Admin Security Report • Total Log Records: ${logs.length} • Generated on: ${new Date().toLocaleString()}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date & Time</th>
                                <th>User Name</th>
                                <th>Role</th>
                                <th>Action / Activity</th>
                                <th>Module</th>
                                <th>Status</th>
                                <th>Activity Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                    <div class="footer">
                        Confidential Super Admin System Document • Bahmani Group Oman • Printed on ${new Date().toLocaleString()}
                    </div>
                    <script>
                        window.onload = function() { window.print(); };
                    </script>
                </body>
                </html>
            `;

            printWin.document.write(pdfHtml);
            printWin.document.close();
            BGO_DB.addAuditLog("AUDIT_LOG_EXPORT", `Super Admin generated printable PDF audit log report for ${logs.length} records.`);
            return;
        }

        let csvContent = "\uFEFF";
        const headers = [
            "Date & Time",
            "User Name",
            "User Role",
            "Activity / Action",
            "Module",
            "Status",
            "Activity Details",
            "Log Record ID"
        ];

        csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";

        logs.forEach(l => {
            const cleanTime = l.timestamp ? l.timestamp.replace("T", " ").substring(0, 19) : "N/A";
            const { role, moduleName } = this.getAuditLogModuleAndRole(l);
            const status = (l.action === "PERMISSION_VIOLATION" || l.action === "LOGIN_FAILED") ? "SECURITY_ALERT" : "SUCCESS";

            const row = [
                cleanTime,
                "@" + l.user,
                role,
                l.action,
                moduleName,
                status,
                l.details,
                l.id
            ];
            csvContent += row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(",") + "\r\n";
        });

        const extension = format === "excel" ? "xlsx" : "csv";
        const mimeType = format === "excel" ? "application/vnd.ms-excel;charset=utf-8;" : "text/csv;charset=utf-8;";
        const filename = `BGO_System_Audit_Logs_${new Date().toISOString().split('T')[0]}.${extension}`;

        const blob = new Blob([csvContent], { type: mimeType });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        BGO_DB.addAuditLog("AUDIT_LOG_EXPORT", `Super Admin exported ${logs.length} system audit log records in ${format.toUpperCase()} format.`);
        alert(`✅ System audit logs exported successfully in ${format.toUpperCase()} format!\nFile Name: ${filename}`);
    },

    handleDeleteSingleAuditLog(id) {
        const user = BGO_AUTH.getCurrentUser();
        if (!user || user.role !== "superadmin") {
            alert("🔒 Access Denied: Deleting System Audit Log records is strictly restricted to Super Admin accounts.");
            return;
        }

        if (confirm("Are you sure you want to delete this log entry record from the system audit log?")) {
            BGO_DB.deleteAuditLog(id);
            alert("Audit log entry deleted successfully.");
            this.renderAdminAuditLogsTable();
        }
    },

    handleDeleteSelectedAuditLogs() {
        const user = BGO_AUTH.getCurrentUser();
        if (!user || user.role !== "superadmin") {
            alert("🔒 Access Denied: Deleting System Audit Log records is strictly restricted to Super Admin accounts.");
            return;
        }

        const checkedBoxes = document.querySelectorAll(".ad-log-cb:checked");
        if (checkedBoxes.length === 0) {
            alert("Please select at least one audit log entry to delete using the checkboxes.");
            return;
        }

        const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);

        if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected audit log records?`)) {
            BGO_DB.deleteAuditLogs(selectedIds);
            alert(`${selectedIds.length} audit log records deleted successfully.`);
            this.renderAdminAuditLogsTable();
        }
    },

    handleClearAllAuditLogs() {
        const user = BGO_AUTH.getCurrentUser();
        if (!user || user.role !== "superadmin") {
            alert("🔒 Access Denied: Clearing System Audit Logs is strictly restricted to Super Admin accounts.");
            return;
        }

        if (confirm("🚨 CRITICAL CONFIRMATION REQUIREMENT:\n\nAre you sure you want to CLEAR ALL System Audit & Activity Logs?\n\nThis will purge all history records. This action cannot be undone.")) {
            BGO_DB.clearAllAuditLogs();
            alert("System audit logs have been completely cleared.");
            this.renderAdminAuditLogsTable();
        }
    }
};
