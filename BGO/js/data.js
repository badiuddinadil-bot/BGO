// Seed Data and LocalStorage Database Management for BGO

const SEED_STATS = [
    { id: "stat-1", key: "yearsOfService", label: "Years of Service", value: "5+", enabled: true },
    { id: "stat-2", key: "membersCount", label: "Community Members", value: "200+", enabled: true },
    { id: "stat-3", key: "jobsShared", label: "Jobs Shared", value: "450+", enabled: true },
    { id: "stat-4", key: "medicalCases", label: "Medical Cases", value: "180+", enabled: true },
    { id: "stat-5", key: "activeVolunteers", label: "Active Volunteers", value: "85+", enabled: true }
];

const SEED_JOBS = [
    {
        id: "job-1",
        title: "Site Civil Engineer",
        company: "Al-Tasnim Enterprises",
        category: "engineering",
        location: "Muscat, Oman",
        salary: "OMR 600 - 800",
        type: "Full-Time",
        posterName: "Mohammed Tabrez",
        contactEmail: "mohammedtabrez.ehs@gmail.com",
        postedBy: "Mohammed Tabrez",
        postedDate: "2026-07-15",
        status: "approved",
        description: "Looking for an experienced Civil Engineer with 3+ years of Gulf experience. Must be fluent in English and Hindi. Knowledge of Arabic is an advantage. Duties include site supervision, structural checks, and client liaison.",
        contact: "mohammedtabrez.ehs@gmail.com"
    },
    {
        id: "job-2",
        title: "Heavy Bus Driver",
        company: "Oman National Transport Co.",
        category: "driving",
        location: "Salalah, Oman",
        salary: "OMR 250 - 300",
        type: "Full-Time",
        posterName: "Mr. Maqdoom Pash",
        contactEmail: "president@bgooman.org",
        postedBy: "Mr. Maqdoom Pash",
        postedDate: "2026-07-18",
        status: "approved",
        description: "Urgent vacancy for Heavy Bus Drivers with a valid Omani driving license (heavy vehicle category). Experience in passenger transport is preferred. Free accommodation and medical insurance provided.",
        contact: "president@bgooman.org"
    },
    {
        id: "job-3",
        title: "Staff Nurse (ICU)",
        company: "Badr Al Samaa Group of Hospitals",
        category: "healthcare",
        location: "Muscat, Oman",
        salary: "OMR 450 - 550",
        type: "Full-Time",
        posterName: "Mr. Abdul Khadar Jaina",
        contactEmail: "khader.meengg@gmail.com",
        postedBy: "Mr. Abdul Khadar Jaina",
        postedDate: "2026-07-17",
        status: "approved",
        description: "Badr Al Samaa is hiring Staff Nurses for the ICU ward. Candidate must have a OMSB (Oman Prometric) pass certificate and Ministry of Health (MOH) license/evaluation. Minimum 2 years of ICU experience required.",
        contact: "Khader.meengg@gmail.com"
    }
];

const SEED_MEDICAL_REQUESTS = [
    {
        id: "med-1",
        patientName: "Syed Abdul Rahman",
        bloodGroup: "O+",
        hospital: "Sultan Qaboos University Hospital",
        location: "Muscat, Oman",
        requiredUnits: 3,
        urgency: "Urgent",
        contactNumber: "+968 9603 9848",
        reason: "Scheduled Heart Surgery on July 22nd. Family is looking for volunteer blood donors.",
        status: "open",
        postedDate: "2026-07-18"
    },
    {
        id: "med-2",
        patientName: "Mohammed Farhan",
        bloodGroup: "B-",
        hospital: "Khasab Hospital",
        location: "Musandam, Oman",
        requiredUnits: 2,
        urgency: "Critical",
        contactNumber: "+968 9826 7323",
        reason: "Emergency post-accident treatment. Musandam blood bank has shortage of B negative group.",
        status: "open",
        postedDate: "2026-07-19"
    }
];

const SEED_NEWS = [
    {
        id: "news-1",
        title: "New Oman Visa Rules & Regulations for Family Status",
        summary: "Sultanate of Oman announces simplified requirements for expatriate family joining visas.",
        content: "Royal Oman Police has revised the salary thresholds and criteria for family residence visas. Expatriates seeking to bring their families to Oman will now find revised conditions that facilitate integration. Bahmani Group is hosting an online consultation session for Gulbarga residents seeking clarity on visa applications.",
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800",
        date: "2026-07-14",
        category: "Announcements"
    },
    {
        id: "news-2",
        title: "Kalaburagi Airport Expands Connections to Hubs",
        summary: "Airport in Gulbarga set to introduce direct routes to major hubs in India, improving Oman travel options.",
        content: "Travelers from Gulbarga residing in Oman will have easier flights back home. New airline deals are being finalized to operate flights connecting Kalaburagi with Mumbai and Hyderabad, which have direct flights to Muscat. This reduces total travel time for expats significantly.",
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800",
        date: "2026-07-10",
        category: "Gulbarga News"
    }
];

const SEED_EVENTS = [
    {
        id: "event-1",
        title: "Annual Gulbarga Community Meet 2026",
        date: "2026-08-14",
        time: "6:00 PM - 10:00 PM",
        location: "Al Masa Hall, Ruwi, Muscat",
        venue: "Al Masa Hall, Ruwi",
        description: "Join the BGO EXCOM Team for our annual community dinner and cultural evening. This event aims to bring together all residents of Kalaburagi living in Oman. Free registration for family members. Traditional foods will be served.",
        registeredCount: 145,
        status: "upcoming",
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "event-2",
        title: "Free Healthcare & Medical Screening Camp",
        date: "2026-07-28",
        time: "8:00 AM - 1:00 PM",
        location: "Badr Al Samaa Clinic, Ruwi",
        venue: "Badr Al Samaa Clinic, Ruwi",
        description: "BGO in partnership with medical volunteers is organizing a free health checkup camp for our community. Includes basic sugar, blood pressure checks, and doctor consultations. Specially dedicated to workers in the construction sector.",
        registeredCount: 68,
        status: "upcoming",
        image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800"
    }
];

const SEED_GALLERY = [
    {
        id: "gal-fort-mosque",
        title: "Historical Gulbarga Fort Mosque (Jama Masjid)",
        category: "Community Events",
        type: "photo",
        imageUrl: "assets/Gulbarga%20Fort%20Mosque.jpg"
    },
    {
        id: "gal-agm-2025",
        title: "BGO Annual General Meeting 2025",
        category: "Community Events",
        type: "photo",
        imageUrl: "assets/annual_general_meeting_2025.jpeg"
    },
    {
        id: "gal-agm-2026-1",
        title: "BGO Executive Council & Annual General Assembly 2026",
        category: "Community Events",
        type: "photo",
        imageUrl: "assets/annual_general_meeting_2026%20(1).jpeg"
    },
    {
        id: "gal-agm-2026-2",
        title: "BGO Leadership & Delegates Assembly 2026",
        category: "Community Events",
        type: "photo",
        imageUrl: "assets/annual_general_meeting_2026%20(2).jpeg"
    },
    {
        id: "gal-foundation-2025",
        title: "BGO Annual Foundation Celebrations 2025",
        category: "Family Gatherings",
        type: "photo",
        imageUrl: "assets/annual_foundation_2025.jpeg"
    },
    {
        id: "gal-bsl-2025-1",
        title: "Bahmani Super League Cricket Tournament 2025",
        category: "Sports Activities",
        type: "photo",
        imageUrl: "assets/bahmanisuperleague_2025.jpeg"
    },
    {
        id: "gal-bsl-2025-2",
        title: "Bahmani Super League Championship Ceremony 2025",
        category: "Sports Activities",
        type: "photo",
        imageUrl: "assets/bahmani_super_league_2025.jpeg"
    },
    {
        id: "gal-eid-2025",
        title: "BGO Eid Milan Community Celebration 2025",
        category: "Family Gatherings",
        type: "photo",
        imageUrl: "assets/eidmilan_2025.jpeg"
    },
    {
        id: "gal-blood-2025",
        title: "BGO Blood Donation Camp 2025, Oman",
        category: "Blood Donation Campaigns",
        type: "photo",
        imageUrl: "assets/blood_donation_camp_2025.jpeg"
    },
    {
        id: "gal-blood-2024",
        title: "BGO Humanitarian Blood Donation Camp 2024",
        category: "Blood Donation Campaigns",
        type: "photo",
        imageUrl: "assets/blood_donation_camp_2024.jpeg"
    },
    {
        id: "gal-blood-2024a",
        title: "BGO Community Blood Drive Phase A 2024",
        category: "Blood Donation Campaigns",
        type: "photo",
        imageUrl: "assets/blood_donation_camp_2024a.jpeg"
    },
    {
        id: "gal-sohar-2025",
        title: "BGO Sohar Chapter General Body Meeting 2025",
        category: "Social Support Activities",
        type: "photo",
        imageUrl: "assets/general_meeting_sohar_2025.jpeg"
    },
    {
        id: "gal-memento-2026",
        title: "BGO Memento of Appreciation & Honors 2026",
        category: "Welfare Programs",
        type: "photo",
        imageUrl: "assets/memento_of_appreciation_2026.jpeg"
    },
    {
        id: "gal-1",
        title: "Annual Community Dinner & Cultural Meet",
        category: "Family Gatherings",
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: "gal-3",
        title: "Job Placement Seminar & Career Guidance",
        category: "Social Support Activities",
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600"
    }
];

const SEED_HELPLINE_INFO = {
    title: "Need Immediate Assistance?",
    description: "If you are facing a medical emergency, legal issue, job crisis, or require urgent document transfer, reach out to our support team instantly.",
    instructions: "For extreme hospital emergency, send an email to our emergency response team or call directly. Helpline emails are monitored 24/7.",
    contacts: [
        { id: "hlc-2", name: "Mr. Abdul Khadar Jaina", role: "Emergency Coordinator", phone: "+968 9603 9848", email: "khader.meengg@gmail.com", isPrimary: true },
        { id: "hlc-3", name: "Minaj", role: "Immediate Support", phone: "+968 9826 7323", email: "bahmanigroupoman@gmail.com", isPrimary: false },
        { id: "hlc-4", name: "Mr. Mohammed Imran", role: "Immediate Support", phone: "+968 7138 4656", email: "bahmanigroupoman@gmail.com", isPrimary: false }
    ]
};

const SEED_HELPLINE_REQUESTS = [
    {
        id: "hlreq-101",
        name: "Mohammed Zameer",
        phone: "+968 9811 2233",
        type: "Medical Emergency",
        status: "pending",
        requestedAt: "2026-07-27 10:15 AM",
        details: "Requires urgent blood donor B+ for surgical procedure at Royal Hospital Muscat."
    },
    {
        id: "hlreq-102",
        name: "Feroz Khan",
        phone: "+968 9744 5566",
        type: "Job Crisis Support",
        status: "resolved",
        requestedAt: "2026-07-27 04:30 PM",
        details: "Labour dispute advice requested regarding visa cancellation."
    }
];

const SEED_EVENT_POLLS = [
    {
        id: "epoll-101",
        eventId: "evt-1",
        username: "user123",
        memberName: "Mohammed Zameer",
        mobile: "+968 9811 2233",
        status: "family",
        familyCount: 3,
        respondedAt: "2026-07-28 02:15 PM"
    },
    {
        id: "epoll-102",
        eventId: "evt-1",
        username: "khalid_bgo",
        memberName: "Khalid Ahmed",
        mobile: "+968 9912 3456",
        status: "alone",
        familyCount: 0,
        respondedAt: "2026-07-28 05:40 PM"
    },
    {
        id: "epoll-103",
        eventId: "evt-1",
        username: "tariq_gulbarga",
        memberName: "Tariq Mahmood",
        mobile: "+968 9455 6677",
        status: "not_attending",
        familyCount: 0,
        respondedAt: "2026-07-29 09:10 AM"
    }
];

const SEED_PROFILE_UPDATE_REQUESTS = [
    {
        id: "pur-101",
        username: "user123",
        memberName: "Mohammed Zameer",
        mobile: "+968 9811 2233",
        requestDate: "2026-07-28 11:30 AM",
        status: "pending",
        oldData: {
            profession: "Mechanical Engineer",
            city: "Muscat"
        },
        newData: {
            profession: "Senior Operations Director",
            city: "Ruwi, Muscat"
        },
        rejectionReason: "",
        processedBy: "",
        processedAt: ""
    }
];

const SEED_EMAIL_RECIPIENTS = [
    { id: "emlr-1", name: "Badiuddin Adil", email: "badiuddinadil@gmail.com", role: "Super Admin System Director" },
    { id: "emlr-2", name: "Mohammed Tabrez", email: "mohammedtabrez.ehs@gmail.com", role: "Admin Coordinator" },
    { id: "emlr-3", name: "Mr. Maqdoom Pash", email: "maqdoomp@gmail.com", role: "Executive President" },
    { id: "emlr-4", name: "Mr. Abdul Khadar Jaina", email: "Khader.meengg@gmail.com", role: "Emergency Coordinator" }
];

const SEED_EMAIL_LOGS = [
    {
        id: "EML-1001",
        timestamp: "2026-08-09T18:30:00Z",
        toEmail: "badiuddinadil@gmail.com",
        toName: "Badiuddin Adil",
        category: "System Initialization & Security",
        subject: "Secure Email Delivery & Dispatch Engine Online",
        body: "All automated OTP verifications, password resets, member registration approvals, profile update verifications, emergency help requests, event RSVPs, job postings, and certificates are now dispatched via secure Email Engine with complete delivery logging.",
        status: "DELIVERED ✅"
    },
    {
        id: "EML-1002",
        timestamp: "2026-08-09T19:15:00Z",
        toEmail: "mohammedtabrez.ehs@gmail.com",
        toName: "Mohammed Tabrez",
        category: "Member Registration Review",
        subject: "New Member Registration Submitted: @user123",
        body: "New member registration for Mohammed Zameer (Ruwi, Muscat) has been submitted and is pending administrative review.",
        status: "DELIVERED ✅"
    }
];

const SEED_EXECUTIVE_MANAGEMENT = [
    { id: "execm-1", roleTitle: "Founder Member and Former President", name: "Mr. Shadab Ahmed", photoUrl: "", region: "Muscat" },
    { id: "execm-2", roleTitle: "President", name: "Mr. Maqdoom Pash", photoUrl: "https://media.licdn.com/dms/image/v2/C4E03AQHRSpY8lIPbvA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1659426757135?e=1786579200&v=beta&t=YgCqklZUv6mcwIQ2L0xFmtdupCumMSo1C7ygrAiyWjk", region: "Muscat" },
    { id: "execm-3", roleTitle: "Vice President", name: "Mr. Parvez Khan", photoUrl: "", region: "Muscat" },
    { id: "execm-4", roleTitle: "Vice President", name: "Mr. Abdul Khader Jaina", photoUrl: "https://media.licdn.com/dms/image/v2/D4D03AQG-dUePHqP51g/profile-displayphoto-scale_400_400/B4DZ9Gc8i6JQAo-/0/1783593422387?e=1787788800&v=beta&t=CFg2lt26Ks1S-PPB3PjrJPNKgEG8RgXp5L8b_ZSa2fk", region: "Muscat" },
    { id: "execm-5", roleTitle: "General Secretary", name: "Mr. Syed Faraaz", photoUrl: "https://media.licdn.com/dms/image/v2/D4D03AQGZu0CDwGZRMw/profile-displayphoto-scale_400_400/B4DZu5XUWeKYAg-/0/1768341461123?e=1787788800&v=beta&t=F1ctJaCHMPrN-ZOezVZG6vgGVGek7ofo2b7Dv5tBCF4", region: "Muscat" },
    { id: "execm-6", roleTitle: "Joint Secretary", name: "Mr. Abdul Nazeer", photoUrl: "https://media.licdn.com/dms/image/v2/D4D03AQEVCne_bdKh5A/profile-displayphoto-scale_400_400/B4DZx_X7gRJEAg-/0/1771663511591?e=1787788800&v=beta&t=54ehWqhFA0Er5vZ9TWSfORdgrB4xjuFG1JcLafUMl38", region: "Muscat" },
    { id: "execm-7", roleTitle: "Treasurer", name: "Mr. Basheer Anwar", photoUrl: "https://media.licdn.com/dms/image/v2/D5603AQGZJSFXNCnPAw/profile-displayphoto-shrink_400_400/B56ZTTxfUWGUAs-/0/1738719757884?e=1787788800&v=beta&t=ZAcyMUxp7W4pebTJYp8zf0sqn5TgdNrnZUk5cQc5alc", region: "Muscat" },
    { id: "execm-8", roleTitle: "Joint Treasurer", name: "Mr. Shoeb Ur Rahman", photoUrl: "https://media.licdn.com/dms/image/v2/D4E35AQHKWwqmeL1oCw/profile-framedphoto-shrink_400_400/B4EZkgJYchGoAc-/0/1757180954651?e=1786564800&v=beta&t=kbvJOv9gTwuiPAdqxKCRtk2-cUUXjBuwc0BMJvXnJ6U", region: "Muscat" },
    { id: "execm-9", roleTitle: "Fund Raiser", name: "Mr. Mohammed Feroz", photoUrl: "https://media.licdn.com/dms/image/v2/C4E03AQEcDB7k-C7Ffg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1593621191399?e=1787788800&v=beta&t=U6MMSKfA6p0vq2TDLBXHhylF2VIqXr2IHI29Puw-bJg", region: "Muscat" },
    { id: "execm-10", roleTitle: "Chief Advisor", name: "Mr. Syed Ashaq Ahmed", photoUrl: "", region: "Muscat" },
    { id: "execm-11", roleTitle: "Executive Committee Member", name: "Mr. Md Rizwan Patel", photoUrl: "https://media.licdn.com/dms/image/v2/D4D35AQG6sSi5m1lx2Q/profile-framedphoto-shrink_400_400/B4DZpVtUBtJMAc-/0/1762374533501?e=1786564800&v=beta&t=bGNXmnO6EYPr4GMy-hgGISY4TE6ZD6Za1QxcjLbl5Ek", region: "Muscat" },
    { id: "execm-12", roleTitle: "Executive Committee Member", name: "Mr. Minhaj Ikram", photoUrl: "https://scontent.fohs1-1.fna.fbcdn.net/v/t1.6435-9/32416550_1708722499205812_6511750662227755008_n.jpg?stp=c0.106.960.960a_dst-jpg_tt6&cstp=mx960x960&ctp=s565x565&_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=38WzQRmc4zYQ7kNvwHS-nMS&_nc_oc=Ado4aRphnba3MXkyFqNDw_l2U72ao2R6Uad09MJBylc8FRnq6axhAoB6BFtWMjDYFoA&_nc_zt=23&_nc_ht=scontent.fohs1-1.fna&_nc_gid=DaFjOycs3sm58apr8JHztQ&_nc_ss=7b2a8&oh=00_AQHYkex0xpd8XXy5-Ut7FdPjaJH1lCr9JPOwPo_yOCIleg&oe=6A9B18A9", region: "Muscat" },
    { id: "execm-13", roleTitle: "Executive Committee Member", name: "Mr. Syed Fasee", photoUrl: "https://media.licdn.com/dms/image/v2/D4D03AQFRZzyyaJh89A/profile-displayphoto-shrink_800_800/B4DZZSS1y8HAAg-/0/1745137393279?e=1788393600&v=beta&t=-8NrSITkGbaeGHh3s74s3KXN2SVaKrX7UqwF_Ga3uBw", region: "Muscat" },
    { id: "execm-14", roleTitle: "Regional Head", name: "Mr. Mohammed Tabrez", photoUrl: "https://media.licdn.com/dms/image/v2/D4D03AQGVFwTMirt9JQ/profile-displayphoto-scale_400_400/B4DZ0.oJmWJMAg-/0/1774872208542?e=1786579200&v=beta&t=nzMSM0nD9AFBK_lEiuVZCCBpF8MX0yucOQBLFomCzZA", region: "Sohar Al Batina Region" }
];

const SEED_EXECUTIVE_PERMISSIONS = {
    viewMembers: true,
    viewProfiles: true,
    viewRequests: true,
    viewVolunteers: true
};

const SEED_TRAVEL_INFO = [
    {
        id: "trv-1001",
        username: "member",
        memberName: "Syed Khan",
        mobile: "+968 9912 3456",
        whatsapp: "+968 9912 3456",
        travelDate: "2026-08-25",
        travelTime: "10:30 AM",
        route: "Muscat to Gulbarga",
        flightDetails: "Oman Air WY 201 via Hyderabad / Direct Train",
        remarks: "Traveling to Gulbarga for annual leave. Can assist in carrying urgent documents or emergency medical reports.",
        status: "active",
        createdAt: "15-Aug-2026 | 02:30 PM"
    },
    {
        id: "trv-1002",
        username: "executive",
        memberName: "Mr. Maqdoom Pash",
        mobile: "+968 9711 7360",
        whatsapp: "+968 9711 7360",
        travelDate: "2026-09-02",
        travelTime: "08:15 PM",
        route: "Gulbarga to Muscat",
        flightDetails: "IndiGo Flight via Mumbai to Muscat (MCT)",
        remarks: "Returning to Oman from Gulbarga. Available to deliver verified documents or small parcels.",
        status: "active",
        createdAt: "16-Aug-2026 | 11:00 AM"
    }
];

// Helper to check and initialize local storage
function dbInit() {
    // Database Versioning to force updates when seed changes
    const DB_VERSION = "v2.6";
    if (localStorage.getItem("bgo_db_version") !== DB_VERSION) {
        localStorage.removeItem("bgo_stats");
        localStorage.removeItem("bgo_jobs");
        localStorage.removeItem("bgo_medical_requests");
        localStorage.removeItem("bgo_news");
        localStorage.removeItem("bgo_events");
        localStorage.removeItem("bgo_event_polls");
        localStorage.removeItem("bgo_profile_update_requests");
        localStorage.removeItem("bgo_gallery");
        localStorage.removeItem("bgo_members");
        localStorage.removeItem("bgo_volunteers");
        localStorage.removeItem("bgo_transfers");
        localStorage.removeItem("bgo_helpline_info");
        localStorage.removeItem("bgo_helpline_requests");
        localStorage.removeItem("bgo_sms_recipients");
        localStorage.removeItem("bgo_executive_management");
        localStorage.removeItem("bgo_executive_permissions");
        localStorage.removeItem("bgo_email_recipients");
        localStorage.removeItem("bgo_audit_logs");
        localStorage.setItem("bgo_db_version", DB_VERSION);
    }

    if (!localStorage.getItem("bgo_executive_management")) {
        localStorage.setItem("bgo_executive_management", JSON.stringify(SEED_EXECUTIVE_MANAGEMENT));
    }
    if (!localStorage.getItem("bgo_stats")) {
        localStorage.setItem("bgo_stats", JSON.stringify(SEED_STATS));
    }
    if (!localStorage.getItem("bgo_jobs")) {
        localStorage.setItem("bgo_jobs", JSON.stringify(SEED_JOBS));
    }
    if (!localStorage.getItem("bgo_medical_requests")) {
        localStorage.setItem("bgo_medical_requests", JSON.stringify(SEED_MEDICAL_REQUESTS));
    }
    if (!localStorage.getItem("bgo_news")) {
        localStorage.setItem("bgo_news", JSON.stringify(SEED_NEWS));
    }
    if (!localStorage.getItem("bgo_events")) {
        localStorage.setItem("bgo_events", JSON.stringify(SEED_EVENTS));
    }
    if (!localStorage.getItem("bgo_event_polls")) {
        localStorage.setItem("bgo_event_polls", JSON.stringify(SEED_EVENT_POLLS));
    }
    if (!localStorage.getItem("bgo_profile_update_requests")) {
        localStorage.setItem("bgo_profile_update_requests", JSON.stringify(SEED_PROFILE_UPDATE_REQUESTS));
    }
    if (!localStorage.getItem("bgo_gallery")) {
        localStorage.setItem("bgo_gallery", JSON.stringify(SEED_GALLERY));
    }
    if (!localStorage.getItem("bgo_helpline_info")) {
        localStorage.setItem("bgo_helpline_info", JSON.stringify(SEED_HELPLINE_INFO));
    }
    if (!localStorage.getItem("bgo_helpline_requests")) {
        localStorage.setItem("bgo_helpline_requests", JSON.stringify(SEED_HELPLINE_REQUESTS));
    }
    if (!localStorage.getItem("bgo_email_recipients")) {
        localStorage.setItem("bgo_email_recipients", JSON.stringify(SEED_EMAIL_RECIPIENTS));
    }
    if (!localStorage.getItem("bgo_email_logs")) {
        localStorage.setItem("bgo_email_logs", JSON.stringify(SEED_EMAIL_LOGS));
    }
    if (!localStorage.getItem("bgo_executive_permissions")) {
        localStorage.setItem("bgo_executive_permissions", JSON.stringify(SEED_EXECUTIVE_PERMISSIONS));
    }
    if (!localStorage.getItem("bgo_executive_management")) {
        localStorage.setItem("bgo_executive_management", JSON.stringify(SEED_EXECUTIVE_MANAGEMENT));
    }
    if (!localStorage.getItem("bgo_travel_info")) {
        localStorage.setItem("bgo_travel_info", JSON.stringify(SEED_TRAVEL_INFO));
    }
    if (!localStorage.getItem("bgo_audit_logs")) {
        localStorage.setItem("bgo_audit_logs", JSON.stringify([]));
    }
    
    if (!localStorage.getItem("bgo_members")) {
        const seedMembers = [
            {
                memberId: "BGO20260001",
                username: "superadmin",
                password: "Badiuddin@123",
                fullName: "Badiuddin Adil",
                email: "badiuddinadil@gmail.com",
                mobile: "+968 9449 6331",
                whatsapp: "+968 9449 6331",
                role: "superadmin",
                status: "approved",
                registeredAt: "01-Jul-2026 | 09:00 AM",
                registrationDate: "01-Jul-2026 | 09:00 AM",
                city: "Sohar",
                profession: "System Director",
                company: "BGO Oman",
                nativePlace: "Gulbarga Town",
                bloodGroup: "B+",
                emergencyContact: "+91 99001 58875",
                maritalStatus: "single",
                dependentsCount: 0,
                spouseName: "",
                children: [],
                fatherName: "BGO",
                companyAddress: "Headquarters",
                workLocation: "Muscat",
                emergencyContactOman: { name: "Mohammed Tabrez", relationship: "Friend", phone: "+968 9527 9719" },
                emergencyContactIndia: { name: "Admin", relationship: "Support", phone: "+91 9482 111111" },
                volunteerInterest: false,
                volunteerAreas: [],
                volunteerSkills: ""
            },
            {
                memberId: "BGO20260002",
                username: "admin",
                password: "adminpassword",
                fullName: "Mohammed Tabrez",
                email: "mohammedtabrez.ehs@gmail.com",
                mobile: "+968 9527 9719",
                whatsapp: "+968 9527 9719",
                role: "admin",
                status: "approved",
                registeredAt: "10-Jul-2026 | 10:15 AM",
                registrationDate: "10-Jul-2026 | 10:15 AM",
                city: "Muscat",
                profession: "EXCOM Committee",
                company: "Bahmani Enterprises",
                nativePlace: "Gulbarga Town",
                bloodGroup: "O+",
                emergencyContact: "+91 9482 123456",
                maritalStatus: "married",
                dependentsCount: 3,
                spouseName: "Mrs. Tabrez",
                children: [{ name: "Imran Tabrez", birthYear: "2012" }],
                fatherName: "Mr. Abdul Raheem",
                companyAddress: "Ruwi Main St, Muscat",
                workLocation: "Muscat",
                emergencyContactOman: { name: "Mr. Maqdoom Pash", relationship: "Associate", phone: "+968 9711 7360" },
                emergencyContactIndia: { name: "Mr. Raheem", relationship: "Brother", phone: "+91 9482 123456" },
                volunteerInterest: true,
                volunteerAreas: ["HR & Career Support", "Fundraising & Community Support"],
                volunteerSkills: "Community leadership, HR management, career advisory"
            },
            {
                memberId: "BGO20260003",
                username: "executive",
                password: "executivepassword",
                fullName: "Mr. Maqdoom Pash",
                email: "president@bgooman.org",
                mobile: "+968 9711 7360",
                whatsapp: "+968 9711 7360",
                role: "executive",
                status: "approved",
                registeredAt: "12-Jul-2026 | 11:30 AM",
                registrationDate: "12-Jul-2026 | 11:30 AM",
                city: "Muscat",
                profession: "President",
                company: "BGO Oman",
                nativePlace: "Gulbarga Town",
                bloodGroup: "O+",
                emergencyContact: "+91 9482 654321",
                maritalStatus: "married",
                dependentsCount: 2,
                spouseName: "Mrs. Pash",
                children: [{ name: "Siddique Pash", birthYear: "2015" }],
                fatherName: "Mr. Mohammed Ali",
                companyAddress: "Al Masa St, Ruwi",
                workLocation: "Muscat",
                emergencyContactOman: { name: "Mr. Mohammed Tabrez", relationship: "Friend", phone: "+968 9527 9719" },
                emergencyContactIndia: { name: "Mr. Ali", relationship: "Brother", phone: "+91 9482 654321" },
                volunteerInterest: true,
                volunteerAreas: ["Event Management", "Sports Activities Coordination"],
                volunteerSkills: "Event coordination, community planning, sports management"
            },
            {
                memberId: "BGO20260004",
                username: "member",
                password: "memberpassword",
                fullName: "Syed khan",
                email: "member@bgooman.org",
                mobile: "+968 9912 3456",
                whatsapp: "+968 9912 3456",
                role: "member",
                status: "approved",
                registeredAt: "15-Jul-2026 | 02:45 PM",
                registrationDate: "15-Jul-2026 | 02:45 PM",
                city: "Muscat",
                profession: "Store Supervisor",
                company: "Lulu Hypermarket",
                nativePlace: "Shah Bazar, Gulbarga",
                bloodGroup: "B+",
                emergencyContact: "+91 9886 123456",
                maritalStatus: "single",
                dependentsCount: 0,
                spouseName: "",
                children: [],
                fatherName: "Syed Ghouse",
                companyAddress: "Darsait, Muscat",
                workLocation: "Muscat",
                emergencyContactOman: { name: "Minaj", relationship: "Friend", phone: "+968 9826 7323" },
                emergencyContactIndia: { name: "Syed Ghouse", relationship: "Father", phone: "+91 9886 123456" },
                volunteerInterest: false,
                volunteerAreas: [],
                volunteerSkills: ""
            }
        ];
        localStorage.setItem("bgo_members", JSON.stringify(seedMembers));
    }

    if (!localStorage.getItem("bgo_volunteers")) {
        const seedVols = [
            {
                id: "vol-seed-1",
                username: "admin",
                fullName: "EXCOM TEAM",
                mobile: "+968 9527 9719",
                city: "Muscat",
                expertise: "Community Leadership & Management",
                availability: "Flexible / On Call",
                languages: "English, Urdu, Kannada, Arabic",
                type: "Medical Support, Legal Guidance, HR Support",
                status: "approved"
            },
            {
                id: "vol-seed-2",
                username: "executive",
                fullName: "Mr. Maqdoom Pash",
                mobile: "+968 9711 7360",
                city: "Muscat",
                expertise: "Event Logistics & Administration",
                availability: "Weekends & Evenings",
                languages: "English, Urdu, Kannada",
                type: "Event Management, Sports Activities Coordination",
                status: "approved"
            }
        ];
        localStorage.setItem("bgo_volunteers", JSON.stringify(seedVols));
    }

    if (!localStorage.getItem("bgo_transfers")) {
        const seedTransfers = [
            {
                id: "trsf-seed-1",
                senderName: "Syed Tabrez Ahmed",
                contact: "+968 9912 3456",
                documentType: "Degree Certificate (Attested)",
                direction: "Oman to India",
                date: "2026-07-16",
                status: "processing",
                details: "Urgent handover required in Gulbarga for visa verification."
            }
        ];
        localStorage.setItem("bgo_transfers", JSON.stringify(seedTransfers));
    }

    if (!localStorage.getItem("bgo_profile_update_requests")) {
        localStorage.setItem("bgo_profile_update_requests", JSON.stringify([]));
    }

    if (!localStorage.getItem("bgo_event_polls")) {
        const seedPolls = [
            {
                id: "epoll-seed-1",
                eventId: "event-1",
                username: "executive",
                memberName: "Mr. Maqdoom Pash",
                mobile: "+968 9711 7360",
                status: "family",
                selectedFamilyMembers: [{ type: "Spouse", name: "Mrs. Pash", age: null }, { type: "Child", name: "Siddique Pash", birthYear: "2015", age: 11 }],
                additionalFamilyCount: 0,
                totalAttendees: 3,
                familyCount: 2,
                respondedAt: "14-Jul-2026 | 04:30 PM"
            }
        ];
        localStorage.setItem("bgo_event_polls", JSON.stringify(seedPolls));
    }
}

const BGO_DB = {
    // Audit log API
    addAuditLog(action, details) {
        const logs = this.getAuditLogs();
        let currentUserName = "Guest";
        try {
            const curUser = localStorage.getItem("bgo_current_user");
            if (curUser) {
                currentUserName = JSON.parse(curUser).username;
            }
        } catch (e) {}

        const newLog = {
            id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
            timestamp: new Date().toISOString(),
            user: currentUserName,
            action: action,
            details: details
        };
        logs.unshift(newLog);
        localStorage.setItem("bgo_audit_logs", JSON.stringify(logs));
        return newLog;
    },

    getAuditLogs() {
        let logs = JSON.parse(localStorage.getItem("bgo_audit_logs")) || [];
        let updated = false;
        logs.forEach(l => {
            if (l.details && l.details.includes("BGO Command")) {
                l.details = l.details.replace(/BGO Command/g, "Badiuddin Adil");
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem("bgo_audit_logs", JSON.stringify(logs));
        }
        return logs;
    },

    deleteAuditLog(id) {
        let logs = this.getAuditLogs();
        const target = logs.find(l => l.id === id);
        if (target) {
            logs = logs.filter(l => l.id !== id);
            localStorage.setItem("bgo_audit_logs", JSON.stringify(logs));
            this.addAuditLog("AUDIT_LOG_DELETE", `Super Admin deleted audit log entry (Action: ${target.action}, User: @${target.user}).`);
        }
    },

    deleteAuditLogs(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return;
        let logs = this.getAuditLogs();
        const initialCount = logs.length;
        logs = logs.filter(l => !ids.includes(l.id));
        const deletedCount = initialCount - logs.length;
        localStorage.setItem("bgo_audit_logs", JSON.stringify(logs));
        this.addAuditLog("AUDIT_LOG_BULK_DELETE", `Super Admin bulk deleted ${deletedCount} audit log entries.`);
    },

    clearAllAuditLogs() {
        localStorage.setItem("bgo_audit_logs", JSON.stringify([]));
        this.addAuditLog("AUDIT_LOG_CLEAR", `System Audit Logs completely cleared by Super Admin.`);
    },

    // Stats API
    getStats() {
        return JSON.parse(localStorage.getItem("bgo_stats"));
    },
    
    updateStats(newStats) {
        localStorage.setItem("bgo_stats", JSON.stringify(newStats));
        this.addAuditLog("STATS_UPDATE", `Updated homepage statistics array.`);
    },

    incrementStat(key) {
        const stats = this.getStats();
        const stat = stats.find(s => s.key === key);
        if (stat) {
            let valNum = parseInt(stat.value);
            if (!isNaN(valNum)) {
                stat.value = (valNum + 1) + (stat.value.includes("+") ? "+" : "");
            } else {
                stat.value = "1+";
            }
            localStorage.setItem("bgo_stats", JSON.stringify(stats));
        }
    },

    // Helpline Info API
    getHelplineInfo() {
        return JSON.parse(localStorage.getItem("bgo_helpline_info")) || SEED_HELPLINE_INFO;
    },

    saveHelplineInfo(info) {
        localStorage.setItem("bgo_helpline_info", JSON.stringify(info));
        this.addAuditLog("HELPLINE_INFO_UPDATE", `Updated helpline guidelines/descriptions.`);
    },

    addHelplineContact(contact) {
        const info = this.getHelplineInfo();
        const newContact = {
            id: "hlc-" + Date.now(),
            name: contact.name,
            role: contact.role,
            phone: contact.phone,
            email: contact.email || "",
            isPrimary: !!contact.isPrimary
        };
        info.contacts.push(newContact);
        this.saveHelplineInfo(info);
        this.addAuditLog("HELPLINE_CONTACT_ADD", `Added helpline contact ${contact.name} (${contact.phone}, Mail ID: ${contact.email || 'N/A'}).`);
        return newContact;
    },

    updateHelplineContact(id, updated) {
        const info = this.getHelplineInfo();
        const index = info.contacts.findIndex(c => c.id === id);
        if (index !== -1) {
            info.contacts[index] = { ...info.contacts[index], ...updated };
            this.saveHelplineInfo(info);
            this.addAuditLog("HELPLINE_CONTACT_UPDATE", `Updated helpline contact ${info.contacts[index].name}.`);
        }
    },

    deleteHelplineContact(id) {
        const info = this.getHelplineInfo();
        const contact = info.contacts.find(c => c.id === id);
        if (contact) {
            info.contacts = info.contacts.filter(c => c.id !== id);
            this.saveHelplineInfo(info);
            this.addAuditLog("HELPLINE_CONTACT_DELETE", `Deleted helpline contact ${contact.name}.`);
        }
    },

    // Helpline Assistance Call Requests API
    getHelplineRequests() {
        return JSON.parse(localStorage.getItem("bgo_helpline_requests")) || SEED_HELPLINE_REQUESTS;
    },

    addHelplineRequest(data) {
        const requests = this.getHelplineRequests();
        const newReq = {
            id: "hlreq-" + Math.floor(100 + Math.random() * 900),
            name: data.name,
            phone: data.phone,
            type: data.type,
            status: "pending",
            requestedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            details: data.details || `Assistance call request for ${data.type}`
        };
        requests.unshift(newReq);
        localStorage.setItem("bgo_helpline_requests", JSON.stringify(requests));
        this.addAuditLog("HELPLINE_REQUEST_ADD", `New helpline call request created by ${data.name} (${data.phone}) for ${data.type}.`);
        
        // Broadcast automated email alert to all designated Emergency Email Recipients
        this.broadcastEmergencyEmail({
            category: "Emergency Helpline Request",
            subject: `URGENT Helpline Assistance Request: ${data.name} (${data.phone})`,
            body: `Assalamu Alaikum Coordinator,\n\nA new Emergency Helpline Assistance Request (ID: ${newReq.id}) has been submitted on the BGO Portal.\n\nDetails:\n- Requester Name: ${data.name}\n- Contact Phone: ${data.phone}\n- Category of Help Needed: ${data.type}\n- Time Submitted: ${newReq.requestedAt}\n- Additional Remarks: ${newReq.details}\n\nPlease review and initiate response coordination as appropriate.`
        });

        return newReq;
    },

    updateHelplineRequestStatus(id, newStatus) {
        const requests = this.getHelplineRequests();
        const req = requests.find(r => r.id === id);
        if (req) {
            req.status = newStatus;
            localStorage.setItem("bgo_helpline_requests", JSON.stringify(requests));
            this.addAuditLog("HELPLINE_REQUEST_STATUS", `Helpline request ${id} status updated to ${newStatus}.`);
        }
    },

    deleteHelplineRequest(id) {
        let requests = this.getHelplineRequests();
        const req = requests.find(r => r.id === id);
        if (req) {
            requests = requests.filter(r => r.id !== id);
            localStorage.setItem("bgo_helpline_requests", JSON.stringify(requests));
            this.addAuditLog("HELPLINE_REQUEST_DELETE", `Deleted helpline call request ${id}.`);
        }
    },

    // Event Polling & Attendance API
    getEventPolls() {
        const raw = localStorage.getItem("bgo_event_polls");
        if (!raw) return [];
        try {
            return JSON.parse(raw) || [];
        } catch (e) {
            return [];
        }
    },

    getEventPollsByEvent(eventId) {
        const polls = this.getEventPolls();
        if (!eventId || eventId === "all") return polls;
        return polls.filter(p => p.eventId === eventId);
    },

    getMemberPollResponse(eventId, username) {
        const polls = this.getEventPolls();
        return polls.find(p => p.eventId === eventId && p.username === username);
    },

    saveEventPollResponse(data) {
        const polls = this.getEventPolls();
        const index = polls.findIndex(p => p.eventId === data.eventId && p.username.toLowerCase() === data.username.toLowerCase());
        
        const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        
        let totalAttendees = 0;
        if (data.status === "alone") {
            totalAttendees = 1;
        } else if (data.status === "family") {
            const familyListCount = (data.selectedFamilyMembers || []).length;
            const extraCount = parseInt(data.additionalFamilyCount, 10) || 0;
            totalAttendees = 1 + familyListCount + extraCount; // 1 (Member) + selected family + extra
        } else {
            totalAttendees = 0;
        }

        let record;
        if (index !== -1) {
            polls[index] = {
                ...polls[index],
                memberName: data.memberName,
                mobile: data.mobile,
                status: data.status,
                selectedFamilyMembers: data.selectedFamilyMembers || [],
                additionalFamilyCount: data.additionalFamilyCount || 0,
                totalAttendees: totalAttendees,
                familyCount: data.status === "family" ? (totalAttendees - 1) : 0,
                respondedAt: timestamp
            };
            record = polls[index];
        } else {
            record = {
                id: "epoll-" + Date.now(),
                eventId: data.eventId,
                username: data.username,
                memberName: data.memberName,
                mobile: data.mobile,
                status: data.status,
                selectedFamilyMembers: data.selectedFamilyMembers || [],
                additionalFamilyCount: data.additionalFamilyCount || 0,
                totalAttendees: totalAttendees,
                familyCount: data.status === "family" ? (totalAttendees - 1) : 0,
                respondedAt: timestamp
            };
            polls.unshift(record);
        }

        localStorage.setItem("bgo_event_polls", JSON.stringify(polls));

        // Synchronize Event registeredCount
        const events = this.getEvents();
        const event = events.find(e => e.id === data.eventId);
        if (event) {
            const eventPolls = polls.filter(p => p.eventId === data.eventId && p.status !== "not_attending");
            let totalHeadcount = 0;
            eventPolls.forEach(p => {
                totalHeadcount += (p.totalAttendees || (p.status === "alone" ? 1 : 1 + (p.familyCount || 0)));
            });
            event.registeredCount = totalHeadcount;
            localStorage.setItem("bgo_events", JSON.stringify(events));
        }

        this.addAuditLog("EVENT_POLL_SUBMIT", `Member ${data.memberName} (@${data.username}) submitted poll response for event ID ${data.eventId}: ${data.status.toUpperCase()} (Total Attendees: ${totalAttendees}).`);
        return record;
    },

    getEventPollStats(eventId) {
        const polls = this.getEventPollsByEvent(eventId);
        let aloneCount = 0;
        let familyRespCount = 0;
        let familyMembersCount = 0;
        let notAttendingCount = 0;

        polls.forEach(p => {
            if (p.status === "alone") {
                aloneCount++;
            } else if (p.status === "family") {
                familyRespCount++;
                familyMembersCount += (p.familyCount || 0);
            } else if (p.status === "not_attending") {
                notAttendingCount++;
            }
        });

        const totalExpectedHeadcount = aloneCount + familyRespCount + familyMembersCount;

        return {
            aloneCount,
            familyRespCount,
            familyMembersCount,
            notAttendingCount,
            totalExpectedHeadcount,
            totalResponses: polls.length
        };
    },

    deleteEventPoll(id) {
        let polls = this.getEventPolls();
        const poll = polls.find(p => p.id === id);
        if (poll) {
            polls = polls.filter(p => p.id !== id);
            localStorage.setItem("bgo_event_polls", JSON.stringify(polls));
            this.addAuditLog("EVENT_POLL_DELETE", `Deleted event poll response ID ${id}.`);
        }
    },

    // Member Profile Update & Approval Workflow API
    getProfileUpdateRequests() {
        return JSON.parse(localStorage.getItem("bgo_profile_update_requests")) || SEED_PROFILE_UPDATE_REQUESTS;
    },

    getProfileUpdateRequestsByMember(username) {
        const list = this.getProfileUpdateRequests();
        return list.filter(r => r.username === username);
    },

    getMemberProfileLockStatus(username) {
        const currentUser = typeof BGO_AUTH !== "undefined" ? BGO_AUTH.getCurrentUser() : null;
        if (currentUser && (currentUser.role === "superadmin" || currentUser.role === "admin")) {
            return { isLocked: false, remainingMs: 0, hours: 0, minutes: 0, seconds: 0, formattedTime: "", requestDate: "" };
        }

        const requests = this.getProfileUpdateRequestsByMember(username);
        if (!requests || requests.length === 0) {
            return { isLocked: false, remainingMs: 0, hours: 0, minutes: 0, seconds: 0, formattedTime: "", requestDate: "" };
        }

        let latestTime = 0;
        let latestReqDateStr = "";

        requests.forEach(r => {
            let t = r.requestTimestamp || r.createdAt;
            if (!t && r.requestDate) {
                const parsed = new Date(r.requestDate).getTime();
                if (!isNaN(parsed)) t = parsed;
            }
            if (typeof t === "string") {
                const parsed = new Date(t).getTime();
                if (!isNaN(parsed)) t = parsed;
            }
            if (typeof t === "number" && !isNaN(t) && t > latestTime) {
                latestTime = t;
                latestReqDateStr = r.requestDate || new Date(t).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
            }
        });

        if (!latestTime) {
            return { isLocked: false, remainingMs: 0, hours: 0, minutes: 0, seconds: 0, formattedTime: "", requestDate: "" };
        }

        const LOCK_DURATION_MS = 72 * 60 * 60 * 1000; // 72 hours (259,200,000 ms)
        const now = Date.now();
        const elapsed = now - latestTime;

        if (elapsed < LOCK_DURATION_MS) {
            const remainingMs = LOCK_DURATION_MS - elapsed;
            const hours = Math.floor(remainingMs / (1000 * 60 * 60));
            const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
            const formattedTime = `${hours} Hours ${minutes} Minutes ${seconds} Seconds`;
            return {
                isLocked: true,
                remainingMs,
                hours,
                minutes,
                seconds,
                formattedTime,
                requestDate: latestReqDateStr
            };
        }

        return { isLocked: false, remainingMs: 0, hours: 0, minutes: 0, seconds: 0, formattedTime: "", requestDate: "" };
    },

    createProfileUpdateRequest(username, oldData, newData) {
        const list = this.getProfileUpdateRequests();
        const member = this.getMembers().find(m => m.username === username);
        const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        const nowMs = Date.now();

        const newReq = {
            id: "pur-" + Math.floor(1000 + Math.random() * 9000),
            username: username,
            memberName: (member ? member.fullName : "") || newData.fullName || username,
            mobile: newData.mobile || (member ? member.mobile : "N/A"),
            requestDate: timestamp,
            requestTimestamp: nowMs,
            createdAt: nowMs,
            status: "pending",
            oldData: oldData,
            newData: newData,
            rejectionReason: "",
            processedBy: "",
            processedAt: ""
        };

        list.unshift(newReq);
        localStorage.setItem("bgo_profile_update_requests", JSON.stringify(list));
        this.addAuditLog("PROFILE_UPDATE_REQUEST", `Member ${newReq.memberName} (@${username}) submitted a profile update request (ID: ${newReq.id}) for admin review.`);
        
        // 1. Notify Super Admin
        this.sendEmailNotification({
            toEmail: "badiuddinadil@gmail.com",
            toName: "BGO Super Admin",
            category: "Profile Update Request",
            subject: `Pending Profile Update: Member @${username} (${newReq.memberName})`,
            body: `Assalamu Alaikum Super Admin,\n\nMember @${username} (${newReq.memberName}) has submitted a complete profile information update request (ID: ${newReq.id}) pending Administrator verification.\n\nSummary of Requested Updates:\n- Full Name: ${newData.fullName}\n- City: ${newData.city}\n- Mobile: ${newData.mobile}\n- Profession: ${newData.profession}\n- Native Place: ${newData.nativePlace}\n\nPlease review and process this request in the Admin Panel.`
        });

        // 2. Notify Admin
        this.sendEmailNotification({
            toEmail: "mohammedtabrez.ehs@gmail.com",
            toName: "Mohammed Tabrez (Admin)",
            category: "Profile Update Request",
            subject: `Pending Profile Update: Member @${username} (${newReq.memberName})`,
            body: `Assalamu Alaikum Admin,\n\nMember @${username} (${newReq.memberName}) has submitted a complete profile information update request (ID: ${newReq.id}) pending Administrator verification.`
        });

        // 3. Acknowledge Member
        const targetMemberEmail = newData.email || (member ? member.email : "");
        if (targetMemberEmail) {
            this.sendEmailNotification({
                toEmail: targetMemberEmail,
                toName: newReq.memberName,
                category: "Profile Update Submission Acknowledgment",
                subject: `Profile Update Request Received (ID: ${newReq.id})`,
                body: `Assalamu Alaikum ${newReq.memberName},\n\nYour profile information update request (ID: ${newReq.id}) has been received and is currently in Pending Approval status for BGO Administrator review.\n\nYou will receive a notification once your proposed changes are approved and synchronized.`
            });
        }

        return newReq;
    },

    approveProfileUpdateRequest(requestId, adminUsername) {
        const list = this.getProfileUpdateRequests();
        const req = list.find(r => r.id === requestId);
        if (req && req.status === "pending") {
            const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
            req.status = "approved";
            req.processedBy = adminUsername;
            req.processedAt = timestamp;

            // Apply newData to Member Profile
            const updatedMember = this.updateMemberProfile(req.username, req.newData);

            localStorage.setItem("bgo_profile_update_requests", JSON.stringify(list));
            this.addAuditLog("PROFILE_UPDATE_APPROVE", `Admin @${adminUsername} approved profile update request ${requestId} for member @${req.username}.`);
            
            // Notify Member of Approval
            const memberEmail = req.newData.email || (updatedMember ? updatedMember.email : "");
            if (memberEmail) {
                this.sendEmailNotification({
                    toEmail: memberEmail,
                    toName: req.memberName,
                    category: "Profile Update Approved",
                    subject: `Profile Information Update Approved (ID: ${requestId})`,
                    body: `Assalamu Alaikum ${req.memberName},\n\nYour profile information update request (ID: ${requestId}) has been APPROVED by Administrator @${adminUsername}.\n\nYour member records, contact information, children details, and directory profile have been synchronized successfully across Bahmani Group Oman.`
                });
            }
            return req;
        }
        return null;
    },

    rejectProfileUpdateRequest(requestId, adminUsername, reason) {
        const list = this.getProfileUpdateRequests();
        const req = list.find(r => r.id === requestId);
        if (req && req.status === "pending") {
            const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
            req.status = "rejected";
            req.rejectionReason = reason || "Request does not meet verification guidelines.";
            req.processedBy = adminUsername;
            req.processedAt = timestamp;

            localStorage.setItem("bgo_profile_update_requests", JSON.stringify(list));
            this.addAuditLog("PROFILE_UPDATE_REJECT", `Admin @${adminUsername} rejected profile update request ${requestId} for member @${req.username}. Reason: ${req.rejectionReason}`);
            
            // Notify Member of Rejection
            const member = this.getMembers().find(m => m.username === req.username);
            const memberEmail = req.newData.email || (member ? member.email : "");
            if (memberEmail) {
                this.sendEmailNotification({
                    toEmail: memberEmail,
                    toName: req.memberName,
                    category: "Profile Update Rejected",
                    subject: `Profile Update Request Status (ID: ${requestId})`,
                    body: `Assalamu Alaikum ${req.memberName},\n\nYour profile information update request (ID: ${requestId}) was REJECTED by Administrator @${adminUsername}.\n\nReason: ${req.rejectionReason}\n\nIf you have any questions, please contact system administration.`
                });
            }
            return req;
        }
        return null;
    },

    editAndApproveProfileUpdateRequest(requestId, adminUsername, editedNewData) {
        const list = this.getProfileUpdateRequests();
        const req = list.find(r => r.id === requestId);
        if (req && req.status === "pending") {
            const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
            req.newData = { ...req.newData, ...editedNewData };
            req.status = "approved";
            req.processedBy = adminUsername;
            req.processedAt = timestamp;

            // Apply edited newData to Member Profile
            const updatedMember = this.updateMemberProfile(req.username, req.newData);

            localStorage.setItem("bgo_profile_update_requests", JSON.stringify(list));
            this.addAuditLog("PROFILE_UPDATE_EDIT_APPROVE", `Admin @${adminUsername} edited and approved profile update request ${requestId} for member @${req.username}.`);
            
            // Notify Member of Approval
            const memberEmail = req.newData.email || (updatedMember ? updatedMember.email : "");
            if (memberEmail) {
                this.sendEmailNotification({
                    toEmail: memberEmail,
                    toName: req.memberName,
                    category: "Profile Update Approved",
                    subject: `Profile Information Update Approved (ID: ${requestId})`,
                    body: `Assalamu Alaikum ${req.memberName},\n\nYour profile information update request (ID: ${requestId}) has been EDITED and APPROVED by Administrator @${adminUsername}.\n\nYour member records have been synchronized successfully.`
                });
            }
            return req;
        }
        return null;
    },

    deleteProfileUpdateRequest(requestId) {
        let list = this.getProfileUpdateRequests();
        const req = list.find(r => r.id === requestId);
        if (req) {
            list = list.filter(r => r.id !== requestId);
            localStorage.setItem("bgo_profile_update_requests", JSON.stringify(list));
            this.addAuditLog("PROFILE_UPDATE_DELETE", `Deleted profile update request ${requestId}.`);
        }
    },

    // Email Notification Recipients & Emergency Alert Broadcast API
    getEmailRecipients() {
        let list = JSON.parse(localStorage.getItem("bgo_email_recipients")) || SEED_EMAIL_RECIPIENTS;
        let updated = false;
        list.forEach(r => {
            if (r.email === "badiuddinadil@gmail.com" && (r.name === "BGO Command" || r.name === "BGO Super Admin")) {
                r.name = "Badiuddin Adil";
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem("bgo_email_recipients", JSON.stringify(list));
        }
        return list;
    },

    addEmailRecipient(recipient) {
        const list = this.getEmailRecipients();
        const newRec = {
            id: "emlr-" + Date.now(),
            name: recipient.name,
            email: recipient.email,
            role: recipient.role || "Emergency Coordinator"
        };
        list.push(newRec);
        localStorage.setItem("bgo_email_recipients", JSON.stringify(list));
        this.addAuditLog("EMAIL_RECIPIENT_ADD", `Added Email notification recipient ${recipient.name} (${recipient.email}).`);
        return newRec;
    },

    updateEmailRecipient(id, updated) {
        const list = this.getEmailRecipients();
        const index = list.findIndex(r => r.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updated };
            localStorage.setItem("bgo_email_recipients", JSON.stringify(list));
            this.addAuditLog("EMAIL_RECIPIENT_UPDATE", `Updated Email notification recipient ${list[index].name} (${list[index].email}).`);
        }
    },

    deleteEmailRecipient(id) {
        let list = this.getEmailRecipients();
        const item = list.find(r => r.id === id);
        if (item) {
            list = list.filter(r => r.id !== id);
            localStorage.setItem("bgo_email_recipients", JSON.stringify(list));
            this.addAuditLog("EMAIL_RECIPIENT_DELETE", `Removed Email recipient ${item.name} (${item.email}).`);
        }
    },

    broadcastEmergencyEmail({ category, subject, body }) {
        const recipients = this.getEmailRecipients();
        if (Array.isArray(recipients)) {
            recipients.forEach(r => {
                if (r.email) {
                    this.sendEmailNotification({
                        toEmail: r.email,
                        toName: r.name || r.role || "Emergency Coordinator",
                        category: category || "Emergency Alert Broadcast",
                        subject: subject,
                        body: body
                    });
                }
            });
        }
    },

    // System Email Delivery Logs & Audit Trail API
    getEmailLogs() {
        return JSON.parse(localStorage.getItem("bgo_email_logs")) || SEED_EMAIL_LOGS;
    },

    sendEmailNotification({ toEmail, toName, category, subject, body }) {
        const logs = this.getEmailLogs();
        const nowStr = new Date().toISOString();
        const logEntry = {
            id: "EML-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
            timestamp: nowStr,
            toEmail: toEmail || "khader.meengg@gmail.com",
            toName: toName || toEmail || "BGO Member",
            category: category || "General System Notification",
            subject: subject || "BGO Notification",
            body: body || "",
            status: "DELIVERED ✅"
        };
        logs.unshift(logEntry); // Most recent log first
        if (logs.length > 300) logs.pop(); // Keep max 300 logs
        localStorage.setItem("bgo_email_logs", JSON.stringify(logs));
        this.addAuditLog("EMAIL_DISPATCH", `Email notification [${category}] dispatched to ${logEntry.toEmail} (${logEntry.toName}). Subject: "${subject}".`);
        return logEntry;
    },

    deleteEmailLog(id) {
        let logs = this.getEmailLogs();
        const target = logs.find(l => l.id === id);
        if (target) {
            logs = logs.filter(l => l.id !== id);
            localStorage.setItem("bgo_email_logs", JSON.stringify(logs));
            this.addAuditLog("EMAIL_LOG_DELETE", `Super Admin deleted email log entry (ID: ${target.id}, Subject: "${target.subject}", To: ${target.toEmail}).`);
        }
    },

    deleteEmailLogs(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return;
        let logs = this.getEmailLogs();
        const initialCount = logs.length;
        logs = logs.filter(l => !ids.includes(l.id));
        const deletedCount = initialCount - logs.length;
        localStorage.setItem("bgo_email_logs", JSON.stringify(logs));
        this.addAuditLog("EMAIL_LOG_BULK_DELETE", `Super Admin bulk deleted ${deletedCount} email log entries.`);
    },

    clearAllEmailLogs() {
        localStorage.setItem("bgo_email_logs", JSON.stringify([]));
        this.addAuditLog("EMAIL_LOG_CLEAR", `System Email Logs completely cleared by Super Admin.`);
    },

    // Executive Permissions API
    getExecutivePermissions() {
        return JSON.parse(localStorage.getItem("bgo_executive_permissions")) || SEED_EXECUTIVE_PERMISSIONS;
    },

    saveExecutivePermissions(perms) {
        localStorage.setItem("bgo_executive_permissions", JSON.stringify(perms));
        this.addAuditLog("EXEC_PERMISSIONS_UPDATE", `Updated Executive permissions configurations.`);
    },

    // Executive Management Leadership API (Super Admin / Admin directory control)
    getExecutiveManagement() {
        const raw = localStorage.getItem("bgo_executive_management");
        if (!raw) {
            localStorage.setItem("bgo_executive_management", JSON.stringify(SEED_EXECUTIVE_MANAGEMENT));
            return SEED_EXECUTIVE_MANAGEMENT;
        }
        let list = JSON.parse(raw) || [];
        let updated = false;

        // Auto-heal any legacy "Muscat Central" entries to "Muscat"
        list.forEach(item => {
            if (item.region === "Muscat Central") {
                item.region = "Muscat";
                updated = true;
            }
        });

        // Ensure all seed executive management officers exist
        SEED_EXECUTIVE_MANAGEMENT.forEach(seedItem => {
            const exists = list.some(e => e.id === seedItem.id || e.name === seedItem.name);
            if (!exists) {
                list.push(seedItem);
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem("bgo_executive_management", JSON.stringify(list));
        }
        return list;
    },

    addExecutiveManagement(item) {
        const list = this.getExecutiveManagement();
        const newItem = {
            id: "execm-" + Date.now(),
            name: item.name,
            roleTitle: item.roleTitle,
            region: item.region || "Muscat",
            photoUrl: item.photoUrl || ""
        };
        list.push(newItem);
        localStorage.setItem("bgo_executive_management", JSON.stringify(list));
        this.addAuditLog("EXEC_MANAGEMENT_ADD", `Added Executive Management Officer "${item.name}" (${item.roleTitle}).`);
        return newItem;
    },

    updateExecutiveManagement(id, updated) {
        const list = this.getExecutiveManagement();
        const index = list.findIndex(e => e.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updated };
            localStorage.setItem("bgo_executive_management", JSON.stringify(list));
            this.addAuditLog("EXEC_MANAGEMENT_UPDATE", `Updated Executive Management Officer "${list[index].name}".`);
        }
    },

    deleteExecutiveManagement(id) {
        let list = this.getExecutiveManagement();
        const item = list.find(e => e.id === id);
        if (item) {
            list = list.filter(e => e.id !== id);
            localStorage.setItem("bgo_executive_management", JSON.stringify(list));
            this.addAuditLog("EXEC_MANAGEMENT_DELETE", `Removed Executive Management Officer "${item.name}".`);
        }
    },

    moveExecutiveManagement(id, direction) {
        const list = this.getExecutiveManagement();
        const index = list.findIndex(e => e.id === id);
        if (index === -1) return;
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < list.length) {
            const temp = list[index];
            list[index] = list[targetIndex];
            list[targetIndex] = temp;
            localStorage.setItem("bgo_executive_management", JSON.stringify(list));
            this.addAuditLog("EXEC_MANAGEMENT_REORDER", `Reordered Executive Management Officer "${temp.name}" (${direction.toUpperCase()}).`);
        }
    },

    // Travel Information API
    getTravelInfo() {
        const raw = localStorage.getItem("bgo_travel_info");
        if (!raw) {
            localStorage.setItem("bgo_travel_info", JSON.stringify(SEED_TRAVEL_INFO));
            return SEED_TRAVEL_INFO;
        }
        return JSON.parse(raw) || [];
    },

    addTravelInfo(travelData) {
        const list = this.getTravelInfo();
        const nowFormatted = this.formatRegistrationDate();
        const newEntry = {
            id: "trv-" + Date.now(),
            status: "active",
            createdAt: nowFormatted,
            ...travelData
        };
        list.unshift(newEntry);
        localStorage.setItem("bgo_travel_info", JSON.stringify(list));
        this.addAuditLog("TRAVEL_INFO_ADD", `Registered travel schedule for "${newEntry.memberName}" (${newEntry.route} on ${newEntry.travelDate}).`);
        return newEntry;
    },

    updateTravelInfo(id, updatedData) {
        const list = this.getTravelInfo();
        const index = list.findIndex(t => t.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updatedData };
            localStorage.setItem("bgo_travel_info", JSON.stringify(list));
            this.addAuditLog("TRAVEL_INFO_UPDATE", `Updated travel schedule ID "${id}".`);
        }
    },

    deleteTravelInfo(id) {
        let list = this.getTravelInfo();
        const entry = list.find(t => t.id === id);
        if (entry) {
            list = list.filter(t => t.id !== id);
            localStorage.setItem("bgo_travel_info", JSON.stringify(list));
            this.addAuditLog("TRAVEL_INFO_DELETE", `Deleted travel entry for "${entry.memberName}".`);
        }
    },

    getTravelInfoByUser(username) {
        const list = this.getTravelInfo();
        return list.filter(t => t.username && t.username.toLowerCase() === String(username).toLowerCase());
    },

    // Executive Committee promote/demote
    promoteMember(username) {
        const members = this.getMembers();
        const member = members.find(m => m.username === username);
        if (member) {
            member.role = "executive";
            localStorage.setItem("bgo_members", JSON.stringify(members));
            this.addAuditLog("MEMBER_PROMOTE", `Promoted @${username} to Executive Committee.`);
        }
    },

    demoteMember(username) {
        const members = this.getMembers();
        const member = members.find(m => m.username === username);
        if (member) {
            member.role = "member";
            localStorage.setItem("bgo_members", JSON.stringify(members));
            this.addAuditLog("MEMBER_DEMOTE", `Demoted @${username} back to regular member status.`);
        }
    },

    // Jobs API
    getJobs() {
        const raw = localStorage.getItem("bgo_jobs");
        let jobs = raw ? JSON.parse(raw) : SEED_JOBS;
        let updated = false;
        const now = Date.now();

        jobs.forEach(j => {
            // For seed/approved jobs missing 15-day validity timestamp, assign 15-day validity
            if (j.status === "approved" && !j.expiryTimestamp) {
                j.approvalTimestamp = now;
                j.approvedAt = j.approvedAt || j.postedDate || new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
                j.expiryTimestamp = now + (15 * 24 * 60 * 60 * 1000);
                j.expiryDate = new Date(j.expiryTimestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
                updated = true;
            }

            // Auto Expiry Check: If approved and 15 days have passed since approval
            if (j.status === "approved" && j.expiryTimestamp && now > j.expiryTimestamp) {
                j.status = "expired";
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem("bgo_jobs", JSON.stringify(jobs));
        }
        return jobs;
    },
    
    addJob(jobData) {
        const jobs = this.getJobs();
        const nowMs = Date.now();
        const formattedDate = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        
        const newJob = {
            id: "job-" + Date.now(),
            postedDate: formattedDate,
            postedTimestamp: nowMs,
            status: "pending", // ALL newly submitted job vacancies remain Pending Approval
            approvalTimestamp: null,
            approvedAt: "",
            expiryTimestamp: null,
            expiryDate: "",
            rejectionReason: "",
            ...jobData
        };
        
        jobs.push(newJob);
        localStorage.setItem("bgo_jobs", JSON.stringify(jobs));
        this.addAuditLog("JOB_POST", `Job vacancy "${newJob.title}" posted by user @${newJob.postedBy} (Status: PENDING APPROVAL).`);
        return newJob;
    },
    
    approveJob(id) {
        const jobs = this.getJobs();
        const job = jobs.find(j => j.id === id);
        if (job) {
            const nowMs = Date.now();
            const expiryMs = nowMs + (15 * 24 * 60 * 60 * 1000); // 15 days validity
            const formatOptions = { dateStyle: 'medium', timeStyle: 'short' };

            job.status = "approved";
            job.approvalTimestamp = nowMs;
            job.approvedAt = new Date(nowMs).toLocaleString('en-US', formatOptions);
            job.expiryTimestamp = expiryMs;
            job.expiryDate = new Date(expiryMs).toLocaleString('en-US', formatOptions);
            job.rejectionReason = "";

            localStorage.setItem("bgo_jobs", JSON.stringify(jobs));
            this.incrementStat("jobsShared");
            this.addAuditLog("JOB_APPROVE", `Approved job vacancy "${job.title}" for 15 days validity (Expires: ${job.expiryDate}).`);

            // Email Notification to Job Poster
            const posterEmail = job.contactEmail || job.email;
            if (posterEmail) {
                this.sendEmailNotification({
                    toEmail: posterEmail,
                    toName: job.posterName || "Member",
                    category: "Job Vacancy Approval",
                    subject: `Job Vacancy Approved & Published: ${job.title}`,
                    body: `Assalamu Alaikum ${job.posterName || 'Member'},\n\nYour job vacancy post "${job.title}" at ${job.company} has been APPROVED by the BGO Administrator.\n\nIt is now live under Verified Job Opportunities for 15 days until ${job.expiryDate}.`
                });
            }
        }
    },

    rejectJob(id, reason = "") {
        const jobs = this.getJobs();
        const job = jobs.find(j => j.id === id);
        if (job) {
            job.status = "rejected";
            job.rejectionReason = reason || "Administrator Rejected Listing";
            localStorage.setItem("bgo_jobs", JSON.stringify(jobs));
            this.addAuditLog("JOB_REJECT", `Rejected job vacancy "${job.title}".`);
        }
    },

    extendJobValidity(id, days = 15) {
        const jobs = this.getJobs();
        const job = jobs.find(j => j.id === id);
        if (job) {
            const nowMs = Date.now();
            const baseMs = (job.expiryTimestamp && job.expiryTimestamp > nowMs) ? job.expiryTimestamp : nowMs;
            const newExpiryMs = baseMs + (days * 24 * 60 * 60 * 1000);
            const formatOptions = { dateStyle: 'medium', timeStyle: 'short' };

            job.status = "approved";
            job.expiryTimestamp = newExpiryMs;
            job.expiryDate = new Date(newExpiryMs).toLocaleString('en-US', formatOptions);

            localStorage.setItem("bgo_jobs", JSON.stringify(jobs));
            this.addAuditLog("JOB_EXTEND", `Extended job vacancy "${job.title}" validity by ${days} days (New Expiry: ${job.expiryDate}).`);
        }
    },
    
    updateJob(id, updated) {
        const jobs = this.getJobs();
        const index = jobs.findIndex(j => j.id === id);
        if (index !== -1) {
            jobs[index] = { ...jobs[index], ...updated };
            localStorage.setItem("bgo_jobs", JSON.stringify(jobs));
            this.addAuditLog("JOB_UPDATE", `Updated job listing "${jobs[index].title}".`);
        }
    },

    deleteJob(id) {
        let jobs = this.getJobs();
        const job = jobs.find(j => j.id === id);
        if (job) {
            jobs = jobs.filter(j => j.id !== id);
            localStorage.setItem("bgo_jobs", JSON.stringify(jobs));
            this.addAuditLog("JOB_DELETE", `Deleted job listing "${job.title}".`);
        }
    },

    // Medical API
    getMedicalRequests() {
        return JSON.parse(localStorage.getItem("bgo_medical_requests"));
    },
    
    addMedicalRequest(reqData) {
        const reqs = this.getMedicalRequests();
        const newReq = {
            id: "med-" + Date.now(),
            status: "open",
            postedDate: new Date().toISOString().split('T')[0],
            ...reqData
        };
        reqs.push(newReq);
        localStorage.setItem("bgo_medical_requests", JSON.stringify(reqs));
        this.addAuditLog("HELP_REQUEST_MEDICAL", `Emergency medical request submitted for patient "${newReq.patientName}".`);
        return newReq;
    },
    
    resolveMedicalRequest(id) {
        const reqs = this.getMedicalRequests();
        const req = reqs.find(r => r.id === id);
        if (req) {
            req.status = "resolved";
            localStorage.setItem("bgo_medical_requests", JSON.stringify(reqs));
            this.incrementStat("medicalCases");
            this.addAuditLog("HELP_REQUEST_RESOLVE_MED", `Resolved medical emergency case for patient "${req.patientName}".`);
        }
    },

    deleteMedicalRequest(id) {
        let reqs = this.getMedicalRequests();
        const req = reqs.find(r => r.id === id);
        if (req) {
            reqs = reqs.filter(r => r.id !== id);
            localStorage.setItem("bgo_medical_requests", JSON.stringify(reqs));
            this.addAuditLog("HELP_REQUEST_DELETE_MED", `Deleted medical request for patient "${req.patientName}".`);
        }
    },

    getNews() {
        return JSON.parse(localStorage.getItem("bgo_news"));
    },
    
    // Events CRUD API
    getEvents() {
        return JSON.parse(localStorage.getItem("bgo_events"));
    },

    addEvent(eventData) {
        const events = this.getEvents();
        const newEvent = {
            id: "event-" + Date.now(),
            registeredCount: 0,
            status: eventData.status || "upcoming",
            ...eventData
        };
        events.push(newEvent);
        localStorage.setItem("bgo_events", JSON.stringify(events));
        this.addAuditLog("EVENT_ADD", `Added new event "${newEvent.title}".`);
        return newEvent;
    },

    updateEvent(id, updated) {
        const events = this.getEvents();
        const index = events.findIndex(e => e.id === id);
        if (index !== -1) {
            events[index] = { ...events[index], ...updated };
            localStorage.setItem("bgo_events", JSON.stringify(events));
            this.addAuditLog("EVENT_UPDATE", `Updated event "${events[index].title}".`);
        }
    },

    deleteEvent(id) {
        let events = this.getEvents();
        const ev = events.find(e => e.id === id);
        if (ev) {
            events = events.filter(e => e.id !== id);
            localStorage.setItem("bgo_events", JSON.stringify(events));
            this.addAuditLog("EVENT_DELETE", `Deleted event "${ev.title}".`);
        }
    },
    
    registerForEvent(eventId) {
        const events = this.getEvents();
        const event = events.find(e => e.id === eventId);
        if (event) {
            event.registeredCount = (event.registeredCount || 0) + 1;
            localStorage.setItem("bgo_events", JSON.stringify(events));
            this.addAuditLog("EVENT_RSVP", `User registered RSVP for event "${event.title}".`);
            return event.registeredCount;
        }
        return 0;
    },
    
    // Gallery CRUD API
    getGallery() {
        const raw = localStorage.getItem("bgo_gallery");
        let items = raw ? JSON.parse(raw) : SEED_GALLERY;
        let updated = false;

        // Ensure all seed gallery items exist in database
        SEED_GALLERY.forEach(seedItem => {
            const exists = items.some(i => i.id === seedItem.id || i.imageUrl === seedItem.imageUrl);
            if (!exists) {
                items.push(seedItem);
                updated = true;
            }
        });

        // Ensure URL encodings for image paths with special characters/spaces
        items.forEach((item, idx) => {
            if (!item.imageUrl && item.image) {
                item.imageUrl = item.image;
                updated = true;
            }
            if (item.imageUrl) {
                if (item.imageUrl.includes("Gulbarga Fort Mosque.jpg")) {
                    item.imageUrl = item.imageUrl.replace("Gulbarga Fort Mosque.jpg", "Gulbarga%20Fort%20Mosque.jpg");
                    updated = true;
                }
                if (item.imageUrl.includes("annual_general_meeting_2026 (1).jpeg")) {
                    item.imageUrl = item.imageUrl.replace("annual_general_meeting_2026 (1).jpeg", "annual_general_meeting_2026%20(1).jpeg");
                    updated = true;
                }
                if (item.imageUrl.includes("annual_general_meeting_2026 (2).jpeg")) {
                    item.imageUrl = item.imageUrl.replace("annual_general_meeting_2026 (2).jpeg", "annual_general_meeting_2026%20(2).jpeg");
                    updated = true;
                }
            }
        });

        if (updated || !raw) {
            localStorage.setItem("bgo_gallery", JSON.stringify(items));
        }
        return items;
    },

    addGalleryItem(galleryData) {
        const items = this.getGallery();
        const newItem = {
            id: "gal-" + Date.now(),
            type: galleryData.type || "photo",
            ...galleryData
        };
        items.push(newItem);
        localStorage.setItem("bgo_gallery", JSON.stringify(items));
        this.addAuditLog("GALLERY_ADD", `Added new gallery media "${newItem.title}" in category "${newItem.category}".`);
        return newItem;
    },

    updateGalleryItem(id, updated) {
        const items = this.getGallery();
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updated };
            localStorage.setItem("bgo_gallery", JSON.stringify(items));
            this.addAuditLog("GALLERY_UPDATE", `Updated gallery item "${items[index].title}".`);
        }
    },

    deleteGalleryItem(id) {
        let items = this.getGallery();
        const item = items.find(i => i.id === id);
        if (item) {
            items = items.filter(i => i.id !== id);
            localStorage.setItem("bgo_gallery", JSON.stringify(items));
            this.addAuditLog("GALLERY_DELETE", `Deleted gallery item "${item.title}".`);
        }
    },
    
    // Members API
    generateMemberId(membersList) {
        const year = new Date().getFullYear();
        const prefix = `BGO${year}`;
        let maxSeq = 0;
        
        if (Array.isArray(membersList)) {
            membersList.forEach(m => {
                if (m.memberId && typeof m.memberId === "string") {
                    const match = m.memberId.match(/BGO\d{4}(\d+)/i);
                    if (match) {
                        const seq = parseInt(match[1], 10);
                        if (seq > maxSeq) maxSeq = seq;
                    }
                }
            });
        }
        
        const nextSeq = maxSeq + 1;
        const seqStr = String(nextSeq).padStart(4, '0');
        return `${prefix}${seqStr}`;
    },

    formatRegistrationDate(dateInput) {
        const d = dateInput ? new Date(dateInput) : new Date();
        const validDate = isNaN(d.getTime()) ? new Date() : d;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = String(validDate.getDate()).padStart(2, '0');
        const month = months[validDate.getMonth()];
        const year = validDate.getFullYear();
        
        let hours = validDate.getHours();
        const minutes = String(validDate.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hoursStr = String(hours).padStart(2, '0');
        
        return `${day}-${month}-${year} | ${hoursStr}:${minutes} ${ampm}`;
    },

    ensureMemberMetadata() {
        const rawMembers = localStorage.getItem("bgo_members");
        if (!rawMembers) return [];
        const members = JSON.parse(rawMembers) || [];
        let updated = false;
        
        const defaultDates = {
            "superadmin": "01-Jul-2026 | 09:00 AM",
            "admin": "10-Jul-2026 | 10:15 AM",
            "executive": "12-Jul-2026 | 11:30 AM",
            "member": "15-Jul-2026 | 02:45 PM"
        };

        members.forEach(m => {
            // Auto sanitize superadmin display name to Badiuddin Adil
            if (m.username === "superadmin" && (m.fullName === "BGO Command" || m.fullName === "BGO Super Admin" || !m.fullName)) {
                m.fullName = "Badiuddin Adil";
                updated = true;
            }
            // Auto assign sequential BGO Member IDs to approved or inactive members missing a memberId
            if ((m.status === "approved" || m.status === "inactive") && !m.memberId) {
                m.memberId = this.generateMemberId(members);
                updated = true;
            }
            // Auto assign Registration Date & Time if missing
            if (!m.registeredAt && !m.registrationDate) {
                const formattedDate = defaultDates[m.username] || this.formatRegistrationDate();
                m.registeredAt = formattedDate;
                m.registrationDate = formattedDate;
                updated = true;
            } else if (!m.registeredAt) {
                m.registeredAt = m.registrationDate;
                updated = true;
            } else if (!m.registrationDate) {
                m.registrationDate = m.registeredAt;
                updated = true;
            }
        });
        
        if (updated) {
            localStorage.setItem("bgo_members", JSON.stringify(members));
            const curUserStr = localStorage.getItem("bgo_current_user");
            if (curUserStr) {
                const curUser = JSON.parse(curUserStr);
                const match = members.find(m => m.username === curUser.username);
                if (match) {
                    localStorage.setItem("bgo_current_user", JSON.stringify(match));
                }
            }
        }
        return members;
    },

    getMembers() {
        return this.ensureMemberMetadata();
    },
    
    addMember(memberData) {
        const members = this.getMembers();
        const nowFormatted = this.formatRegistrationDate();
        const newMember = {
            role: "member",
            status: "pending", // Needs Admin approval
            registeredAt: nowFormatted,
            registrationDate: nowFormatted,
            ...memberData
        };
        if (!newMember.registeredAt) newMember.registeredAt = nowFormatted;
        if (!newMember.registrationDate) newMember.registrationDate = nowFormatted;
        members.push(newMember);
        localStorage.setItem("bgo_members", JSON.stringify(members));
        this.addAuditLog("MEMBER_REGISTER", `New registration submitted for username @${newMember.username} on ${newMember.registeredAt} (Pending Review).`);
        return newMember;
    },

    approveMember(username) {
        const members = this.getMembers();
        const member = members.find(m => m.username === username);
        if (member) {
            member.status = "approved";
            if (!member.memberId) {
                member.memberId = this.generateMemberId(members);
            }
            localStorage.setItem("bgo_members", JSON.stringify(members));
            this.incrementStat("membersCount");
            this.addAuditLog("MEMBER_APPROVE", `Approved and activated member account @${username} (Assigned Member ID: ${member.memberId}).`);
            
            // Auto approve volunteer status if checked
            if (member.volunteerInterest) {
                const vols = this.getVolunteers();
                const exists = vols.some(v => v.username === username);
                if (!exists) {
                    const newVol = {
                        id: "vol-" + Date.now(),
                        username: member.username,
                        fullName: member.fullName,
                        mobile: member.mobile,
                        city: member.city,
                        expertise: member.volunteerSkills || "General Assistance",
                        availability: "Flexible",
                        languages: "English, Urdu, Kannada",
                        type: member.volunteerAreas.join(", ") || "General Volunteer",
                        status: "approved"
                    };
                    vols.push(newVol);
                    localStorage.setItem("bgo_volunteers", JSON.stringify(vols));
                    this.incrementStat("activeVolunteers");
                    this.addAuditLog("VOLUNTEER_AUTO_ADD", `Auto-added approved volunteer profile for member @${username}.`);
                }
            }
        }
    },

    updateMemberStatus(username, newStatus) {
        const members = this.getMembers();
        const member = members.find(m => m.username === username);
        if (member) {
            member.status = newStatus;
            localStorage.setItem("bgo_members", JSON.stringify(members));
            this.addAuditLog("MEMBER_STATUS_CHANGE", `Changed member @${username} status to ${newStatus.toUpperCase()}.`);
        }
    },

    updateMemberProfile(username, updatedData) {
        const members = this.getMembers();
        const index = members.findIndex(m => m.username === username);
        if (index !== -1) {
            members[index] = { ...members[index], ...updatedData };
            localStorage.setItem("bgo_members", JSON.stringify(members));
            this.addAuditLog("MEMBER_PROFILE_UPDATE", `Updated profile information for member @${username}.`);
            
            // Sync with current user cache if applicable
            const curUser = localStorage.getItem("bgo_current_user");
            if (curUser) {
                const parsed = JSON.parse(curUser);
                if (parsed.username === username) {
                    localStorage.setItem("bgo_current_user", JSON.stringify(members[index]));
                }
            }
            return members[index];
        }
        return null;
    },

    deleteMember(username) {
        let members = this.getMembers();
        const memb = members.find(m => m.username === username);
        if (memb) {
            members = members.filter(m => m.username !== username);
            localStorage.setItem("bgo_members", JSON.stringify(members));
            this.addAuditLog("MEMBER_DELETE", `Deleted member account @${username}.`);
            
            // Remove volunteer records
            let vols = this.getVolunteers();
            vols = vols.filter(v => v.username !== username);
            localStorage.setItem("bgo_volunteers", JSON.stringify(vols));
        }
    },

    registerAdminAccount(adminData) {
        const members = this.getMembers();
        const exists = members.some(m => m.username.toLowerCase() === adminData.username.toLowerCase());
        if (exists) return { success: false, message: "Username already taken." };

        const newAdmin = {
            role: adminData.role || "admin", // admin or superadmin
            status: "approved",
            dependentsCount: 0,
            children: [],
            volunteerInterest: false,
            volunteerAreas: [],
            ...adminData
        };
        members.push(newAdmin);
        localStorage.setItem("bgo_members", JSON.stringify(members));
        this.addAuditLog("ADMIN_CREATION", `Created secure new admin account @${newAdmin.username} with role ${newAdmin.role.toUpperCase()}.`);
        return { success: true, user: newAdmin };
    },
    
    // Volunteers API
    getVolunteers() {
        return JSON.parse(localStorage.getItem("bgo_volunteers"));
    },
    
    addVolunteer(volData) {
        const vols = this.getVolunteers();
        const newVol = {
            id: "vol-" + Date.now(),
            status: "pending", // Needs Admin approval
            ...volData
        };
        vols.push(newVol);
        localStorage.setItem("bgo_volunteers", JSON.stringify(vols));
        this.addAuditLog("VOLUNTEER_SIGNUP", `Submitted volunteer interest for ${newVol.fullName} (Pending Review).`);
        return newVol;
    },

    approveVolunteer(id) {
        const vols = this.getVolunteers();
        const vol = vols.find(v => v.id === id);
        if (vol) {
            vol.status = "approved";
            localStorage.setItem("bgo_volunteers", JSON.stringify(vols));
            this.incrementStat("activeVolunteers");
            this.addAuditLog("VOLUNTEER_APPROVE", `Approved and activated volunteer Team profile for ${vol.fullName}.`);
        }
    },

    updateVolunteer(id, updatedData) {
        const vols = this.getVolunteers();
        const index = vols.findIndex(v => v.id === id);
        if (index !== -1) {
            vols[index] = { ...vols[index], ...updatedData };
            localStorage.setItem("bgo_volunteers", JSON.stringify(vols));
            this.addAuditLog("VOLUNTEER_UPDATE", `Updated volunteer profile details for ${vols[index].fullName}.`);
        }
    },

    deleteVolunteer(id) {
        let vols = this.getVolunteers();
        const vol = vols.find(v => v.id === id);
        if (vol) {
            vols = vols.filter(v => v.id !== id);
            localStorage.setItem("bgo_volunteers", JSON.stringify(vols));
            this.addAuditLog("VOLUNTEER_REMOVE", `Removed volunteer ${vol.fullName} from active registry.`);
        }
    },

    addVolunteerManually(volData) {
        const vols = this.getVolunteers();
        const newVol = {
            id: "vol-" + Date.now(),
            status: "approved", // Pre-approved when manually added by admin
            ...volData
        };
        vols.push(newVol);
        localStorage.setItem("bgo_volunteers", JSON.stringify(vols));
        this.incrementStat("activeVolunteers");
        this.addAuditLog("VOLUNTEER_MANUAL_ADD", `Manually added approved volunteer ${newVol.fullName}.`);
        return newVol;
    },
    
    // Transfers API
    getTransfers() {
        return JSON.parse(localStorage.getItem("bgo_transfers"));
    },
    
    addTransfer(transferData) {
        const transfers = this.getTransfers();
        const newTrsf = {
            id: "trsf-" + Date.now(),
            status: "processing",
            date: new Date().toISOString().split('T')[0],
            ...transferData
        };
        transfers.push(newTrsf);
        localStorage.setItem("bgo_transfers", JSON.stringify(transfers));
        this.addAuditLog("DOC_TRANSFER_CREATE", `Submitted new document transfer carriage request ID ${newTrsf.id}.`);
        return newTrsf;
    },
    
    updateTransferStatus(id, newStatus) {
        const transfers = this.getTransfers();
        const trsf = transfers.find(t => t.id === id);
        if (trsf) {
            trsf.status = newStatus;
            localStorage.setItem("bgo_transfers", JSON.stringify(transfers));
            this.addAuditLog("DOC_TRANSFER_STATUS", `Changed transfer request ${id} status to ${newStatus.toUpperCase()}.`);
        }
    },
    
    deleteTransfer(id) {
        let transfers = this.getTransfers();
        const trsf = transfers.find(t => t.id === id);
        if (trsf) {
            transfers = transfers.filter(t => t.id !== id);
            localStorage.setItem("bgo_transfers", JSON.stringify(transfers));
            this.addAuditLog("DOC_TRANSFER_DELETE", `Deleted document transfer request ${id}.`);
        }
    },

    // Administrative Accounts Management API (Super Admin Exclusive)
    getAdminAccounts() {
        const members = this.getMembers();
        return members.filter(m => m.role === "admin");
    },

    toggleAdminLock(username, isLocked, reason = "") {
        const members = this.getMembers();
        const admin = members.find(m => m.username.toLowerCase() === String(username).toLowerCase());
        if (admin) {
            admin.isLocked = !!isLocked;
            if (isLocked) {
                admin.lockReason = reason || "Administrative security lock";
                admin.lockedAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
            } else {
                delete admin.lockReason;
                delete admin.lockedAt;
            }
            localStorage.setItem("bgo_members", JSON.stringify(members));
            
            const cur = localStorage.getItem("bgo_current_user");
            const actor = cur ? JSON.parse(cur).username : "superadmin";
            this.addAuditLog("ADMIN_LOCK_TOGGLE", `Super Admin @${actor} ${isLocked ? 'LOCKED 🔒' : 'UNLOCKED 🔓'} admin account @${admin.username}. Reason: ${reason || 'N/A'}`);
            return admin;
        }
        return null;
    },

    toggleAdminStatus(username) {
        const members = this.getMembers();
        const admin = members.find(m => m.username.toLowerCase() === String(username).toLowerCase());
        if (admin) {
            const oldStatus = admin.status || "approved";
            admin.status = oldStatus === "approved" ? "inactive" : "approved";
            localStorage.setItem("bgo_members", JSON.stringify(members));
            
            const cur = localStorage.getItem("bgo_current_user");
            const actor = cur ? JSON.parse(cur).username : "superadmin";
            this.addAuditLog("ADMIN_STATUS_TOGGLE", `Super Admin @${actor} changed status of admin @${admin.username} from ${oldStatus.toUpperCase()} to ${admin.status.toUpperCase()}.`);
            return admin;
        }
        return null;
    },

    updateAdminPermissions(username, permissionsObj) {
        const members = this.getMembers();
        const admin = members.find(m => m.username.toLowerCase() === String(username).toLowerCase());
        if (admin) {
            admin.permissions = permissionsObj;
            localStorage.setItem("bgo_members", JSON.stringify(members));

            const curStr = localStorage.getItem("bgo_current_user");
            if (curStr) {
                const curUser = JSON.parse(curStr);
                if (curUser.username.toLowerCase() === admin.username.toLowerCase()) {
                    curUser.permissions = permissionsObj;
                    localStorage.setItem("bgo_current_user", JSON.stringify(curUser));
                }
            }
            
            const actor = curStr ? JSON.parse(curStr).username : "superadmin";
            this.addAuditLog("ADMIN_PERMISSIONS_UPDATE", `Super Admin @${actor} updated module permissions for admin @${admin.username}.`);
            return admin;
        }
        return null;
    },

    resetAdminPassword(username, newPassword) {
        const members = this.getMembers();
        const admin = members.find(m => m.username.toLowerCase() === String(username).toLowerCase());
        if (admin) {
            admin.password = newPassword;
            localStorage.setItem("bgo_members", JSON.stringify(members));
            
            const cur = localStorage.getItem("bgo_current_user");
            const actor = cur ? JSON.parse(cur).username : "superadmin";
            this.addAuditLog("ADMIN_PASSWORD_RESET", `Super Admin @${actor} reset credentials password for admin @${admin.username}.`);
            return true;
        }
        return false;
    },

    deleteAdminAccount(username) {
        if (String(username).toLowerCase() === "superadmin") {
            alert("Security Error: Lead Super Admin account cannot be deleted.");
            return false;
        }
        let members = this.getMembers();
        const admin = members.find(m => m.username.toLowerCase() === String(username).toLowerCase());
        if (admin) {
            members = members.filter(m => m.username.toLowerCase() !== String(username).toLowerCase());
            localStorage.setItem("bgo_members", JSON.stringify(members));
            
            const cur = localStorage.getItem("bgo_current_user");
            const actor = cur ? JSON.parse(cur).username : "superadmin";
            this.addAuditLog("ADMIN_ACCOUNT_DELETE", `Super Admin @${actor} permanently deleted admin account @${admin.username} (${admin.fullName}).`);
            return true;
        }
        return false;
    }
};

// Initialize
dbInit();
