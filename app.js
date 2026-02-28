'use strict';

/* ============================================================
   תנ"ך — הספרייה הדיגיטלית  |  app.js
   Uses Sefaria.org public API for text and search
   ============================================================ */

// ===== BOOK DATA =================================================

const SECTIONS = {
  torah: {
    label: 'תּוֹרָה',
    books: [
      { he:'בְּרֵאשִׁית', heShort:'בראשית', en:'Genesis',      chapters:50 },
      { he:'שְׁמוֹת',     heShort:'שמות',   en:'Exodus',       chapters:40 },
      { he:'וַיִּקְרָא',  heShort:'ויקרא',  en:'Leviticus',    chapters:27 },
      { he:'בְּמִדְבַּר', heShort:'במדבר',  en:'Numbers',      chapters:36 },
      { he:'דְּבָרִים',   heShort:'דברים',  en:'Deuteronomy',  chapters:34 },
    ]
  },
  neviim: {
    label: 'נְבִיאִים',
    books: [
      { he:'יְהוֹשֻׁעַ',   heShort:'יהושע',      en:'Joshua',     chapters:24 },
      { he:'שׁוֹפְטִים',   heShort:'שופטים',     en:'Judges',     chapters:21 },
      { he:'שְׁמוּאֵל א', heShort:'שמואל א',    en:'I Samuel',   chapters:31 },
      { he:'שְׁמוּאֵל ב', heShort:'שמואל ב',    en:'II Samuel',  chapters:24 },
      { he:'מְלָכִים א',  heShort:'מלכים א',    en:'I Kings',    chapters:22 },
      { he:'מְלָכִים ב',  heShort:'מלכים ב',    en:'II Kings',   chapters:25 },
      { he:'יְשַׁעְיָהוּ', heShort:'ישעיהו',    en:'Isaiah',     chapters:66 },
      { he:'יִרְמְיָהוּ', heShort:'ירמיהו',     en:'Jeremiah',   chapters:52 },
      { he:'יְחֶזְקֵאל',  heShort:'יחזקאל',    en:'Ezekiel',    chapters:48 },
      { he:'הוֹשֵׁעַ',    heShort:'הושע',       en:'Hosea',      chapters:14 },
      { he:'יוֹאֵל',      heShort:'יואל',       en:'Joel',       chapters:4  },
      { he:'עָמוֹס',      heShort:'עמוס',       en:'Amos',       chapters:9  },
      { he:'עֹבַדְיָה',   heShort:'עובדיה',     en:'Obadiah',    chapters:1  },
      { he:'יוֹנָה',      heShort:'יונה',       en:'Jonah',      chapters:4  },
      { he:'מִיכָה',      heShort:'מיכה',       en:'Micah',      chapters:7  },
      { he:'נַחוּם',      heShort:'נחום',       en:'Nahum',      chapters:3  },
      { he:'חֲבַקּוּק',   heShort:'חבקוק',      en:'Habakkuk',   chapters:3  },
      { he:'צְפַנְיָה',   heShort:'צפניה',      en:'Zephaniah',  chapters:3  },
      { he:'חַגַּי',      heShort:'חגי',        en:'Haggai',     chapters:2  },
      { he:'זְכַרְיָה',   heShort:'זכריה',      en:'Zechariah',  chapters:14 },
      { he:'מַלְאָכִי',   heShort:'מלאכי',      en:'Malachi',    chapters:3  },
    ]
  },
  ketuvim: {
    label: 'כְּתוּבִים',
    books: [
      { he:'תְּהִלִּים',      heShort:'תהלים',        en:'Psalms',        chapters:150 },
      { he:'מִשְׁלֵי',        heShort:'משלי',         en:'Proverbs',      chapters:31  },
      { he:'אִיּוֹב',         heShort:'איוב',         en:'Job',           chapters:42  },
      { he:'שִׁיר הַשִּׁירִים', heShort:'שיר השירים', en:'Song of Songs', chapters:8   },
      { he:'רוּת',            heShort:'רות',          en:'Ruth',          chapters:4   },
      { he:'אֵיכָה',          heShort:'איכה',         en:'Lamentations',  chapters:5   },
      { he:'קֹהֶלֶת',         heShort:'קהלת',         en:'Ecclesiastes',  chapters:12  },
      { he:'אֶסְתֵּר',        heShort:'אסתר',         en:'Esther',        chapters:10  },
      { he:'דָּנִיֵּאל',       heShort:'דניאל',        en:'Daniel',        chapters:12  },
      { he:'עֶזְרָא',         heShort:'עזרא',         en:'Ezra',          chapters:10  },
      { he:'נְחֶמְיָה',        heShort:'נחמיה',        en:'Nehemiah',      chapters:13  },
      { he:'דִּבְרֵי הַיָּמִים א', heShort:'דברי הימים א', en:'I Chronicles',  chapters:29 },
      { he:'דִּבְרֵי הַיָּמִים ב', heShort:'דברי הימים ב', en:'II Chronicles', chapters:36 },
    ]
  }
};

// Quick links shown on welcome screen
const QUICK_BOOKS = [
  { sectionKey:'torah',   bookEn:'Genesis',      chapter:1,  icon:'📜', label:'בראשית',     sub:'פרק א' },
  { sectionKey:'ketuvim', bookEn:'Psalms',        chapter:23, icon:'🕊️', label:'תהלים כ״ג',  sub:'מזמור רועה' },
  { sectionKey:'ketuvim', bookEn:'Song of Songs', chapter:1,  icon:'🌹', label:'שיר השירים', sub:'פרק א' },
  { sectionKey:'torah',   bookEn:'Exodus',        chapter:20, icon:'⛰️', label:'עשרת הדברות', sub:'שמות כ' },
  { sectionKey:'ketuvim', bookEn:'Proverbs',      chapter:1,  icon:'💡', label:'משלי',       sub:'פרק א' },
  { sectionKey:'neviim',  bookEn:'Isaiah',        chapter:40, icon:'✨', label:'ישעיהו מ',  sub:'נחמו נחמו' },
];

// ===== STATE =====================================================

// Populated from tanakh.json at startup — all 39 books, no API calls needed.
let tanakhData = null;

const state = {
  view:          'reader',
  book:          null,   // full book object
  chapter:       1,
  verses:        [],     // array of Hebrew strings
  loading:       false,
  selectedVerse: null,   // { id, bookHe, bookEn, chapter, verse, text }
  searchResults: [],
  searchLoading: false,
  dragSrcIndex:  null,
  sidebarOpen:   false,
};

// ===== UTILS =====================================================

function $(id)  { return document.getElementById(id); }
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return document.querySelectorAll(sel); }

function stripHtml(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || d.innerText || '';
}

function makeId(bookEn, chapter, verse) {
  return `${bookEn}|${chapter}|${verse}`;
}

// Strip Hebrew vowel points and cantillation marks (U+0591–U+05C7) for search.
function stripNikkud(str) {
  return str.replace(/[\u0591-\u05C7]/g, '');
}

// Wrap search term in <mark> tags inside a verse, matching across nikkud.
function highlightInVerse(verseText, query) {
  const plain = stripNikkud(query);
  if (!plain) return verseText;
  // Build regex: each consonant may be followed by any number of nikkud chars
  const NIKKUD = '[\\u0591-\\u05C7]*';
  const pat    = [...plain]
    .map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + NIKKUD)
    .join('');
  try {
    return verseText.replace(new RegExp(`(${pat})`, 'g'), '<mark>$1</mark>');
  } catch { return verseText; }
}

let toastTimer;
function showToast(msg, ms = 2600) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

function scrollTop() {
  window.scrollTo({ top:0, behavior:'smooth' });
}

// Convert an integer (1–400) to a Hebrew numeral string (Gematria).
// Special cases: 15 → טו, 16 → טז (avoid divine name abbreviations).
function toHebrewNumeral(n) {
  const ONES     = ['','א','ב','ג','ד','ה','ו','ז','ח','ט'];
  const TENS     = ['','י','כ','ל','מ','נ','ס','ע','פ','צ'];
  const HUNDREDS = ['','ק','ר','ש','ת'];
  let result = '', rem = n;
  const h = Math.floor(rem / 100); rem %= 100;
  if (h) result += HUNDREDS[h];
  if (rem === 15) return result + 'טו';
  if (rem === 16) return result + 'טז';
  const t = Math.floor(rem / 10); const u = rem % 10;
  if (t) result += TENS[t];
  if (u) result += ONES[u];
  return result;
}

// ===== LOCAL STORAGE =============================================

function loadBookmarks() {
  try { return JSON.parse(localStorage.getItem('tanakh-bookmarks') || '[]'); }
  catch { return []; }
}
function saveBookmarks(arr) {
  localStorage.setItem('tanakh-bookmarks', JSON.stringify(arr));
}
function loadCollection() {
  try { return JSON.parse(localStorage.getItem('tanakh-collection') || '[]'); }
  catch { return []; }
}
function saveCollection(arr) {
  localStorage.setItem('tanakh-collection', JSON.stringify(arr));
}

// ===== LOCAL DATA (tanakh.json) ==================================

// Return verses for a chapter from the local JSON — instant, no network.
function fetchChapter(bookEn, chapter) {
  const chapters = tanakhData?.[bookEn];
  if (!chapters) throw new Error(`ספר לא נמצא: ${bookEn}`);
  const verses = chapters[chapter - 1];
  if (!verses)  throw new Error(`פרק לא נמצא: ${bookEn} ${chapter}`);
  return verses.filter(v => v.trim());
}

// Full-text search across all 23 K verses — runs in < 50 ms locally.
function searchLocal(query) {
  if (!tanakhData) return [];
  const needle = stripNikkud(query.trim());
  if (!needle) return [];

  const results = [];
  const MAX     = 50;

  for (const [secKey, sec] of Object.entries(SECTIONS)) {
    for (const book of sec.books) {
      const chapters = tanakhData[book.en];
      if (!chapters) continue;
      for (let ci = 0; ci < chapters.length; ci++) {
        const ch = chapters[ci];
        if (!ch) continue;
        for (let vi = 0; vi < ch.length; vi++) {
          const verseText = ch[vi];
          if (!verseText) continue;
          if (!stripNikkud(verseText).includes(needle)) continue;

          const chNum  = ci + 1;
          const vNum   = vi + 1;
          results.push({
            heRef:       `${book.heShort} ${toHebrewNumeral(chNum)}:${toHebrewNumeral(vNum)}`,
            enRef:       `${book.en} ${chNum}:${vNum}`,
            text:        verseText,
            displayHtml: highlightInVerse(verseText, query),
            bookEn:      book.en,
            chapter:     chNum,
          });
          if (results.length >= MAX) return results;
        }
      }
    }
  }
  return results;
}

// ===== SIDEBAR ==================================================

function buildSidebar() {
  Object.keys(SECTIONS).forEach(sectionKey => {
    const sec  = SECTIONS[sectionKey];
    const wrap = $(`${sectionKey}-books`);
    wrap.innerHTML = '';
    sec.books.forEach(book => {
      const btn = document.createElement('button');
      btn.className = 'book-btn';
      btn.textContent = book.heShort;
      btn.dataset.en = book.en;
      btn.addEventListener('click', () => selectBook(book, sectionKey));
      wrap.appendChild(btn);
    });
  });

  // Section toggle
  qsa('.section-title').forEach(btn => {
    btn.addEventListener('click', () => {
      const key  = btn.dataset.section;
      const list = $(`${key}-books`);
      const open = list.classList.toggle('open');
      btn.classList.toggle('open', open);
    });
  });
}

function selectBook(book, sectionKey) {
  // Update active button
  qsa('.book-btn').forEach(b => b.classList.remove('active'));
  const wrap = $(`${sectionKey}-books`);
  [...wrap.querySelectorAll('.book-btn')]
    .find(b => b.dataset.en === book.en)
    ?.classList.add('active');

  state.book    = book;
  state.chapter = 1;

  // Expand its section
  const list = $(`${sectionKey}-books`);
  list.classList.add('open');
  $(`[data-section="${sectionKey}"]`)?.classList.add('open');

  closeSidebar();
  setView('reader');
  loadAndRenderChapter();
}

function openSidebar()  {
  $('sidebar').classList.add('open');
  state.sidebarOpen = true;
}
function closeSidebar() {
  $('sidebar').classList.remove('open');
  state.sidebarOpen = false;
}

// ===== VIEW SWITCHING ============================================

function setView(view) {
  state.view = view;

  // Sync nav buttons
  qsa('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === view);
  });

  hideVerseActions();
  scrollTop();
  renderView();
}

function renderView() {
  switch (state.view) {
    case 'reader':     renderReaderView();     break;
    case 'search':     renderSearchView();     break;
    case 'bookmarks':  renderBookmarksView();  break;
    case 'collection': renderCollectionView(); break;
  }
}

// ===== READER VIEW ==============================================

function loadAndRenderChapter() {
  if (!state.book) { renderWelcome(); return; }
  try {
    state.verses = fetchChapter(state.book.en, state.chapter);
    renderReaderView();
  } catch (err) {
    $('mainContent').innerHTML = `<div class="error-box">שגיאה בטעינת הטקסט.<br><small>${err.message}</small></div>`;
  }
}

function renderReaderView() {
  const content = $('mainContent');
  if (!state.book) { renderWelcome(); return; }

  const { book, chapter, verses } = state;
  const chCount = book.chapters;

  // Chapter selector options
  let chOptions = '';
  for (let i = 1; i <= chCount; i++) {
    chOptions += `<option value="${i}" ${i === chapter ? 'selected' : ''}>פרק ${toHebrewNumeral(i)}</option>`;
  }

  // Verses HTML
  const versesHtml = verses.map((text, i) => {
    const v = i + 1;
    return `
      <p class="verse" data-verse="${v}" role="button" tabindex="0" title="לחץ לאפשרויות">
        <span class="verse-number">${v}</span>
        <span class="verse-text">${text}</span>
      </p>`;
  }).join('');

  content.innerHTML = `
    <div class="reader-header">
      <h1 class="chapter-title">${book.he} — פרק ${toHebrewNumeral(chapter)}</h1>
      <p class="chapter-subtitle">${book.heShort} · ${chCount} פרקים</p>
      <div class="chapter-nav">
        <label class="chapter-label">פרק:</label>
        <select class="chapter-select" id="chapterSelect">${chOptions}</select>
        <button class="btn-ch" id="btnPrev" ${chapter <= 1 ? 'disabled' : ''}>◀ הקודם</button>
        <button class="btn-ch" id="btnNext" ${chapter >= chCount ? 'disabled' : ''}>הבא ▶</button>
      </div>
    </div>
    <div class="verses-container" id="versesContainer">${versesHtml || '<p class="error-box">לא נמצא טקסט לפרק זה.</p>'}</div>
  `;

  // Events
  $('chapterSelect').addEventListener('change', e => {
    state.chapter = parseInt(e.target.value);
    loadAndRenderChapter();
  });
  $('btnPrev').addEventListener('click', () => {
    if (state.chapter > 1) { state.chapter--; loadAndRenderChapter(); }
  });
  $('btnNext').addEventListener('click', () => {
    if (state.chapter < chCount) { state.chapter++; loadAndRenderChapter(); }
  });

  // Verse click → action bar
  qsa('.verse').forEach(el => {
    el.addEventListener('click', () => onVerseClick(el));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') onVerseClick(el); });
  });
}

function renderWelcome() {
  $('mainContent').innerHTML = `
    <div class="welcome">
      <span class="welcome-emblem">✡</span>
      <h1>תנ"ך — הספרייה הדיגיטלית</h1>
      <p class="welcome-tagline">בחר ספר מהתפריט, או התחל מאחד מהמקורות הנבחרים למטה</p>
      <div class="welcome-divider">• ✦ •</div>
      <div class="quick-grid">
        ${QUICK_BOOKS.map(q => `
          <div class="quick-card" data-en="${q.bookEn}" data-ch="${q.chapter}" data-sec="${q.sectionKey}">
            <div class="quick-card-icon">${q.icon}</div>
            <div class="quick-card-label">${q.label}</div>
            <div class="quick-card-sub">${q.sub}</div>
          </div>
        `).join('')}
      </div>
      <p class="welcome-tip">לחץ על פסוק בעת קריאה כדי לשמור סימנייה, להוסיף לאוסף, לשתף או להעתיק.</p>
    </div>
  `;

  qsa('.quick-card').forEach(card => {
    card.addEventListener('click', () => {
      const bookEn  = card.dataset.en;
      const chapter = parseInt(card.dataset.ch);
      const secKey  = card.dataset.sec;
      const book    = SECTIONS[secKey].books.find(b => b.en === bookEn);
      if (book) {
        state.book    = book;
        state.chapter = chapter;
        // Activate sidebar button
        qsa('.book-btn').forEach(b => b.classList.remove('active'));
        const wrap = $(`${secKey}-books`);
        const btn  = [...wrap.querySelectorAll('.book-btn')].find(b => b.dataset.en === bookEn);
        if (btn) { btn.classList.add('active'); }
        $(`${secKey}-books`).classList.add('open');
        $(`[data-section="${secKey}"]`)?.classList.add('open');
        loadAndRenderChapter();
      }
    });
  });
}

// ===== VERSE ACTIONS ============================================

function onVerseClick(el) {
  // Deselect previous
  qsa('.verse.selected').forEach(v => v.classList.remove('selected'));
  el.classList.add('selected');

  const verseNum = parseInt(el.dataset.verse);
  const text     = el.querySelector('.verse-text')?.textContent?.trim() || '';
  state.selectedVerse = {
    id:     makeId(state.book.en, state.chapter, verseNum),
    bookHe: state.book.heShort,
    bookEn: state.book.en,
    chapter: state.chapter,
    verse:  verseNum,
    text,
    ref:    `${state.book.heShort} ${state.chapter}:${verseNum}`,
  };

  positionVerseActions(el);
}

function positionVerseActions(el) {
  const bar  = $('verseActions');
  bar.style.display = 'flex';

  // getBoundingClientRect() is already viewport-relative, and the bar is
  // position:fixed (also viewport-relative), so do NOT add window.scrollY.
  const rect = el.getBoundingClientRect();
  const barH = bar.offsetHeight || 50;
  const barW = bar.offsetWidth  || 210;

  // Prefer above the verse; fall back to below if too close to the top.
  let top = rect.top - barH - 8;
  if (top < 8) top = rect.bottom + 8;

  // Centre horizontally over the verse, clamped to viewport edges.
  const center = rect.left + rect.width / 2;
  let left = center - barW / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - barW - 8));

  bar.style.top  = top  + 'px';
  bar.style.left = left + 'px';
}

function hideVerseActions() {
  $('verseActions').style.display = 'none';
  state.selectedVerse = null;
  qsa('.verse.selected').forEach(v => v.classList.remove('selected'));
}

// ===== BOOKMARKS ================================================

function addBookmark(v) {
  if (!v) return;
  const bms = loadBookmarks();
  if (bms.find(b => b.id === v.id)) { showToast('הפסוק כבר מסומן ⭐'); return; }
  bms.unshift(v);
  saveBookmarks(bms);
  showToast('✅ סימנייה נשמרה!');
}

function removeBookmark(id) {
  saveBookmarks(loadBookmarks().filter(b => b.id !== id));
  renderBookmarksView();
  showToast('🗑 סימנייה הוסרה');
}

function renderBookmarksView() {
  const bms     = loadBookmarks();
  const content = $('mainContent');

  if (!bms.length) {
    content.innerHTML = `
      <div class="view-header">
        <h2 class="view-heading">🔖 הסימניות שלי</h2>
      </div>
      <div class="empty-state">
        <span class="empty-icon">🔖</span>
        <h3>אין סימניות עדיין</h3>
        <p>לחץ על פסוק בעת קריאה ובחר "שמור סימנייה".</p>
      </div>`;
    return;
  }

  content.innerHTML = `
    <div class="view-header">
      <h2 class="view-heading">🔖 הסימניות שלי (${bms.length})</h2>
      <div>
        <button class="btn-danger no-print" onclick="clearAllBookmarks()">🗑 נקה הכל</button>
      </div>
    </div>
    ${bms.map(b => `
      <div class="bookmark-item" data-id="${b.id}">
        <div class="bookmark-body" onclick="goToVerse('${b.bookEn}','${b.chapter}','${b.verse}')">
          <div class="bookmark-ref">${b.ref}</div>
          <div class="bookmark-text">${b.text}</div>
        </div>
        <div class="bm-actions">
          <button class="icon-btn" title="שתף"
            onclick="showShareModal(${JSON.stringify(b).replace(/"/g,"'")})">📤</button>
          <button class="icon-btn" title="הוסף לאוסף"
            onclick="addToCollection(${JSON.stringify(b).replace(/"/g,"'")})">🗂</button>
          <button class="icon-btn danger" title="הסר" onclick="removeBookmark('${b.id}')">🗑</button>
        </div>
      </div>
    `).join('')}
  `;
}

function clearAllBookmarks() {
  if (!confirm('למחוק את כל הסימניות?')) return;
  saveBookmarks([]);
  renderBookmarksView();
}

// ===== COLLECTION ===============================================

function addToCollection(v) {
  if (!v) return;
  const col = loadCollection();
  if (col.find(c => c.id === v.id)) { showToast('הפסוק כבר באוסף 📋'); return; }
  col.push(v);
  saveCollection(col);
  showToast('✅ נוסף לאוסף!');
}

function removeFromCollection(id) {
  saveCollection(loadCollection().filter(c => c.id !== id));
  renderCollectionView();
  showToast('🗑 הוסר מהאוסף');
}

function moveCollectionItem(id, direction) {
  const col = loadCollection();
  const idx = col.findIndex(c => c.id === id);
  if (idx < 0) return;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= col.length) return;
  const [item] = col.splice(idx, 1);
  col.splice(newIdx, 0, item);
  saveCollection(col);
  renderCollectionView();
}

function renderCollectionView() {
  const col     = loadCollection();
  const content = $('mainContent');

  const emptyNotice = col.length
    ? ''
    : `<div class="empty-state">
        <span class="empty-icon">🗂</span>
        <h3>האוסף ריק</h3>
        <p>לחץ על פסוק בעת קריאה ובחר "הוסף לאוסף".</p>
      </div>`;

  const items = col.map((item, idx) => `
    <li class="collection-item"
        draggable="true"
        data-id="${item.id}"
        data-idx="${idx}">
      <div class="drag-handle" title="גרור לסידור מחדש">⠿</div>
      <div class="coll-item-body">
        <div class="coll-item-ref">${item.ref}</div>
        <div class="coll-item-text">${item.text}</div>
      </div>
      <div class="coll-item-controls">
        <button class="coll-ctrl-btn" title="העלה" onclick="moveCollectionItem('${item.id}',-1)">▲</button>
        <button class="coll-ctrl-btn" title="שתף"  onclick='showShareModal(${JSON.stringify(item)})'>📤</button>
        <button class="coll-ctrl-btn" title="קרא"
          onclick="goToVerse('${item.bookEn}','${item.chapter}','${item.verse}')">📖</button>
        <button class="coll-ctrl-btn del" title="הסר" onclick="removeFromCollection('${item.id}')">🗑</button>
        <button class="coll-ctrl-btn" title="הורד" onclick="moveCollectionItem('${item.id}',1)">▼</button>
      </div>
    </li>
  `).join('');

  content.innerHTML = `
    <div class="view-header">
      <h2 class="view-heading">🗂 האוסף שלי ${col.length ? '(' + col.length + ')' : ''}</h2>
      <div class="coll-actions no-print">
        ${col.length ? `
          <button class="btn-primary"   onclick="printCollection()">🖨 הדפס</button>
          <button class="btn-secondary" onclick="clearCollection()">🗑 נקה</button>
        ` : ''}
      </div>
    </div>

    ${emptyNotice}

    <ul class="collection-list" id="collectionList">${items}</ul>

    <div class="manual-add no-print">
      <h4>הוסף פסוק ידנית (לדוגמה: <em>תהלים 23:1</em>)</h4>
      <div class="manual-add-row">
        <input class="manual-input" id="manualRef"
               placeholder="שם ספר (עברית/אנגלית) + מספר פרק:פסוק" />
        <button class="btn-primary" onclick="addManualVerse()">הוסף</button>
      </div>
    </div>
  `;

  initDragDrop();
}

function clearCollection() {
  if (!confirm('למחוק את כל האוסף?')) return;
  saveCollection([]);
  renderCollectionView();
}

function printCollection() {
  window.print();
}

// ===== DRAG & DROP ==============================================

function initDragDrop() {
  const list = $('collectionList');
  if (!list) return;
  let dragSrcIdx = null;

  list.querySelectorAll('.collection-item').forEach((item, idx) => {
    item.addEventListener('dragstart', e => {
      dragSrcIdx = idx;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      list.querySelectorAll('.collection-item').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom');
      });
      dragSrcIdx = null;
    });
    item.addEventListener('dragover', e => {
      e.preventDefault();
      if (dragSrcIdx === null || dragSrcIdx === idx) return;
      const rect = item.getBoundingClientRect();
      const above = e.clientY < rect.top + rect.height / 2;
      item.classList.toggle('drag-over-top',    above);
      item.classList.toggle('drag-over-bottom', !above);
    });
    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    item.addEventListener('drop', e => {
      e.preventDefault();
      if (dragSrcIdx === null || dragSrcIdx === idx) return;
      const rect = item.getBoundingClientRect();
      const insertBefore = e.clientY < rect.top + rect.height / 2;

      const col = loadCollection();
      const [moved] = col.splice(dragSrcIdx, 1);
      // Adjust index after removal
      let target = idx;
      if (dragSrcIdx < idx) target--;
      col.splice(insertBefore ? target : target + 1, 0, moved);
      saveCollection(col);
      renderCollectionView();
    });
  });
}

// ===== MANUAL VERSE ADD =========================================

async function addManualVerse() {
  const raw = $('manualRef')?.value?.trim();
  if (!raw) { showToast('נא להזין אסמכתא'); return; }

  // Try to parse "BookName chapter:verse"
  const match = raw.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match) {
    showToast('פורמט לא תקין. נסה: ישעיהו 40:1 או Isaiah 40:1');
    return;
  }
  const bookRaw = match[1].trim();
  const ch      = parseInt(match[2]);
  const vs      = parseInt(match[3]);

  // Find the book (Hebrew or English)
  let foundBook = null, foundSec = null;
  Object.keys(SECTIONS).forEach(key => {
    SECTIONS[key].books.forEach(b => {
      if (
        b.heShort === bookRaw || b.en.toLowerCase() === bookRaw.toLowerCase() ||
        b.he === bookRaw
      ) {
        foundBook = b; foundSec = key;
      }
    });
  });

  if (!foundBook) { showToast('לא נמצא הספר "' + bookRaw + '"'); return; }
  if (ch < 1 || ch > foundBook.chapters) { showToast('מספר פרק לא תקין'); return; }

  showToast('טוען...');
  try {
    const verses = await fetchChapter(foundBook.en, ch);
    if (vs < 1 || vs > verses.length) { showToast('מספר פסוק לא תקין'); return; }
    const text = verses[vs - 1];
    const v = {
      id:     makeId(foundBook.en, ch, vs),
      bookHe: foundBook.heShort,
      bookEn: foundBook.en,
      chapter: ch, verse: vs,
      text,
      ref: `${foundBook.heShort} ${ch}:${vs}`,
    };
    addToCollection(v);
    if ($('manualRef')) $('manualRef').value = '';
    renderCollectionView();
  } catch {
    showToast('שגיאה בטעינה, נסה שנית');
  }
}

// ===== SEARCH ===================================================

function performSearch(query) {
  if (!query.trim()) return;
  state.searchResults = searchLocal(query);
  setView('search');
  renderSearchView(query);
}

function renderSearchView(query) {
  const results = state.searchResults;
  const content = $('mainContent');
  const q       = query || '';

  if (!results.length) {
    content.innerHTML = `
      <h2 class="view-heading">🔍 חיפוש: "${q}"</h2>
      <div class="search-empty">
        <span class="search-empty-icon">🔎</span>
        <p>לא נמצאו תוצאות עבור "<strong>${q}</strong>".<br>נסה מילה אחרת.</p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <h2 class="view-heading">🔍 תוצאות עבור "${q}"</h2>
    <p class="view-sub">${results.length} תוצאות</p>
    ${results.map((r, i) => `
      <div class="search-result" data-idx="${i}">
        <div class="search-result-ref">${r.heRef}</div>
        <div class="search-result-text">${r.displayHtml}</div>
      </div>
    `).join('')}
  `;

  qsa('.search-result').forEach((el, i) => {
    el.addEventListener('click', () => {
      const r = results[i];
      // Find book by English name (handles multi-word names like "I Samuel")
      let foundBook = null, foundSec = null;
      Object.keys(SECTIONS).forEach(key => {
        SECTIONS[key].books.forEach(b => {
          if (b.en === r.bookEn) { foundBook = b; foundSec = key; }
        });
      });
      if (!foundBook) { showToast('לא ניתן לנווט לתוצאה זו'); return; }

      state.book    = foundBook;
      state.chapter = r.chapter;
      qsa('.book-btn').forEach(b => b.classList.remove('active'));
      if (foundSec) {
        $(`${foundSec}-books`).classList.add('open');
        $(`[data-section="${foundSec}"]`)?.classList.add('open');
      }
      setView('reader');
      loadAndRenderChapter();
    });
  });
}

// ===== SHARE MODAL ==============================================

function showShareModal(v) {
  if (!v) return;
  state.selectedVerse = typeof v === 'string' ? JSON.parse(v) : v;
  const verse = state.selectedVerse;

  const shareText = `${verse.text}\n— ${verse.ref}`;
  $('shareVersePreview').textContent = shareText;

  const enc = encodeURIComponent(shareText);
  $('btnWhatsapp').onclick = () => window.open(`https://wa.me/?text=${enc}`, '_blank');
  $('btnTelegram').onclick = () => window.open(`https://t.me/share/url?url=&text=${enc}`, '_blank');
  $('btnTwitter').onclick  = () => window.open(`https://twitter.com/intent/tweet?text=${enc}`, '_blank');
  $('btnFacebook').onclick = () => window.open(`https://www.facebook.com/sharer/sharer.php?quote=${enc}&u=https://sefaria.org`, '_blank');
  $('btnCopyShare').onclick = () => {
    navigator.clipboard.writeText(shareText).then(() => showToast('✅ הטקסט הועתק!'));
    hideShareModal();
  };

  $('shareModal').style.display = 'flex';
}

function hideShareModal() {
  $('shareModal').style.display = 'none';
}

// ===== NAVIGATION ===============================================

function goToVerse(bookEn, chapter, verse) {
  // Find the book
  let foundBook = null, foundSec = null;
  Object.keys(SECTIONS).forEach(key => {
    SECTIONS[key].books.forEach(b => {
      if (b.en === bookEn) { foundBook = b; foundSec = key; }
    });
  });
  if (!foundBook) return;

  state.book    = foundBook;
  state.chapter = parseInt(chapter);

  qsa('.book-btn').forEach(b => b.classList.remove('active'));
  if (foundSec) {
    $(`${foundSec}-books`).classList.add('open');
    $(`[data-section="${foundSec}"]`)?.classList.add('open');
    const btn = [...$(`${foundSec}-books`).querySelectorAll('.book-btn')].find(b => b.dataset.en === bookEn);
    btn?.classList.add('active');
  }

  setView('reader');
  loadAndRenderChapter();
}

// ===== GLOBAL WIRE-UPS ==========================================

function wireEvents() {
  // Logo → home
  qs('.logo').addEventListener('click', () => {
    state.book    = null;
    state.chapter = 1;
    qsa('.book-btn').forEach(b => b.classList.remove('active'));
    setView('reader');
  });

  // Search
  $('searchBtn').addEventListener('click', () => {
    performSearch($('searchInput').value.trim());
  });
  $('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') performSearch($('searchInput').value.trim());
  });

  // Nav buttons
  qsa('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });

  // Mobile menu toggle
  $('menuToggle').addEventListener('click', () => {
    state.sidebarOpen ? closeSidebar() : openSidebar();
  });

  // Verse action buttons
  $('vaBookmark').addEventListener('click', () => {
    addBookmark(state.selectedVerse); hideVerseActions();
  });
  $('vaCollect').addEventListener('click', () => {
    addToCollection(state.selectedVerse); hideVerseActions();
  });
  $('vaShare').addEventListener('click', () => {
    const v = state.selectedVerse;
    hideVerseActions();
    if (v) showShareModal(v);
  });
  $('vaCopy').addEventListener('click', () => {
    if (!state.selectedVerse) return;
    const { text, ref } = state.selectedVerse;
    navigator.clipboard.writeText(`${text}\n— ${ref}`)
      .then(() => showToast('✅ הועתק!'));
    hideVerseActions();
  });
  $('vaClose').addEventListener('click', hideVerseActions);

  // Share modal close
  $('shareModalClose').addEventListener('click', hideShareModal);
  $('shareModal').addEventListener('click', e => {
    if (e.target === $('shareModal')) hideShareModal();
  });

  // Click outside verse → close action bar
  document.addEventListener('click', e => {
    const bar = $('verseActions');
    if (
      bar.style.display !== 'none' &&
      !bar.contains(e.target) &&
      !e.target.closest('.verse')
    ) {
      hideVerseActions();
    }
  });

  // Keyboard close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      hideVerseActions();
      hideShareModal();
      closeSidebar();
    }
  });
}

// ===== INIT =====================================================

async function init() {
  // Show a loading screen while tanakh.json downloads (~1.5 MB gzipped).
  $('mainContent').innerHTML = `
    <div class="loading" style="margin-top:20vh">
      <div class="spinner"></div>
      <span>טוען תנ״ך…</span>
    </div>`;

  try {
    const res = await fetch('tanakh.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tanakhData = await res.json();
  } catch (err) {
    $('mainContent').innerHTML = `
      <div class="error-box" style="margin:4rem auto;max-width:480px">
        <strong>שגיאה בטעינת קובץ התנ״ך</strong><br>
        <small>${err.message}</small>
      </div>`;
    return;
  }

  buildSidebar();
  wireEvents();
  renderWelcome();
}

init();
