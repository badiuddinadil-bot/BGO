// Multilingual Translation Engine for BGO
// Supporting: English (en), Arabic (ar), Urdu (ur), Kannada (kn)

const BGO_LANGUAGES = {
    en: { name: "English", dir: "ltr" },
    ar: { name: "العربية (Arabic)", dir: "rtl" },
    ur: { name: "اردو (Urdu)", dir: "rtl" },
    kn: { name: "ಕನ್ನಡ (Kannada)", dir: "ltr" }
};

const TRANSLATIONS = {
    en: {
        // Menu/Navigation
        "nav_home": "Home",
        "nav_about": "About Us",
        "nav_founder": "EXCOM Message",
        "nav_services": "Services",
        "nav_jobs": "Job Portal",
        "nav_medical": "Medical Aid",
        "nav_legal": "Legal Help",
        "nav_transfer": "Doc Transfer",
        "nav_news": "News",
        "nav_gallery": "Gallery & Events",
        "nav_membership": "Membership",
        "nav_contact": "Contact",
        "nav_dashboard": "Dashboard",
        "nav_admin": "Admin Panel",
        
        // Brand/Motto
        "motto": "By the community for the community .",
        "tagline": "Connecting Gulbarga People Across Oman",
        "org_name": "BGO",
        "org_abbr": "BGO",
        
        // Hero Section
        "hero_title": "Bahmani Group Oman",
        "hero_cta_join": "Join as a Member",
        "hero_cta_emergency": "Emergency Helpline",
        
        // Stats
        "stat_service": "Years of Service",
        "stat_members": "Community Members",
        "stat_jobs": "Jobs Shared",
        "stat_medical": "Medical Cases",
        "stat_volunteers": "Active Volunteers",
        
        // Helpline Widget
        "helpline_title": "Need Immediate Assistance?",
        "helpline_desc": "If you are facing a legal issue, job crisis, or require urgent document transfer, reach out to our support team instantly.",
        "helpline_call": "Call Support",
        "helpline_whatsapp": "WhatsApp Support",
        "helpline_req_btn": "Submit Help Request",
        
        // Services Teasers
        "services_title": "Our Core Services",
        "services_subtitle": "BGO stands as a pillars of support, bridging the distance between Oman and Kalaburagi.",
        "srv_info_title": "Community Info",
        "srv_info_desc": "Stay updated with Gulbarga news, community announcements, educational updates, and travel advisories.",
        "srv_jobs_title": "Verified Job Opportunities",
        "srv_jobs_desc": "Browse verified vacancies, access career guidance, and get resume assistance tailored for Gulbarga expats.",
        "srv_med_title": "Medical Assistance",
        "srv_med_desc": "Request emergency blood donations, find hospital guidance, patient assistance, and ambulance contacts.",
        "srv_legal_title": "Legal Support",
        "srv_legal_desc": "Guidance on labor disputes, visa issues, and employer relations through certified legal resource connections.",
        "srv_transfer_title": "Document Transfer",
        "srv_transfer_desc": "Safe and urgent transfer of passports, medical reports, and certificates between Oman and Gulbarga.",
        
        // General buttons
        "btn_view_details": "View Details",
        "btn_apply_now": "Apply Now",
        "btn_submit": "Submit Application",
        "btn_login": "Member Login",
        "btn_logout": "Log Out",
        
        // Founder Message
        "founder_title": "Message from the EXCOM Team",
        "founder_salutation": "Assalamu Alaikum,",
        "founder_body_1": "Bahmani Group of Oman was established with a vision to bring together the people of Gulbarga living in Oman under one platform.",
        "founder_body_2": "When people move away from their hometown in search of better opportunities, they often face challenges related to employment, health, legal matters, and emergencies. Our goal is to ensure that no member of our community feels alone during difficult times.",
        "founder_body_3": "Over the years, BGO has grown into a trusted community network where members support one another, share opportunities, and work together for the welfare of the community.",
        "founder_body_4": "We sincerely thank all members, volunteers, and supporters who have contributed to the success of this initiative. Together, we can continue building a stronger, more connected, and more supportive community.",
        "founder_regards": "Warm regards,",
         },
    ar: {
        "nav_home": "الرئيسية",
        "nav_about": "من نحن",
        "nav_founder": "رسالة اللجنة التنفيذية",
        "nav_services": "الخدمات",
        "nav_jobs": "بوابة الوظائف",
        "nav_medical": "المساعدة الطبية",
        "nav_legal": "الدعم القانوني",
        "nav_transfer": "نقل الوثائق",
        "nav_news": "الأخبار",
        "nav_gallery": "المعرض والفعاليات",
        "nav_membership": "العضوية",
        "nav_contact": "اتصل بنا",
        "nav_dashboard": "لوحة التحكم",
        "nav_admin": "إدارة النظام",
        
        "motto": "مجتمع واحد، منصة واحدة، دعم لا نهائي.",
        "tagline": "ربط أهل جولبارجا في جميع أنحاء سلطنة عمان",
        "org_name": "مجموعة بهمني العمانية",
        "org_abbr": "BGO",
        
        "hero_subtitle": "منظمة مجتمعية غير ربحية",
        "hero_title": "تعزيز الروابط بين مقيمي جولبارجا في سلطنة عمان",
        "hero_cta_join": "انضم كعضو",
        "hero_cta_emergency": "خط المساعدة في حالات الطوارئ",
        
        "stat_service": "سنوات من الخدمة",
        "stat_members": "أعضاء المجتمع",
        "stat_jobs": "الوظائف المشتركة",
        "stat_medical": "الحالات الطبية",
        "stat_volunteers": "المتطوعون النشطون",
        
        "helpline_title": "هل تحتاج إلى مساعدة فورية؟",
        "helpline_desc": "إذا كنت تواجه حالة طوارئ طبية، أو مشكلة قانونية، أو أزمة وظيفية، أو تحتاج إلى نقل وثائق عاجلة، تواصل مع فريق الدعم لدينا على الفور.",
        "helpline_call": "الاتصال بالدعم",
        "helpline_whatsapp": "الدعم عبر الواتساب",
        "helpline_req_btn": "تقديم طلب مساعدة",
        
        "services_title": "خدماتنا الأساسية",
        "services_subtitle": "تقف مجموعة بهمني كركيزة دعم تسد الفجوة بين عمان وكلابوراجي.",
        "srv_info_title": "معلومات المجتمع",
        "srv_info_desc": "ابق على اطلاع بأخبار جولبارجا، والإعلانات المجتمعية، والتحديثات التعليمية، وإرشادات السفر.",
        "srv_jobs_title": "فرص عمل موثوقة",
        "srv_jobs_desc": "تصفح الوظائف الشاغرة الموثقة، واحصل على التوجيه المهني والمساعدة في كتابة السيرة الذاتية.",
        "srv_med_title": "المساعدة الطبية",
        "srv_med_desc": "طلب التبرع بالدم في حالات الطوارئ، والحصول على إرشادات المستشفيات، ومساعدة المرضى، وجهات اتصال الإسعاف.",
        "srv_legal_title": "الدعم القانوني",
        "srv_legal_desc": "إرشادات بشأن النزاعات العمالية، ومشاكل التأشيرات، والعلاقة مع صاحب العمل من خلال اتصالات قانونية معتمدة.",
        "srv_transfer_title": "نقل الوثائق",
        "srv_transfer_desc": "نقل آمن وعاجل لجوازات السفر، والتقارير الطبية، والشهادات بين عمان وجولبارجا.",
        
        "btn_view_details": "عرض التفاصيل",
        "btn_apply_now": "قدم الآن",
        "btn_submit": "تقديم الطلب",
        "btn_login": "تسجيل دخول الأعضاء",
        "btn_logout": "تسجيل الخروج",
        
        "founder_title": "رسالة من اللجنة التنفيذية",
        "founder_salutation": "السلام عليكم ورحمة الله وبركاته،",
        "founder_body_1": "تأسست مجموعة بهمني العمانية برؤية تجمع أبناء جولبارجا المقيمين في سلطنة عمان تحت منصة واحدة.",
        "founder_body_2": "عندما يبتعد الناس عن مسقط رأسهم بحثًا عن فرص أفضل، فإنهم غالبًا ما يواجهون تحديات تتعلق بالتوظيف والصحة والمسائل القانونية وحالات الطوارئ. هدفنا هو ضمان عدم شعور أي عضو في مجتمعنا بالوحدة خلال الأوقات الصعبة.",
        "founder_body_3": "على مر السنين، نمت المجموعة لتصبح شبكة مجتمعية موثوقة حيث يدعم الأعضاء بعضهم البعض، ويشاركون الفرص، ويعملون معًا من أجل رفاهية المجتمع.",
        "founder_body_4": "أتقدم بخالص الشكر لجميع الأعضاء والمتطوعين والداعمين الذين ساهموا في نجاح هذه المبادرة. معًا، يمكننا الاستمرار في بناء مجتمع أقوى وأكثر ترابطًا ودعمًا.",
        "founder_regards": "مع أطيب التحيات،",
        "founder_name": "فريق اللجنة التنفيذية",
        "founder_role": "اللجنة التنفيذية لمجموعة بهمني العمانية (BGO)"
    },
    ur: {
        "nav_home": "ہوم",
        "nav_about": "ہمارے بارے میں",
        "nav_founder": "ایگزیکٹو کمیٹی کا پیغام",
        "nav_services": "خدمات",
        "nav_jobs": "جوب پورٹل",
        "nav_medical": "طبی امداد",
        "nav_legal": "قانی رہنمائی",
        "nav_transfer": "کاغذات کی منتقلی",
        "nav_news": "خبریں",
        "nav_gallery": "گیلری اور تقاریب",
        "nav_membership": "رکنیت",
        "nav_contact": "رابطہ کریں",
        "nav_dashboard": "ڈیش بورڈ",
        "nav_admin": "ایڈمن پینل",
        
        "motto": "ایک برادری، ایک پلیٹ فارم، بے لوث مدد۔",
        "tagline": "عمان میں مقیم گلبرگہ کے لوگوں کو آپس میں جوڑنا",
        "org_name": "بہمنی گروپ عمان",
        "org_abbr": "BGO",
        
        "hero_subtitle": "غیر منافع بخش سماجی تنظیم",
        "hero_title": "عمان میں مقیم گلبرگہ کے باسیوں کے درمیان اتحاد اور بھائی چارہ",
        "hero_cta_join": "ممبر بنیں",
        "hero_cta_emergency": "ایمرجنسی ہیلپ لائن",
        
        "stat_service": "ایمرجنسی ہیلپ لائن",
        "stat_members": "کمیونٹی ممبرز",
        "stat_jobs": "ملازمتیں شیئر کیں",
        "stat_medical": "طبی معاملات میں مدد",
        "stat_volunteers": "سرگرم رضاکار",
        
        "helpline_title": "فوری مدد کی ضرورت ہے؟",
        "helpline_desc": "اگر آپ کو طبی ایمرجنسی، قانونی مسئلہ، ملازمت کا بحران، یا فوری دستاویزات کی منتقلی درپیش ہے، تو فوراً ہماری سپورٹ ٹیم سے رابطہ کریں۔",
        "helpline_call": "رابطہ کریں",
        "helpline_whatsapp": "واٹس ایپ سپورٹ",
        "helpline_req_btn": "درخواست جمع کریں",
        
        "services_title": "ہماری اہم خدمات",
        "services_subtitle": "بہمنی گروپ عمان اور گلبرگہ کے درمیان ایک مضبوط پل کی طرح کام کرتا ہے۔",
        "srv_info_title": "کمیونٹی معلومات",
        "srv_info_desc": "گلبرگہ کی خبریں، کمیونٹی کے اعلانات، تعلیمی اپ ڈیٹس اور سفری معلومات سے باخبر رہیں۔",
        "srv_jobs_title": "تصدیق شدہ ملازمتیں",
        "srv_jobs_desc": "ملازمتوں کے اشتہارات تلاش کریں، کیریئر کے بارے میں رہنمائی اور سی وی بنانے میں مدد حاصل کریں۔",
        "srv_med_title": "طبی امداد",
        "srv_med_desc": "خون کے عطیات کی ایمرجنسی درخواستیں، ہسپتال کی رہنمائی، مریضوں کی مدد اور ایمبولینس رابطے۔",
        "srv_legal_title": "قانونی مدد",
        "srv_legal_desc": "ملازمت کے تنازعات، ویزا مسائل اور آجر کے ساتھ تعلقات کے لیے قانونی وسائل سے رہنمائی فراہم کرنا۔",
        "srv_transfer_title": "دستاویزات کی منتقلی",
        "srv_transfer_desc": "عمان سے گلبرگہ اور گلبرگہ سے عمان پاسپورٹ، طبی رپورٹس اور اسناد کی محفوظ منتقلی۔",
        
        "btn_view_details": "تفصیلات دیکھیں",
        "btn_apply_now": "ابھی اپلائی کریں",
        "btn_submit": "درخواست بھیجیں",
        "btn_login": "ممبر لاگ ان",
        "btn_logout": "لاگ آؤٹ",
        
        "founder_title": "ایگزیکٹو کمیٹی کا خصوصی پیغام",
        "founder_salutation": "السلام علیکم،",
        "founder_body_1": "بہمنی گروپ آف عمان کا قیام اس وژن کے ساتھ عمل میں لایا گیا تھا کہ عمان میں رہنے والے گلبرگہ کے لوگوں کو ایک ہی پلیٹ فارم پر اکٹھا کیا جائے۔",
        "founder_body_2": "جب لوگ بہتر مستقبل کی تلاش میں اپنے وطن سے دور جاتے ہیں، تو انہیں اکثر روزگار، صحت، قانونی معاملات اور ہنگامی حالات میں مشکلات کا سامنا کرنا پڑتا ہے۔ ہمارا مقصد یہ ہے کہ کوئی بھی ممبر مشکل وقت میں خود کو تنہا محسوس نہ کرے۔",
        "founder_body_3": "گزشتہ برسوں میں، BGO نے ایک قابل اعتماد کمیونٹی نیٹ ورک کی شکل اختیار کی ہے جہاں ممبران ایک دوسرے کی مدد کرتے ہیں، مواقع شیئر کرتے ہیں اور فلاح و بہبود کے لیے کام کرتے ہیں۔",
        "founder_body_4": "میں ان تمام ممبران، رضاکاروں اور حامیوں کا شکریہ ادا کرتا ہوں جنہوں نے اس کام کو کامیاب بنانے میں حصہ لیا۔ ہم مل کر ایک مضبوط اور مددگار کمیونٹی بنا سکتے ہیں۔",
        "founder_regards": "طالبِ دعا،",
        "founder_name": "ایگزیکٹو کمیٹی ٹیم",
        "founder_role": "ایگزیکٹو کمیٹی، بہمنی گروپ آف عمان (BGO)"
    },
    kn: {
        "nav_home": "ಮುಖಪುಟ",
        "nav_about": "ನಮ್ಮ ಬಗ್ಗೆ",
        "nav_founder": "ಕಾರ್ಯಕಾರಿ ಸಮಿತಿಯ ಸಂದೇಶ",
        "nav_services": "ಸೇವೆಗಳು",
        "nav_jobs": "ಉದ್ಯೋಗ ಪೋರ್ಟಲ್",
        "nav_medical": "ವೈದ್ಯಕೀಯ ನೆರವು",
        "nav_legal": "ಕಾನೂನು ಸಲಹೆ",
        "nav_transfer": "ದಾಖಲೆಗಳ ವರ್ಗಾವಣೆ",
        "nav_news": "ಸುದ್ದಿ",
        "nav_gallery": "ಗ್ಯಾಲರಿ ಮತ್ತು ಈವೆಂಟ್ಸ್",
        "nav_membership": "ಸದಸ್ಯತ್ವ",
        "nav_contact": "ಸಂಪರ್ಕಿಸಿ",
        "nav_dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        "nav_admin": "ನಿರ್ವಾಹಕ ಪುಟ",
        
        "motto": "ಒಂದೇ ಸಮುದಾಯ, ಒಂದೇ ವೇದಿಕೆ, ಕೊನೆಯಿಲ್ಲದ ಬೆಂಬಲ.",
        "tagline": "ಓಮನ್‌ನಾದ್ಯಂತ ಗುಲ್ಬರ್ಗಾ ಜನರನ್ನು ಸಂಪರ್ಕಿಸುವುದು",
        "org_name": "ಬಹಮನಿ ಗ್ರೂಪ್ ಓಮನ್",
        "org_abbr": "BGO",
        
        "hero_subtitle": "ಲಾಭರಹಿತ ಸಮುದಾಯ ಸಂಸ್ಥೆ",
        "hero_title": "ಓಮನ್‌ನಲ್ಲಿರುವ ಗುಲ್ಬರ್ಗಾ ನಿವಾಸಿಗಳ ನಡುವೆ ಬಾಂಧವ್ಯದ ಬಲವರ್ಧನೆ",
        "hero_cta_join": "ಸದಸ್ಯರಾಗಿ ಸೇರಿ",
        "hero_cta_emergency": "ತುರ್ತು ಸಹಾಯವಾಣಿ",
        
        "stat_service": "ವರ್ಷಗಳ ಸೇವೆ",
        "stat_members": "ಸಮುದಾಯದ ಸದಸ್ಯರು",
        "stat_jobs": "ಹಂಚಿಕೊಳ್ಳಲಾದ ಉದ್ಯೋಗಗಳು",
        "stat_medical": "ವೈದ್ಯಕೀಯ ಪ್ರಕರಣಗಳು",
        "stat_volunteers": "ಸಕ್ರಿಯ ಸ್ವಯಂಸೇವಕರು",
        
        "helpline_title": "ತುರ್ತು ಸಹಾಯ ಬೇಕಾಗಿದೆಯೇ?",
        "helpline_desc": "ವೈದ್ಯಕೀಯ ತುರ್ತುಸ್ಥಿತಿ, ಕಾನೂನು ಸಮಸ್ಯೆ, ಉದ್ಯೋಗ ಬಿಕ್ಕಟ್ಟು ಅಥವಾ ತುರ್ತು ದಾಖಲೆ ವರ್ಗಾವಣೆ ಅಗತ್ಯವಿದ್ದರೆ ತಕ್ಷಣ ನಮ್ಮ ಸಹಾಯವಾಣಿ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        "helpline_call": "ಕರೆ ಮಾಡಿ",
        "helpline_whatsapp": "ವಾಟ್ಸಾಪ್ ಸಹಾಯ",
        "helpline_req_btn": "ತುರ್ತು ವಿನಂತಿ ಸಲ್ಲಿಸಿ",
        
        "services_title": "ನಮ್ಮ ಮುಖ್ಯ ಸೇವೆಗಳು",
        "services_subtitle": "ಓಮನ್ ಮತ್ತು ಕಲಬುರಗಿ ನಡುವೆ ಬಲವಾದ ಸಂಪರ್ಕ ಸೇತುವೆಯಾಗಿ ಬಹಮನಿ ಗ್ರೂಪ್ ಕೆಲಸ ಮಾಡುತ್ತದೆ.",
        "srv_info_title": "ಮಾಹಿತಿ ಸೇವೆ",
        "srv_info_desc": "ಗುಲ್ಬರ್ಗಾ ಸುದ್ದಿ, ಸಮುದಾಯ ಪ್ರಕಟಣೆಗಳು, ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿ ಮತ್ತು ಪ್ರಯಾಣದ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ತಿಳಿದುಕೊಳ್ಳಿ.",
        "srv_jobs_title": "ಖಚಿತ ಉದ್ಯೋಗಗಳು",
        "srv_jobs_desc": "ಪರಿಶೀಲಿಸಿದ ಉದ್ಯೋಗಾವಕಾಶಗಳನ್ನು ಹುಡುಕಿ, ಉದ್ಯೋಗ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ರೆಸ್ಯೂಮ್ ತಯಾರಿಕೆಗೆ ಸಹಾಯ ಪಡೆಯಿರಿ.",
        "srv_med_title": "ವೈದ್ಯಕೀಯ ನೆರವು",
        "srv_med_desc": "ತುರ್ತು ರಕ್ತದಾನ ವಿನಂತಿಗಳು, ಆಸ್ಪತ್ರೆ ಮಾರ್ಗದರ್ಶನ, ರೋಗಿಗಳ ನೆರವು ಮತ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಂಪರ್ಕಗಳು.",
        "srv_legal_title": "ಕಾನೂನು ಬೆಂಬಲ",
        "srv_legal_desc": "ಕಾರ್ಮಿಕ ವಿವಾದಗಳು, ವೀಸಾ ತೊಂದರೆಗಳು ಮತ್ತು ಉದ್ಯೋಗದ ಸಮಸ್ಯೆಗಳಿಗೆ ಕಾನೂನು ತಜ್ಞರ ಮೂಲಕ ಉಚಿತ ಸಲಹೆ ಪಡೆಯಿರಿ.",
        "srv_transfer_title": "ದಾಖಲೆ ವರ್ಗಾವಣೆ",
        "srv_transfer_desc": "ಓಮನ್‌ನಿಂದ ಗುಲ್ಬರ್ಗಾ ಅಥವಾ ಗುಲ್ಬರ್ಗಾದಿಂದ ಓಮನ್‌ಗೆ ಪಾಸ್‌ಪೋರ್ಟ್, ಶೈಕ್ಷಣಿಕ ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ವೈದ್ಯಕೀಯ ವರದಿಗಳ ಸುರಕ್ಷಿತ ವರ್ಗಾವಣೆ.",
        
        "btn_view_details": "ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
        "btn_apply_now": "ಈಗಲೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
        "btn_submit": "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
        "btn_login": "ಸದಸ್ಯರ ಲಾಗಿನ್",
        "btn_logout": "ಲಾಗ್ ಔಟ್",
        
        "founder_title": "ಕಾರ್ಯಕಾರಿ ಸಮಿತಿಯ (EXCOM) ಸಂದೇಶ",
        "founder_salutation": "ಅಸ್ಸಲಾಮು ಅಲೈಕುಮ್,",
        "founder_body_1": "ಓಮನ್‌ನಲ್ಲಿ ವಾಸಿಸುತ್ತಿರುವ ಗುಲ್ಬರ್ಗಾ ಜನರನ್ನು ಒಂದೇ ವೇದಿಕೆಯಡಿ ಒಟ್ಟುಗೂಡಿಸುವ ದೃಷ್ಟಿಯೊಂದಿಗೆ ಬಹಮನಿ ಗ್ರೂಪ್ ಆಫ್ ಓಮನ್ ಅನ್ನು ಸ್ಥಾಪಿಸಲಾಯಿತು.",
        "founder_body_2": "ಉತ್ತಮ ಅವಕಾಶಗಳ ಹುಡುಕಾಟದಲ್ಲಿ ಜನರು ತಾಯ್ನಾಡಿನಿಂದ ದೂರ ಹೋದಾಗ, ಅವರು ಉದ್ಯೋಗ, ಆರೋಗ್ಯ, ಕಾನೂನು ವಿಷಯಗಳು ಮತ್ತು ತುರ್ತು ಪರಿಸ್ถಿತಿಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಸವಾಲುಗಳನ್ನು ಎದುರಿಸುತ್ತಾರೆ. ನಮ್ಮ ಸಮುದಾಯದ ಯಾವುದೇ ಸದಸ್ಯರು ಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ಒಂಟಿತನ ಅನುಭವಿಸಬಾರದು ಎಂಬುದು ನಮ್ಮ ಆಶಯ.",
        "founder_body_3": "ವರ್ಷಗಳಲ್ಲಿ, ಬಿಜಿಒ ಸಮುದಾಯ ಸದಸ್ಯರು ಪರಸ್ಪರ ಬೆಂಬಲಿಸುವ, ಅವಕಾಶಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವ ಮತ್ತು ಒಟ್ಟಾಗಿ ಕೆಲಸ ಮಾಡುವ ವಿಶ್ವಾಸಾರ್ಹ ಸಮುದಾಯ ನೆಟ್‌ವರ್ಕ್ ಆಗಿ ಬೆಳೆದಿದೆ.",
        "founder_body_4": "ಈ ಸಂಸ್ಥೆಯ ಯಶಸ್ಸಿಗೆ ಕಾರಣರಾದ ಎಲ್ಲಾ ಸದಸ್ಯರು, ಸ್ವಯಂಸೇವಕರು ಮತ್ತು ಬೆಂಬಲಿಗರಿಗೆ ನಾನು ಹೃತ್ಪೂರ್ವಕ ಧನ್ಯವಾದಗಳನ್ನು ಅರ್ಪಿಸುತ್ತೇನೆ. ನಾವೆಲ್ಲರೂ ಒಟ್ಟಾಗಿ ಇನ್ನಷ್ಟು ಬಲವಾದ ಮತ್ತು ಬೆಂಬಲ ನೀಡುವ ಸಮುದಾಯವನ್ನು ನಿರ್ಮಿಸೋಣ.",
        "founder_regards": "ಆತ್ಮೀಯ ವಂದನೆಗಳೊಂದಿಗೆ,",
        "founder_name": "ಕಾರ್ಯಕಾರಿ ಸಮಿತಿ ತಂಡ (EXCOM TEAM)",
        "founder_role": "ಕಾರ್ಯಕಾರಿ ಸಮಿತಿ, ಬಹಮನಿ ಗ್ರೂಪ್ ಆಫ್ ಓಮನ್ (BGO)"
    }
};

let currentLang = localStorage.getItem("bgo_lang") || "en";

function setLanguage(lang) {
    if (!BGO_LANGUAGES[lang]) return;
    currentLang = lang;
    localStorage.setItem("bgo_lang", lang);
    
    // Update HTML dir and lang attributes
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", BGO_LANGUAGES[lang].dir);
    
    // Update active state in selects across page
    const selectors = document.querySelectorAll(".lang-selector");
    selectors.forEach(sel => {
        sel.value = lang;
    });
    
    applyTranslations();
}

function applyTranslations() {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS["en"];
    
    // Process all elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach(elem => {
        const key = elem.getAttribute("data-i18n");
        const translation = dict[key];
        
        if (translation) {
            const attr = elem.getAttribute("data-i18n-attr");
            if (attr) {
                elem.setAttribute(attr, translation);
            } else {
                // If it contains tags, we might want innerHTML, otherwise textContent
                if (elem.querySelector("input, select, textarea, img, svg")) {
                    // Do not overwrite children elements if it's a wrapper, but usually data-i18n is placed on leaf nodes
                    elem.textContent = translation;
                } else {
                    elem.innerHTML = translation;
                }
            }
        }
    });
}

function t(key) {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS["en"];
    return dict[key] || TRANSLATIONS["en"][key] || key;
}

// Initial direct execution to set correct attributes on page load
document.addEventListener("DOMContentLoaded", () => {
    setLanguage(currentLang);
});
