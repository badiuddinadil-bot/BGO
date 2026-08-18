// Centralized Supabase Client Module for Bahmani Group Oman (BGO)
// Handles authentication state, session restoration, and database profile queries.

(function (window) {
    'use strict';

    // Public Supabase Configuration from js/config.js or environment fallback
    const config = window.BGO_CONFIG || {};
    const SUPABASE_URL = config.SUPABASE_URL || window.ENV_SUPABASE_URL || "https://fjtoosmtvgfrvxtjzoqu.supabase.co";
    const SUPABASE_ANON_KEY = config.SUPABASE_PUBLISHABLE_KEY || window.ENV_SUPABASE_PUBLISHABLE_KEY || "";

    let client = null;
    let isConfigured = false;

    // Check if real publishable key is provided
    if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.trim() !== "" && SUPABASE_ANON_KEY !== "your-supabase-anon-key-here") {
        isConfigured = true;
    }

    if (typeof window.supabase !== "undefined" && window.supabase.createClient && isConfigured) {
        try {
            client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            console.log("✅ Supabase Client initialized successfully.");
        } catch (err) {
            console.error("❌ Failed to initialize Supabase Client:", err);
        }
    } else {
        console.warn("⚠️ Supabase Client is not yet connected to a live project. Enter your SUPABASE_PUBLISHABLE_KEY in js/config.js to activate live backend operations.");
    }

    const BGO_SUPABASE = {
        isConfigured() {
            return isConfigured && client !== null;
        },

        getClient() {
            return client;
        },

        // --- AUTHENTICATION API ---
        async signUp(email, password, profileData) {
            if (!this.isConfigured()) {
                return { success: false, message: "BLOCKED — Supabase project credentials/configuration are required." };
            }
            try {
                const { data, error } = await client.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: profileData.fullName || "",
                            username: (profileData.username || "").toLowerCase().trim(),
                            mobile: profileData.mobile || "",
                            whatsapp: profileData.whatsapp || profileData.mobile || "",
                            city: profileData.city || "Muscat",
                            native_place: profileData.nativePlace || "Gulbarga",
                            blood_group: profileData.bloodGroup || "O+",
                            profession: profileData.profession || "",
                            company: profileData.company || ""
                        }
                    }
                });

                if (error) {
                    return { success: false, message: error.message };
                }

                return {
                    success: true,
                    user: data.user,
                    session: data.session,
                    message: "⏳ Account Pending Approval: Your registration is currently in Visitor / Pending Approval status. Please wait for an authorized Admin to review and approve your application before logging in."
                };
            } catch (err) {
                return { success: false, message: err.message || "Registration failed" };
            }
        },

        async signIn(usernameOrEmail, password) {
            if (!this.isConfigured()) {
                return { success: false, message: "BLOCKED — Supabase project credentials/configuration are required." };
            }
            try {
                let loginEmail = usernameOrEmail.trim();

                // Native Supabase Email Auth — Zero RPC enumeration risk
                if (!loginEmail.includes("@")) {
                    return { 
                        success: false, 
                        message: "🔒 Privacy Protection: Please enter your registered Email address to log in securely." 
                    };
                }

                const { data, error } = await client.auth.signInWithPassword({
                    email: loginEmail,
                    password: password
                });

                if (error) {
                    return { success: false, message: error.message };
                }

                // Fetch database profile for user status & role check
                const { data: userProfile, error: userProfErr } = await client
                    .from("profiles")
                    .select("*")
                    .eq("id", data.user.id)
                    .single();

                if (userProfErr || !userProfile) {
                    return { success: false, message: "User profile record not found in database." };
                }

                if (userProfile.is_locked) {
                    await client.auth.signOut();
                    return { success: false, message: `🔒 Account Locked: ${userProfile.lock_reason || 'Locked by Administration.'}` };
                }

                if (userProfile.status === "pending" || userProfile.status === "visitor") {
                    await client.auth.signOut();
                    return { success: false, message: "⏳ Account Pending Approval: Your registration is currently in Visitor / Pending Approval status. Please wait for an Admin to review and approve your application." };
                }

                if (userProfile.status === "inactive" || userProfile.status === "deactivated" || userProfile.status === "rejected") {
                    await client.auth.signOut();
                    return { success: false, message: "🚫 Account Inactive: Your account has been deactivated or rejected by administration." };
                }

                // Update last_login timestamp in database
                await client
                    .from("profiles")
                    .update({ last_login: new Date().toISOString() })
                    .eq("id", data.user.id);

                return { success: true, user: data.user, profile: userProfile, session: data.session };
            } catch (err) {
                return { success: false, message: err.message || "Authentication failed" };
            }
        },

        async signOut() {
            if (!this.isConfigured()) return;
            try {
                await client.auth.signOut();
            } catch (err) {
                console.error("SignOut error:", err);
            }
        },

        async getSession() {
            if (!this.isConfigured()) return null;
            try {
                const { data } = await client.auth.getSession();
                return data.session;
            } catch (err) {
                return null;
            }
        },

        async getProfile(userId) {
            if (!this.isConfigured() || !userId) return null;
            try {
                const { data, error } = await client
                    .from("profiles")
                    .select("*")
                    .eq("id", userId)
                    .single();
                if (error) return null;
                return data;
            } catch (err) {
                return null;
            }
        }
    };

    window.BGO_SUPABASE = BGO_SUPABASE;

})(window);
