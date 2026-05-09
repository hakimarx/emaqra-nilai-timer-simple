// Global State
const state = {
    settings: {
        eventName: 'MTQSys',
        logo: null,
        organizerLogo: null,
        location: '',
        startDate: '',
        endDate: '',
        timerPrep: 2,
        timerDuration: 10,
        timerYellow2: 1,
        judgeCount: 4,
        scoreMethod: 'average',
        hfqTotal: 4,
        hfqMut: 1,
        hfqReg: 3
    },
    participants: [],
    branches: ['Juz 30 (Juz Amma)', 'Juz 1 (Tanpa Fatihah)', 'Tilawah / Tartil', '5 Juz', '10 Juz', '20 Juz', '30 Juz'],
    rounds: ['Penyisihan', 'Semifinal', 'Final'],
    judges: {}, // { branch: [names] }
    currentMaqra: {
        surah: null,
        startAyah: 1,
        verses: [],
        currentChunk: 0,
        chunkSize: 15,
        zoom: 32,
        isNightMode: false,
        page: 1
    },
    cache: {
        surahs: {},
        pages: {}
    },
    timer: {
        interval: null,
        mode: 'idle', // idle, prep, reading, stop
        secondsElapsed: 0,
        totalSeconds: 0,
    },
    scores: []
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    loadSettings();
    initNavigation();
    initSettingsListeners();
    initMaqraListeners();
    initTimerListeners();
    initScoringListeners();
    initJudgeListeners();
    initBranchRoundListeners();
    initMushafTools();
    
    // Load cache from localStorage
    const savedCache = localStorage.getItem('mtq_quran_cache');
    if (savedCache) state.cache = JSON.parse(savedCache);
    
    // Fetch Surahs for manual selection
    await fetchSurahList();
    
    // Start Clock
    setInterval(() => {
        document.getElementById('current-time').textContent = new Date().toLocaleTimeString('id-ID');
    }, 1000);
});

// --- Settings & Persistence ---
function loadSettings() {
    const saved = localStorage.getItem('mtq_settings');
    if (saved) state.settings = { ...state.settings, ...JSON.parse(saved) };
    
    const savedParticipants = localStorage.getItem('mtq_participants');
    if (savedParticipants) state.participants = JSON.parse(savedParticipants);

    const savedJudges = localStorage.getItem('mtq_judges');
    if (savedJudges) state.judges = JSON.parse(savedJudges);

    const savedBranches = localStorage.getItem('mtq_branches');
    if (savedBranches) state.branches = JSON.parse(savedBranches);

    const savedRounds = localStorage.getItem('mtq_rounds');
    if (savedRounds) state.rounds = JSON.parse(savedRounds);

    applySettingsToUI();
    renderParticipants();
    renderJudges();
    renderBranches();
    renderRounds();
}

function saveSettings() {
    state.settings.eventName = document.getElementById('setting-event-name').value;
    state.settings.location = document.getElementById('setting-location').value;
    state.settings.startDate = document.getElementById('setting-start-date').value;
    state.settings.endDate = document.getElementById('setting-end-date').value;
    state.settings.timerPrep = parseInt(document.getElementById('setting-timer-prep').value);
    state.settings.timerDuration = parseInt(document.getElementById('setting-timer-duration').value);
    state.settings.timerYellow2 = parseInt(document.getElementById('setting-timer-yellow2').value);
    state.settings.judgeCount = parseInt(document.getElementById('setting-judge-count').value);
    state.settings.scoreMethod = document.getElementById('setting-score-method').value;
    state.settings.hfqMut = parseInt(document.getElementById('setting-hfq-mut').value) || 0;
    state.settings.hfqReg = parseInt(document.getElementById('setting-hfq-reg').value) || 0;
    state.settings.hfqTotal = state.settings.hfqMut + state.settings.hfqReg;

    localStorage.setItem('mtq_settings', JSON.stringify(state.settings));
    applySettingsToUI();
    alert('Pengaturan disimpan!');
}

function resetEvent() {
    if (confirm('Apakah Anda yakin ingin menghapus semua hasil penilaian dan mereset pengaturan event?')) {
        state.scores = [];
        state.settings.eventName = 'MTQSys';
        state.settings.logo = null;
        state.settings.organizerLogo = null;
        state.settings.location = '';
        localStorage.removeItem('mtq_settings');
        localStorage.removeItem('mtq_scores');
        applySettingsToUI();
        renderScores();
        alert('Event telah direset.');
    }
}

function resetParticipants() {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh data peserta?')) {
        state.participants = [];
        localStorage.removeItem('mtq_participants');
        renderParticipants();
        applySettingsToUI();
        alert('Data peserta dikosongkan.');
    }
}

function applySettingsToUI() {
    document.getElementById('event-name-display').textContent = state.settings.eventName;
    document.getElementById('public-event-name').textContent = state.settings.eventName.toUpperCase();
    
    // Apply to inputs
    document.getElementById('setting-event-name').value = state.settings.eventName;
    document.getElementById('setting-location').value = state.settings.location;
    document.getElementById('setting-start-date').value = state.settings.startDate;
    document.getElementById('setting-end-date').value = state.settings.endDate;
    document.getElementById('setting-timer-prep').value = state.settings.timerPrep;
    document.getElementById('setting-timer-duration').value = state.settings.timerDuration;
    document.getElementById('setting-timer-yellow2').value = state.settings.timerYellow2;
    document.getElementById('setting-judge-count').value = state.settings.judgeCount;
    document.getElementById('setting-score-method').value = state.settings.scoreMethod;
    document.getElementById('setting-hfq-mut').value = state.settings.hfqMut;
    document.getElementById('setting-hfq-reg').value = state.settings.hfqReg;

    if (state.settings.logo) {
        document.getElementById('event-logo').src = state.settings.logo;
        document.getElementById('event-logo').classList.remove('hidden');
        document.getElementById('default-logo').classList.add('hidden');
    }

    // Update Scoring UI (Dynamic Judges)
    updateJudgeInputsForBranch();

    // Update Participant Selects
    const selects = ['maqra-participant-select', 'score-participant-select', 'manual-participant-cabang', 'judge-branch-select', 'score-branch-select'];
    selects.forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const currentVal = sel.value;
        
        if (id === 'manual-participant-cabang' || id === 'judge-branch-select' || id === 'score-branch-select') {
            sel.innerHTML = id === 'score-branch-select' ? '<option value="">-- Semua Cabang --</option>' : '';
            state.branches.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b;
                opt.textContent = b;
                sel.appendChild(opt);
            });
        } else if (id === 'score-participant-select') {
            const branchFilter = document.getElementById('score-branch-select')?.value;
            sel.innerHTML = '<option value="">-- Pilih Peserta --</option>';
            state.participants
                .filter(p => !branchFilter || p.cabang === branchFilter)
                .forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.nama;
                    opt.textContent = `${p.nama} (${p.cabang})`;
                    sel.appendChild(opt);
                });
        } else {
            sel.innerHTML = '<option value="">-- Bebas --</option>';
            state.participants.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.nama;
                opt.textContent = `${p.nama} (${p.cabang})`;
                sel.appendChild(opt);
            });
        }
        sel.value = currentVal;
    });

    // Update Round Select
    const roundSelect = document.getElementById('manual-participant-babak');
    if (roundSelect) {
        const curRound = roundSelect.value;
        roundSelect.innerHTML = '';
        state.rounds.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r;
            opt.textContent = r;
            roundSelect.appendChild(opt);
        });
        roundSelect.value = curRound;
    }
}

// --- Navigation ---
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.target));
    });
}

function navigateTo(target) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.target === target));
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === target));
    const titles = { 
        dashboard: 'Dashboard', 
        registration: 'Pendaftaran Peserta & Hakim',
        maqra: 'Tampilan Maqra & Timer', 
        scoring: 'e-Scoring',
        settings: 'Pengaturan Sistem' 
    };
    document.getElementById('page-title').textContent = titles[target] || 'Layar Publik';
    
    if (target === 'maqra') {
        initManualJuzSelect();
    }
}

// --- Excel Handler ---
function initSettingsListeners() {
    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
    document.getElementById('btn-reset-event').addEventListener('click', resetEvent);
    document.getElementById('btn-reset-participants').addEventListener('click', resetParticipants);
    
    document.getElementById('btn-add-participant').addEventListener('click', () => {
        const name = document.getElementById('manual-participant-name').value;
        const cabang = document.getElementById('manual-participant-cabang').value;
        const babak = document.getElementById('manual-participant-babak').value;
        if (!name) return alert('Nama peserta tidak boleh kosong!');
        if (!cabang) return alert('Cabang belum diatur! Silakan tambah cabang di pengaturan.');
        if (!babak) return alert('Babak belum diatur! Silakan tambah babak di pengaturan.');
        
        state.participants.push({ nama: name, cabang: cabang, babak: babak });
        localStorage.setItem('mtq_participants', JSON.stringify(state.participants));
        
        document.getElementById('manual-participant-name').value = '';
        renderParticipants();
        applySettingsToUI();
        alert('Peserta ditambahkan!');
    });

    document.getElementById('setting-logo').addEventListener('change', (e) => handleImageUpload(e, 'logo'));
    document.getElementById('setting-organizer-logo').addEventListener('change', (e) => handleImageUpload(e, 'organizerLogo'));

    document.getElementById('upload-excel').addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { header: ['nama', 'cabang', 'babak'], range: 1 });
            
            state.participants = json.filter(p => p.nama).map(p => ({
                nama: p.nama,
                cabang: p.cabang || (state.branches.length > 0 ? state.branches[0] : 'Umum'),
                babak: p.babak || (state.rounds.length > 0 ? state.rounds[0] : 'Penyisihan')
            }));
            localStorage.setItem('mtq_participants', JSON.stringify(state.participants));
            renderParticipants();
            applySettingsToUI();
            alert(`Berhasil mengimpor ${state.participants.length} peserta.`);
        };
        reader.readAsBinaryString(file);
    });
}

function renderParticipants() {
    const tbody = document.getElementById('participants-tbody');
    if (state.participants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Belum ada data peserta</td></tr>';
        return;
    }
    tbody.innerHTML = state.participants.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td style="font-weight: 600;">${p.nama}</td>
            <td>
                <span class="badge" style="background: rgba(16,185,129,0.1); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 4px;">${p.cabang}</span>
                <span class="badge" style="background: rgba(245,158,11,0.1); color: var(--gold); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${p.babak || '-'}</span>
            </td>
            <td>
                <button onclick="editParticipant(${i})" class="btn-warning btn-sm" style="padding: 4px 8px;"><i class="fa-solid fa-edit"></i></button>
                <button onclick="deleteParticipant(${i})" class="btn-danger btn-sm" style="padding: 4px 8px;"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function deleteParticipant(index) {
    if (confirm('Hapus peserta ini?')) {
        state.participants.splice(index, 1);
        localStorage.setItem('mtq_participants', JSON.stringify(state.participants));
        renderParticipants();
        applySettingsToUI();
    }
}

function editParticipant(index) {
    const p = state.participants[index];
    const newName = prompt('Edit Nama Peserta:', p.nama);
    if (newName === null) return;
    
    const newCabang = prompt(`Edit Cabang (Pilihan: ${state.branches.join(', ')}):`, p.cabang);
    if (newCabang === null) return;
    
    const newBabak = prompt(`Edit Babak (Pilihan: ${state.rounds.join(', ')}):`, p.babak || '');
    if (newBabak === null) return;

    p.nama = newName;
    p.cabang = newCabang;
    p.babak = newBabak;
    
    localStorage.setItem('mtq_participants', JSON.stringify(state.participants));
    renderParticipants();
    applySettingsToUI();
}

// --- Maqra Logic ---
async function fetchSurahList() {
    try {
        const res = await fetch('https://api.quran.gading.dev/surah');
        const data = await res.json();
        const select = document.getElementById('manual-surah');
        data.data.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.number;
            opt.textContent = `${s.number}. ${s.name.transliteration.id}`;
            select.appendChild(opt);
        });
    } catch (e) { console.error('Gagal fetch daftar surat'); }
}

function initMaqraListeners() {
    document.getElementById('btn-acak-maqra').addEventListener('click', async () => {
        const cabang = document.getElementById('maqra-cabang').value;
        const mode = document.getElementById('maqra-random-mode').value;
        
        if (mode === 'package') {
            showPackageSelection(cabang);
            return;
        }

        // Antigravity Engine: Offline Logic (Otomatis)
        const pool = generateMaqraPool(cabang);
        if (pool.length === 0) return alert('Pool ayat kosong untuk cabang ini.');

        // Hide package buttons when using auto mode
        const pkgBar = document.getElementById('pkg-buttons-bar');
        pkgBar.classList.add('hidden');
        pkgBar.innerHTML = '';

        const randomItem = pool[Math.floor(Math.random() * pool.length)];
        loadMaqra(randomItem.surah, randomItem.ayat);
        alert('Berhasil diacak!');
    });

    document.getElementById('maqra-random-mode').addEventListener('change', (e) => {
        const pkgBar = document.getElementById('pkg-buttons-bar');
        if (e.target.value === 'package') {
            const cabang = document.getElementById('maqra-cabang').value;
            showPackageSelection(cabang);
        } else {
            pkgBar.classList.add('hidden');
            pkgBar.innerHTML = '';
        }
    });

    document.getElementById('btn-manual-maqra').addEventListener('click', () => {
        const s = document.getElementById('manual-surah').value;
        const a = document.getElementById('manual-ayah').value || 1;
        if (s) loadMaqra(s, parseInt(a));
    });

    document.getElementById('maqra-cabang').addEventListener('change', (e) => {
        const selectEl = e.target;
        const selectedOpt = selectEl.options[selectEl.selectedIndex];
        const jenis = selectedOpt ? selectedOpt.getAttribute('data-jenis') : '';
        const modeSelect = document.getElementById('maqra-random-mode');

        if (jenis === 'Maqra') {
            // Tilawah/Qiraat only supports Otomatis
            modeSelect.value = 'auto';
            // Disable 'package' option
            for (let i = 0; i < modeSelect.options.length; i++) {
                if (modeSelect.options[i].value === 'package') {
                    modeSelect.options[i].disabled = true;
                }
            }
            // Hide package bar if visible
            document.getElementById('pkg-buttons-bar').classList.add('hidden');
            document.getElementById('pkg-buttons-bar').innerHTML = '';
        } else {
            // MHQ supports both
            for (let i = 0; i < modeSelect.options.length; i++) {
                modeSelect.options[i].disabled = false;
            }
        }

        const mode = modeSelect.value;
        if (mode === 'package') {
            showPackageSelection(e.target.value);
        }
    });

    document.getElementById('btn-prev-ruku').addEventListener('click', () => navigateChunk(-1));
    document.getElementById('btn-next-ruku').addEventListener('click', () => navigateChunk(1));
}

async function loadMaqra(surahNum, startAyah) {
    const loading = document.getElementById('mushaf-loading');
    const content = document.getElementById('mushaf-content');
    loading.classList.remove('hidden');
    content.classList.add('hidden');

    try {
        // Use Offline Data
        const surah = QURAN_OFFLINE.find(s => s.id === parseInt(surahNum));
        if (!surah) throw new Error('Surah not found');
        
        state.currentMaqra.surah = {
            id: surah.id,
            name: {
                transliteration: { id: surah.transliteration },
                short: surah.name
            }
        };
        state.currentMaqra.startAyah = startAyah;
        state.currentMaqra.verses = surah.verses.map(v => ({
            number: { inSurah: v.id },
            text: { arab: v.text }
        }));
        
        state.currentMaqra.currentChunk = Math.floor((startAyah - 1) / state.currentMaqra.chunkSize);
        updateMaqraDisplay();
        
        // Difficulty Check
        const diff = getAyahDifficulty(surahNum, startAyah);
        document.getElementById('mushaf-ruku-info').innerHTML += ` <span class="badge ${diff === 'SULIT' ? 'bg-danger' : 'bg-success'}" style="font-size:10px; margin-left:10px;">${diff}</span>`;

        // Update Public Info
        const pNameInput = document.getElementById('maqra-participant-select');
        const pName = pNameInput.value || 'Bebas';
        document.getElementById('side-p-name').textContent = pName;
        document.getElementById('public-participant-name').textContent = pName;
        document.getElementById('public-maqra-surah').textContent = `${surah.transliteration}: ${startAyah}`;

    } catch (e) {
        console.error(e);
        alert('Gagal memuat mushaf offline.');
    } finally {
        loading.classList.add('hidden');
        content.classList.remove('hidden');
    }
}

// Antigravity Engine Helpers
function getAyahDifficulty(surah, ayah) {
    if (typeof MUTASYABIHAT_DATA === 'undefined') return 'REGULER';
    const isMut = (s, a) => MUTASYABIHAT_DATA.some(m => m.surah === s && m.ayat === a);
    if (isMut(surah, ayah)) return 'SULIT';
    for (let i = 1; i <= 5; i++) {
        if (isMut(surah, ayah + i)) return 'SULIT';
    }
    return 'REGULER';
}

function generateMaqraPool(cabang, forcedJuzList = null) {
    let pool = [];
    const excludedSurahs = [1, 36, 55, 56, 67]; // Fatihah, Yasin, Ar-Rahman, Al-Waqiah, Al-Mulk
    const isShortSurah = s => s >= 93 && s <= 114;

    // Juz-to-surah/ayah mapping derived from daftarsurah in emaqra.sql
    const JUZ_RANGES = {
        1:  [{s:1,a1:1,a2:7},{s:2,a1:1,a2:141}],
        2:  [{s:2,a1:142,a2:252}],
        3:  [{s:2,a1:253,a2:286},{s:3,a1:1,a2:91}],
        4:  [{s:3,a1:92,a2:200},{s:4,a1:1,a2:23}],
        5:  [{s:4,a1:24,a2:147}],
        6:  [{s:4,a1:148,a2:176},{s:5,a1:1,a2:82}],
        7:  [{s:5,a1:83,a2:120},{s:6,a1:1,a2:110}],
        8:  [{s:6,a1:111,a2:165},{s:7,a1:1,a2:87}],
        9:  [{s:7,a1:88,a2:206},{s:8,a1:1,a2:40}],
        10: [{s:8,a1:41,a2:75},{s:9,a1:1,a2:93}],
        11: [{s:9,a1:94,a2:129},{s:10,a1:1,a2:109},{s:11,a1:1,a2:5}],
        12: [{s:11,a1:6,a2:123},{s:12,a1:1,a2:52}],
        13: [{s:12,a1:53,a2:111},{s:13,a1:1,a2:43},{s:14,a1:1,a2:52}],
        14: [{s:15,a1:1,a2:99},{s:16,a1:1,a2:128}],
        15: [{s:17,a1:1,a2:111},{s:18,a1:1,a2:62}],
        16: [{s:18,a1:75,a2:110},{s:19,a1:1,a2:98},{s:20,a1:1,a2:135}],
        17: [{s:21,a1:1,a2:112},{s:22,a1:1,a2:78}],
        18: [{s:23,a1:1,a2:118},{s:24,a1:1,a2:64},{s:25,a1:1,a2:20}],
        19: [{s:25,a1:21,a2:77},{s:26,a1:1,a2:227},{s:27,a1:1,a2:59}],
        20: [{s:27,a1:60,a2:93},{s:28,a1:1,a2:88},{s:29,a1:1,a2:44}],
        21: [{s:29,a1:45,a2:69},{s:30,a1:1,a2:60},{s:31,a1:1,a2:34},{s:32,a1:1,a2:30},{s:33,a1:1,a2:30}],
        22: [{s:33,a1:31,a2:73},{s:34,a1:1,a2:54},{s:35,a1:1,a2:45},{s:36,a1:1,a2:21}],
        23: [{s:36,a1:22,a2:83},{s:37,a1:1,a2:182},{s:38,a1:1,a2:88},{s:39,a1:1,a2:31}],
        24: [{s:39,a1:32,a2:75},{s:40,a1:1,a2:85},{s:41,a1:1,a2:46}],
        25: [{s:41,a1:47,a2:54},{s:42,a1:1,a2:53},{s:43,a1:1,a2:89},{s:44,a1:1,a2:59},{s:45,a1:1,a2:37}],
        26: [{s:46,a1:1,a2:35},{s:47,a1:1,a2:38},{s:48,a1:1,a2:29},{s:49,a1:1,a2:18},{s:50,a1:1,a2:45},{s:51,a1:1,a2:30}],
        27: [{s:51,a1:31,a2:60},{s:52,a1:1,a2:49},{s:53,a1:1,a2:62},{s:54,a1:1,a2:55},{s:55,a1:1,a2:78},{s:56,a1:1,a2:96},{s:57,a1:1,a2:29}],
        28: [{s:58,a1:1,a2:22},{s:59,a1:1,a2:24},{s:60,a1:1,a2:13},{s:61,a1:1,a2:14},{s:62,a1:1,a2:11},{s:63,a1:1,a2:11},{s:64,a1:1,a2:18},{s:65,a1:1,a2:12},{s:66,a1:1,a2:12}],
        29: [{s:67,a1:1,a2:30},{s:68,a1:1,a2:52},{s:69,a1:1,a2:52},{s:70,a1:1,a2:44},{s:71,a1:1,a2:28},{s:72,a1:1,a2:28},{s:73,a1:1,a2:20},{s:74,a1:1,a2:56},{s:75,a1:1,a2:40},{s:76,a1:1,a2:31},{s:77,a1:1,a2:50}],
        30: [{s:78,a1:1,a2:40},{s:79,a1:1,a2:46},{s:80,a1:1,a2:42},{s:81,a1:1,a2:29},{s:82,a1:1,a2:19},{s:83,a1:1,a2:36},{s:84,a1:1,a2:25},{s:85,a1:1,a2:22},{s:86,a1:1,a2:17},{s:87,a1:1,a2:19},{s:88,a1:1,a2:26},{s:89,a1:1,a2:30},{s:90,a1:1,a2:20},{s:91,a1:1,a2:15},{s:92,a1:1,a2:21},{s:93,a1:1,a2:11},{s:94,a1:1,a2:8},{s:95,a1:1,a2:8},{s:96,a1:1,a2:19},{s:97,a1:1,a2:5},{s:98,a1:1,a2:8},{s:99,a1:1,a2:8},{s:100,a1:1,a2:11},{s:101,a1:1,a2:11},{s:102,a1:1,a2:8},{s:103,a1:1,a2:3},{s:104,a1:1,a2:9},{s:105,a1:1,a2:5},{s:106,a1:1,a2:4},{s:107,a1:1,a2:7},{s:108,a1:1,a2:3},{s:109,a1:1,a2:6},{s:110,a1:1,a2:3},{s:111,a1:1,a2:5}]
    };

    // Read data-index from the selected option
    let juzList = forcedJuzList;
    if (!juzList) {
        const selectEl = document.getElementById('maqra-cabang');
        const selectedOpt = selectEl.options[selectEl.selectedIndex];
        const juzIndex = selectedOpt ? selectedOpt.getAttribute('data-index') : null;

        if (!juzIndex) return pool;

        // Parse juz range: "1" => [1], "1-10" => [1,2,...,10], "30" => [30]
        juzList = [];
        if (juzIndex.includes('-')) {
            const [start, end] = juzIndex.split('-').map(Number);
            for (let j = start; j <= end; j++) juzList.push(j);
        } else {
            juzList.push(parseInt(juzIndex));
        }
    }

    // Build pool from juz ranges
    juzList.forEach(juz => {
        const ranges = JUZ_RANGES[juz];
        if (!ranges) return;
        ranges.forEach(r => {
            if (excludedSurahs.includes(r.s)) return;
            if (isShortSurah(r.s)) return;
            for (let a = r.a1; a <= r.a2; a++) {
                pool.push({ surah: r.s, ayat: a });
            }
        });
    });

    return pool;
}

function showPackageSelection(cabang) {
    const content = document.getElementById('mushaf-content');
    const pkgBar = document.getElementById('pkg-buttons-bar');
    const selectEl = document.getElementById('maqra-cabang');
    const selectedOpt = selectEl.options[selectEl.selectedIndex];
    const kategoriName = selectedOpt?.text || cabang;
    const juzIndexStr = selectedOpt?.getAttribute('data-index') || "";
    
    document.getElementById('mushaf-surah-title').textContent = "PILIH PAKET SOAL";
    document.getElementById('mushaf-ruku-info').textContent = `Kategori: ${kategoriName}`;
    
    const numBoxes = (state.settings.hfqMut || 0) + (state.settings.hfqReg || 0);
    if (numBoxes === 0) return alert('Jumlah paket tidak boleh 0. Atur di menu Pengaturan.');
    
    let candidates = [];

    // Special Proportional Logic for MHQ 30 Juz
    if (juzIndexStr === "1-30") {
        const chunkSize = Math.floor(30 / numBoxes);
        for (let i = 0; i < numBoxes; i++) {
            const startJuz = 1 + (i * chunkSize);
            const endJuz = (i === numBoxes - 1) ? 30 : (startJuz + chunkSize - 1);
            
            const chunkJuzList = [];
            for (let j = startJuz; j <= endJuz; j++) chunkJuzList.push(j);
            
            const chunkPool = generateMaqraPool(cabang, chunkJuzList);
            if (chunkPool.length > 0) {
                const shuffledChunk = [...chunkPool].sort(() => Math.random() - 0.5);
                // First 'hfqMut' boxes: try to pick SULIT
                if (i < state.settings.hfqMut) {
                    const difficultOne = shuffledChunk.find(item => getAyahDifficulty(item.surah, item.ayat) === 'SULIT');
                    candidates.push(difficultOne || shuffledChunk[0]);
                } else {
                    const regularOne = shuffledChunk.find(item => getAyahDifficulty(item.surah, item.ayat) === 'REGULER');
                    candidates.push(regularOne || shuffledChunk[0]);
                }
            }
        }
        // Shuffle candidates so the SULIT ones aren't always first
        candidates.sort(() => Math.random() - 0.5);
    } else {
        // Standard logic for non-30-Juz branches
        const pool = generateMaqraPool(cabang);
        if (pool.length < numBoxes) return alert('Pool ayat tidak cukup untuk membuat paket.');

        const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
        
        // Pick 'hfqMut' SULIT items
        const difficults = shuffledPool.filter(item => getAyahDifficulty(item.surah, item.ayat) === 'SULIT').slice(0, state.settings.hfqMut);
        candidates.push(...difficults);
        
        // Pick 'hfqReg' REGULER items
        const regulars = shuffledPool.filter(item => 
            !candidates.includes(item) && getAyahDifficulty(item.surah, item.ayat) === 'REGULER'
        ).slice(0, state.settings.hfqReg);
        candidates.push(...regulars);
        
        // Fill remaining if pools were too small
        while(candidates.length < numBoxes) {
            const extra = shuffledPool.find(item => !candidates.includes(item));
            if (!extra) break;
            candidates.push(extra);
        }
        candidates.sort(() => Math.random() - 0.5);
    }

    state._packageCandidates = candidates;
    alert('Berhasil diacak! Pilih paket di toolbar.');

    // Render small inline buttons in the header toolbar
    let btnsHtml = '';
    candidates.forEach((item, index) => {
        btnsHtml += `<button class="btn-sm pkg-btn" id="pkg-btn-${index}" 
            onclick="loadPacketMaqra(${index}, ${item.surah}, ${item.ayat})" 
            title="Paket ${index + 1}">
            <i class="fa-solid fa-envelope"></i> ${index + 1}
        </button>`;
    });
    pkgBar.innerHTML = btnsHtml;
    pkgBar.classList.remove('hidden');

    // Show placeholder in content area
    content.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-hand-pointer"></i>
            <p>Pilih salah satu paket soal (1-${numBoxes}) di toolbar atas</p>
        </div>
    `;
}

function loadPacketMaqra(index, surahNum, startAyah) {
    // Highlight selected button, mark as opened
    document.querySelectorAll('.pkg-btn').forEach(btn => {
        btn.classList.remove('pkg-btn-active');
    });

    const selectedBtn = document.getElementById(`pkg-btn-${index}`);
    selectedBtn.classList.add('pkg-btn-active', 'pkg-btn-opened');
    selectedBtn.innerHTML = `<i class="fa-solid fa-envelope-open"></i> ${index + 1}`;

    // Load verse into the main mushaf-content
    const content = document.getElementById('mushaf-content');
    
    const surah = QURAN_OFFLINE.find(s => s.id === parseInt(surahNum));
    if (!surah) { content.innerHTML = '<p class="text-muted">Surah tidak ditemukan.</p>'; return; }

    const diff = getAyahDifficulty(surahNum, startAyah);
    const diffBadge = `<span class="badge ${diff === 'SULIT' ? 'bg-danger' : 'bg-success'}" style="font-size:11px;">${diff}</span>`;

    // Update header info
    document.getElementById('mushaf-surah-title').textContent = `${surah.transliteration} (${surah.name})`;
    const selectEl = document.getElementById('maqra-cabang');
    const kategoriName = selectEl.options[selectEl.selectedIndex]?.text || '';
    document.getElementById('mushaf-ruku-info').innerHTML = `Paket ${index + 1} | Ayat ${startAyah} | ${kategoriName} ${diffBadge}`;

    // Show 15 verses starting from startAyah
    const chunkSize = 15;
    const startIdx = startAyah - 1;
    const endIdx = Math.min(startIdx + chunkSize, surah.verses.length);
    const chunkVerses = surah.verses.slice(startIdx, endIdx);

    content.innerHTML = `
        <div class="quran-text-block" style="direction: rtl;">
            ${chunkVerses.map(v => `
                <span class="quran-text">${v.text}</span>
                <span class="ayah-end-symbol">۝${toArabicDigits(v.id)}</span>
            `).join(' ')}
        </div>
    `;

    // Update state for navigation and public display
    state.currentMaqra.surah = {
        id: surah.id,
        name: { transliteration: { id: surah.transliteration }, short: surah.name }
    };
    state.currentMaqra.startAyah = startAyah;
    state.currentMaqra.verses = surah.verses.map(v => ({
        number: { inSurah: v.id },
        text: { arab: v.text }
    }));
    state.currentMaqra.currentChunk = Math.floor((startAyah - 1) / state.currentMaqra.chunkSize);

    // Update Public Info
    const pName = document.getElementById('maqra-participant-select')?.value || 'Bebas';
    document.getElementById('side-p-name').textContent = pName;
    document.getElementById('public-participant-name').textContent = pName;
    document.getElementById('public-maqra-surah').textContent = `${surah.transliteration}: ${startAyah}`;
}

function toArabicDigits(num) {
    const id = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, function(w) {
        return id[+w];
    });
}

function playBell(count) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        function ring(delay) {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            // Create a bell-like harmonic sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + delay); 
            
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delay);
            gainNode.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + delay + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.8);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start(audioCtx.currentTime + delay);
            oscillator.stop(audioCtx.currentTime + delay + 0.8);
        }

        for (let i = 0; i < count; i++) {
            ring(i * 0.7);
        }
    } catch (e) {
        console.error('AudioContext not supported or blocked', e);
    }
}

function updateMaqraDisplay() {
    const { surah, currentChunk, chunkSize, verses } = state.currentMaqra;
    const startIdx = currentChunk * chunkSize;
    const endIdx = startIdx + chunkSize;
    const chunkVerses = verses.slice(startIdx, endIdx);
    
    document.getElementById('mushaf-surah-title').textContent = `${surah.name.transliteration.id} (${surah.name.short})`;
    document.getElementById('mushaf-ruku-info').textContent = `Ayat ${startIdx + 1} - ${Math.min(endIdx, verses.length)} | Bagian ${currentChunk + 1}`;
    
    const content = document.getElementById('mushaf-content');
    content.innerHTML = `
        <div class="quran-text-block" style="direction: rtl;">
            ${chunkVerses.map(v => `
                <span class="quran-text">${v.text.arab}</span>
                <span class="ayah-end-symbol">۝${toArabicDigits(v.number.inSurah)}</span>
            `).join(' ')}
        </div>
    `;

    document.getElementById('btn-prev-ruku').disabled = currentChunk === 0;
    document.getElementById('btn-next-ruku').disabled = endIdx >= verses.length;
}

function navigateChunk(dir) {
    state.currentMaqra.currentChunk += dir;
    updateMaqraDisplay();
    // Scroll to top of mushaf
    document.getElementById('mushaf-content').scrollTop = 0;
}

// --- Mushaf Tools & Navigation ---
function initManualJuzSelect() {
    const sel = document.getElementById('manual-juz');
    if (sel.children.length <= 1) {
        for (let i = 1; i <= 30; i++) {
            const opt = document.createElement('option');
            opt.value = i; opt.textContent = 'Juz ' + i;
            sel.appendChild(opt);
        }
    }
}

function initMushafTools() {
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        state.currentMaqra.zoom += 4;
        updateZoom();
    });
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        state.currentMaqra.zoom = Math.max(16, state.currentMaqra.zoom - 4);
        updateZoom();
    });
    document.getElementById('btn-toggle-night').addEventListener('click', () => {
        state.currentMaqra.isNightMode = !state.currentMaqra.isNightMode;
        document.getElementById('mushaf-main-container').classList.toggle('night-mode', state.currentMaqra.isNightMode);
        document.querySelector('#btn-toggle-night i').className = state.currentMaqra.isNightMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });

    document.getElementById('btn-manual-maqra').addEventListener('click', () => {
        const juz = document.getElementById('manual-juz').value;
        const surah = document.getElementById('manual-surah').value;
        const ayah = document.getElementById('manual-ayah').value || 1;

        if (juz) loadMaqraByJuz(parseInt(juz));
        else if (surah) loadMaqra(parseInt(surah), parseInt(ayah));
    });
}

function updateZoom() {
    document.querySelectorAll('.quran-text').forEach(el => {
        el.style.fontSize = state.currentMaqra.zoom + 'px';
    });
}


async function loadMaqraByPage(pageNumber) {
    const loading = document.getElementById('mushaf-loading');
    const content = document.getElementById('mushaf-content');
    loading.classList.remove('hidden');
    content.classList.add('hidden');

    try {
        let verses;
        if (state.cache.pages[pageNumber]) {
            verses = state.cache.pages[pageNumber];
        } else {
            const res = await fetch(`https://api.quran.com/api/v4/quran/verses/tajweed?page_number=${pageNumber}`);
            const data = await res.json();
            verses = data.verses;
            state.cache.pages[pageNumber] = verses;
            saveCache();
        }

        state.currentMaqra.verses = verses;
        state.currentMaqra.surah = { name: { transliteration: { id: `Halaman ${pageNumber}` }, short: 'Mushaf' } };
        state.currentMaqra.currentChunk = 0;
        state.currentMaqra.chunkSize = 1000; // Show all verses on that page
        
        displayTajweedVerses(verses, `Halaman ${pageNumber}`);
    } catch (e) {
        alert('Gagal memuat halaman (Cek koneksi internet untuk data baru).');
    } finally {
        loading.classList.add('hidden');
        content.classList.remove('hidden');
    }
}

async function loadMaqraByJuz(juzNumber) {
    // Similar to loadMaqra but by juz
    const res = await fetch(`https://api.quran.com/api/v4/verses/by_juz/${juzNumber}?per_page=1`);
    const data = await res.json();
    if (data.verses.length > 0) {
        const page = data.verses[0].page_number;
        loadMaqraByPage(page);
    }
}

function saveCache() {
    try {
        localStorage.setItem('mtq_quran_cache', JSON.stringify(state.cache));
    } catch (e) { 
        // LocalStorage full, clear some
        if (Object.keys(state.cache.pages).length > 20) {
            state.cache.pages = {};
        }
    }
}

function displayTajweedVerses(verses, title) {
    document.getElementById('mushaf-surah-title').textContent = title;
    document.getElementById('mushaf-ruku-info').textContent = `Tampilan Tajwid | MTQ Standard`;

    const content = document.getElementById('mushaf-content');
    content.innerHTML = `
        <div class="quran-text-block" style="direction: rtl;">
            ${verses.map(v => {
                let text = v.text_tajweed;
                // Simple tajweed rule mapping (this is simplified as the API returns complex tags)
                // We'll clean up the tags to match our CSS classes if needed, 
                // but usually the API returns <span> tags with classes or similar.
                // For api.quran.com/tajweed, it returns encoded text.
                return `
                    <span class="quran-text" style="font-size: ${state.currentMaqra.zoom}px;">${text}</span>
                    <span class="ayah-end-symbol">۝${toArabicDigits(v.verse_number || v.id.toString().split(':')[1])}</span>
                `;
            }).join(' ')}
        </div>
    `;
}

// --- Timer State Machine ---
function initTimerListeners() {
    document.getElementById('btn-timer-start').addEventListener('click', startTimerFlow);
    document.getElementById('btn-timer-stop').addEventListener('click', stopTimer);
    document.getElementById('btn-timer-reset').addEventListener('click', resetTimer);
}

function startTimerFlow() {
    if (state.timer.mode !== 'idle') return;
    
    // Preparation Phase (Yellow 1)
    state.timer.mode = 'prep';
    state.timer.secondsElapsed = 0;
    state.timer.totalSeconds = state.settings.timerPrep;
    
    playBell(1); // Bel sekali persiapan
    updateTimerUI();
    
    state.timer.interval = setInterval(() => {
        const oldMode = state.timer.mode;
        state.timer.secondsElapsed++;
        
        if (state.timer.mode === 'prep' && state.timer.secondsElapsed >= state.settings.timerPrep) {
            // Switch to Reading Phase (Green)
            state.timer.mode = 'reading';
            state.timer.secondsElapsed = 0;
            state.timer.totalSeconds = state.settings.timerDuration * 60;
            playBell(2); // Bel dua kali mulai baca
        } else if (state.timer.mode === 'reading' || state.timer.mode === 'warning' || state.timer.mode === 'stop') {
            const timeLeft = state.timer.totalSeconds - state.timer.secondsElapsed;
            
            if (timeLeft <= 0) {
                if (oldMode !== 'stop') {
                    state.timer.mode = 'stop';
                    playBell(3); // Bel tiga kali berhenti
                }
            } else if (timeLeft <= state.settings.timerYellow2 * 60 && state.timer.totalSeconds > state.settings.timerYellow2 * 60) {
                if (oldMode !== 'warning') {
                    state.timer.mode = 'warning';
                    playBell(1); // Bel sekali persiapan berhenti
                }
            }
        }
        updateTimerUI();
    }, 1000);
}

function updateTimerUI() {
    const lamp = document.getElementById('side-lamp');
    const pubLamp = document.getElementById('public-timer-lamp');
    const display = document.getElementById('side-time-display');
    const pubDisplay = document.getElementById('public-time-display');
    const statusText = document.getElementById('side-timer-status');
    const pubStatusText = document.getElementById('public-timer-status');

    lamp.className = 'lamp-indicator';
    pubLamp.className = 'lamp-indicator-large';
    display.classList.remove('timer-overtime');
    pubDisplay.classList.remove('timer-overtime');

    let isOvertime = false;
    let displayTime = state.timer.secondsElapsed;
    
    if (state.timer.mode === 'reading' || state.timer.mode === 'warning' || state.timer.mode === 'stop') {
        displayTime = state.timer.totalSeconds - state.timer.secondsElapsed;
        if (displayTime <= 0) isOvertime = true;
    }

    const absSeconds = Math.abs(displayTime);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    const timeStr = (isOvertime && absSeconds > 0 ? '-' : '') + `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    
    display.textContent = timeStr;
    pubDisplay.textContent = timeStr;

    if (isOvertime) {
        display.classList.add('timer-overtime');
        pubDisplay.classList.add('timer-overtime');
    }

    switch (state.timer.mode) {
        case 'prep':
            lamp.classList.add('lamp-prep'); pubLamp.classList.add('lamp-prep');
            statusText.textContent = 'PERSIAPAN'; pubStatusText.textContent = 'PERSIAPAN';
            break;
        case 'reading':
            lamp.classList.add('lamp-reading'); pubLamp.classList.add('lamp-reading');
            statusText.textContent = 'MULAI BACA'; pubStatusText.textContent = 'MULAI BACA';
            break;
        case 'warning':
            lamp.classList.add('lamp-warning'); pubLamp.classList.add('lamp-warning');
            statusText.textContent = 'PERSIAPAN BERHENTI'; pubStatusText.textContent = 'PERSIAPAN BERHENTI';
            break;
        case 'stop':
            lamp.classList.add('lamp-stop'); pubLamp.classList.add('lamp-stop');
            statusText.textContent = 'BERHENTI'; pubStatusText.textContent = 'BERHENTI';
            break;
        default:
            statusText.textContent = 'SIAP'; pubStatusText.textContent = 'SIAP';
    }
}

function stopTimer() {
    clearInterval(state.timer.interval);
    state.timer.mode = 'stop';
    updateTimerUI();
}

function resetTimer() {
    clearInterval(state.timer.interval);
    state.timer.mode = 'idle';
    state.timer.secondsElapsed = 0;
    updateTimerUI();
    document.getElementById('side-time-display').textContent = '00:00';
    document.getElementById('public-time-display').textContent = '00:00';
}

// --- Scoring Logic ---
function initScoringListeners() {
    document.getElementById('btn-save-score').addEventListener('click', saveScore);
    document.getElementById('btn-export-excel').addEventListener('click', exportToExcel);
    document.getElementById('btn-print-rekap').addEventListener('click', printRecap);
    
    // Branch filter for scoring
    document.getElementById('score-branch-select').addEventListener('change', () => {
        applySettingsToUI(); // Refresh participant list based on branch filter
    });

    // Update judge inputs when participant/branch changes
    document.getElementById('score-participant-select').addEventListener('change', (e) => {
        const selected = e.target.options[e.target.selectedIndex]?.text || '';
        const branchMatch = selected.match(/\(([^)]+)\)/);
        if (branchMatch) {
            updateJudgeInputsForBranch(branchMatch[1]);
        }
    });
}

function updateJudgeInputsForBranch(branchKey) {
    const container = document.getElementById('dynamic-judges-container');
    const judgeNames = state.judges[branchKey] || [];
    const count = judgeNames.length || state.settings.judgeCount;
    
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const name = judgeNames[i] || `Hakim ${i + 1}`;
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label>${name}</label>
            <input type="number" class="judge-score-input" min="0" max="100" placeholder="0-100">
        `;
        container.appendChild(div);
    }
}

function initJudgeListeners() {
    document.getElementById('btn-save-judges').addEventListener('click', () => {
        const branch = document.getElementById('judge-branch-select').value;
        const names = document.getElementById('judge-names-input').value.split(',').map(n => n.trim()).filter(n => n);
        if (names.length === 0) return alert('Masukkan nama hakim!');
        
        state.judges[branch] = names;
        localStorage.setItem('mtq_judges', JSON.stringify(state.judges));
        renderJudges();
        alert('Daftar hakim diperbarui!');
    });
}

function renderJudges() {
    const tbody = document.getElementById('judges-tbody');
    tbody.innerHTML = '';
    
    Object.keys(state.judges).forEach(branch => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${branch}</td>
            <td>${state.judges[branch].join(', ')}</td>
            <td>
                <button onclick="editJudge('${branch}')" class="btn-warning btn-sm"><i class="fa-solid fa-edit"></i></button>
                <button onclick="deleteJudge('${branch}')" class="btn-danger btn-sm"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteJudge(branch) {
    if (confirm(`Hapus daftar hakim untuk cabang ${branch}?`)) {
        delete state.judges[branch];
        localStorage.setItem('mtq_judges', JSON.stringify(state.judges));
        renderJudges();
    }
}

function editJudge(branch) {
    const current = state.judges[branch].join(', ');
    const newVal = prompt(`Edit Daftar Hakim untuk ${branch} (Pemisah Koma):`, current);
    if (newVal !== null) {
        state.judges[branch] = newVal.split(',').map(n => n.trim()).filter(n => n);
        localStorage.setItem('mtq_judges', JSON.stringify(state.judges));
        renderJudges();
    }
}

function handleImageUpload(e, field) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (f) => {
            state.settings[field] = f.target.result;
            applySettingsToUI();
        };
        reader.readAsDataURL(file);
    }
}

function exportToExcel() {
    if (state.scores.length === 0) return alert('Tidak ada data untuk diekspor!');
    
    const data = state.scores.map((s, i) => ({
        'Peringkat': i + 1,
        'Nama Peserta': s.name,
        'Cabang': s.cabang || '-',
        'Skor Akhir': s.score
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil Penilaian");
    XLSX.writeFile(workbook, `Hasil_Penilaian_${state.settings.eventName}.xlsx`);
}

function printRecap() {
    if (state.scores.length === 0) return alert('Tidak ada data untuk dicetak!');

    const printDiv = document.createElement('div');
    printDiv.id = 'print-container';
    
    const startDate = state.settings.startDate ? new Date(state.settings.startDate).toLocaleDateString('id-ID') : '';
    const endDate = state.settings.endDate ? new Date(state.settings.endDate).toLocaleDateString('id-ID') : '';
    
    printDiv.innerHTML = `
        <div class="print-kop">
            <img src="${state.settings.logo || ''}" class="kop-logo">
            <div class="kop-text">
                <h1>${state.settings.eventName}</h1>
                <p>${state.settings.location || ''} | ${startDate} - ${endDate}</p>
                <p>REKAPITULASI HASIL PENILAIAN</p>
            </div>
            <img src="${state.settings.organizerLogo || ''}" class="kop-logo">
        </div>
        
        <table class="print-table">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Nama Peserta</th>
                    <th>Cabang</th>
                    ${Array.from({length: state.settings.judgeCount}, (_, i) => `<th>H${i+1}</th>`).join('')}
                    <th>Total Skor</th>
                </tr>
            </thead>
            <tbody>
                ${state.scores.map((s, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${s.name}</td>
                        <td>${s.cabang || '-'}</td>
                        ${s.details ? s.details.map(v => `<td>${v}</td>`).join('') : Array(state.settings.judgeCount).fill('<td>-</td>').join('')}
                        <td style="font-weight:bold;">${s.score}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="print-signature">
            <p>${state.settings.location || 'Tempat'}, ${new Date().toLocaleDateString('id-ID')}</p>
            <p>Ketua Dewan Hakim,</p>
            <div class="signature-space"></div>
            <p>( __________________________ )</p>
        </div>
    `;
    
    document.body.appendChild(printDiv);
    window.print();
    document.body.removeChild(printDiv);
}

function saveScore() {
    const pInput = document.getElementById('score-participant-select');
    const participantName = pInput.value;
    if (!participantName) return alert('Pilih peserta!');
    
    const participant = state.participants.find(p => p.nama === participantName);
    const cabang = participant ? participant.cabang : '-';
    const babak = participant ? participant.babak : '-';

    const inputs = document.querySelectorAll('.judge-score-input');
    let vals = [];
    inputs.forEach(i => { if(i.value) vals.push(parseFloat(i.value)); });

    if (vals.length < inputs.length) return alert(`Masukkan nilai untuk semua hakim (${inputs.length} hakim)`);

    let final = 0;
    if (state.settings.scoreMethod === 'average') {
        final = vals.reduce((a, b) => a + b, 0) / vals.length;
    } else {
        const sorted = [...vals].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        final = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2;
    }

    state.scores.push({ name: participantName, cabang: cabang, babak: babak, score: final.toFixed(2), details: vals });
    state.scores.sort((a, b) => b.score - a.score);
    
    renderScores();
    alert('Nilai disimpan!');
}

function renderScores() {
    const tbody = document.getElementById('rekap-tbody');
    tbody.innerHTML = state.scores.map((s, i) => `
        <tr>
            <td>#${i + 1}</td>
            <td style="font-weight:600;">${s.name}</td>
            <td>
                <span class="badge" style="background: rgba(16,185,129,0.1); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px;">${s.cabang}</span>
                <span class="badge" style="background: rgba(245,158,11,0.1); color: var(--gold); padding: 4px 8px; border-radius: 4px; font-size: 11px;">${s.babak || '-'}</span>
            </td>
            <td style="color:var(--gold); font-weight:700; font-size:18px;">${s.score}</td>
        </tr>
    `).join('');
}

// --- Branch & Round CRUD ---
function initBranchRoundListeners() {
    document.getElementById('btn-add-branch').addEventListener('click', () => {
        const val = document.getElementById('new-branch-name').value.trim();
        if (!val) return;
        state.branches.push(val);
        localStorage.setItem('mtq_branches', JSON.stringify(state.branches));
        document.getElementById('new-branch-name').value = '';
        renderBranches();
        applySettingsToUI();
    });

    document.getElementById('btn-add-round').addEventListener('click', () => {
        const val = document.getElementById('new-round-name').value.trim();
        if (!val) return;
        state.rounds.push(val);
        localStorage.setItem('mtq_rounds', JSON.stringify(state.rounds));
        document.getElementById('new-round-name').value = '';
        renderRounds();
        applySettingsToUI();
    });
}

function renderBranches() {
    const tbody = document.getElementById('branches-tbody');
    if (!tbody) return;
    tbody.innerHTML = state.branches.map((b, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${b}</td>
            <td>
                <button onclick="editBranch(${i})" class="btn-warning btn-sm"><i class="fa-solid fa-edit"></i></button>
                <button onclick="deleteBranch(${i})" class="btn-danger btn-sm"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderRounds() {
    const tbody = document.getElementById('rounds-tbody');
    if (!tbody) return;
    tbody.innerHTML = state.rounds.map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${r}</td>
            <td>
                <button onclick="editRound(${i})" class="btn-warning btn-sm"><i class="fa-solid fa-edit"></i></button>
                <button onclick="deleteRound(${i})" class="btn-danger btn-sm"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function editBranch(index) {
    const newVal = prompt('Edit Cabang:', state.branches[index]);
    if (newVal) {
        state.branches[index] = newVal;
        localStorage.setItem('mtq_branches', JSON.stringify(state.branches));
        renderBranches();
        applySettingsToUI();
    }
}

function deleteBranch(index) {
    if (confirm('Hapus cabang ini?')) {
        state.branches.splice(index, 1);
        localStorage.setItem('mtq_branches', JSON.stringify(state.branches));
        renderBranches();
        applySettingsToUI();
    }
}

function editRound(index) {
    const newVal = prompt('Edit Babak:', state.rounds[index]);
    if (newVal) {
        state.rounds[index] = newVal;
        localStorage.setItem('mtq_rounds', JSON.stringify(state.rounds));
        renderRounds();
        applySettingsToUI();
    }
}

function deleteRound(index) {
    if (confirm('Hapus babak ini?')) {
        state.rounds.splice(index, 1);
        localStorage.setItem('mtq_rounds', JSON.stringify(state.rounds));
        renderRounds();
        applySettingsToUI();
    }
}

function toArabicDigits(num) {
    const id = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/\d/g, d => id[d]);
}
function updateJudgeInputsForBranch(branch = null) {
    const container = document.getElementById('dynamic-judges-container');
    container.innerHTML = '';
    
    let judgeNames = [];
    if (branch && state.judges[branch]) {
        judgeNames = state.judges[branch];
    } else {
        // Fallback or generic
        for (let i = 1; i <= state.settings.judgeCount; i++) {
            judgeNames.push(`Hakim ${i}`);
        }
    }

    judgeNames.forEach(name => {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label>Nilai ${name}</label>
            <input type="number" class="judge-score-input" min="0" max="100" placeholder="0-100">
        `;
        container.appendChild(div);
    });
}
