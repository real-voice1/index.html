const surahListContainer = document.getElementById('surahList');
const mainAudio = document.getElementById('main-audio');
const currentSurahTitle = document.getElementById('current-surah');
const searchInput = document.getElementById('searchInput');

let surahs = [];

// جلب بيانات السور من API
async function getSurahs() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        surahs = data.data;
        displaySurahs(surahs);
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        surahListContainer.innerHTML = "<p>فشل تحميل السور، تأكد من الاتصال بالإنترنت</p>";
    }
}

// عرض السور في القائمة
function displaySurahs(list) {
    surahListContainer.innerHTML = '';
    list.forEach(surah => {
        const div = document.createElement('div');
        div.classList.add('surah-item');
        div.innerHTML = `
            <span>${surah.name}</span>
            <span class="surah-number">${surah.number}</span>
        `;
        div.onclick = () => playSurah(surah.number, surah.name);
        surahListContainer.appendChild(div);
    });
}

// وظيفة تشغيل السورة
function playSurah(number, name) {
    // تنسيق رقم السورة ليكون 3 أرقام (مثلاً 1 يصبح 001)
    const formattedNumber = number.toString().padStart(3, '0');
    const audioUrl = `https://server8.mp3quran.net/afs/${formattedNumber}.mp3`;
    
    mainAudio.src = audioUrl;
    currentSurahTitle.innerText = `سورة ${name}`;
    mainAudio.play();
    
    // التمرير للأعلى عند الاختيار
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ميزة البحث
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = surahs.filter(s => s.name.includes(term));
    displaySurahs(filtered);
});

// التشغيل الأولي
getSurahs();
let count = 0;
const tasbihTexts = ["سبحان الله", "الحمد لله", "لا إله إلا الله", "الله أكبر", "أستغفر الله", "اللهم صلِّ على محمد"];
let currentTextIndex = 0;

// تحديث وظيفة التنقل لتشمل المسبحة
function showSection(section) {
    const sections = ['quran-section', 'azkar-section', 'tasbih-section'];
    const btns = document.querySelectorAll('.tab-btn');
    
    sections.forEach((id, index) => {
        const el = document.getElementById(id);
        if (id.startsWith(section)) {
            el.style.display = 'block';
            btns[index].classList.add('active');
        } else {
            el.style.display = 'none';
            btns[index].classList.remove('active');
        }
    });
}

// وظائف المسبحة
function incrementCounter() {
    count++;
    document.getElementById('counter').innerText = count;
    
    // إضافة اهتزاز بسيط للهواتف (اختياري)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function resetCounter() {
    count = 0;
    document.getElementById('counter').innerText = count;
}

function changeTasbih() {
    currentTextIndex = (currentTextIndex + 1) % tasbihTexts.length;
    document.getElementById('tasbih-text').innerText = tasbihTexts[currentTextIndex];
    resetCounter();
}
const quranFeatures = [
    {
        title: "شفاعة القرآن",
        text: "قال صلى الله عليه وسلم: (اقرؤوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه)."
    },
    {
        title: "رفعة الدرجات",
        text: "يقال لقارئ القرآن: اقرأ وارتقِ ورتل كما كنت ترتل في الدنيا، فإن منزلتك عند آخر آية تقرؤها."
    },
    {
        title: "خيركم من تعلمه",
        text: "قال النبي ﷺ: (خيركم من تعلم القرآن وعلمه)."
    },
    {
        title: "بكل حرف حسنة",
        text: "لا أقول الم حرف، ولكن ألف حرف ولام حرف وميم حرف، والحسنة بعشر أمثالها."
    }
];

// وظيفة عرض المميزات
function displayFeatures() {
    const grid = document.getElementById('featuresGrid');
    grid.innerHTML = quranFeatures.map(f => `
        <div class="feature-card">
            <h4>${f.title}</h4>
            <p>${f.text}</p>
        </div>
    `).join('');
}

// تحديث وظيفة التنقل لتشمل قسم الفضائل
function showSection(section) {
    const sections = ['quran-section', 'azkar-section', 'tasbih-section', 'features-section'];
    const btns = document.querySelectorAll('.tab-btn');
    
    sections.forEach((id, index) => {
        const el = document.getElementById(id);
        if (id.includes(section)) {
            el.style.display = 'block';
            btns[index].classList.add('active');
            if(section === 'features') displayFeatures(); // استدعاء الوظيفة عند فتح القسم
        } else {
            el.style.display = 'none';
            btns[index].classList.remove('active');
        }
    });
}
const prophetsStories = [
    {
        name: "آدم عليه السلام",
        content: "خلق الله آدم بيديه وأسجد له ملائكته وعلمه الأسماء كلها. عاش في الجنة ثم نزل إلى الأرض ليعمرها ويكون أول خليفة فيها وأول الأنبياء..."
    },
    {
        name: "نوح عليه السلام",
        content: "دعا قومه 950 سنة إلى توحيد الله، فأبوا واستكبروا، فأمره الله ببناء السفينة، وحمل فيها من كل زوجين اثنين، وأغرق الله المكذبين بالطوفان..."
    },
    {
        name: "إبراهيم عليه السلام",
        content: "خليل الله، ومحطم الأصنام، بنى الكعبة مع ابنه إسماعيل، وهو أبو الأنبياء الذي جعل الله في ذريته النبوة والكتاب..."
    }
];

// عرض القصص
function displayStories(data = prophetsStories) {
    const container = document.getElementById('storiesGrid');
    container.innerHTML = data.map((story, index) => `
        <div class="story-card">
            <h3>${story.name}</h3>
            <div class="story-content" id="story-${index}">${story.content}</div>
            <button class="read-more-btn" onclick="toggleStory(${index})">اقرأ القصة</button>
        </div>
    `).join('');
}

// فتح وإغلاق القصة
function toggleStory(index) {
    const content = document.getElementById(`story-${index}`);
    const btn = content.nextElementSibling;
    if (content.style.display === "block") {
        content.style.display = "none";
        btn.innerText = "اقرأ القصة";
    } else {
        content.style.display = "block";
        btn.innerText = "إغلاق";
    }
}

// بحث في القصص
function filterStories() {
    const term = document.getElementById('storySearch').value.toLowerCase();
    const filtered = prophetsStories.filter(s => s.name.includes(term));
    displayStories(filtered);
}

// تحديث وظيفة التبديل (Tabs) لتشمل القصص
function showSection(section) {
    const sections = ['quran-section', 'azkar-section', 'tasbih-section', 'features-section', 'stories-section'];
    const btns = document.querySelectorAll('.tab-btn');
    
    sections.forEach((id, index) => {
        const el = document.getElementById(id);
        if (id.includes(section)) {
            el.style.display = 'block';
            btns[index].classList.add('active');
            if(section === 'stories') displayStories();
        } else {
            el.style.display = 'none';
            btns[index].classList.remove('active');
        }
    });
}
