// ===== Translations (Bengali, Arabic, English) =====
const LANGS = {
  en: {
    nav_home: "Home", nav_quran: "Quran", nav_prayer: "Prayer Times",
    nav_hadith: "Hadith", nav_articles: "Articles", nav_contact: "Contact",
    hero_sub: "A Beautiful Journey of Faith & Knowledge",
    btn_quran: "Quran", btn_explore: "Explore Islam",
    prayer_title: "Prayer Times", daily_title: "Daily Ayah & Hadith",
    daily_ayah: "Daily Ayah", daily_hadith: "Daily Hadith",
    services_title: "Our Services", quran_title: "The Holy Quran",
    hadith_title: "Hadith Collection", articles_title: "Islamic Articles",
    footer_tag: "Light of guidance, knowledge of faith"
  },
  bn: {
    nav_home: "হোম", nav_quran: "কুরআন", nav_prayer: "নামাজের সময়",
    nav_hadith: "হাদিস", nav_articles: "প্রবন্ধ", nav_contact: "যোগাযোগ",
    hero_sub: "ঈমান ও জ্ঞানের সুন্দর যাত্রা",
    btn_quran: "কুরআন", btn_explore: "ইসলাম জানুন",
    prayer_title: "নামাজের সময়সূচি", daily_title: "দৈনিক আয়াত ও হাদিস",
    daily_ayah: "দৈনিক আয়াত", daily_hadith: "দৈনিক হাদিস",
    services_title: "আমাদের সেবাসমূহ", quran_title: "পবিত্র কুরআন",
    hadith_title: "হাদিস সংগ্রহ", articles_title: "ইসলামী প্রবন্ধ",
    footer_tag: "হিদায়াতের আলো, ঈমানের জ্ঞান"
  },
  ar: {
    nav_home: "الرئيسية", nav_quran: "القرآن", nav_prayer: "مواقيت الصلاة",
    nav_hadith: "الحديث", nav_articles: "المقالات", nav_contact: "اتصل بنا",
    hero_sub: "رحلة جميلة في الإيمان والعلم",
    btn_quran: "القرآن", btn_explore: "استكشف الإسلام",
    prayer_title: "مواقيت الصلاة", daily_title: "آية وحديث اليوم",
    daily_ayah: "آية اليوم", daily_hadith: "حديث اليوم",
    services_title: "خدماتنا", quran_title: "القرآن الكريم",
    hadith_title: "الحديث الشريف", articles_title: "المقالات الإسلامية",
    footer_tag: "نور الهداية ومعرفة الدين"
  }
};

// ===== Verified verses and hadith (Sahih International translation for Quran) =====
const AYAHS = [
  { ar: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا", en: "Allah does not burden a soul beyond that it can bear.", ref: "Quran 2:286" },
  { ar: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا", en: "For indeed, with hardship [will be] ease.", ref: "Quran 94:6" },
  { ar: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ", en: "Unquestionably, by the remembrance of Allah hearts are assured.", ref: "Quran 13:28" }
];

const HADITHS = [
  { ar: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ", en: "Actions are judged by intentions.", ref: "Sahih al-Bukhari 1" },
  { ar: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", en: "The most beloved deeds to Allah are those done consistently, even if small.", ref: "Sahih al-Bukhari 6464" }
];

// ===== Helpers =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ===== Language =====
function setLang(lang) {
  const dict = LANGS[lang] || LANGS.en;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  $$("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
  $("#langSelect").value = lang;
  localStorage.setItem("imranLang", lang);
  showDailyContent(lang);
}

// ===== Theme =====
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("#themeBtn").textContent = theme === "dark" ? "🌙" : "☀️";
  localStorage.setItem("imranTheme", theme);
}

// ===== Mobile menu =====
$("#menuBtn").addEventListener("click", () => {
  const isOpen = $("#mainNav").classList.toggle("open");
  $("#menuBtn").setAttribute("aria-expanded", isOpen);
});
$$("#mainNav a").forEach((link) => {
  link.addEventListener("click", () => $("#mainNav").classList.remove("open"));
});

// ===== Prayer times (Aladhan API: free, no key needed) =====
async function loadPrayerTimes(value) {
  const [city, country] = value.split("|");
  const status = $("#prayerStatus");
  status.textContent = "Loading prayer times…";

  try {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const json = await response.json();

    const timings = json.data.timings;
    const order = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
    $("#timesGrid").innerHTML = order
      .map((name) => `<div class="time-box"><span>${name}</span><b>${timings[name].split(" ")[0]}</b></div>`)
      .join("");

    const h = json.data.date.hijri;
    $("#hijriDate").textContent = `${h.day} ${h.month.en} ${h.year} AH`;
    status.textContent = "Source: Aladhan API. Times may differ slightly from your local mosque.";
    localStorage.setItem("imranCity", value);
  } catch (error) {
    $("#timesGrid").innerHTML = "";
    $("#hijriDate").textContent = "";
    status.textContent = "Could not load prayer times. Check your internet connection and try again.";
    console.error(error);
  }
}

// ===== Daily ayah and hadith (changes every day) =====
function showDailyContent(lang) {
  const dict = LANGS[lang] || LANGS.en;
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);

  const ayah = AYAHS[dayOfYear % AYAHS.length];
  const hadith = HADITHS[dayOfYear % HADITHS.length];

  $("#ayahBox").innerHTML = `
    <h3>${dict.daily_ayah}</h3>
    <p class="ayah-ar">${ayah.ar}</p>
    <p>${ayah.en}</p>
    <p class="ref">${ayah.ref}</p>`;

  $("#hadithBox").innerHTML = `
    <h3>${dict.daily_hadith}</h3>
    <p class="ayah-ar">${hadith.ar}</p>
    <p>${hadith.en}</p>
    <p class="ref">${hadith.ref}</p>`;
}

// ===== Startup =====
setLang(localStorage.getItem("imranLang") || "en");
setTheme(localStorage.getItem("imranTheme") || "dark");

$("#langSelect").addEventListener("change", (e) => setLang(e.target.value));
$("#themeBtn").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next);
});

$("#citySelect").value = localStorage.getItem("imranCity") || "Dhaka|Bangladesh";
$("#citySelect").addEventListener("change", (e) => loadPrayerTimes(e.target.value));
loadPrayerTimes($("#citySelect").value);

$("#year").textContent = new Date().getFullYear();
