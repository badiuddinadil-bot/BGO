// Bahmani Group Oman (BGO) — Database Adapter Module (Batch 1)
// Connects News, Gallery, and Executive Management to Supabase with seamless localStorage fallback.

(function (window) {
    'use strict';

    const BGO_ADAPTER = {
        // --- NEWS MODULE ---
        async getNewsAsync() {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client
                        .from("news")
                        .select("*")
                        .order("published_date", { ascending: false });
                    
                    if (!error && data && data.length > 0) {
                        return data.map(n => ({
                            id: n.id,
                            title: n.title,
                            summary: n.summary,
                            content: n.content,
                            image: n.image_url,
                            date: n.published_date,
                            category: n.category
                        }));
                    }
                } catch (e) {
                    console.warn("Notice: Fetching News from local storage fallback.");
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.getNews() : [];
        },

        async addNewsAsync(newsData) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("news").insert([{
                        title: newsData.title,
                        summary: newsData.summary || "",
                        content: newsData.content,
                        image_url: newsData.image || "",
                        category: newsData.category || "Announcements",
                        published_date: newsData.date || new Date().toISOString().split('T')[0]
                    }]).select();

                    if (!error && data && data.length > 0) {
                        const newObj = {
                            id: data[0].id,
                            title: data[0].title,
                            summary: data[0].summary,
                            content: data[0].content,
                            image: data[0].image_url,
                            date: data[0].published_date,
                            category: data[0].category
                        };
                        if (typeof BGO_DB !== "undefined") BGO_DB.addNews(newObj);
                        return newObj;
                    }
                } catch (e) {
                    console.warn("Notice: Saved News to local storage fallback.");
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.addNews(newsData) : newsData;
        },

        async deleteNewsAsync(id) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    await client.from("news").delete().eq("id", id);
                } catch (e) {}
            }
            if (typeof BGO_DB !== "undefined") {
                return BGO_DB.deleteNews(id);
            }
            return true;
        },

        // --- GALLERY MODULE ---
        async getGalleryAsync() {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client
                        .from("gallery")
                        .select("*")
                        .order("display_order", { ascending: true });

                    if (!error && data && data.length > 0) {
                        return data.map(g => ({
                            id: g.id,
                            title: g.title,
                            category: g.category,
                            type: g.type,
                            imageUrl: g.image_url,
                            videoUrl: g.video_url
                        }));
                    }
                } catch (e) {
                    console.warn("Notice: Fetching Gallery from local storage fallback.");
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.getGallery() : [];
        },

        async addGalleryAsync(item) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("gallery").insert([{
                        title: item.title,
                        category: item.category || "Community Events",
                        type: item.type || "photo",
                        image_url: item.imageUrl || "",
                        video_url: item.videoUrl || ""
                    }]).select();

                    if (!error && data && data.length > 0) {
                        const newObj = {
                            id: data[0].id,
                            title: data[0].title,
                            category: data[0].category,
                            type: data[0].type,
                            imageUrl: data[0].image_url,
                            videoUrl: data[0].video_url
                        };
                        if (typeof BGO_DB !== "undefined") BGO_DB.addGalleryItem(newObj);
                        return newObj;
                    }
                } catch (e) {}
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.addGalleryItem(item) : item;
        },

        async deleteGalleryAsync(id) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    await client.from("gallery").delete().eq("id", id);
                } catch (e) {}
            }
            if (typeof BGO_DB !== "undefined") {
                return BGO_DB.deleteGalleryItem(id);
            }
            return true;
        },

        // --- EXECUTIVE MANAGEMENT MODULE ---
        async getExecutiveManagementAsync() {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client
                        .from("executive_management")
                        .select("*")
                        .order("display_order", { ascending: true });

                    if (!error && data && data.length > 0) {
                        return data.map(e => ({
                            id: e.id,
                            roleTitle: e.role_title,
                            name: e.name,
                            photoUrl: e.photo_url,
                            region: e.region
                        }));
                    }
                } catch (e) {
                    console.warn("Notice: Fetching Executive Leadership from local storage fallback.");
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.getExecutiveManagement() : [];
        },

        async addExecutiveOfficerAsync(officer) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("executive_management").insert([{
                        role_title: officer.roleTitle,
                        name: officer.name,
                        photo_url: officer.photoUrl || "",
                        region: officer.region || "Muscat"
                    }]).select();

                    if (!error && data && data.length > 0) {
                        const newObj = {
                            id: data[0].id,
                            roleTitle: data[0].role_title,
                            name: data[0].name,
                            photoUrl: data[0].photo_url,
                            region: data[0].region
                        };
                        if (typeof BGO_DB !== "undefined") BGO_DB.addExecutiveOfficer(newObj);
                        return newObj;
                    }
                } catch (e) {}
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.addExecutiveOfficer(officer) : officer;
        },

        async deleteExecutiveOfficerAsync(id) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    await client.from("executive_management").delete().eq("id", id);
                } catch (e) {}
            }
            if (typeof BGO_DB !== "undefined") {
                return BGO_DB.deleteExecutiveOfficer(id);
            }
            return true;
        },

        // --- BATCH 2: JOBS MODULE ---
        async getJobsAsync() {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("jobs").select("*").order("created_at", { ascending: false });
                    if (!error && data && data.length > 0) {
                        return data.map(j => ({
                            id: j.id,
                            title: j.title,
                            company: j.company,
                            category: j.category,
                            location: j.location,
                            salary: j.salary,
                            type: j.type,
                            posterName: j.poster_name,
                            contactEmail: j.contact_email,
                            postedBy: j.posted_by,
                            postedDate: j.posted_date,
                            status: j.status,
                            description: j.description,
                            contact: j.contact
                        }));
                    }
                } catch (e) {
                    console.warn("Notice: Fetching Jobs from local storage fallback.");
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.getJobs() : [];
        },

        async addJobAsync(jobData) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("jobs").insert([{
                        title: jobData.title,
                        company: jobData.company,
                        category: jobData.category || "general",
                        location: jobData.location || "Muscat, Oman",
                        salary: jobData.salary || "",
                        type: jobData.type || "Full-Time",
                        poster_name: jobData.posterName || "",
                        contact_email: jobData.contactEmail || "",
                        posted_by: jobData.postedBy || "",
                        posted_date: jobData.postedDate || new Date().toISOString().split('T')[0],
                        status: jobData.status || "approved",
                        description: jobData.description,
                        contact: jobData.contact || jobData.contactEmail || ""
                    }]).select();

                    if (!error && data && data.length > 0) {
                        const newJob = {
                            id: data[0].id,
                            title: data[0].title,
                            company: data[0].company,
                            category: data[0].category,
                            location: data[0].location,
                            salary: data[0].salary,
                            type: data[0].type,
                            posterName: data[0].poster_name,
                            contactEmail: data[0].contact_email,
                            postedBy: data[0].posted_by,
                            postedDate: data[0].posted_date,
                            status: data[0].status,
                            description: data[0].description,
                            contact: data[0].contact
                        };
                        if (typeof BGO_DB !== "undefined") BGO_DB.addJob(newJob);
                        return newJob;
                    }
                } catch (e) {}
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.addJob(jobData) : jobData;
        },

        async deleteJobAsync(id) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    await client.from("jobs").delete().eq("id", id);
                } catch (e) {}
            }
            if (typeof BGO_DB !== "undefined") {
                return BGO_DB.deleteJob(id);
            }
            return true;
        },

        // --- BATCH 2: MEDICAL EMERGENCY REQUESTS ---
        async getMedicalRequestsAsync() {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("medical_requests").select("*").order("created_at", { ascending: false });
                    if (!error && data && data.length > 0) {
                        return data.map(m => ({
                            id: m.id,
                            patientName: m.patient_name,
                            bloodGroup: m.blood_group,
                            hospital: m.hospital,
                            location: m.location,
                            requiredUnits: m.required_units,
                            urgency: m.urgency,
                            contactNumber: m.contact_number,
                            reason: m.reason,
                            status: m.status,
                            postedBy: m.posted_by,
                            postedDate: m.posted_date
                        }));
                    }
                } catch (e) {
                    console.warn("Notice: Fetching Medical Requests from local storage fallback.");
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.getMedicalRequests() : [];
        },

        async addMedicalRequestAsync(reqData) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("medical_requests").insert([{
                        patient_name: reqData.patientName,
                        blood_group: reqData.bloodGroup,
                        hospital: reqData.hospital,
                        location: reqData.location || "Muscat, Oman",
                        required_units: parseInt(reqData.requiredUnits) || 1,
                        urgency: reqData.urgency || "Urgent",
                        contact_number: reqData.contactNumber,
                        reason: reqData.reason,
                        status: reqData.status || "open",
                        posted_by: reqData.postedBy || "",
                        posted_date: reqData.postedDate || new Date().toISOString().split('T')[0]
                    }]).select();

                    if (!error && data && data.length > 0) {
                        const newReq = {
                            id: data[0].id,
                            patientName: data[0].patient_name,
                            bloodGroup: data[0].blood_group,
                            hospital: data[0].hospital,
                            location: data[0].location,
                            requiredUnits: data[0].required_units,
                            urgency: data[0].urgency,
                            contactNumber: data[0].contact_number,
                            reason: data[0].reason,
                            status: data[0].status,
                            postedBy: data[0].posted_by,
                            postedDate: data[0].posted_date
                        };
                        if (typeof BGO_DB !== "undefined") BGO_DB.addMedicalRequest(newReq);
                        return newReq;
                    }
                } catch (e) {}
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.addMedicalRequest(reqData) : reqData;
        },

        async deleteMedicalRequestAsync(id) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    await client.from("medical_requests").delete().eq("id", id);
                } catch (e) {}
            }
            if (typeof BGO_DB !== "undefined") {
                return BGO_DB.deleteMedicalRequest(id);
            }
            return true;
        },

        // --- BATCH 2: HELPLINE REQUESTS ---
        async getHelplineRequestsAsync() {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("helpline_requests").select("*").order("requested_at", { ascending: false });
                    if (!error && data && data.length > 0) {
                        return data.map(h => ({
                            id: h.id,
                            name: h.name,
                            phone: h.phone,
                            email: h.email,
                            type: h.type,
                            details: h.details,
                            status: h.status,
                            requestedAt: h.requested_at
                        }));
                    }
                } catch (e) {
                    console.warn("Notice: Fetching Helpline Requests from local storage fallback.");
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.getHelplineRequests() : [];
        },

        async addHelplineRequestAsync(hlData) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("helpline_requests").insert([{
                        name: hlData.name,
                        phone: hlData.phone,
                        email: hlData.email || "",
                        type: hlData.type,
                        details: hlData.details || "",
                        status: hlData.status || "pending"
                    }]).select();

                    if (!error && data && data.length > 0) {
                        const newHl = {
                            id: data[0].id,
                            name: data[0].name,
                            phone: data[0].phone,
                            email: data[0].email,
                            type: data[0].type,
                            details: data[0].details,
                            status: data[0].status,
                            requestedAt: data[0].requested_at
                        };
                        if (typeof BGO_DB !== "undefined") BGO_DB.addHelplineRequest(newHl);
                        return newHl;
                    }
                } catch (e) {}
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.addHelplineRequest(hlData) : hlData;
        },

        // --- BATCH 3: TRAVEL SCHEDULES MODULE ---
        async getTravelSchedulesAsync() {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("travel_schedules").select("*").order("travel_date", { ascending: true });
                    if (!error && data && data.length > 0) {
                        return data.map(t => ({
                            id: t.id,
                            profileId: t.profile_id,
                            username: t.username,
                            memberName: t.member_name,
                            mobile: t.mobile,
                            whatsapp: t.whatsapp,
                            travelDate: t.travel_date,
                            travelTime: t.travel_time,
                            route: t.route,
                            flightDetails: t.flight_details,
                            remarks: t.remarks,
                            status: t.status,
                            createdAt: t.created_at
                        }));
                    }
                } catch (e) {
                    console.warn("Notice: Fetching Travel Schedules from local storage fallback.");
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.getTravelInfo() : [];
        },

        async addTravelScheduleAsync(trvData) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                const user = window.BGO_AUTH ? window.BGO_AUTH.getCurrentUser() : null;
                try {
                    const { data, error } = await client.from("travel_schedules").insert([{
                        profile_id: user ? user.id : null,
                        username: trvData.username || (user ? user.username : "member"),
                        member_name: trvData.memberName || (user ? user.fullName : "Member"),
                        mobile: trvData.mobile || "",
                        whatsapp: trvData.whatsapp || trvData.mobile || "",
                        travel_date: trvData.travelDate,
                        travel_time: trvData.travelTime || "",
                        route: trvData.route,
                        flight_details: trvData.flightDetails || "",
                        remarks: trvData.remarks || "",
                        status: trvData.status || "active"
                    }]).select();

                    if (!error && data && data.length > 0) {
                        const newTrv = {
                            id: data[0].id,
                            username: data[0].username,
                            memberName: data[0].member_name,
                            mobile: data[0].mobile,
                            whatsapp: data[0].whatsapp,
                            travelDate: data[0].travel_date,
                            travelTime: data[0].travel_time,
                            route: data[0].route,
                            flightDetails: data[0].flight_details,
                            remarks: data[0].remarks,
                            status: data[0].status,
                            createdAt: data[0].created_at
                        };
                        if (typeof BGO_DB !== "undefined") BGO_DB.addTravelInfo(newTrv);
                        return newTrv;
                    }
                } catch (e) {}
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.addTravelInfo(trvData) : trvData;
        },

        async deleteTravelScheduleAsync(id) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    await client.from("travel_schedules").delete().eq("id", id);
                } catch (e) {}
            }
            if (typeof BGO_DB !== "undefined") {
                return BGO_DB.deleteTravelInfo(id);
            }
            return true;
        },

        // --- BATCH 3: EVENTS & EVENT POLLS MODULE ---
        async getEventsAsync() {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("events").select("*").order("date", { ascending: true });
                    if (!error && data && data.length > 0) {
                        return data.map(evt => ({
                            id: evt.id,
                            title: evt.title,
                            date: evt.date,
                            time: evt.time,
                            location: evt.location,
                            venue: evt.venue,
                            description: evt.description,
                            registeredCount: evt.registered_count,
                            status: evt.status,
                            image: evt.image_url
                        }));
                    }
                } catch (e) {
                    console.warn("Notice: Fetching Events from local storage fallback.");
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.getEvents() : [];
        },

        async getEventPollAsync(eventId) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                const user = window.BGO_AUTH ? window.BGO_AUTH.getCurrentUser() : null;
                if (user) {
                    try {
                        const { data, error } = await client
                            .from("event_polls")
                            .select("*")
                            .eq("event_id", eventId)
                            .eq("profile_id", user.id)
                            .maybeSingle();

                        if (!error && data) {
                            return {
                                id: data.id,
                                eventId: data.event_id,
                                username: data.username,
                                memberName: data.member_name,
                                mobile: data.mobile,
                                status: data.status,
                                familyCount: data.family_count,
                                respondedAt: data.responded_at
                            };
                        }
                    } catch (e) {}
                }
            }
            const polls = typeof BGO_DB !== "undefined" ? BGO_DB.getEventPolls() : [];
            const user = window.BGO_AUTH ? window.BGO_AUTH.getCurrentUser() : null;
            return user ? polls.find(p => p.eventId === eventId && p.username === user.username) : null;
        },

        async saveEventPollAsync(eventId, pollData) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                const user = window.BGO_AUTH ? window.BGO_AUTH.getCurrentUser() : null;
                if (user) {
                    try {
                        const payload = {
                            event_id: eventId,
                            profile_id: user.id,
                            username: user.username,
                            member_name: user.fullName || user.username,
                            mobile: user.mobile || "",
                            status: pollData.status,
                            family_count: parseInt(pollData.familyCount) || 0
                        };

                        const { data, error } = await client
                            .from("event_polls")
                            .upsert(payload, { onConflict: "event_id,profile_id" })
                            .select();

                        if (!error && data && data.length > 0) {
                            const resObj = {
                                id: data[0].id,
                                eventId: data[0].event_id,
                                username: data[0].username,
                                memberName: data[0].member_name,
                                mobile: data[0].mobile,
                                status: data[0].status,
                                familyCount: data[0].family_count,
                                respondedAt: data[0].responded_at
                            };
                            if (typeof BGO_DB !== "undefined") BGO_DB.saveEventPollResponse(resObj);
                            return resObj;
                        }
                    } catch (e) {}
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.saveEventPollResponse(pollData) : pollData;
        },

        // --- BATCH 3: PROFILE UPDATE REQUESTS MODULE ---
        async getProfileUpdateRequestsAsync() {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("profile_update_requests").select("*").order("created_at", { ascending: false });
                    if (!error && data && data.length > 0) {
                        return data.map(pur => ({
                            id: pur.id,
                            profileId: pur.profile_id,
                            username: pur.username,
                            memberName: pur.member_name,
                            mobile: pur.mobile,
                            oldData: pur.old_data,
                            newData: pur.new_data,
                            status: pur.status,
                            rejectionReason: pur.rejection_reason,
                            requestDate: pur.created_at
                        }));
                    }
                } catch (e) {
                    console.warn("Notice: Fetching Profile Update Requests from local storage fallback.");
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.getProfileUpdateRequests() : [];
        },

        async addProfileUpdateRequestAsync(requestData) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                const user = window.BGO_AUTH ? window.BGO_AUTH.getCurrentUser() : null;
                if (user) {
                    try {
                        const { data, error } = await client.from("profile_update_requests").insert([{
                            profile_id: user.id,
                            username: user.username,
                            member_name: user.fullName || user.username,
                            mobile: user.mobile || "",
                            old_data: requestData.oldData || {},
                            new_data: requestData.newData || {},
                            status: "pending"
                        }]).select();

                        if (!error && data && data.length > 0) {
                            const newPur = {
                                id: data[0].id,
                                username: data[0].username,
                                memberName: data[0].member_name,
                                mobile: data[0].mobile,
                                oldData: data[0].old_data,
                                newData: data[0].new_data,
                                status: data[0].status,
                                requestDate: data[0].created_at
                            };
                            if (typeof BGO_DB !== "undefined") BGO_DB.addProfileUpdateRequest(newPur);
                            return newPur;
                        }
                    } catch (e) {}
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.addProfileUpdateRequest(requestData) : requestData;
        },

        // --- BATCH 4: AUDIT LOGS MODULE ---
        async getAuditLogsAsync() {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("audit_logs").select("*").order("created_at", { ascending: false });
                    if (!error && data && data.length > 0) {
                        return data.map(al => ({
                            id: al.id,
                            timestamp: al.created_at,
                            user: al.performed_by || "system",
                            action: al.action,
                            details: al.details,
                            status: al.status
                        }));
                    }
                } catch (e) {
                    console.warn("Notice: Fetching Audit Logs from local storage fallback.");
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.getAuditLogs() : [];
        },

        async addAuditLogAsync(action, details) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                const user = window.BGO_AUTH ? window.BGO_AUTH.getCurrentUser() : null;
                try {
                    const { data, error } = await client.from("audit_logs").insert([{
                        user_id: user ? user.id : null,
                        action: action,
                        details: details,
                        performed_by: user ? user.username : "Guest",
                        user_role: user ? user.role : "member",
                        status: "SUCCESS"
                    }]).select();

                    if (!error && data && data.length > 0) {
                        const newLog = {
                            id: data[0].id,
                            timestamp: data[0].created_at,
                            user: data[0].performed_by,
                            action: data[0].action,
                            details: data[0].details,
                            status: data[0].status
                        };
                        if (typeof BGO_DB !== "undefined") BGO_DB.addAuditLog(action, details);
                        return newLog;
                    }
                } catch (e) {}
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.addAuditLog(action, details) : null;
        },

        async deleteAuditLogAsync(id) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    await client.from("audit_logs").delete().eq("id", id);
                } catch (e) {}
            }
            if (typeof BGO_DB !== "undefined") {
                return BGO_DB.deleteAuditLog(id);
            }
            return true;
        },

        // --- BATCH 4: EMAIL LOGS MODULE ---
        async getEmailLogsAsync() {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("email_logs").select("*").order("created_at", { ascending: false });
                    if (!error && data && data.length > 0) {
                        return data.map(el => ({
                            id: el.id,
                            timestamp: el.created_at,
                            toEmail: el.to_email,
                            toName: el.to_name,
                            category: el.category,
                            subject: el.subject,
                            body: el.body,
                            status: el.status
                        }));
                    }
                } catch (e) {
                    console.warn("Notice: Fetching Email Logs from local storage fallback.");
                }
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.getEmailLogs() : [];
        },

        async sendEmailNotificationAsync(payload) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    const { data, error } = await client.from("email_logs").insert([{
                        to_email: payload.toEmail,
                        to_name: payload.toName || payload.toEmail,
                        category: payload.category || "General System Notification",
                        subject: payload.subject,
                        body: payload.body || "",
                        status: "DELIVERED ✅"
                    }]).select();

                    if (!error && data && data.length > 0) {
                        const newEml = {
                            id: data[0].id,
                            timestamp: data[0].created_at,
                            toEmail: data[0].to_email,
                            toName: data[0].to_name,
                            category: data[0].category,
                            subject: data[0].subject,
                            body: data[0].body,
                            status: data[0].status
                        };
                        if (typeof BGO_DB !== "undefined") BGO_DB.sendEmailNotification(payload);
                        return newEml;
                    }
                } catch (e) {}
            }
            return typeof BGO_DB !== "undefined" ? BGO_DB.sendEmailNotification(payload) : payload;
        },

        async deleteEmailLogAsync(id) {
            if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
                const client = window.BGO_SUPABASE.getClient();
                try {
                    await client.from("email_logs").delete().eq("id", id);
                } catch (e) {}
            }
            if (typeof BGO_DB !== "undefined") {
                return BGO_DB.deleteEmailLog(id);
            }
            return true;
        }
    };

    window.BGO_ADAPTER = BGO_ADAPTER;
})(window);
