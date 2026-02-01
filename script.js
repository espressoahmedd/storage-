// script.js 

// تهيئة Firebase 
const firebaseConfig = {
  apiKey: "AIzaSyDwSiFByLuhlKvGS0H5VABRKpnzh-XgCNI",
  authDomain: "storage-ec88a.firebaseapp.com",
  databaseURL: "https://storage-ec88a-default-rtdb.firebaseio.com",
  projectId: "storage-ec88a",
  storageBucket: "storage-ec88a.firebasestorage.app",
  messagingSenderId: "585522420556",
  appId: "1:585522420556:web:dee428334644e2225dcde9",
  measurementId: "G-W9P9DCKTHG"
};

// تهيئة Firebase 
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ----------------------
// حالة التطبيق والمتغيرات
// ----------------------
let currentPeriod = 'week';
let currentStartDate = new Date();
let currentEndDate = new Date();
let periodData = {};
let allSearchData = null;
let isSearchMode = false;
let isConnected = false;
let isInitialLoad = true;

// ----------------------
// عناصر DOM
// ----------------------
const loadingScreen = document.getElementById('loading-screen');
const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const prevPeriodBtn = document.getElementById('prevPeriod');
const nextPeriodBtn = document.getElementById('nextPeriod');
const currentPeriodBtn = document.getElementById('currentPeriodBtn');
const themeToggleBtn = document.getElementById('theme-toggle');
const periodSelect = document.getElementById('periodSelect');
const jumpToDateInput = document.getElementById('jumpToDate');
const jumpToDateBtn = document.getElementById('jumpToDateBtn');
const totalOwedToMeEl = document.getElementById('totalOwedToMe');
const totalIOweEl = document.getElementById('totalIOwe');
const totalAccountEl = document.getElementById('totalAccount');
const totalReceivedEl = document.getElementById('totalReceived');
const currentPeriodText = document.getElementById('currentPeriodText');
const recordsCountEl = document.getElementById('recordsCount');
const tableOwedToMeTotal = document.getElementById('tableOwedToMeTotal');
const tableIOweTotal = document.getElementById('tableIOweTotal');
const tableAccountTotal = document.getElementById('tableAccountTotal');
const tableReceivedTotal = document.getElementById('tableReceivedTotal');

// ==================== دوال شريط التنقل ====================
function initNavbarScroll() {
    const navbar = document.getElementById('navsec');
    if (!navbar) return;
    
    let lastScrollY = window.pageYOffset;
    window.addEventListener('scroll', () => {
        const currentY = window.pageYOffset;
        if (currentY <= 0) {
            navbar.classList.remove('hide', 'show');
        } else if (currentY > lastScrollY) {
            navbar.classList.add('hide');
            navbar.classList.remove('show');
        } else {
            navbar.classList.add('show');
            navbar.classList.remove('hide');
        }
        lastScrollY = currentY;
    });
}

// ----------------------
// دوال المساعدة
// ----------------------
function showMessage(message, type = 'success') {
    const toast = document.getElementById('global-toast');
    if (!toast) {
        const newToast = document.createElement('div');
        newToast.id = 'global-toast';
        newToast.className = 'qc-toast';
        document.body.appendChild(newToast);
    }
    
    const toastElement = document.getElementById('global-toast');
    let bgColor, textColor;
    switch(type) {
        case 'success': bgColor = '#4CAF50'; textColor = 'white'; break;
        case 'error': bgColor = '#f44336'; textColor = 'white'; break;
        case 'info': bgColor = '#2196F3'; textColor = 'white'; break;
        case 'warning': bgColor = '#ff9800'; textColor = 'white'; break;
        default: bgColor = '#9C27B0'; textColor = 'white';
    }
    
    toastElement.textContent = message;
    toastElement.style.backgroundColor = bgColor;
    toastElement.style.color = textColor;
    toastElement.classList.add('visible');
    
    setTimeout(() => {
        toastElement.classList.remove('visible');
    }, 4000);
}

// ----------------------
// نظام التحميل
// ----------------------
function initLoadingSystem() {
    console.log('🔧 تهيئة نظام التحميل...');
    
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        startLoadingProgress();
    }
}

function startLoadingProgress() {
    let loadingProgress = 0;
    let currentLoadingStep = 0;
    
    const loadingSteps = [
        "جاري التحميل...",
        "جاري تحميل البيانات...", 
        "جاري تهيئة النظام...",
        "جاري تحميل الجدول...",
        "جاري التهيئة النهائية...",
        "تم التحميل بنجاح!"
    ];
    
    const progressInterval = setInterval(() => {
        if (loadingProgress < 90) {
            loadingProgress += Math.random() * 10 + 5;
            if (loadingProgress > 90) loadingProgress = 90;
            
            const progressFill = document.querySelector('.loading-progress-fill');
            const progressText = document.querySelector('.loading-progress-text');
            
            if (progressFill) {
                progressFill.style.width = `${loadingProgress}%`;
            }
            if (progressText) {
                progressText.textContent = `${Math.round(loadingProgress)}%`;
            }
            
            if (loadingProgress >= 15 && currentLoadingStep < 1) {
                currentLoadingStep = 1;
                updateLoadingMessage(loadingSteps[currentLoadingStep]);
            } else if (loadingProgress >= 30 && currentLoadingStep < 2) {
                currentLoadingStep = 2;
                updateLoadingMessage(loadingSteps[currentLoadingStep]);
            } else if (loadingProgress >= 50 && currentLoadingStep < 3) {
                currentLoadingStep = 3;
                updateLoadingMessage(loadingSteps[currentLoadingStep]);
            } else if (loadingProgress >= 70 && currentLoadingStep < 4) {
                currentLoadingStep = 4;
                updateLoadingMessage(loadingSteps[currentLoadingStep]);
            }
        } else {
            clearInterval(progressInterval);
            loadingProgress = 100;
            currentLoadingStep = 5;
            
            const progressFill = document.querySelector('.loading-progress-fill');
            const progressText = document.querySelector('.loading-progress-text');
            
            if (progressFill) progressFill.style.width = '100%';
            if (progressText) progressText.textContent = '100%';
            
            updateLoadingMessage(loadingSteps[5]);
            
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        console.log('✅ تم تحميل الموقع');
                    }, 500);
                }
            }, 1000);
        }
    }, 300);
}

function updateLoadingMessage(message) {
    const messageElement = document.querySelector('.loading-message');
    if (messageElement) {
        messageElement.textContent = message;
    }
}

// تهيئة فلتر الفترة عند تحميل الصفحة
function initPeriodSelect() {
    if (!periodSelect) return;
    
    // تعيين القيمة الحالية للسيلكت
    periodSelect.value = currentPeriod;
    
    // حدث تغيير السيلكت
    periodSelect.addEventListener('change', function() {
        if (isSearchMode) { 
            showMessage('يجب الخروج من وضع البحث أولاً', 'error'); 
            // إعادة تعيين القيمة لما كانت عليه
            this.value = currentPeriod;
            return; 
        }
        
        const value = this.value;
        if (value !== 'week' && value !== 'two-weeks' && value !== 'month') {
            this.value = currentPeriod;
            return;
        }
        
        currentPeriod = value;
        setCurrentPeriod();
        loadPeriodData();
        console.log(`تم تغيير الفترة إلى: ${value}`);
    });
}

// دالة تحديث فلتر الفترة عند تغيير الفترة برمجياً
function updatePeriodSelect() {
    if (periodSelect && periodSelect.value !== currentPeriod) {
        periodSelect.value = currentPeriod;
    }
}

// إعداد فلتر التاريخ والبلاسهولدر
// إعداد فلتر التاريخ والبلاسهولدر
function initDateInput() {
    const dateInput = document.getElementById('jumpToDate');
    const datePlaceholder = document.getElementById('datePlaceholder');
    
    if (!dateInput || !datePlaceholder) return;
    
    // إخفاء البلاسهولدر فقط إذا كان هناك قيمة
    if (dateInput.value) {
        datePlaceholder.style.opacity = '0';
    } else {
        datePlaceholder.style.opacity = '1';
    }
    
    // عند التركيز على حقل التاريخ
    dateInput.addEventListener('focus', function() {
        datePlaceholder.style.opacity = '0';
    });
    
    // عند فقدان التركيز
    dateInput.addEventListener('blur', function() {
        if (!this.value) {
            datePlaceholder.style.opacity = '1';
        }
    });
    
    // عند تغيير القيمة
    dateInput.addEventListener('input', function() {
        if (this.value) {
            datePlaceholder.style.opacity = '0';
        } else {
            datePlaceholder.style.opacity = '1';
        }
    });
    
    // عند تغيير القيمة عبر التقويم
    dateInput.addEventListener('change', function() {
        if (this.value) {
            datePlaceholder.style.opacity = '0';
        } else {
            datePlaceholder.style.opacity = '1';
        }
    });
    
    // تعيين الحد الأدنى والأقصى للتاريخ
    dateInput.min = '2020-01-01';
    dateInput.max = '2030-12-31';
}
// ==================== دوال التنقل بين الفترات ====================

function navigatePeriod(direction) {
    if (currentPeriod === 'week') {
        currentStartDate.setDate(currentStartDate.getDate() + (direction * 7));
        currentEndDate.setDate(currentEndDate.getDate() + (direction * 7));
    } else if (currentPeriod === 'two-weeks') {
        currentStartDate.setDate(currentStartDate.getDate() + (direction * 14));
        currentEndDate.setDate(currentEndDate.getDate() + (direction * 14));
    } else if (currentPeriod === 'month') {
        currentStartDate.setMonth(currentStartDate.getMonth() + direction);
        currentEndDate = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth() + 1, 0);
    }
    loadPeriodData();
    updatePeriodSelect(); // تحديث السيلكت
}

function goToCurrentPeriod() {
    setCurrentPeriod();
    loadPeriodData();
    updatePeriodSelect(); // تحديث السيلكت
    showMessage('تم الانتقال إلى الفترة الحالية', 'success');
}

// ----------------------
// تهيئة التطبيق
// ----------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 بدء تهيئة التطبيق...');
    
    window.scrollTo({ top: 0, behavior: 'auto' });

    // تهيئة شريط التنقل
    initNavbarScroll();
    
    // تهيئة نظام التحميل
    initLoadingSystem();
    
    // تعيين تاريخ اليوم
    
    
    // تهيئة الفلاتر
    initPeriodSelect();
    initDateInput();
    
    setCurrentPeriod();
    loadPeriodData();
    
    // إضافة باقي الـ event listeners
    addEventListeners();
    
    // تعيين الحد الأدنى للتاريخ في حقل الانتقال
    if (jumpToDateInput) {
        jumpToDateInput.min = '2020-01-01';
        jumpToDateInput.max = '2030-12-31';
    }
});

function setCurrentPeriod() {
    const today = new Date();
    currentStartDate = new Date(today);
    currentEndDate = new Date(today);

    if (currentPeriod === 'week') {
        const dow = today.getDay();
        currentStartDate.setDate(today.getDate() - dow);
        currentEndDate = new Date(currentStartDate);
        currentEndDate.setDate(currentStartDate.getDate() + 6);
    } else if (currentPeriod === 'two-weeks') {
        const dow = today.getDay();
        currentStartDate.setDate(today.getDate() - dow);
        currentEndDate = new Date(currentStartDate);
        currentEndDate.setDate(currentStartDate.getDate() + 13);
    } else if (currentPeriod === 'month') {
        currentStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        currentEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    
    // تحديث السيلكت
    updatePeriodSelect();
}

function getPeriodDates() {
    const dates = [];
    const cur = new Date(currentStartDate);
    const end = new Date(currentEndDate);
    
    while (cur <= end) {
        dates.push(formatDate(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return dates;
}

// ----------------------
// تحميل البيانات
// ----------------------
function loadData() {
    database.ref('.info/connected').on('value', (snap) => {
        isConnected = !!snap.val();
        if (isConnected) {
            console.log('✅ متصل بقاعدة البيانات');
        } else {
            console.log('❌ غير متصل بقاعدة البيانات');
        }
    });
    
    loadPeriodData();
}

async function loadPeriodData() {
    isSearchMode = false;
    periodData = {};
    const dates = getPeriodDates();
    
    const promises = dates.map(async (date) => {
        const [d, m, y] = date.split('/');
        const wkNum = getWeekNumber(new Date(y, m - 1, d));
        const weekKey = `${y}-W${wkNum}`;
        
        try {
            const snap = await database.ref(`weeks/${weekKey}/${date}`).once('value');
            if (snap.exists()) {
                return { date, data: snap.val() };
            } else {
                return {
                    date,
                    data: createEmptyDayData(date)
                };
            }
        } catch (err) {
            console.error(`خطأ في تحميل بيانات ${date}:`, err);
            return {
                date,
                data: createEmptyDayData(date)
            };
        }
    });

    try {
        const results = await Promise.all(promises);
        results.forEach(r => periodData[r.date] = r.data);
        renderTable();
        updatePeriodSummary();
        updatePeriodInfo();
    } catch (err) {
        console.error('خطأ في تحميل بيانات الفترة:', err);
        showMessage('خطأ في تحميل بيانات الفترة', 'error');
    }
}

function createEmptyDayData(date) {
    const [d, m, y] = date.split('/');
    const dateObj = new Date(y, m - 1, d);
    
    return {
        date,
        day: getDayName(dateObj.getDay()),
        client: "",
        reference: "",
        price: "",
        account: "",
        received: "",
        owedToMe: "",
        iOwe: ""
    };
}

// ----------------------
// عرض الجدول والملخصات
// ----------------------
function renderTable() {
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    const sortedDates = Object.keys(periodData).sort((a, b) => {
        const [dA, mA, yA] = a.split('/');
        const [dB, mB, yB] = b.split('/');
        return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
    });

    sortedDates.forEach(date => {
        const dayData = periodData[date] || {};
        const [d, m, y] = date.split('/');
        const dateObj = new Date(y, m - 1, d);
        const displayDate = formatDateDisplay(dateObj);
        const shortDay = getShortDayName(dateObj.getDay());

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="date-cell"><input type="text" class="table-input" value="${displayDate}" readonly></td>
            <td class="day-cell"><input type="text" class="table-input" value="${shortDay}" readonly></td>
            <td><input type="text" class="table-input client-input" data-field="client" data-date="${date}" value="${escapeHtml(dayData.client || '')}" placeholder="اسم العميل"></td>
            <td><input type="text" class="table-input reference-input" data-field="reference" data-date="${date}" value="${escapeHtml(dayData.reference || '')}" placeholder="النشارة"></td>
            <td><input type="number" class="table-input price-input numeric-cell" data-field="price" data-date="${date}" value="${dayData.price || ''}" placeholder="0" min="0" step="0.01"></td>
            <td><input type="number" class="table-input account-input numeric-cell" data-field="account" data-date="${date}" value="${dayData.account || ''}" placeholder="0" min="0" step="0.01"></td>
            <td><input type="number" class="table-input received-input numeric-cell" data-field="received" data-date="${date}" value="${dayData.received || ''}" placeholder="0" min="0" step="0.01"></td>
            <td><input type="number" class="table-input owedToMe-input numeric-cell" data-field="owedToMe" data-date="${date}" value="${dayData.owedToMe || ''}" placeholder="0" min="0" step="0.01"></td>
            <td><input type="number" class="table-input iOwe-input numeric-cell" data-field="iOwe" data-date="${date}" value="${dayData.iOwe || ''}" placeholder="0" min="0" step="0.01"></td>
            <td class="save-cell"><button class="save-row-btn" data-date="${date}" title="حفظ الصف"><i class="fas fa-save"></i></button></td>
        `;
        tableBody.appendChild(row);
    });

    if (recordsCountEl) {
        recordsCountEl.textContent = sortedDates.length;
    }
    
    addInputListeners();
    addSaveRowListeners();
}

function updatePeriodSummary() {
    let totalOwedToMe = 0;
    let totalIOwe = 0;
    let totalAccount = 0;
    let totalReceived = 0;

    Object.values(periodData).forEach(day => {
        totalOwedToMe += parseFloat(day.owedToMe) || 0;
        totalIOwe += parseFloat(day.iOwe) || 0;
        totalAccount += parseFloat(day.account) || 0;
        totalReceived += parseFloat(day.received) || 0;
    });

    // دالة مساعدة لتنسيق الأرقام
    function formatNumber(num) {
        // إذا كان الرقم صحيحاً (لا يحتوي على كسور) نعرضه بدون كسور
        if (Number.isInteger(num)) {
            return num.toString();
        } else {
            // إذا كان يحتوي على كسور، نعرضه بمكانين عشريين
            return num.toFixed(2);
        }
    }

    if (totalOwedToMeEl) totalOwedToMeEl.textContent = formatNumber(totalOwedToMe);
    if (totalIOweEl) totalIOweEl.textContent = formatNumber(totalIOwe);
    if (totalAccountEl) totalAccountEl.textContent = formatNumber(totalAccount);
    if (totalReceivedEl) totalReceivedEl.textContent = formatNumber(totalReceived);

    if (tableOwedToMeTotal) tableOwedToMeTotal.textContent = formatNumber(totalOwedToMe);
    if (tableIOweTotal) tableIOweTotal.textContent = formatNumber(totalIOwe);
    if (tableAccountTotal) tableAccountTotal.textContent = formatNumber(totalAccount);
    if (tableReceivedTotal) tableReceivedTotal.textContent = formatNumber(totalReceived);
}

function updatePeriodInfo() {
    if (!currentPeriodText) return;
    
    const startStr = formatDateDisplay(currentStartDate);
    const endStr = formatDateDisplay(currentEndDate);
    let periodText = '';
    
    if (isSearchMode) {
        periodText = `نتائج البحث (${Object.keys(periodData).length} سجل)`;
    } else if (currentPeriod === 'week') {
        periodText = `أسبوع: ${startStr} - ${endStr}`;
    } else if (currentPeriod === 'two-weeks') {
        periodText = `أسبوعين: ${startStr} - ${endStr}`;
    } else if (currentPeriod === 'month') {
        const monthNames = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
        periodText = `شهر ${monthNames[currentStartDate.getMonth()]} ${currentStartDate.getFullYear()}`;
    }
    
    currentPeriodText.textContent = periodText;
}

// ----------------------
// دوال مساعدة للتاريخ والنصوص
// ----------------------
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDateDisplay(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function getDayName(dayIndex) {
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[dayIndex] || '';
}

function getShortDayName(dayIndex) {
    const days = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
    return days[dayIndex] || '';
}

function getWeekNumber(date) {
    const d = new Date(date.getFullYear(), 0, 1);
    const diff = Math.floor((date - d) / 86400000);
    return Math.ceil((diff + d.getDay() + 1) / 7);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// ----------------------
// البحث
// ----------------------
async function performSearch() {
    const raw = (searchInput.value || '').trim();
    const searchTerm = raw.toLowerCase();
    
    if (!searchTerm) {
        showMessage("الرجاء إدخال مصطلح للبحث", "error");
        return;
    }

    showMessage("جاري البحث...", "info");
    
    try {
        const snap = await database.ref('weeks').once('value');
        const allWeeks = snap.val() || {};
        const resultsMap = {};

        function searchInData(data, path = '') {
            if (!data) return;
            
            if (typeof data === 'object') {
                if (data.client || data.reference) {
                    const client = String(data.client || '').toLowerCase();
                    const reference = String(data.reference || '').toLowerCase();
                    
                    if (client.includes(searchTerm) || reference.includes(searchTerm)) {
                        const date = data.date || path.split('/').pop();
                        if (date && date.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
                            resultsMap[date] = {
                                date,
                                day: data.day || '',
                                client: data.client || '',
                                reference: data.reference || '',
                                price: data.price || '',
                                account: data.account || '',
                                received: data.received || '',
                                owedToMe: data.owedToMe || '',
                                iOwe: data.iOwe || ''
                            };
                        }
                    }
                } else {
                    Object.keys(data).forEach(key => {
                        searchInData(data[key], path ? `${path}/${key}` : key);
                    });
                }
            }
        }

        searchInData(allWeeks);

        const results = Object.values(resultsMap);
        
        results.sort((a, b) => {
            const parseDate = (s) => {
                if (!s) return new Date(0);
                const parts = s.split('/');
                if (parts.length !== 3) return new Date(0);
                const d = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1;
                const y = parseInt(parts[2], 10);
                return new Date(y, m, d);
            };
            return parseDate(b.date) - parseDate(a.date);
        });

        if (results.length > 0) {
            periodData = {};
            results.forEach(r => {
                periodData[r.date] = r;
            });
            
            isSearchMode = true;
            renderTable();
            updatePeriodSummary();
            updatePeriodInfo();
            showMessage(`تم العثور على ${results.length} نتيجة للبحث عن "${raw}"`, 'success');
        } else {
            showMessage(`لم يتم العثور على أي نتيجة للبحث عن "${raw}"`, 'error');
        }
    } catch (err) {
        console.error('خطأ في البحث:', err);
        showMessage('حدث خطأ أثناء البحث', 'error');
    }
}

// ----------------------
// أحداث المستخدم
// ----------------------
function addEventListeners() {
    // البحث
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        
        searchInput.addEventListener('input', () => {
            if ((searchInput.value || '').trim() === '' && isSearchMode) {
                isSearchMode = false;
                setCurrentPeriod();
                loadPeriodData();
                showMessage('تم الخروج من وضع البحث', 'success');
            }
        });
    }

    // التنقل بين الفترات
    if (prevPeriodBtn) {
        prevPeriodBtn.addEventListener('click', () => {
            if (isSearchMode) { 
                showMessage('يجب الخروج من وضع البحث أولاً', 'error'); 
                return; 
            }
            navigatePeriod(-1);
        });
    }
    
    if (nextPeriodBtn) {
        nextPeriodBtn.addEventListener('click', () => {
            if (isSearchMode) { 
                showMessage('يجب الخروج من وضع البحث أولاً', 'error'); 
                return; 
            }
            navigatePeriod(1);
        });
    }
    
    if (currentPeriodBtn) {
        currentPeriodBtn.addEventListener('click', () => {
            if (isSearchMode) {
                isSearchMode = false;
                if (searchInput) searchInput.value = '';
                setCurrentPeriod();
                loadPeriodData();
                showMessage('تم الخروج من وضع البحث', 'success');
            } else {
                goToCurrentPeriod();
            }
        });
    }

    // تبديل الثيم
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (window.themeSystem && typeof window.themeSystem.toggleTheme === 'function') {
                window.themeSystem.toggleTheme();
            } else {
                showMessage('نظام الثيمات غير جاهز', 'error');
            }
        });
    }

    // تغيير الفترة
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            if (isSearchMode) { 
                showMessage('يجب الخروج من وضع البحث أولاً', 'error'); 
                return; 
            }
            currentPeriod = this.value;
            setCurrentPeriod();
            loadPeriodData();
        });
    }

    // الانتقال إلى تاريخ
    if (jumpToDateBtn) {
        jumpToDateBtn.addEventListener('click', () => {
            if (isSearchMode) { 
                showMessage('يجب الخروج من وضع البحث أولاً', 'error'); 
                return; 
            }
            jumpToDate();
        });
    }
    
    if (jumpToDateInput) {
    jumpToDateInput.addEventListener('change', () => {
        // تحديث البلاسهولدر عند تغيير التاريخ
        const datePlaceholder = document.getElementById('datePlaceholder');
        if (datePlaceholder && jumpToDateInput.value) {
            datePlaceholder.style.opacity = '0';
        }
    });
    
    jumpToDateInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            jumpToDate();
        }
    });
}
}

function addInputListeners() {
    const inputs = document.querySelectorAll('.table-input[data-field]');
    inputs.forEach(input => {
        input.addEventListener('input', onTableInput);
    });
}

function onTableInput() {
    const date = this.dataset.date;
    const field = this.dataset.field;
    const value = this.value;
    
    if (!periodData[date]) periodData[date] = {};
    periodData[date][field] = value;

    if (['owedToMe','iOwe','account','received'].includes(field)) {
        updatePeriodSummary();
    }
}

function addSaveRowListeners() {
    const saveBtns = document.querySelectorAll('.save-row-btn');
    saveBtns.forEach(btn => {
        btn.addEventListener('click', onSaveRowClick);
    });
}

function onSaveRowClick() {
    const date = this.dataset.date;
    saveDayData(date);
}

// ----------------------
// وظائف التنقل
// ----------------------
function jumpToDate() {
    if (!jumpToDateInput) return;
    
    const dateStr = jumpToDateInput.value;
    if (!dateStr) {
        showMessage('يرجى اختيار تاريخ', 'error');
        return;
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        showMessage('اختر تاريخًا صحيحًا', 'error');
        return;
    }
    
    if (currentPeriod === 'week') {
        const dow = date.getDay();
        currentStartDate = new Date(date);
        currentStartDate.setDate(date.getDate() - dow);
        currentEndDate = new Date(currentStartDate);
        currentEndDate.setDate(currentStartDate.getDate() + 6);
    } else if (currentPeriod === 'two-weeks') {
        const dow = date.getDay();
        currentStartDate = new Date(date);
        currentStartDate.setDate(date.getDate() - dow);
        currentEndDate = new Date(currentStartDate);
        currentEndDate.setDate(currentStartDate.getDate() + 13);
    } else if (currentPeriod === 'month') {
        currentStartDate = new Date(date.getFullYear(), date.getMonth(), 1);
        currentEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
    
    loadPeriodData();
    showMessage(`تم الانتقال إلى ${formatDateDisplay(date)}`, 'success');
}

function navigatePeriod(direction) {
    if (currentPeriod === 'week') {
        currentStartDate.setDate(currentStartDate.getDate() + (direction * 7));
        currentEndDate.setDate(currentEndDate.getDate() + (direction * 7));
    } else if (currentPeriod === 'two-weeks') {
        currentStartDate.setDate(currentStartDate.getDate() + (direction * 14));
        currentEndDate.setDate(currentEndDate.getDate() + (direction * 14));
    } else if (currentPeriod === 'month') {
        currentStartDate.setMonth(currentStartDate.getMonth() + direction);
        currentEndDate = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth() + 1, 0);
    }
    loadPeriodData();
}

function goToCurrentPeriod() {
    setCurrentPeriod();
    loadPeriodData();
    showMessage('تم الانتقال إلى الفترة الحالية', 'success');
}

// ----------------------
// حفظ البيانات
// ----------------------
async function saveDayData(date) {
    if (!periodData[date]) { 
        showMessage('لا توجد بيانات لحفظها', 'error'); 
        return; 
    }
    
    const dayData = periodData[date];
    if (!date.includes('/')) { 
        showMessage('خطأ في تنسيق التاريخ', 'error'); 
        return; 
    }
    
    const [d, m, y] = date.split('/');
    const dateObj = new Date(y, m - 1, d);
    const wk = getWeekNumber(dateObj);
    const weekKey = `${y}-W${wk}`;
    
    const dataToSave = {
        date: dayData.date || date,
        day: dayData.day || getDayName(dateObj.getDay()),
        client: dayData.client || '',
        reference: dayData.reference || '',
        price: dayData.price || '',
        account: dayData.account || '',
        received: dayData.received || '',
        owedToMe: dayData.owedToMe || '',
        iOwe: dayData.iOwe || ''
    };
    
    try {
        await database.ref(`weeks/${weekKey}/${date}`).set(dataToSave);
        showMessage(`تم حفظ بيانات ${date} بنجاح!`, 'success');
    } catch (err) {
        console.error('خطأ في حفظ البيانات:', err);
        showMessage('حدث خطأ أثناء الحفظ', 'error');
    }
}

// جعل الدوال متاحة عالمياً
window.showMessage = showMessage;