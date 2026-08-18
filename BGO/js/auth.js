// Membership Authentication Management for BGO

const BGO_AUTH = {
    getCurrentUser() {
        const userJson = localStorage.getItem("bgo_current_user");
        return userJson ? JSON.parse(userJson) : null;
    },
    
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },
    
    isSuperAdmin() {
        const user = this.getCurrentUser();
        return user !== null && user.role === "superadmin";
    },
    
    isAdmin() {
        const user = this.getCurrentUser();
        return user !== null && (user.role === "superadmin" || user.role === "admin");
    },

    isExecutive() {
        const user = this.getCurrentUser();
        return user !== null && user.role === "executive";
    },

    isMember() {
        const user = this.getCurrentUser();
        return user !== null && user.role === "member";
    },

    isAdminOrExecutive() {
        const user = this.getCurrentUser();
        return user !== null && (user.role === "superadmin" || user.role === "admin" || user.role === "executive");
    },
    
    hasAdminPermission(permKey) {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (user.role === "superadmin") return true; // Super Admin has full master access
        if (user.role === "admin") {
            if (!user.permissions || typeof user.permissions !== "object") return true; // Default full access if unconfigured
            return user.permissions[permKey] !== false; // Access granted unless explicitly set to false
        }
        return false;
    },

    async loginAsync(usernameOrEmail, password) {
        if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
            const res = await window.BGO_SUPABASE.signIn(usernameOrEmail, password);
            if (res.success) {
                // Map database profile to session format
                const userObj = {
                    id: res.user.id,
                    username: res.profile.username,
                    fullName: res.profile.full_name,
                    email: res.profile.email,
                    mobile: res.profile.mobile,
                    role: res.profile.role,
                    status: res.profile.status,
                    memberId: res.profile.member_id,
                    city: res.profile.city,
                    nativePlace: res.profile.native_place,
                    bloodGroup: res.profile.blood_group,
                    profession: res.profile.profession,
                    company: res.profile.company
                };
                localStorage.setItem("bgo_current_user", JSON.stringify(userObj));
                return { success: true, user: userObj };
            }
            return res;
        } else {
            return this.login(usernameOrEmail, password);
        }
    },

    login(username, password) {
        if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
            console.warn("Notice: Use BGO_AUTH.loginAsync() for Supabase Auth backend operations.");
        }
        // Find member in DB
        const members = BGO_DB.getMembers();
        const user = members.find(m => m.username.toLowerCase() === username.toLowerCase() && m.password === password);
        
        if (user) {
            if (user.isLocked) {
                BGO_DB.addAuditLog("LOCKED_LOGIN_ATTEMPT", `Attempted login to locked account @${user.username}.`);
                return { success: false, message: "🔒 Account Locked: This administrative account has been locked by the Super Admin. Please contact system support." };
            }
            if (user.status === "pending" || user.status === "visitor") {
                BGO_DB.addAuditLog("PENDING_LOGIN_ATTEMPT", `Attempted login to unapproved pending account @${user.username}.`);
                return { 
                    success: false, 
                    message: "⏳ Account Pending Approval: Your registration is currently in Visitor / Pending Approval status. Please wait for an authorized Admin to review and approve your application before logging in." 
                };
            }
            if (user.status === "inactive" || user.status === "deactivated" || user.status === "rejected") {
                BGO_DB.addAuditLog("INACTIVE_LOGIN_ATTEMPT", `Attempted login to deactivated account @${user.username}.`);
                return { success: false, message: "🚫 Account Inactive: Your account has been deactivated or rejected by administration." };
            }

            // Update last login timestamp
            const nowStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
            user.lastLogin = nowStr;
            
            // Save back to DB
            const index = members.findIndex(m => m.username === user.username);
            if (index !== -1) {
                members[index].lastLogin = nowStr;
                localStorage.setItem("bgo_members", JSON.stringify(members));
            }

            localStorage.setItem("bgo_current_user", JSON.stringify(user));
            BGO_DB.addAuditLog("LOGIN", `User @${user.username} (${user.role.toUpperCase()}) logged in successfully.`);
            return { success: true, user: user };
        }
        
        BGO_DB.addAuditLog("LOGIN_FAILED", `Failed login attempt for username "${username}".`);
        return { success: false, message: "Invalid username or password" };
    },
    
    async logout() {
        const user = this.getCurrentUser();
        if (user) {
            try {
                BGO_DB.addAuditLog("LOGOUT", `User @${user.username} (${(user.role || "").toUpperCase()}) logged out successfully.`);
            } catch (e) {}
        }

        // Call Supabase SignOut if configured
        if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
            await window.BGO_SUPABASE.signOut();
        }

        // 1. Clear current user from browser local & session storage
        localStorage.removeItem("bgo_current_user");
        sessionStorage.removeItem("bgo_current_user");

        // 2. Dismiss any active modal overlays to prevent frozen/stuck UI
        const activeModals = document.querySelectorAll(".modal-overlay.active");
        activeModals.forEach(m => m.classList.remove("active"));

        // 3. Close mobile navbar menu if open
        const navMenu = document.getElementById("nav-menu");
        if (navMenu) {
            navMenu.classList.remove("active");
        }

        // 4. Update header navbar auth controls immediately
        if (typeof initNavbarAuthStates === "function") {
            initNavbarAuthStates();
        }

        // 5. Instantly redirect & execute router without manual refresh
        const targetHash = "#membership";
        const currentHash = window.location.hash;

        if (currentHash === targetHash) {
            if (typeof router === "function") {
                router();
            }
        } else {
            window.location.hash = targetHash;
            // Explicitly invoke router synchronously to guarantee instant redirection on all devices
            if (typeof router === "function") {
                router();
            }
        }
    },
    
    async signupAsync(memberData) {
        if (window.BGO_SUPABASE && window.BGO_SUPABASE.isConfigured()) {
            return await window.BGO_SUPABASE.signUp(memberData.email, memberData.password, memberData);
        } else {
            return this.signup(memberData);
        }
    },

    signup(memberData) {
        // Check if username already exists
        const members = BGO_DB.getMembers();
        const exists = members.some(m => m.username.toLowerCase() === memberData.username.toLowerCase());
        
        if (exists) {
            return { success: false, message: "Username is already taken" };
        }
        
        // Ensure new member is pending approval and assigned default member role
        memberData.status = "pending";
        memberData.role = "member";
        
        // Add member to database
        const newMember = BGO_DB.addMember(memberData);
        
        // Do NOT log user in automatically. Member must await Admin approval.
        BGO_DB.addAuditLog("MEMBER_PENDING_REGISTER", `New member @${newMember.username} registered (Pending Admin Approval).`);
        
        return { 
            success: true, 
            user: newMember, 
            message: "⏳ Account Pending Approval: Your registration is currently in Visitor / Pending Approval status. Please wait for an authorized Admin to review and approve your application before logging in." 
        };
    }
};
