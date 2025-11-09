/* scripts.js — محدث: سبلاش بشرارات، لوحة متناسقة، عرض البريد ورقم الجوال والمقنع */
document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'pw_contest_entries_v5';

    // أقسام
    const userInfo = document.getElementById('userInfo');
    const home = document.getElementById('home');
    const test = document.getElementById('test');
    const leaderboard = document.getElementById('leaderboard');
    const info = document.getElementById('info');

    // عناصر التسجيل
    const userName = document.getElementById('userName');
    const userPhone = document.getElementById('userPhone');
    const userEmail = document.getElementById('userEmail');
    const startChallenge = document.getElementById('startChallenge');
    const goHomeFromUser = document.getElementById('goHomeFromUser');

    // عناصر الاختبار
    const passwordInput = document.getElementById('passwordInput');
    const toggleReveal = document.getElementById('toggleReveal');
    const checkBtn = document.getElementById('checkBtn');
    const submitBtn = document.getElementById('submitBtn');
    const backHome = document.getElementById('backHome');
    const resultEl = document.getElementById('result');
    const meterBar = document.getElementById('meterBar');

    // لوحة المتصدرين
    const leaderContainer = document.getElementById('leaderContainer');
    const lbBack = document.getElementById('lbBack');
    const clearEntriesBtn = document.getElementById('clearEntries');

    // أزرار معلومات
    const infoBack = document.getElementById('infoBack');
    const infoToTest = document.getElementById('infoToTest');

    // إظهار قسم
    function showSection(section) {
        [userInfo, home, test, leaderboard, info].forEach(s => s && s.classList.remove('active'));
        section && section.classList.add('active');
    }

    // منبثق أنيق
    function showToast(msg) {
        const toast = document.createElement('div');
        toast.textContent = msg;
        Object.assign(toast.style, {
            position: 'fixed', bottom: '25px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '10px 18px',
            borderRadius: '8px', fontSize: '1rem', zIndex: 9999, transition: 'opacity .3s'
        });
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = '0', 2500);
        setTimeout(() => toast.remove(), 3000);
    }

    // تحميل/حفظ
    function loadEntries() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
    }
    function saveEntries(entries) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }

    // تحقق البريد
    function validEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // شروط كلمة المرور
    function checkPasswordConditions(pw, name) {
        const c = [];
        if (pw.length < 8) c.push("الحد الأدنى 8 أحرف");
        if (!/[A-Z]/.test(pw)) c.push("حرف كبير واحد على الأقل");
        if (!/[a-z]/.test(pw)) c.push("حرف صغير واحد على الأقل");
        if (!/\d/.test(pw)) c.push("رقم واحد على الأقل");
        if (!/[\W_]/.test(pw)) c.push("رمز خاص واحد على الأقل");
        if (name && pw.toLowerCase().includes(name.toLowerCase())) c.push("لا يجوز استخدام الاسم في كلمة المرور");
        return c;
    }

    // تقييم (لا نغير ما يخص النسبة أو ألوانها هنا)
    function evaluatePassword(pw) {
        let score = 0;
        if (!pw) return { score: 0, label: '', percent: 0 };
        if (pw.length >= 8) score += 2;
        if (/[a-z]/.test(pw)) score += 1;
        if (/[A-Z]/.test(pw)) score += 1;
        if (/\d/.test(pw)) score += 1;
        if (/[\W_]/.test(pw)) score += 2;
        if (pw.length >= 12) score += 1;
        const percent = Math.min(100, Math.round((score / 8) * 100));
        let label = '';
        if (score >= 7) label = '💪 قوية جداً';
        else if (score >= 4) label = '👍 متوسطة';
        else label = '⚠️ ضعيفة';
        return { score, label, percent };
    }

    // قناع عرض
    function maskForDisplay(text) {
        if (!text) return '';
        const s = String(text);
        if (s.length <= 3) return '*'.repeat(s.length);
        return '*'.repeat(s.length - 3) + s.slice(-3);
    }

    // عرض لوحة الترتيب — مطابق للـ CSS: الاسم على اليمين، والبريد/جوال/كلمة على اليسار (مرصوصة)
    function renderLeaderboard() {
        const entries = loadEntries();
        leaderContainer.innerHTML = '';
        if (!entries.length) {
            leaderContainer.innerHTML = '<div class="leader-item">لا توجد مشاركات بعد 💡</div>';
            return;
        }
        entries.sort((a,b) => b.score - a.score || b.percent - a.percent);
        entries.forEach((it, idx) => {
            const div = document.createElement('div');
            div.className = 'leader-item' + (idx===0? ' top1':'');
            div.innerHTML = `
                <div class="rank-box">${idx+1}</div>
                <div class="leader-info">
                    <div class="name">${it.name}</div>
                    <div class="strength">${it.label} — ${it.percent}%</div>
                </div>
                <div class="leader-stats">
                    <div class="email">${it.email}</div>
                    <div class="phone">${maskForDisplay(it.phone)}</div>
                    <div class="pass">${maskForDisplay(it.original)}</div>
                </div>
            `;
            leaderContainer.appendChild(div);
        });
    }

    // سبلاش مع شرارات — يظهر عند الضغط على "اختبر قوة كلمتك"
    const toTestBtn = document.getElementById('toTest');
    if (toTestBtn) {
        toTestBtn.addEventListener('click', () => {
            const splash = document.getElementById('splash');
            if (splash) {
                // نظهر العنصر المحفوظ في الـ HTML (إذا موجود) مع إضافة شرارات ديناميكية
                splash.style.display = 'block';
                // أنشئ بعض الشرارات المتحركة
                const sparks = [];
                for (let i=0;i<10;i++){
                    const s = document.createElement('div');
                    s.className = 'splash-sparkle';
                    // موضع عشوائي داخل الصندوق
                    const left = 20 + Math.random()*60; // 20..80%
                    const top = 80 + Math.random()*20;  // تبدأ أسفل النص ثم تطير للأعلى
                    Object.assign(s.style, {
                        left: left + '%',
                        top: top + '%',
                        background: `radial-gradient(circle at 30% 30%, #fff, ${['#ffd24d','#ff6b6b','#7affc2','#ffd2ff'][i%4]} 40%, transparent 60%)`,
                        animationDelay: (Math.random()*800) + 'ms'
                    });
                    splash.appendChild(s);
                    sparks.push(s);
                }
                // مدة العرض قابلة للتعديل: (هنا 3000ms)
                setTimeout(() => {
                    // ازالة الشرارات والمنبثقات
                    sparks.forEach(s => s.remove());
                    splash.style.display = 'none';
                    showSection(userInfo);
                }, 3000);
            } else {
                // إن لم يكن هناك عنصر ثابت في HTML، ننشئ واحد مؤقت
                const tmp = document.createElement('div');
                tmp.className = 'splash-content';
                tmp.innerHTML = `<h2>هل أنت قد التحدي؟</h2><p>جرب واكتب أقوى كلمة سر 💪</p>`;
                const wrapper = document.createElement('div');
                wrapper.id = 'splash-temp';
                wrapper.style.position = 'fixed';
                Object.assign(wrapper.style, {
                    top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                    background:'rgba(19,113,124,0.95)', color:'#fff', padding:'24px 34px', borderRadius:'12px', zIndex:9998, textAlign:'center', boxShadow:'0 10px 40px rgba(0,0,0,0.45)'
                });
                wrapper.appendChild(tmp);
                document.body.appendChild(wrapper);
                // شرارات
                const sparks = [];
                for (let i=0;i<10;i++){
                    const s = document.createElement('div');
                    s.className = 'splash-sparkle';
                    s.style.left = (30 + Math.random()*40) + '%';
                    s.style.top = (70 + Math.random()*30) + '%';
                    s.style.background = `radial-gradient(circle at 30% 30%, #fff, ${['#ffd24d','#ff6b6b','#7affc2','#ffd2ff'][i%4]} 40%, transparent 60%)`;
                    wrapper.appendChild(s);
                    sparks.push(s);
                }
                setTimeout(() => { sparks.forEach(s=>s.remove()); wrapper.remove(); showSection(userInfo); }, 3000);
            }
        });
    }

    // بدء التحدي (حفظ current_user ثم إظهار الاختبار)
    startChallenge.addEventListener('click', () => {
        const name = userName.value.trim(), phone = userPhone.value.trim(), email = userEmail.value.trim();
        if (!name || !phone || !email) return showToast("الرجاء إدخال جميع البيانات.");
        if (!validEmail(email)) return showToast("صيغة البريد الإلكتروني غير صحيحة.");
        localStorage.setItem('current_user', JSON.stringify({ name, phone, email }));
        showSection(test);
    });

    goHomeFromUser.addEventListener('click', () => showSection(home));
    backHome && backHome.addEventListener('click', () => showSection(home));

    // إظهار/إخفاء كلمة المرور
    toggleReveal && toggleReveal.addEventListener('click', () => {
        if (passwordInput.type === 'password') { passwordInput.type = 'text'; toggleReveal.textContent = '🙈'; }
        else { passwordInput.type = 'password'; toggleReveal.textContent = '👁️'; }
        passwordInput.focus();
    });

    // تقييم القوة (زر التقييم)
    checkBtn && checkBtn.addEventListener('click', () => {
        const pw = (passwordInput.value || '').trim();
        const user = JSON.parse(localStorage.getItem('current_user') || '{}');
        if (!pw) return showToast("أدخل كلمة المرور أولاً.");
        const missing = checkPasswordConditions(pw, user.name || '');
        if (missing.length) return showToast("ناقص: " + missing.join("، "));
        const { label, percent } = evaluatePassword(pw);
        meterBar.style.width = percent + '%';
        resultEl.textContent = `قوة كلمتك: ${label}`;
    });

    // حفظ للمسابقة → ثم عرض صفحة "سر الكلمة القوية"
    submitBtn && submitBtn.addEventListener('click', () => {
        const pw = (passwordInput.value || '').trim();
        const user = JSON.parse(localStorage.getItem('current_user') || '{}');
        if (!user.name || !user.phone || !user.email) return showToast("سجّل بياناتك أولاً.");
        const missing = checkPasswordConditions(pw, user.name);
        if (missing.length) return showToast("ناقص: " + missing.join("، "));
        const res = evaluatePassword(pw);
        const entries = loadEntries();
        entries.push({
            name: user.name,
            phone: user.phone,
            email: user.email,
            original: pw,
            score: res.score,
            label: res.label,
            percent: res.percent,
            ts: new Date().toISOString()
        });
        saveEntries(entries);
        showToast("تم الحفظ بنجاح ✅");
        showSection(info); // عرض صفحة المعلومات كما طلبت
        // إعادة تهيئة
        localStorage.removeItem('current_user');
        userName.value = userPhone.value = userEmail.value = passwordInput.value = '';
        meterBar.style.width = '0%'; resultEl.textContent = '';
        renderLeaderboard(); // تحديث اللوحة بعد الحفظ
    });

    // أزرار صفحة المعلومات
    if (infoBack) infoBack.addEventListener('click', () => showSection(home));
    if (infoToTest) infoToTest.addEventListener('click', () => { showSection(test); passwordInput.focus(); });

    // زر فتح لوحة الترتيب
    const openLeaderboardBtn = document.getElementById('openLeaderboard');
    if (openLeaderboardBtn) openLeaderboardBtn.addEventListener('click', () => { renderLeaderboard(); showSection(leaderboard); });
    lbBack && lbBack.addEventListener('click', () => showSection(home));

    // مسح الكل
    clearEntriesBtn && clearEntriesBtn.addEventListener('click', () => {
        if (!confirm('هل تريد مسح جميع المشاركات؟')) return;
        localStorage.removeItem(STORAGE_KEY);
        renderLeaderboard();
        showToast("تم المسح بنجاح.");
    });
    // ... كامل الكود كما هو إلى دالة maskForDisplay ...

// ✅ تعديل جديد: قناع مخصص للبريد
function maskEmail(email) {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (!domain) return maskForDisplay(email);
    const visible = user.slice(-3);
    return '*'.repeat(user.length - 3) + visible + '@' + domain;
}

// عرض لوحة الترتيب
function renderLeaderboard() {
    const entries = loadEntries();
    leaderContainer.innerHTML = '';
    if (!entries.length) {
        leaderContainer.innerHTML = '<div class="leader-item">لا توجد مشاركات بعد 💡</div>';
        return;
    }
    entries.sort((a,b) => b.score - a.score || b.percent - a.percent);
    entries.forEach((it, idx) => {
        const div = document.createElement('div');
        div.className = 'leader-item' + (idx===0? ' top1':'');
        div.innerHTML = `
            <div class="rank-box">${idx+1}</div>
            <div class="leader-info">
                <div class="name">${it.name}</div>
                <div class="strength">${it.label} — ${it.percent}%</div>
            </div>
            <div class="leader-stats">
                <div class="email">${maskEmail(it.email)}</div>
                <div class="phone">${maskForDisplay(it.phone)}</div>
                <div class="pass">${maskForDisplay(it.original)}</div>
            </div>
        `;
        leaderContainer.appendChild(div);
    });
}

// ✅ تعديل تأثير الفقاعات ليغطي الصفحة كاملة ويختفي تدريجيًا مع السبلاش
if (toTestBtn) {
    toTestBtn.addEventListener('click', () => {
        const splash = document.getElementById('splash');
        if (splash) {
            splash.style.display = 'block';
            const sparks = [];
            for (let i=0;i<20;i++){
                const s = document.createElement('div');
                s.className = 'splash-sparkle';
                Object.assign(s.style, {
                    left: Math.random()*100 + '%',
                    top: Math.random()*100 + '%',
                    background: `radial-gradient(circle at 30% 30%, #fff, ${['#ffd24d','#ff6b6b','#7affc2','#ffd2ff'][i%4]} 40%, transparent 60%)`,
                    animationDelay: (Math.random()*1500)+'ms'
                });
                document.body.appendChild(s);
                sparks.push(s);
            }
            setTimeout(() => {
                sparks.forEach(s => {
                    s.style.transition = 'opacity 0.8s ease';
                    s.style.opacity = 0;
                    setTimeout(()=>s.remove(), 800);
                });
                splash.style.display = 'none';
                showSection(userInfo);
            }, 3000);
        }
    });
}

// ... بقية الكود بدون أي تعديل ...


    // بداية العرض
    showSection(home);
    renderLeaderboard();
});
