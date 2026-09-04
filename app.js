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
        hfqReg: 3,
        mushafType: 'kemenag',
        timerLampStyle: 'single'
    },
    participants: [],
    branches: ['Juz 30 (Juz Amma)', 'Juz 1 (Tanpa Fatihah)', 'Tilawah / Tartil', '5 Juz', '10 Juz', '20 Juz', '30 Juz', 'Qiraat'],
    rounds: ['Penyisihan', 'Semifinal', 'Final'],
    judges: {}, // { branch: [names] }
    competitionStructure: {}, // { branchName: { fields: [...] } }
    currentMaqra: {
        surah: null,
        startAyah: 1,
        verses: [],
        flatVerses: [],
        displayStart: 0,
        chunkSize: 15,
        zoom: 32,
        isNightMode: false,
        isMushafMode: false,
        page: 1
    },
    qiraatMode: 'pdf',
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

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    // Verify Developer Signature Integrity
    const _0x58 = 88;
    const _dec = arr => arr.map(c => String.fromCharCode(c ^ _0x58)).join('');
    if (window.__APP_SIGNATURE__ !== _dec([48, 57, 51, 49, 53, 57, 42, 32])) {
        document.body.innerHTML = "<div style='display:flex;justify-content:center;align-items:center;height:100vh;background:#0f172a;color:#ef4444;font-family:sans-serif;font-size:20px;font-weight:bold;text-align:center;padding:20px;'>System Integrity Error: Developer attribution modified.</div>";
        return;
    }
    
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
    if (savedCache) {
        try {
            const parsedCache = JSON.parse(savedCache);
            if (parsedCache && typeof parsedCache === 'object') {
                state.cache = parsedCache;
                if (!state.cache.surahs) state.cache.surahs = {};
                if (!state.cache.pages) state.cache.pages = {};
            }
        } catch(e) {
            console.error('Failed to parse cache:', e);
            state.cache.surahs = {};
            state.cache.pages = {};
        }
    }
    
    // Fetch Surahs for manual selection
    await fetchSurahList();
    fetchJuzList();
    
    // Clock element check
    setInterval(() => {
        const clock = document.getElementById('current-time');
        if (clock) clock.textContent = new Date().toLocaleTimeString('id-ID');
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
    if (savedBranches) {
        state.branches = JSON.parse(savedBranches);
        if (!state.branches.includes('Qiraat')) {
            state.branches.push('Qiraat');
            localStorage.setItem('mtq_branches', JSON.stringify(state.branches));
        }
    }

    const savedRounds = localStorage.getItem('mtq_rounds');
    if (savedRounds) state.rounds = JSON.parse(savedRounds);

    const savedStructure = localStorage.getItem('mtq_structure');
    if (savedStructure) state.competitionStructure = JSON.parse(savedStructure);

    const savedScores = localStorage.getItem('mtq_scores');
    if (savedScores) state.scores = JSON.parse(savedScores);

    applySettingsToUI();
    renderParticipants();
    renderJudges();
    renderBranches();
    renderRounds();
    renderScores();
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
    
    const mushafTypeEl = document.getElementById('setting-mushaf-type');
    if (mushafTypeEl) {
        state.settings.mushafType = mushafTypeEl.value;
    }
    
    const timerLampStyleEl = document.getElementById('setting-timer-lamp-style');
    if (timerLampStyleEl) {
        state.settings.timerLampStyle = timerLampStyleEl.value;
    }

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
    const eventNameDisplay = document.getElementById('event-name-display');
    if (eventNameDisplay) eventNameDisplay.textContent = state.settings.eventName;
    
    const publicEventName = document.getElementById('public-event-name');
    if (publicEventName) publicEventName.textContent = state.settings.eventName.toUpperCase();
    
    // Apply to inputs
    if (document.getElementById('setting-event-name')) {
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
        const mushafTypeEl = document.getElementById('setting-mushaf-type');
        if (mushafTypeEl) {
            mushafTypeEl.value = state.settings.mushafType || 'kemenag';
        }
        const timerLampStyleEl = document.getElementById('setting-timer-lamp-style');
        if (timerLampStyleEl) {
            timerLampStyleEl.value = state.settings.timerLampStyle || 'single';
        }
    }

    const miniPrep = document.getElementById('mini-timer-prep');
    const miniDuration = document.getElementById('mini-timer-duration');
    const miniYellow = document.getElementById('mini-timer-yellow');
    if (miniPrep) miniPrep.value = state.settings.timerPrep;
    if (miniDuration) miniDuration.value = state.settings.timerDuration;
    if (miniYellow) miniYellow.value = state.settings.timerYellow2;

    const mushafContainer = document.getElementById('mushaf-main-container');
    if (mushafContainer) {
        mushafContainer.classList.remove('mushaf-type-kemenag', 'mushaf-type-madinah');
        mushafContainer.classList.add(`mushaf-type-${state.settings.mushafType || 'kemenag'}`);
    }

    const standardLabel = document.getElementById('standard-label');
    if (standardLabel) {
        standardLabel.textContent = state.settings.mushafType === 'madinah' ? 'MADINAH' : 'KEMENAG';
    }

    const singleStyle = document.getElementById('timer-style-single');
    const multiStyle = document.getElementById('timer-style-multi');
    const sideTimerContainer = document.querySelector('.side-timer-container');
    if (singleStyle && multiStyle) {
        if (state.settings.timerLampStyle === 'multi') {
            singleStyle.classList.add('hidden');
            multiStyle.classList.remove('hidden');
            if (sideTimerContainer) sideTimerContainer.classList.add('timer-style-multi-active');
        } else {
            singleStyle.classList.remove('hidden');
            multiStyle.classList.add('hidden');
            if (sideTimerContainer) sideTimerContainer.classList.remove('timer-style-multi-active');
        }
    }

    const pubSingleStyle = document.getElementById('public-timer-style-single');
    const pubMultiStyle = document.getElementById('public-timer-style-multi');
    if (pubSingleStyle && pubMultiStyle) {
        if (state.settings.timerLampStyle === 'multi') {
            pubSingleStyle.classList.add('hidden');
            pubMultiStyle.classList.remove('hidden');
        } else {
            pubSingleStyle.classList.remove('hidden');
            pubMultiStyle.classList.add('hidden');
        }
    }


    if (state.settings.logo && document.getElementById('event-logo')) {
        document.getElementById('event-logo').src = state.settings.logo;
        document.getElementById('event-logo').classList.remove('hidden');
        if (document.getElementById('default-logo')) document.getElementById('default-logo').classList.add('hidden');
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

    // Update Maqra Cabang Select
    const maqraCabang = document.getElementById('maqra-cabang');
    if (maqraCabang) {
        const currentMaqraCabang = maqraCabang.value;
        maqraCabang.innerHTML = '';
        
        const mhqGroup = document.createElement('optgroup');
        mhqGroup.label = "MHQ (Hifdzil Quran)";
        const maqraGroup = document.createElement('optgroup');
        maqraGroup.label = "Maqra (Tilawah/Qiraat)";
        const otherGroup = document.createElement('optgroup');
        otherGroup.label = "Lainnya";

        state.branches.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b;
            opt.textContent = b;
            
            // Guess jenis and index
            const bUpper = b.toUpperCase();
            if (bUpper.includes('HIFZH') || bUpper.includes('JUZ')) {
                opt.dataset.jenis = "MHQ";
                if (bUpper.includes('AMMA')) {
                    opt.dataset.index = "30";
                } else {
                    const m = bUpper.match(/(\d+)\s*JUZ|JUZ\s*(\d+)/);
                    const num = m ? parseInt(m[1] || m[2], 10) : 30;
                    if (num === 1) opt.dataset.index = "1";
                    else if (num === 5) opt.dataset.index = "1-5";
                    else if (num === 10) opt.dataset.index = "1-10";
                    else if (num === 20) opt.dataset.index = "1-20";
                    else opt.dataset.index = "1-30";
                }
                mhqGroup.appendChild(opt);
            } else if (bUpper.includes('TILAWAH') || bUpper.includes('TARTIL') || bUpper.includes('QIRAAT')) {
                opt.dataset.jenis = "Maqra";
                opt.dataset.index = "1-30";
                maqraGroup.appendChild(opt);
            } else {
                otherGroup.appendChild(opt);
            }
        });

        if (mhqGroup.children.length > 0) maqraCabang.appendChild(mhqGroup);
        if (maqraGroup.children.length > 0) maqraCabang.appendChild(maqraGroup);
        if (otherGroup.children.length > 0) maqraCabang.appendChild(otherGroup);
        
        maqraCabang.value = currentMaqraCabang;
    }

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

    // Render scores to make sure scoreboard is in sync with any setting/filter changes
    renderScores();
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
}

// --- Excel Handler ---
function initSettingsListeners() {
    if (document.getElementById('btn-save-settings')) {
        document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
        
        const btnResetEvent = document.getElementById('btn-reset-event');
        if (btnResetEvent) btnResetEvent.addEventListener('click', resetEvent);
        
        const btnResetParticipants = document.getElementById('btn-reset-participants');
        if (btnResetParticipants) btnResetParticipants.addEventListener('click', resetParticipants);
        
        const btnLoadTemplate = document.getElementById('btn-load-template');
        if (btnLoadTemplate) btnLoadTemplate.addEventListener('click', loadJatimTemplate);
    }
    
    if (document.getElementById('btn-print-all-idcards')) {
        document.getElementById('btn-print-all-idcards').addEventListener('click', printAllIDCards);
    }
    
    if (document.getElementById('btn-add-participant')) {
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
    }

    if (document.getElementById('setting-logo')) {
        document.getElementById('setting-logo').addEventListener('change', (e) => handleImageUpload(e, 'logo'));
        document.getElementById('setting-organizer-logo').addEventListener('change', (e) => handleImageUpload(e, 'organizerLogo'));
    }

    if (document.getElementById('upload-excel')) {
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
}

function renderParticipants() {
    const tbody = document.getElementById('participants-tbody');
    if (!tbody) return;
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
                <button onclick="printIDCard(${i})" class="btn-primary btn-sm" style="padding: 4px 8px;" title="Cetak ID Card"><i class="fa-solid fa-id-card"></i></button>
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
    const listContainer = document.getElementById('surah-dropdown-list');
    const searchInput = document.getElementById('manual-surah-search');
    const hiddenInput = document.getElementById('manual-surah');
    if (!listContainer || typeof QURAN_OFFLINE === 'undefined') return;

    function renderList(filter = '') {
        listContainer.innerHTML = '';
        const cleanFilter = filter.toLowerCase().replace(/surah\s*|surat\s*/g, '').trim();
        const filtered = QURAN_OFFLINE.filter(s => {
            const searchStr = (s.transliteration || s.name).toLowerCase();
            return searchStr.includes(cleanFilter) || s.id.toString().includes(cleanFilter);
        });
        filtered.forEach(s => {
            const div = document.createElement('div');
            div.className = 'dropdown-item';
            div.textContent = `${s.id}. ${s.transliteration || s.name}`;
            div.onclick = () => {
                searchInput.value = div.textContent;
                hiddenInput.value = s.id;
                listContainer.classList.add('hidden');
            };
            listContainer.appendChild(div);
        });
    }

    renderList();

    searchInput.addEventListener('focus', () => {
        listContainer.classList.remove('hidden');
        renderList(searchInput.value);
    });

    searchInput.addEventListener('input', (e) => {
        listContainer.classList.remove('hidden');
        renderList(e.target.value);
        hiddenInput.value = '';
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#surah-search-container')) {
            listContainer.classList.add('hidden');
        }
    });
}

function fetchJuzList() {
    const listContainer = document.getElementById('juz-dropdown-list');
    const searchInput = document.getElementById('manual-juz-search');
    const hiddenInput = document.getElementById('manual-juz');
    
    // If it is a standard select instead of custom dropdown
    if (hiddenInput && hiddenInput.tagName === 'SELECT') {
        if (hiddenInput.children.length <= 1) {
            for (let i = 1; i <= 30; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = 'Juz ' + i;
                hiddenInput.appendChild(opt);
            }
        }
        return;
    }
    
    if (!listContainer) return;

    function renderList(filter = '') {
        listContainer.innerHTML = '';
        const juzNumbers = Array.from({length: 30}, (_, i) => i + 1);
        const filtered = juzNumbers.filter(j => j.toString().includes(filter));
        
        filtered.forEach(j => {
            const div = document.createElement('div');
            div.className = 'dropdown-item';
            div.textContent = `Juz ${j}`;
            div.onclick = () => {
                searchInput.value = div.textContent;
                hiddenInput.value = j;
                listContainer.classList.add('hidden');
            };
            listContainer.appendChild(div);
        });
    }

    renderList();

    searchInput.addEventListener('focus', () => {
        listContainer.classList.remove('hidden');
        renderList(searchInput.value.replace('Juz ', ''));
    });

    searchInput.addEventListener('input', (e) => {
        listContainer.classList.remove('hidden');
        renderList(e.target.value.replace('Juz ', ''));
        hiddenInput.value = '';
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#manual-juz-container')) {
            listContainer.classList.add('hidden');
        }
    });
}

function initMaqraListeners() {
    if (document.getElementById('btn-acak-maqra')) {
        document.getElementById('btn-acak-maqra').addEventListener('click', async () => {
            const cabang = document.getElementById('maqra-cabang').value;
            const mode = document.getElementById('maqra-random-mode').value;
            
            if (mode === 'package') {
                showPackageSelection(cabang);
                return;
            }

            const juzList = getMaqraJuzList();
            const flat = buildJuzFlat(juzList);
            if (flat.length === 0) return alert('Pool ayat kosong untuk cabang ini.');

            const pkgBar = document.getElementById('pkg-buttons-bar');
            pkgBar.classList.add('hidden');
            pkgBar.innerHTML = '';

            const idx = Math.floor(Math.random() * flat.length);
            state.currentMaqra.flatVerses = flat;
            state.currentMaqra.displayStart = idx;
            updateMaqraSideInfo('Bebas');
            renderFlat();
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
            let s = document.getElementById('manual-surah').value;
            const surahSearchText = document.getElementById('manual-surah-search').value.toLowerCase();
            let a = document.getElementById('manual-ayah').value;
            const juz = document.getElementById('manual-juz').value;
            
            // Auto-resolve surah if user typed but didn't click dropdown
            if (!s && surahSearchText && typeof QURAN_OFFLINE !== 'undefined') {
                const cleanFilter = surahSearchText.replace(/surah\s*|surat\s*/g, '').trim();
                const match = QURAN_OFFLINE.find(sur => 
                    (sur.transliteration || sur.name).toLowerCase().includes(cleanFilter) || 
                    sur.id.toString() === cleanFilter
                );
                if (match) s = match.id;
            }

            // Logic 1: If Surah is valid, load it
            if (s) {
                loadMaqra(s, parseInt(a || 1));
            } 
            // Logic 2: If no Surah but Juz is valid, load whole Juz from beginning
            else if (juz && JUZ_RANGES[juz]) {
                const flat = buildJuzFlat([parseInt(juz)]);
                if (flat.length === 0) return alert('Data juz tidak tersedia.');
                state.currentMaqra.flatVerses = flat;
                state.currentMaqra.displayStart = 0;
                updateMaqraSideInfo('Bebas');
                renderFlat();
            } else {
                alert('Silakan pilih Surah atau Juz terlebih dahulu.');
            }
        });

        document.getElementById('maqra-cabang').addEventListener('change', (e) => {
            const branchName = e.target.value;
            const selectEl = e.target;
            const selectedOpt = selectEl.options[selectEl.selectedIndex];
            const jenis = selectedOpt ? selectedOpt.getAttribute('data-jenis') : '';
            const modeSelect = document.getElementById('maqra-random-mode');
            
            // Toggle Qiraat vs Standard Layout
            const qiraatLayout = document.getElementById('qiraat-layout');
            const standardLayout = document.getElementById('mushaf-main-container');
            if (branchName.toLowerCase().includes('qiraat')) {
                if (qiraatLayout) qiraatLayout.classList.remove('hidden');
                if (standardLayout) standardLayout.classList.add('hidden');
                renderQiraatImams(); // Make sure to render if we switch to it
            } else {
                if (qiraatLayout) qiraatLayout.classList.add('hidden');
                if (standardLayout) standardLayout.classList.remove('hidden');
            }

            if (state.competitionStructure[branchName] && state.competitionStructure[branchName].time) {
                state.settings.timerDuration = state.competitionStructure[branchName].time;
                if (document.getElementById('setting-timer-duration')) document.getElementById('setting-timer-duration').value = state.settings.timerDuration;
            }

            if (jenis === 'Maqra') {
                modeSelect.value = 'auto';
                for (let i = 0; i < modeSelect.options.length; i++) {
                    if (modeSelect.options[i].value === 'package') modeSelect.options[i].disabled = true;
                }
                document.getElementById('pkg-buttons-bar').classList.add('hidden');
                document.getElementById('pkg-buttons-bar').innerHTML = '';
            } else {
                for (let i = 0; i < modeSelect.options.length; i++) modeSelect.options[i].disabled = false;
            }

            const mode = modeSelect.value;
            if (mode === 'package') showPackageSelection(e.target.value);
        });

        document.getElementById('btn-prev-ruku').addEventListener('click', () => navigateChunk(-1));
        document.getElementById('btn-next-ruku').addEventListener('click', () => navigateChunk(1));
        
        const btnToggleStandard = document.getElementById('btn-toggle-standard');
        if (btnToggleStandard) {
            btnToggleStandard.addEventListener('click', () => {
                state.settings.mushafType = state.settings.mushafType === 'madinah' ? 'kemenag' : 'madinah';
                localStorage.setItem('mtq_settings', JSON.stringify(state.settings));
                applySettingsToUI();
                if (state.currentMaqra && state.currentMaqra.flatVerses && state.currentMaqra.flatVerses.length) {
                    renderFlat();
                }
            });
        }

        const maqraParticipantSelect = document.getElementById('maqra-participant-select');
        if (maqraParticipantSelect) {
            maqraParticipantSelect.addEventListener('change', () => {
                const pName = maqraParticipantSelect.value || 'Bebas';
                const participant = state.participants.find(p => p.nama === pName);
                
                document.getElementById('side-p-name').textContent = pName;
                document.getElementById('side-p-cabang').textContent = participant ? `${participant.cabang} - ${participant.babak || ''}` : '-';
                
                const pubPName = document.getElementById('public-participant-name');
                if (pubPName) pubPName.textContent = pName;
            });
        }
    }
}

async function fetchKemenagVerses(surahNum) {
    const cacheKey = `kemenag_${surahNum}`;
    if (state.cache.surahs && state.cache.surahs[cacheKey]) {
        return state.cache.surahs[cacheKey];
    }
    
    // Try Kemenag API first
    try {
        const response = await fetch(`https://quran-api.lpmqkemenag.id/api-alquran/ayat/local/${surahNum}`, {
            headers: {
                'user': 'gayungan',
                'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IjQyNDg4NjcxOGI5NDQ2MDBmZjU2MTY0OTRjM2NhZWVhIiwiaWF0IjoxNzg1NjMwOTY5fQ.qZhqKY2h5u4qdnVjH5iIQYjAL5V1VLVW2wd5s0v9v0o'
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.code !== 200 || !data.data) throw new Error('API error');
        
        if (!state.cache.surahs) state.cache.surahs = {};
        state.cache.surahs[cacheKey] = data.data;
        localStorage.setItem('mtq_quran_cache', JSON.stringify(state.cache));
        return data.data;
    } catch (e) {
        console.error('Failed to fetch Kemenag verses from API, trying fallback:', e);
        
        // Fallback to offline data if API fails or offline
        if (typeof getKemenagFallback !== 'undefined') {
            const fallbackData = getKemenagFallback(surahNum);
            if (fallbackData) {
                if (!state.cache.surahs) state.cache.surahs = {};
                state.cache.surahs[cacheKey] = fallbackData;
                return fallbackData;
            }
        }
        return null;
    }
}

async function loadMaqra(surahNum, startAyah) {
    const loading = document.getElementById('mushaf-loading');
    const content = document.getElementById('mushaf-content');
    if (!loading || !content) return;
    loading.classList.remove('hidden');
    content.classList.add('hidden');

    try {
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

        const flat = buildSurahRangeFlat(surah.id, 114);
        state.currentMaqra.flatVerses = flat;
        state.currentMaqra.displayStart = Math.max(0, (parseInt(startAyah) || 1) - 1);

        updateMaqraSideInfo('Bebas');
        renderFlat();

        const pubMaqraSurah = document.getElementById('public-maqra-surah');
        if (pubMaqraSurah) pubMaqraSurah.textContent = `${surah.transliteration}: ${startAyah}`;

    } catch (e) {
        console.error(e);
        alert('Gagal memuat mushaf.');
    } finally {
        loading.classList.add('hidden');
        content.classList.remove('hidden');
    }
}

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
    const excludedSurahs = [1, 36, 55, 56, 67];
    const isShortSurah = s => s >= 93 && s <= 114;

    let juzList = forcedJuzList;
    if (!juzList) {
        const selectEl = document.getElementById('maqra-cabang');
        const selectedOpt = selectEl.options[selectEl.selectedIndex];
        const juzIndex = selectedOpt ? selectedOpt.getAttribute('data-index') : null;
        if (!juzIndex) return pool;
        juzList = [];
        if (juzIndex.includes('-')) {
            const [start, end] = juzIndex.split('-').map(Number);
            for (let j = start; j <= end; j++) juzList.push(j);
        } else {
            juzList.push(parseInt(juzIndex));
        }
    }

    juzList.forEach(juz => {
        const ranges = JUZ_RANGES[juz];
        if (!ranges) return;
        ranges.forEach(r => {
            if (excludedSurahs.includes(r.s)) return;
            if (isShortSurah(r.s)) return;
            for (let a = r.a1; a <= r.a2; a++) pool.push({ surah: r.s, ayat: a });
        });
    });
    return pool;
}

function getMaqraJuzList() {
    const selectEl = document.getElementById('maqra-cabang');
    const selectedOpt = selectEl.options[selectEl.selectedIndex];
    const juzIndex = selectedOpt ? selectedOpt.getAttribute('data-index') : null;
    const juzList = [];
    if (!juzIndex) return juzList;
    if (juzIndex.includes('-')) {
        const [start, end] = juzIndex.split('-').map(Number);
        for (let j = start; j <= end; j++) juzList.push(j);
    } else {
        juzList.push(parseInt(juzIndex));
    }
    return juzList;
}

function buildSurahRangeFlat(fromId, toId) {
    const flat = [];
    QURAN_OFFLINE.forEach(surah => {
        if (surah.id < fromId || surah.id > toId) return;
        const rukuList = RUKU_DATA[surah.id] || [];
        let rukuNo = 0;
        surah.verses.forEach(v => {
            if (rukuList.includes(v.id)) rukuNo++;
            flat.push({
                surah: surah.id,
                ayat: v.id,
                text: v.text,
                surahName: surah.transliteration,
                surahShort: surah.name,
                rukuNo: rukuNo,
                isRukuStart: rukuList.includes(v.id)
            });
        });
    });
    return flat;
}

function buildSurahFlat(surah) {
    const rukuList = RUKU_DATA[surah.id] || [];
    const flat = [];
    let rukuNo = 0;
    surah.verses.forEach(v => {
        if (rukuList.includes(v.id)) rukuNo++;
        flat.push({
            surah: surah.id,
            ayat: v.id,
            text: v.text,
            surahName: surah.transliteration,
            surahShort: surah.name,
            rukuNo: rukuNo,
            isRukuStart: rukuList.includes(v.id)
        });
    });
    return flat;
}

function buildJuzFlat(juzList) {
    const flat = [];
    juzList.forEach(juz => {
        const ranges = JUZ_RANGES[juz];
        if (!ranges) return;
        ranges.forEach(r => {
            const surah = QURAN_OFFLINE.find(s => s.id === r.s);
            if (!surah) return;
            const rukuList = RUKU_DATA[r.s] || [];
            let rukuNo = 0;
            for (let a = r.a1; a <= r.a2; a++) {
                if (rukuList.includes(a)) rukuNo++;
                const verse = surah.verses.find(v => v.id === a);
                if (!verse) continue;
                flat.push({
                    surah: r.s,
                    ayat: a,
                    text: verse.text,
                    surahName: surah.transliteration,
                    surahShort: surah.name,
                    rukuNo: rukuNo,
                    isRukuStart: rukuList.includes(a)
                });
            }
        });
    });
    return flat;
}

function updateMaqraSideInfo(pName) {
    pName = pName || 'Bebas';
    document.getElementById('side-p-name').textContent = pName;
    const participant = state.participants.find(p => p.nama === pName);
    document.getElementById('side-p-cabang').textContent = participant ? `${participant.cabang} - ${participant.babak || ''}` : '-';
    const pubPName = document.getElementById('public-participant-name');
    if (pubPName) pubPName.textContent = pName;
}

async function renderFlat() {
    const { flatVerses, displayStart, chunkSize } = state.currentMaqra;
    if (!flatVerses || flatVerses.length === 0) return;

    const startIdx = Math.max(0, displayStart);
    const endIdx = Math.min(flatVerses.length, startIdx + chunkSize);
    const chunk = flatVerses.slice(startIdx, endIdx);
    if (chunk.length === 0) return;

    const first = chunk[0];
    const last = chunk[chunk.length - 1];
    const titleEl = document.getElementById('mushaf-surah-title');
    const infoEl = document.getElementById('mushaf-ruku-info');

    titleEl.textContent = (first.surah === last.surah)
        ? `${first.surahName} (${first.surahShort})`
        : `${first.surahName} – ${last.surahName}`;

    infoEl.textContent = `Ayat ${first.surah}:${toArabicDigits(first.ayat)} s.d. ${last.surah}:${toArabicDigits(last.ayat)}`;

    // Fetch Kemenag verses if mushafType is kemenag
    let kemenagDataMap = {};
    if (state.settings.mushafType === 'kemenag') {
        const uniqueSurahs = [...new Set(chunk.map(item => item.surah))];
        for (const surahId of uniqueSurahs) {
            const verses = await fetchKemenagVerses(surahId);
            if (verses) {
                kemenagDataMap[surahId] = verses;
            }
        }
    }

    let html = `<div class="quran-text-block" lang="ar" dir="rtl">`;
    let currentSurah = null;
    chunk.forEach(item => {
        if (item.surah !== currentSurah) {
            currentSurah = item.surah;
            html += `<div class="surah-header">${item.surahName} (${item.surahShort})</div>`;
        }

        let textToRender = item.text;
        if (state.settings.mushafType === 'kemenag' && kemenagDataMap[item.surah]) {
            const kVerse = kemenagDataMap[item.surah].find(kv => kv.ayat === item.ayat);
            if (kVerse && kVerse.teks_msi_usmani) {
                textToRender = kVerse.teks_msi_usmani;
            }
        }

        const rukuSign = item.isRukuStart
            ? `<span class="ruku-mark" title="Awal Ruku' ${item.rukuNo}">ع${toArabicDigits(item.rukuNo)}</span>`
            : '';
        html += `<span class="quran-text">${textToRender}</span> <span class="ayah-end-symbol">۝${toArabicDigits(item.ayat)}</span>${rukuSign} `;
    });
    html += `</div>`;

    document.getElementById('mushaf-content').innerHTML = html;
    updateZoom();
}

function showPackageSelection(cabang) {
    const pkgBar = document.getElementById('pkg-buttons-bar');
    const selectEl = document.getElementById('maqra-cabang');
    const selectedOpt = selectEl.options[selectEl.selectedIndex];
    const juzIndexStr = selectedOpt?.getAttribute('data-index') || "";
    
    document.getElementById('mushaf-surah-title').textContent = "PILIH PAKET SOAL";
    const numBoxes = (state.settings.hfqMut || 0) + (state.settings.hfqReg || 0);
    if (numBoxes === 0) return alert('Jumlah paket tidak boleh 0.');
    
    let candidates = [];

    // Split the Juz range into chunks for even distribution
    let juzList = [];
    if (juzIndexStr.includes('-')) {
        const [start, end] = juzIndexStr.split('-').map(Number);
        for (let j = start; j <= end; j++) juzList.push(j);
    } else if (juzIndexStr) {
        juzList.push(parseInt(juzIndexStr));
    }

    state.currentMaqra.flatVerses = buildJuzFlat(juzList);
    state.currentMaqra.displayStart = 0;

    if (juzList.length > 0) {
        // Distribute Juz across boxes
        const chunkSize = Math.max(1, Math.floor(juzList.length / numBoxes));
        for (let i = 0; i < numBoxes; i++) {
            const startIdx = i * chunkSize;
            let endIdx = (i === numBoxes - 1) ? juzList.length : (startIdx + chunkSize);
            
            // Adjust if juzList is shorter than numBoxes
            if (startIdx >= juzList.length) {
                // Fallback: pick from whole list if we ran out of juz
                const fullPool = generateMaqraPool(cabang);
                const shuffled = [...fullPool].sort(() => Math.random() - 0.5);
                candidates.push(shuffled[0]);
                continue;
            }

            const chunkJuzSubList = juzList.slice(startIdx, endIdx);
            const chunkPool = generateMaqraPool(cabang, chunkJuzSubList);
            
            if (chunkPool.length > 0) {
                const shuffledChunk = [...chunkPool].sort(() => Math.random() - 0.5);
                // Try to match difficulty if needed
                const isSulit = i < state.settings.hfqMut;
                const found = shuffledChunk.find(item => getAyahDifficulty(item.surah, item.ayat) === (isSulit ? 'SULIT' : 'REGULER'));
                candidates.push(found || shuffledChunk[0]);
            } else {
                // Fallback to full pool if chunk is empty (e.g. all surahs excluded)
                const fullPool = generateMaqraPool(cabang);
                candidates.push(fullPool[Math.floor(Math.random() * fullPool.length)]);
            }
        }
    } else {
        // Fallback for non-indexed branches
        const pool = generateMaqraPool(cabang);
        if (pool.length < numBoxes) return alert('Pool ayat tidak cukup.');
        const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
        candidates = shuffledPool.slice(0, numBoxes);
    }
    candidates.sort(() => Math.random() - 0.5);
    state._packageCandidates = candidates;
    
    let btnsHtml = '';
    candidates.forEach((item, index) => {
        btnsHtml += `<button class="btn-sm pkg-btn" id="pkg-btn-${index}" onclick="loadPacketMaqra(${index}, ${item.surah}, ${item.ayat})"><i class="fa-solid fa-envelope"></i> ${index + 1}</button>`;
    });
    pkgBar.innerHTML = btnsHtml;
    pkgBar.classList.remove('hidden');
}

function loadPacketMaqra(index, surahNum, startAyah) {
    document.querySelectorAll('.pkg-btn').forEach(btn => btn.classList.remove('pkg-btn-active'));
    const btn = document.getElementById(`pkg-btn-${index}`);
    if (btn) btn.classList.add('pkg-btn-active', 'pkg-btn-opened');

    const flat = state.currentMaqra.flatVerses || [];
    const idx = flat.findIndex(v => v.surah === surahNum && v.ayat === startAyah);
    state.currentMaqra.displayStart = idx >= 0 ? idx : 0;
    updateMaqraSideInfo('Bebas');
    renderFlat();
}

function navigateChunk(dir) {
    const { chunkSize, flatVerses, displayStart } = state.currentMaqra;
    const max = Math.max(0, flatVerses.length - 1);
    let next = displayStart + dir * chunkSize;
    next = Math.max(0, Math.min(next, max));
    state.currentMaqra.displayStart = next;
    renderFlat();
}


function initMushafTools() {
    const btnZoomIn = document.getElementById('btn-zoom-in');
    if (btnZoomIn) btnZoomIn.addEventListener('click', () => { state.currentMaqra.zoom += 4; updateZoom(); });
    
    const btnZoomOut = document.getElementById('btn-zoom-out');
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => { state.currentMaqra.zoom = Math.max(16, state.currentMaqra.zoom - 4); updateZoom(); });
    
    const btnToggleNight = document.getElementById('btn-toggle-night');
    if (btnToggleNight) btnToggleNight.addEventListener('click', () => { state.currentMaqra.isNightMode = !state.currentMaqra.isNightMode; state.currentMaqra.isMushafMode = false; updateMushafTheme(); });
    
    const btnToggleMushaf = document.getElementById('btn-toggle-mushaf');
    if (btnToggleMushaf) btnToggleMushaf.addEventListener('click', () => { state.currentMaqra.isMushafMode = !state.currentMaqra.isMushafMode; state.currentMaqra.isNightMode = false; updateMushafTheme(); });
}

function updateZoom() {
    const z = state.currentMaqra.zoom;
    document.querySelectorAll('.quran-text').forEach(el => el.style.fontSize = z + 'px');
    document.querySelectorAll('.ayah-end-symbol, .ruku-mark').forEach(el => el.style.fontSize = Math.round(z * 0.8) + 'px');
}
function updateMushafTheme() {
    const container = document.getElementById('mushaf-main-container');
    container.classList.remove('night-mode', 'mushaf-mode');
    if (state.currentMaqra.isNightMode) container.classList.add('night-mode');
    else if (state.currentMaqra.isMushafMode) container.classList.add('mushaf-mode');
}

function initTimerListeners() {
    const btnStart = document.getElementById('btn-timer-start');
    if (btnStart) btnStart.addEventListener('click', startTimerFlow);
    const btnStartMulti = document.getElementById('btn-timer-start-multi');
    if (btnStartMulti) btnStartMulti.addEventListener('click', startTimerFlow);
    
    const btnStop = document.getElementById('btn-timer-stop');
    if (btnStop) btnStop.addEventListener('click', stopTimer);
    const btnStopMulti = document.getElementById('btn-timer-stop-multi');
    if (btnStopMulti) btnStopMulti.addEventListener('click', stopTimer);
    
    const btnReset = document.getElementById('btn-timer-reset');
    if (btnReset) btnReset.addEventListener('click', resetTimer);
    const btnResetMulti = document.getElementById('btn-timer-reset-multi');
    if (btnResetMulti) btnResetMulti.addEventListener('click', resetTimer);

    // Mini Timer Settings Listeners
    const miniPrep = document.getElementById('mini-timer-prep');
    const miniDuration = document.getElementById('mini-timer-duration');
    const miniYellow = document.getElementById('mini-timer-yellow');

    function saveSettingsQuietly() {
        const mainPrep = document.getElementById('setting-timer-prep');
        const mainDuration = document.getElementById('setting-timer-duration');
        const mainYellow = document.getElementById('setting-timer-yellow2');
        if (mainPrep) mainPrep.value = state.settings.timerPrep;
        if (mainDuration) mainDuration.value = state.settings.timerDuration;
        if (mainYellow) mainYellow.value = state.settings.timerYellow2;
        localStorage.setItem('mtq_settings', JSON.stringify(state.settings));
    }

    if (miniPrep) {
        miniPrep.addEventListener('change', (e) => {
            state.settings.timerPrep = parseInt(e.target.value) || 0;
            saveSettingsQuietly();
        });
    }
    if (miniDuration) {
        miniDuration.addEventListener('change', (e) => {
            state.settings.timerDuration = parseInt(e.target.value) || 10;
            saveSettingsQuietly();
        });
    }
    if (miniYellow) {
        miniYellow.addEventListener('change', (e) => {
            state.settings.timerYellow2 = parseInt(e.target.value) || 1;
            saveSettingsQuietly();
        });
    }
}

function startTimerFlow() {
    if (state.timer.mode !== 'idle') return;    
    state.timer.mode = 'prep'; state.timer.secondsElapsed = 0; state.timer.totalSeconds = state.settings.timerPrep;
    
    if (state.timer.totalSeconds === 0) {
        state.timer.mode = 'reading';
        state.timer.totalSeconds = (state.settings.timerDuration || 10) * 60;
    }

    playTimerSound('start');
    updateTimerUI();
    state.timer.interval = setInterval(() => {
        state.timer.secondsElapsed++;
        if (state.timer.mode === 'prep' && state.timer.secondsElapsed >= state.settings.timerPrep) {
            state.timer.mode = 'reading'; state.timer.secondsElapsed = 0; state.timer.totalSeconds = (state.settings.timerDuration || 10) * 60;
            playTimerSound('start');
        } else if (state.timer.mode === 'reading' && state.timer.secondsElapsed >= state.timer.totalSeconds) {
            state.timer.mode = 'stop'; clearInterval(state.timer.interval);
            playTimerSound('stop'); // Beep for stop
        }
        
        // Warning sound at specified yellow time
        if (state.timer.mode === 'reading') {
            const timeRemaining = state.timer.totalSeconds - state.timer.secondsElapsed;
            const warningSeconds = (state.settings.timerYellow2 || 1) * 60;
            if (timeRemaining === warningSeconds) {
                playTimerSound('warning'); // Beep for warning
            }
        }
        updateTimerUI();
    }, 1000);
}

function updateTimerUI() {
    const display = document.getElementById('side-time-display');
    const status = document.getElementById('side-timer-status');
    const lamp = document.getElementById('side-lamp');
    const pubTimer = document.getElementById('public-time-display');
    const pubLamp = document.getElementById('public-timer-lamp');
    
    // Multi lamp elements
    const multiDisplay = document.getElementById('multi-time-display');
    const pubMultiDisplay = document.getElementById('public-multi-time-display');
    
    const lampPrep = document.getElementById('lamp-multi-prep');
    const lampReading = document.getElementById('lamp-multi-reading');
    const lampWarning = document.getElementById('lamp-multi-warning');
    const lampStop = document.getElementById('lamp-multi-stop');
    
    const pubLampPrep = document.getElementById('public-lamp-multi-prep');
    const pubLampReading = document.getElementById('public-lamp-multi-reading');
    const pubLampWarning = document.getElementById('public-lamp-multi-warning');
    const pubLampStop = document.getElementById('public-lamp-multi-stop');

    if (!display) return;
    let timeRemaining = state.timer.totalSeconds - state.timer.secondsElapsed;
    const m = Math.floor(Math.abs(timeRemaining) / 60); const s = Math.abs(timeRemaining) % 60;
    const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    
    display.textContent = timeStr;
    if (pubTimer) pubTimer.textContent = timeStr;
    if (multiDisplay) multiDisplay.textContent = timeStr;
    if (pubMultiDisplay) pubMultiDisplay.textContent = timeStr;
    
    if (lamp) lamp.className = 'lamp-indicator';
    if (pubLamp) pubLamp.className = 'lamp-indicator-large';
    
    // Clear active classes from multi-lamp displays
    const multiLamps = [lampPrep, lampReading, lampWarning, lampStop, pubLampPrep, pubLampReading, pubLampWarning, pubLampStop];
    multiLamps.forEach(el => {
        if (el) {
            el.className = el.classList.contains('lamp-circle-large') ? 'lamp-circle-large' : 'lamp-circle';
        }
    });

    let statusText = '';
    if (state.timer.mode === 'prep') {
        statusText = 'PERSIAPAN';
        if (lamp) lamp.classList.add('lamp-prep');
        if (pubLamp) pubLamp.classList.add('lamp-prep');
        
        if (lampPrep) lampPrep.classList.add('lamp-prep-active');
        if (pubLampPrep) pubLampPrep.classList.add('lamp-prep-active');
    } else if (state.timer.mode === 'reading') {
        statusText = 'BACA';
        const warningSeconds = (state.settings.timerYellow2 || 1) * 60;
        if (timeRemaining <= warningSeconds) {
            if (lamp) lamp.classList.add('lamp-warning');
            if (pubLamp) pubLamp.classList.add('lamp-warning');
            
            if (lampWarning) lampWarning.classList.add('lamp-warning-active');
            if (pubLampWarning) pubLampWarning.classList.add('lamp-warning-active');
        } else {
            if (lamp) lamp.classList.add('lamp-reading');
            if (pubLamp) pubLamp.classList.add('lamp-reading');
            
            if (lampReading) lampReading.classList.add('lamp-reading-active');
            if (pubLampReading) pubLampReading.classList.add('lamp-reading-active');
        }
    } else if (state.timer.mode === 'stop') {
        statusText = 'SELESAI';
        if (lamp) lamp.classList.add('lamp-stop');
        if (pubLamp) pubLamp.classList.add('lamp-stop');
        
        if (lampStop) lampStop.classList.add('lamp-stop-active');
        if (pubLampStop) pubLampStop.classList.add('lamp-stop-active');
    } else { 
        statusText = 'SIAP'; 
    }
    if (status) status.textContent = statusText;
}

function playTimerSound(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'start') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start(); osc.stop(ctx.currentTime + 0.5);
        } else if (type === 'warning') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start(); osc.stop(ctx.currentTime + 0.4);
        } else if (type === 'stop') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
            osc.start(); osc.stop(ctx.currentTime + 1.2);
        }
    } catch (e) { console.error("Audio error", e); }
}


function stopTimer() { clearInterval(state.timer.interval); state.timer.mode = 'stop'; updateTimerUI(); }
function resetTimer() { clearInterval(state.timer.interval); state.timer.mode = 'idle'; state.timer.secondsElapsed = 0; updateTimerUI(); }

function initScoringListeners() {
    if (document.getElementById('btn-save-score')) {
        document.getElementById('btn-save-score').addEventListener('click', saveScore);
        const scoreBranchSelect = document.getElementById('score-branch-select');
        if (scoreBranchSelect) scoreBranchSelect.addEventListener('change', () => applySettingsToUI());
    }
    const btnPrintBeritaAcara = document.getElementById('btn-print-berita-acara');
    if (btnPrintBeritaAcara) btnPrintBeritaAcara.addEventListener('click', printBeritaAcara);
    
    const btnPrintRekap = document.getElementById('btn-print-rekap');
    if (btnPrintRekap) btnPrintRekap.addEventListener('click', printRekap);
}

function updateJudgeInputsForBranch() {
    const container = document.getElementById('dynamic-judges-container');
    if (!container) return;
    container.innerHTML = '<h4>Penilaian Hakim</h4>';
    for (let i = 0; i < state.settings.judgeCount; i++) {
        container.innerHTML += `<div class="form-group"><label>Hakim ${i + 1}</label><input type="number" class="judge-score-input" data-judge="${i}" max="100" placeholder="0-100"></div>`;
    }
}

function loadJatimTemplate() {
    if (typeof MTQ_JATIM_2025 === 'undefined') {
        return alert('Template MTQ Jatim 2025 tidak ditemukan!');
    }
    
    state.settings.eventName = MTQ_JATIM_2025.name;
    state.settings.location = "Jawa Timur";
    
    const branches = [];
    const structure = {};
    
    MTQ_JATIM_2025.cabang.forEach(c => {
        c.golongan.forEach(g => {
            const name = `${c.name} - ${g.name}`;
            branches.push(name);
            structure[name] = {
                fields: g.fields,
                time: g.time
            };
        });
    });
    
    state.branches = branches;
    state.competitionStructure = structure;
    
    localStorage.setItem('mtq_settings', JSON.stringify(state.settings));
    localStorage.setItem('mtq_branches', JSON.stringify(state.branches));
    localStorage.setItem('mtq_structure', JSON.stringify(state.competitionStructure));
    
    applySettingsToUI();
    renderBranches();
    renderScores();
    alert('Template MTQ Jatim 2025 Berhasil Dimuat!');
}

function initJudgeListeners() {
    const btnSaveJudges = document.getElementById('btn-save-judges');
    if (btnSaveJudges) {
        btnSaveJudges.addEventListener('click', () => {
            const branch = document.getElementById('judge-branch-select').value;
            const input = document.getElementById('judge-names-input').value;
            if (!branch) return alert('Silakan pilih cabang terlebih dahulu!');
            
            const names = input.split(',').map(n => n.trim()).filter(n => n !== '');
            if (names.length === 0) {
                delete state.judges[branch];
            } else {
                state.judges[branch] = names;
            }
            localStorage.setItem('mtq_judges', JSON.stringify(state.judges));
            renderJudges();
            applySettingsToUI();
            alert('Daftar hakim berhasil diperbarui!');
        });
    }

    const judgeBranchSelect = document.getElementById('judge-branch-select');
    if (judgeBranchSelect) {
        judgeBranchSelect.addEventListener('change', () => {
            const branch = judgeBranchSelect.value;
            const names = state.judges[branch] || [];
            document.getElementById('judge-names-input').value = names.join(', ');
        });
    }
}

function renderJudges() {
    const tbody = document.getElementById('judges-tbody');
    if (!tbody) return;
    const branchesWithJudges = Object.keys(state.judges);
    if (branchesWithJudges.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Belum ada daftar hakim</td></tr>';
        return;
    }
    tbody.innerHTML = branchesWithJudges.map(branch => {
        const list = state.judges[branch] || [];
        return `
            <tr>
                <td style="font-weight: 600;">${branch}</td>
                <td>${list.join(', ') || '-'}</td>
                <td>
                    <button onclick="clearJudgesForBranch('${branch}')" class="btn-danger btn-sm" style="padding: 4px 8px;"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function clearJudgesForBranch(branch) {
    if (confirm(`Hapus daftar hakim untuk cabang "${branch}"?`)) {
        delete state.judges[branch];
        localStorage.setItem('mtq_judges', JSON.stringify(state.judges));
        renderJudges();
        applySettingsToUI();
    }
}
window.clearJudgesForBranch = clearJudgesForBranch;

function initBranchRoundListeners() {
    const btnAddBranch = document.getElementById('btn-add-branch');
    if (btnAddBranch) {
        btnAddBranch.addEventListener('click', () => {
            const input = document.getElementById('new-branch-name');
            const name = input.value.trim();
            if (!name) return alert('Nama cabang tidak boleh kosong!');
            if (state.branches.includes(name)) return alert('Cabang sudah ada!');
            state.branches.push(name);
            localStorage.setItem('mtq_branches', JSON.stringify(state.branches));
            input.value = '';
            renderBranches();
            applySettingsToUI();
            alert('Cabang berhasil ditambahkan!');
        });
    }

    const btnAddRound = document.getElementById('btn-add-round');
    if (btnAddRound) {
        btnAddRound.addEventListener('click', () => {
            const input = document.getElementById('new-round-name');
            const name = input.value.trim();
            if (!name) return alert('Nama babak tidak boleh kosong!');
            if (state.rounds.includes(name)) return alert('Babak sudah ada!');
            state.rounds.push(name);
            localStorage.setItem('mtq_rounds', JSON.stringify(state.rounds));
            input.value = '';
            renderRounds();
            applySettingsToUI();
            alert('Babak berhasil ditambahkan!');
        });
    }
}

function renderBranches() {
    const tbody = document.getElementById('branches-tbody');
    if (!tbody) return;
    if (state.branches.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Belum ada cabang</td></tr>';
        return;
    }
    tbody.innerHTML = state.branches.map((b, i) => `
        <tr>
            <td>${i + 1}</td>
            <td style="font-weight: 600;">${b}</td>
            <td>
                <button onclick="deleteBranch(${i})" class="btn-danger btn-sm" style="padding: 4px 8px;"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function deleteBranch(index) {
    if (confirm('Hapus cabang ini?')) {
        const branchName = state.branches[index];
        state.branches.splice(index, 1);
        delete state.competitionStructure[branchName];
        localStorage.setItem('mtq_branches', JSON.stringify(state.branches));
        localStorage.setItem('mtq_structure', JSON.stringify(state.competitionStructure));
        renderBranches();
        applySettingsToUI();
    }
}
window.deleteBranch = deleteBranch;

function renderRounds() {
    const tbody = document.getElementById('rounds-tbody');
    if (!tbody) return;
    if (state.rounds.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Belum ada babak</td></tr>';
        return;
    }
    tbody.innerHTML = state.rounds.map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td style="font-weight: 600;">${r}</td>
            <td>
                <button onclick="deleteRound(${i})" class="btn-danger btn-sm" style="padding: 4px 8px;"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function deleteRound(index) {
    if (confirm('Hapus babak ini?')) {
        state.rounds.splice(index, 1);
        localStorage.setItem('mtq_rounds', JSON.stringify(state.rounds));
        renderRounds();
        applySettingsToUI();
    }
}
window.deleteRound = deleteRound;

function renderScores() {
    const tbody = document.getElementById('rekap-tbody');
    if (!tbody) return;
    
    const branchFilter = document.getElementById('score-branch-select')?.value;
    
    let filtered = [...state.scores];
    if (branchFilter) {
        filtered = filtered.filter(s => s.branchName === branchFilter);
    }
    
    filtered.sort((a, b) => b.finalScore - a.finalScore);
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Belum ada data nilai</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map((s, idx) => {
        const actualIdx = state.scores.findIndex(score => score.participantName === s.participantName && score.branchName === s.branchName && score.babak === s.babak);
        return `
            <tr>
                <td>
                    <span class="badge ${idx === 0 ? 'bg-success' : idx < 3 ? 'bg-danger' : 'btn-secondary'}" style="padding: 4px 8px; border-radius: 4px;">
                        ${idx + 1}
                    </span>
                </td>
                <td style="font-weight: 600;">${s.participantName}</td>
                <td>
                    <span class="badge" style="background: rgba(16,185,129,0.1); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 4px;">${s.branchName}</span>
                    <span class="badge" style="background: rgba(245,158,11,0.1); color: var(--gold); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${s.babak}</span>
                </td>
                <td style="font-weight: 700; color: var(--gold); font-size: 16px;">${s.finalScore}</td>
                <td>
                    <button onclick="printPiagam(${actualIdx}, ${idx + 1})" class="btn-warning btn-sm" style="padding: 4px 8px;" title="Cetak Piagam"><i class="fa-solid fa-certificate"></i></button>
                    <button onclick="deleteScore(${actualIdx})" class="btn-danger btn-sm" style="padding: 4px 8px;" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function deleteScore(idx) {
    if (confirm('Apakah Anda yakin ingin menghapus data nilai ini?')) {
        state.scores.splice(idx, 1);
        localStorage.setItem('mtq_scores', JSON.stringify(state.scores));
        renderScores();
    }
}
window.deleteScore = deleteScore;

function calculateOverallScore(judgeScores, method) {
    if (judgeScores.length === 0) return 0;
    if (method === 'median') {
        const sorted = [...judgeScores].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
        const sum = judgeScores.reduce((a, b) => a + b, 0);
        return sum / judgeScores.length;
    }
}

function saveScore() {
    const branchName = document.getElementById('score-branch-select').value;
    const participantName = document.getElementById('score-participant-select').value;
    
    if (!branchName) return alert('Pilih cabang terlebih dahulu!');
    if (!participantName) return alert('Pilih peserta terlebih dahulu!');
    
    const participant = state.participants.find(p => p.nama === participantName && p.cabang === branchName);
    if (!participant) return alert('Peserta tidak ditemukan di cabang ini!');
    
    const structure = state.competitionStructure[branchName] || {};
    const fields = structure.fields || [];
    
    const judgeScores = [];
    const fieldScores = [];
    
    if (fields.length > 0) {
        for (let i = 0; i < state.settings.judgeCount; i++) {
            let judgeSum = 0;
            for (let fIdx = 0; fIdx < fields.length; fIdx++) {
                const f = fields[fIdx];
                const inputEl = document.querySelector(`.judge-field-input[data-judge="${i}"][data-field="${f.n}"]`);
                if (!inputEl) return alert(`Input untuk Hakim ${i+1} - ${f.n} tidak ditemukan!`);
                const val = parseFloat(inputEl.value);
                if (isNaN(val) || val < 0 || val > f.max) {
                    return alert(`Nilai Hakim ${i+1} untuk ${f.n} harus di antara 0 dan ${f.max}!`);
                }
                judgeSum += val;
                fieldScores.push({ judge: i, fieldName: f.n, score: val });
            }
            judgeScores.push(judgeSum);
        }
    } else {
        const inputs = document.querySelectorAll('.judge-score-input');
        if (inputs.length !== state.settings.judgeCount) {
            return alert('Harap isi semua nilai hakim!');
        }
        for (let i = 0; i < inputs.length; i++) {
            const val = parseFloat(inputs[i].value);
            if (isNaN(val) || val < 0 || val > 100) {
                return alert(`Nilai Hakim ${i+1} harus di antara 0 dan 100!`);
            }
            judgeScores.push(val);
        }
    }
    
    const finalScore = calculateOverallScore(judgeScores, state.settings.scoreMethod);
    
    const scoreRecord = {
        participantName: participantName,
        branchName: branchName,
        babak: participant.babak || 'Penyisihan',
        judgeScores: judgeScores,
        fieldScores: fieldScores,
        finalScore: parseFloat(finalScore.toFixed(2)),
        timestamp: new Date().toISOString()
    };
    
    const existingIdx = state.scores.findIndex(s => s.participantName === participantName && s.branchName === branchName && s.babak === participant.babak);
    if (existingIdx !== -1) {
        state.scores[existingIdx] = scoreRecord;
    } else {
        state.scores.push(scoreRecord);
    }
    
    localStorage.setItem('mtq_scores', JSON.stringify(state.scores));
    
    // Clear inputs
    if (fields.length > 0) {
        document.querySelectorAll('.judge-field-input').forEach(input => input.value = '');
    } else {
        document.querySelectorAll('.judge-score-input').forEach(input => input.value = '');
    }
    
    renderScores();
    alert(`Nilai untuk ${participantName} berhasil disimpan. Skor akhir: ${scoreRecord.finalScore}`);
}

function exportScoresToExcel() {
    if (state.scores.length === 0) {
        return alert('Tidak ada data nilai untuk diexport!');
    }
    
    const sortedScores = [...state.scores].sort((a, b) => b.finalScore - a.finalScore);
    
    const data = sortedScores.map((s, idx) => ({
        'Peringkat': idx + 1,
        'Nama Peserta': s.participantName,
        'Cabang': s.branchName,
        'Babak': s.babak,
        'Skor Akhir': s.finalScore,
        'Nilai Hakim': s.judgeScores.join(', ')
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Nilai');
    
    XLSX.writeFile(workbook, `Rekap_Nilai_${state.settings.eventName.replace(/\s+/g, '_')}.xlsx`);
}

function printRekap() {
    const branchFilter = document.getElementById('score-branch-select')?.value;
    let filtered = [...state.scores];
    if (branchFilter) {
        filtered = filtered.filter(s => s.branchName === branchFilter);
    }
    filtered.sort((a, b) => b.finalScore - a.finalScore);
    
    let printContainer = document.getElementById('print-container');
    if (printContainer) {
        printContainer.remove();
    }
    
    printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    
    const logoLeftHtml = state.settings.logo ? `<img class="kop-logo" src="${state.settings.logo}" alt="Logo Left">` : `<div style="width: 80px;"></div>`;
    const logoRightHtml = state.settings.organizerLogo ? `<img class="kop-logo" src="${state.settings.organizerLogo}" alt="Logo Right">` : `<div style="width: 80px;"></div>`;
    
    const tableRowsHtml = filtered.map((s, idx) => `
        <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td>${s.participantName}</td>
            <td>${s.branchName}</td>
            <td>${s.babak}</td>
            <td style="text-align: center; font-weight: bold;">${s.finalScore}</td>
            <td>${s.judgeScores.join(', ')}</td>
        </tr>
    `).join('');
    
    const locationText = state.settings.location || 'Indonesia';
    const dateText = state.settings.startDate ? new Date(state.settings.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    printContainer.innerHTML = `
        <div class="print-kop">
            ${logoLeftHtml}
            <div class="kop-text">
                <h1>${state.settings.eventName.toUpperCase()}</h1>
                <p>REKAPITULASI PENILAIAN PESERTA</p>
                <p>${locationText}, ${dateText}</p>
            </div>
            ${logoRightHtml}
        </div>
        <h3 style="text-align: center; margin-bottom: 20px;">LAPORAN HASIL PENILAIAN</h3>
        <table class="print-table">
            <thead>
                <tr>
                    <th style="width: 50px; text-align: center;">No</th>
                    <th>Nama Peserta</th>
                    <th>Cabang</th>
                    <th>Babak</th>
                    <th style="width: 100px; text-align: center;">Skor Akhir</th>
                    <th>Rincian Nilai Hakim</th>
                </tr>
            </thead>
            <tbody>
                ${tableRowsHtml || '<tr><td colspan="6" style="text-align: center;">Belum ada data nilai</td></tr>'}
            </tbody>
        </table>
        <div class="print-signature">
            <p>${locationText}, ${dateText}</p>
            <p>Ketua Dewan Hakim</p>
            <div class="signature-space"></div>
            <p>_______________________</p>
        </div>
    `;
    
    document.body.appendChild(printContainer);
    window.print();
}
function toArabicDigits(num) {
    const id = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/\d/g, d => id[d]);
}
function handleImageUpload(e, field) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (f) => { state.settings[field] = f.target.result; applySettingsToUI(); };
        reader.readAsDataURL(file);
    }
}

function printIDCard(index) {
    const p = state.participants[index];
    if (!p) return alert('Data peserta tidak ditemukan!');
    
    let printContainer = document.getElementById('print-container');
    if (printContainer) {
        printContainer.remove();
    }
    
    printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    
    const logoLeftHtml = state.settings.logo ? `<img class="kop-logo" src="${state.settings.logo}" alt="Logo Left" style="max-height: 45px; object-fit: contain;">` : ``;
    const logoRightHtml = state.settings.organizerLogo ? `<img class="kop-logo" src="${state.settings.organizerLogo}" alt="Logo Right" style="max-height: 45px; object-fit: contain;">` : ``;
    
    printContainer.innerHTML = `
        <div class="id-card-wrapper">
            <div class="id-card">
                <div class="id-card-header" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                    ${logoLeftHtml}
                    <div style="flex: 1; text-align: center;">
                        <h2 style="margin: 0; font-size: 11px;">${state.settings.eventName.toUpperCase()}</h2>
                        <p style="margin: 2px 0 0 0; font-size: 9px; font-weight: 700; color: #F59E0B;">KARTU PESERTA</p>
                    </div>
                    ${logoRightHtml}
                </div>
                <div class="id-card-body">
                    <span class="id-card-title">PESERTA</span>
                    <div class="id-card-photo-frame">
                        <span>FOTO 3x4</span>
                    </div>
                    <div class="id-card-name">${p.nama}</div>
                    <div class="id-card-details">
                        <div class="id-card-details-row">
                            <span class="id-card-details-label">Cabang</span>
                            <span class="id-card-details-val">${p.cabang}</span>
                        </div>
                        <div class="id-card-details-row">
                            <span class="id-card-details-label">Babak</span>
                            <span class="id-card-details-val">${p.babak || '-'}</span>
                        </div>
                        <div class="id-card-details-row">
                            <span class="id-card-details-label">No. Urut</span>
                            <span class="id-card-details-val">${index + 1}</span>
                        </div>
                    </div>
                </div>
                <div class="id-card-footer">
                    <span>${state.settings.location || 'Panitia Pelaksana'}</span>
                    <span>${new Date().getFullYear()}</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(printContainer);
    window.print();
    printContainer.remove();
}
window.printIDCard = printIDCard;

function printAllIDCards() {
    if (state.participants.length === 0) {
        return alert('Belum ada data peserta untuk dicetak!');
    }
    
    let printContainer = document.getElementById('print-container');
    if (printContainer) {
        printContainer.remove();
    }
    
    printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    
    const logoLeftHtml = state.settings.logo ? `<img class="kop-logo" src="${state.settings.logo}" alt="Logo Left" style="max-height: 45px; object-fit: contain;">` : ``;
    const logoRightHtml = state.settings.organizerLogo ? `<img class="kop-logo" src="${state.settings.organizerLogo}" alt="Logo Right" style="max-height: 45px; object-fit: contain;">` : ``;
    
    const cardsHtml = state.participants.map((p, index) => `
        <div class="id-card-wrapper">
            <div class="id-card">
                <div class="id-card-header" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                    ${logoLeftHtml}
                    <div style="flex: 1; text-align: center;">
                        <h2 style="margin: 0; font-size: 11px;">${state.settings.eventName.toUpperCase()}</h2>
                        <p style="margin: 2px 0 0 0; font-size: 9px; font-weight: 700; color: #F59E0B;">KARTU PESERTA</p>
                    </div>
                    ${logoRightHtml}
                </div>
                <div class="id-card-body">
                    <span class="id-card-title">PESERTA</span>
                    <div class="id-card-photo-frame">
                        <span>FOTO 3x4</span>
                    </div>
                    <div class="id-card-name">${p.nama}</div>
                    <div class="id-card-details">
                        <div class="id-card-details-row">
                            <span class="id-card-details-label">Cabang</span>
                            <span class="id-card-details-val">${p.cabang}</span>
                        </div>
                        <div class="id-card-details-row">
                            <span class="id-card-details-label">Babak</span>
                            <span class="id-card-details-val">${p.babak || '-'}</span>
                        </div>
                        <div class="id-card-details-row">
                            <span class="id-card-details-label">No. Urut</span>
                            <span class="id-card-details-val">${index + 1}</span>
                        </div>
                    </div>
                </div>
                <div class="id-card-footer">
                    <span>${state.settings.location || 'Panitia Pelaksana'}</span>
                    <span>${new Date().getFullYear()}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    printContainer.innerHTML = `<div class="id-cards-grid">${cardsHtml}</div>`;
    
    document.body.appendChild(printContainer);
    window.print();
    printContainer.remove();
}
window.printAllIDCards = printAllIDCards;

function printPiagam(scoreIdx, rank) {
    const score = state.scores[scoreIdx];
    if (!score) return alert('Data nilai tidak ditemukan!');
    
    let printContainer = document.getElementById('print-container');
    if (printContainer) {
        printContainer.remove();
    }
    
    printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    
    const dateText = state.settings.startDate 
        ? new Date(state.settings.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
        : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
    const getJuaraSuffix = (r) => {
        if (r === 1) return 'PERTAMA (I)';
        if (r === 2) return 'KEDUA (II)';
        if (r === 3) return 'KETIGA (III)';
        return `${r}`;
    };
    
    printContainer.innerHTML = `
        <div class="piagam-container">
            <div class="piagam-border">
                <div class="piagam-ornament orn-tl"></div>
                <div class="piagam-ornament orn-tr"></div>
                <div class="piagam-ornament orn-bl"></div>
                <div class="piagam-ornament orn-br"></div>
                
                <div class="piagam-header">
                    <h1>الشهادة التقديرية</h1>
                    <h2>PIAGAM PENGHARGAAN</h2>
                </div>
                
                <div class="piagam-body">
                    <p class="piagam-text-intro">Diberikan kepada:</p>
                    <div class="piagam-recipient-name">${score.participantName}</div>
                    <p class="piagam-text-award">
                        Sebagai <strong>JUARA ${getJuaraSuffix(rank)}</strong><br>
                        pada cabang perlombaan <strong>${score.branchName} (${score.babak})</strong><br>
                        dalam kegiatan <strong>${state.settings.eventName}</strong>
                    </p>
                    <p class="piagam-text-footer">
                        yang diselenggarakan di ${state.settings.location || 'Indonesia'} pada tahun ${new Date().getFullYear()}.
                    </p>
                </div>
                
                <div class="piagam-footer">
                    <div class="piagam-signature">
                        <p>Mengetahui,</p>
                        <p>Ketua Panitia Pelaksana</p>
                        <div style="height: 60px;"></div>
                        <p><strong>_____________________</strong></p>
                    </div>
                    
                    <div class="piagam-seal">
                        <i class="fa-solid fa-award"></i>
                    </div>
                    
                    <div class="piagam-signature">
                        <p>${state.settings.location || 'Indonesia'}, ${dateText}</p>
                        <p>Ketua Dewan Hakim</p>
                        <div style="height: 60px;"></div>
                        <p><strong>_____________________</strong></p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(printContainer);
    window.print();
    printContainer.remove();
}
window.printPiagam = printPiagam;

function printBeritaAcara() {
    if (state.scores.length === 0) {
        return alert('Belum ada data nilai untuk mencetak berita acara!');
    }
    
    let printContainer = document.getElementById('print-container');
    if (printContainer) {
        printContainer.remove();
    }
    
    printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    
    // Group scores by branch and round
    const groups = {};
    state.scores.forEach(s => {
        const key = `${s.branchName} - ${s.babak}`;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(s);
    });
    
    let tableRowsHtml = '';
    let overallIndex = 1;
    const juaraLabels = ['Juara I', 'Juara II', 'Juara III'];
    
    Object.keys(groups).sort().forEach(key => {
        const sortedGroup = groups[key].sort((a, b) => b.finalScore - a.finalScore);
        sortedGroup.forEach((s, idx) => {
            if (idx >= 3) return; // Only show top 3 as winners
            tableRowsHtml += `
                <tr>
                    <td style="text-align: center;">${overallIndex++}</td>
                    <td>${s.branchName}</td>
                    <td style="text-align: center;">${s.babak}</td>
                    <td style="font-weight: bold; text-align: center; color: #1e293b;">${juaraLabels[idx]}</td>
                    <td style="font-weight: 600;">${s.participantName}</td>
                    <td style="text-align: center; font-weight: bold;">${s.finalScore}</td>
                </tr>
            `;
        });
    });
    
    const dateText = state.settings.startDate 
        ? new Date(state.settings.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
        : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
    const logoLeftHtml = state.settings.logo ? `<img class="kop-logo" src="${state.settings.logo}" alt="Logo Left">` : `<div style="width: 80px;"></div>`;
    const logoRightHtml = state.settings.organizerLogo ? `<img class="kop-logo" src="${state.settings.organizerLogo}" alt="Logo Right">` : `<div style="width: 80px;"></div>`;
    
    printContainer.innerHTML = `
        <div class="berita-acara-container">
            <div class="print-kop">
                ${logoLeftHtml}
                <div class="kop-text">
                    <h1>${state.settings.eventName.toUpperCase()}</h1>
                    <p style="font-size: 14px; font-weight: 700; margin: 5px 0;">BERITA ACARA KEPUTUSAN DEWAN HAKIM</p>
                    <p>${state.settings.location || 'Indonesia'}, ${dateText}</p>
                </div>
                ${logoRightHtml}
            </div>
            
            <div class="berita-acara-title">BERITA ACARA KEPUTUSAN DEWAN HAKIM</div>
            <div class="berita-acara-subtitle">Nomor: DH/${state.settings.eventName.replace(/\s+/g, '_')}/${new Date().getFullYear()}</div>
            
            <div class="berita-acara-preamble">
                Pada hari ini, tanggal ${dateText}, bertempat di ${state.settings.location || 'Indonesia'}, Dewan Hakim dan Panitia Pelaksana <strong>${state.settings.eventName}</strong> telah melakukan sidang pleno penetapan pemenang/juara perlombaan. Setelah melakukan rekapitulasi penilaian dari seluruh hakim penilai secara objektif dan saksama, dengan ini menetapkan daftar pemenang untuk masing-masing cabang perlombaan sebagai berikut:
            </div>
            
            <table class="berita-acara-table">
                <thead>
                    <tr>
                        <th style="width: 50px;">No</th>
                        <th>Cabang</th>
                        <th style="width: 100px;">Babak</th>
                        <th style="width: 100px;">Peringkat</th>
                        <th>Nama Pemenang</th>
                        <th style="width: 100px;">Skor Akhir</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRowsHtml || '<tr><td colspan="6" style="text-align: center; color: #64748b;">Belum ada pemenang yang tercatat.</td></tr>'}
                </tbody>
            </table>
            
            <div class="berita-acara-signatures">
                <div class="berita-acara-sig-block">
                    <p>Panitia Pelaksana</p>
                    <p>Sekretaris,</p>
                    <div style="height: 70px;"></div>
                    <p><strong>_____________________</strong></p>
                </div>
                <div class="berita-acara-sig-block">
                    <p>${state.settings.location || 'Indonesia'}, ${dateText}</p>
                    <p>Ketua Dewan Hakim,</p>
                    <div style="height: 70px;"></div>
                    <p><strong>_____________________</strong></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(printContainer);
    window.print();
    printContainer.remove();
}
window.printBeritaAcara = printBeritaAcara;

/* --- Qiraat Logic --- */
const qiraatData = [
    { name: "Nafi'", narrators: ["Qolun", "Warsy"], files: ["01qolun.pdf", "02warsy.pdf"], folders: ["Qalun_An_Nafi3", "Warsh_An_Nafi3"] },
    { name: "Ibnu Katsir", narrators: ["Al-Bazzi", "Qunbul"], files: ["03albazzi.pdf", "04qunbul.pdf"], folders: ["Al-Bazzi_Ibn_Kathir", "Qunbul_An_IbnKathir"] },
    { name: "Abu 'Amr", narrators: ["Ad-Duri", "As-Susi"], files: ["05adduri.pdf", "06assusi.pdf"], folders: ["Ad-Duri_An_Abu_3amr", "As-Sussi_An_Abu_3amr"] },
    { name: "Ibnu 'Amir", narrators: ["Hisyam", "Ibnu Dzakwan"], files: ["07hisyam.pdf", "08ibnudzakwan.pdf"], folders: ["Hisham_An_Ibn_3amir", "Ibn_Dhakwan_An_Ibn_3amir"] },
    { name: "'Ashim", narrators: ["Syubah", "Hafsh"], files: ["09syubah.pdf", "10hafsh.pdf"], folders: ["Shu3ba_An_3asim", "Hafs_An_3asim"] },
    { name: "Hamzah", narrators: ["Kholaf", "Khollad"], files: ["11kholaf.pdf", "12khollad.pdf"], folders: ["Khalaf_An_Hamzah", "Khalaad_An_Hamzah"] },
    { name: "Al-Kisa'i", narrators: ["Abul Harits", "HafshadDuri"], files: ["13abulharits.pdf", "14hafshadduri.pdf"], folders: ["Abu_Al-Harith_An_Al-Kisaae", "Ad-Duri_An_Al-Kisaae"] },
    { name: "Abu Ja'far", narrators: ["Ibnu Wardan", "Ibnu Jammaz"], files: ["15ibnuwardan.pdf", "16ibnujammaz.pdf"], folders: ["Ibn_Wardaan_An_Abu_Ja3far", "Ibn_Jammaaz_An_Abu_Ja3far"] },
    { name: "Ya'qub", narrators: ["Ruwais", "Rawh"], files: ["17ruwais.pdf", "18rawh.pdf"], folders: ["Ruwais_An_Ya3qub", "Rawh_An_Ya3qub"] },
    { name: "Kholaf", narrators: ["Idris", "Ishaq"], files: ["19idris.pdf", "20ishaq.pdf"], folders: ["Idris_An_Khalaf", "Ishaq_An_Khalaf"] }
];

const narratorTextConfigs = {
    "qolun": { jsonPath: "qaloon/data/QaloonData_v10.json", fontClass: "qaloon" },
    "warsy": { jsonPath: "warsh/data/warshData_v10.json", fontClass: "warsh" },
    "al-bazzi": { jsonPath: "bazzi/data/BazziData_v07.json", fontClass: "bazzi" },
    "qunbul": { jsonPath: "qumbul/data/QumbulData_v07.json", fontClass: "qumbul" },
    "ad-duri": { jsonPath: "doori/data/DooriData_v09.json", fontClass: "doori" },
    "as-susi": { jsonPath: "soosi/data/SoosiData09.json", fontClass: "soosi" },
    "syubah": { jsonPath: "shouba/data/ShoubaData08.json", fontClass: "shouba" },
    "hafsh": { jsonPath: "hafs/data/hafsData_v18.json", fontClass: "hafs" }
};

const qiraatTextCache = {};
let currentQiraatIndex = 0;
let currentQiraatPage = 1;
let qiraatScale = 1.0; // Zoom scale (1.0 = fit container width)

function renderQiraatImams() {
    const grid = document.getElementById('qiraat-imams-grid');
    if (!grid) return;
    grid.innerHTML = '';
    qiraatData.forEach((imam, index) => {
        const n1 = imam.narrators[0].toLowerCase();
        const n2 = imam.narrators[1].toLowerCase();
        const hasText = !!narratorTextConfigs[n1] && !!narratorTextConfigs[n2];

        let badgeHtml = '<i class="fa-solid fa-file-pdf"></i> PDF + <i class="fa-solid fa-image"></i> JPG';
        if (hasText) {
            badgeHtml += ' + <i class="fa-solid fa-file-lines"></i> TEKS';
        }

        const card = document.createElement('div');
        card.className = `qiraat-card-alt has-both`;
        card.innerHTML = `
            <div class="imam-title">MUSHAF IMAM ${imam.name.toUpperCase()}</div>
            <div class="narrators">${imam.narrators[0].toUpperCase()} | ${imam.narrators[1].toUpperCase()}</div>
            <div class="format-badge-container">
                <span class="format-badge badge-both">
                    ${badgeHtml}
                </span>
            </div>
        `;
        card.onclick = () => openQiraatViewer(index);
        grid.appendChild(card);
    });
}

function openQiraatViewer(index) {
    currentQiraatIndex = index;
    currentQiraatPage = 1;
    document.getElementById('qiraat-landing').classList.add('hidden');
    document.getElementById('qiraat-viewer').classList.remove('hidden');
    
    // Reset scroll positions
    const wrapper1 = document.getElementById('pdfWrapper1');
    const wrapper2 = document.getElementById('pdfWrapper2');
    if (wrapper1) wrapper1.scrollTop = 0;
    if (wrapper2) wrapper2.scrollTop = 0;

    const twrapper1 = document.getElementById('textWrapper1');
    const twrapper2 = document.getElementById('textWrapper2');
    if (twrapper1) twrapper1.scrollTop = 0;
    if (twrapper2) twrapper2.scrollTop = 0;

    updateQiraatViewer();
}

function closeQiraatViewer() {
    document.getElementById('qiraat-viewer').classList.add('hidden');
    document.getElementById('qiraat-landing').classList.remove('hidden');
    const img1 = document.getElementById('qiraat-img-1');
    const img2 = document.getElementById('qiraat-img-2');
    if (img1) img1.src = '';
    if (img2) img2.src = '';
}

async function loadQiraatTextData(narratorKey, config) {
    if (qiraatTextCache[narratorKey]) {
        return qiraatTextCache[narratorKey];
    }
    
    const url = `https://cdn.jsdelivr.net/gh/thetruetruth/quran-data-kfgqpc@main/${config.jsonPath}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Gagal mengunduh berkas teks (${response.status})`);
    }
    const data = await response.json();
    qiraatTextCache[narratorKey] = data;
    return data;
}

function updateQiraatToggleState() {
    const btnPdf = document.getElementById('qiraat-toggle-pdf');
    const btnJpg = document.getElementById('qiraat-toggle-jpg');
    const btnText = document.getElementById('qiraat-toggle-text');
    if (!btnPdf || !btnJpg || !btnText) return;

    const imam = qiraatData[currentQiraatIndex];
    const n1 = imam.narrators[0].toLowerCase();
    const n2 = imam.narrators[1].toLowerCase();
    
    // Check if BOTH narrators have text configs
    const hasText1 = !!narratorTextConfigs[n1];
    const hasText2 = !!narratorTextConfigs[n2];
    const textAvailable = hasText1 && hasText2;

    if (!textAvailable) {
        // Text mode is not available, force default active mode if it was text
        if (state.qiraatMode === 'text') {
            state.qiraatMode = 'jpg';
        }
        btnText.classList.add('disabled');
        btnText.title = "Mode teks tidak tersedia untuk riwayat ini";
    } else {
        btnText.classList.remove('disabled');
        btnText.title = "Tampilkan Mode Teks";
    }

    // Toggle active classes on buttons
    btnPdf.classList.toggle('active', state.qiraatMode === 'pdf');
    btnJpg.classList.toggle('active', state.qiraatMode === 'jpg');
    btnText.classList.toggle('active', state.qiraatMode === 'text');

    // Dom elements
    const pdfWrapper1 = document.getElementById('pdfWrapper1');
    const pdfWrapper2 = document.getElementById('pdfWrapper2');
    const textWrapper1 = document.getElementById('textWrapper1');
    const textWrapper2 = document.getElementById('textWrapper2');

    const iframe1 = document.getElementById('qiraat-iframe-1');
    const iframe2 = document.getElementById('qiraat-iframe-2');
    const img1 = document.getElementById('qiraat-img-1');
    const img2 = document.getElementById('qiraat-img-2');

    if (state.qiraatMode === 'pdf') {
        if (pdfWrapper1) pdfWrapper1.classList.remove('hidden');
        if (pdfWrapper2) pdfWrapper2.classList.remove('hidden');
        if (textWrapper1) textWrapper1.classList.add('hidden');
        if (textWrapper2) textWrapper2.classList.add('hidden');

        if (iframe1) iframe1.classList.remove('hidden');
        if (iframe2) iframe2.classList.remove('hidden');
        if (img1) img1.classList.add('hidden');
        if (img2) img2.classList.add('hidden');
    } else if (state.qiraatMode === 'jpg') {
        if (pdfWrapper1) pdfWrapper1.classList.remove('hidden');
        if (pdfWrapper2) pdfWrapper2.classList.remove('hidden');
        if (textWrapper1) textWrapper1.classList.add('hidden');
        if (textWrapper2) textWrapper2.classList.add('hidden');

        if (iframe1) iframe1.classList.add('hidden');
        if (iframe2) iframe2.classList.add('hidden');
        if (img1) img1.classList.remove('hidden');
        if (img2) img2.classList.remove('hidden');
    } else {
        if (pdfWrapper1) pdfWrapper1.classList.add('hidden');
        if (pdfWrapper2) pdfWrapper2.classList.add('hidden');
        if (textWrapper1) textWrapper1.classList.remove('hidden');
        if (textWrapper2) textWrapper2.classList.remove('hidden');
    }
}

async function renderPaneText(paneIndex, narratorName) {
    const wrapper = document.getElementById(`textWrapper${paneIndex}`);
    const loading = wrapper.querySelector('.qiraat-text-loading');
    const error = wrapper.querySelector('.qiraat-text-error');
    const content = document.getElementById(`qiraat-text-content-${paneIndex}`);
    
    if (!loading || !error || !content) return;

    // Show loading, hide error & content
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    content.innerHTML = '';

    const key = narratorName.toLowerCase();
    const config = narratorTextConfigs[key];
    if (!config) {
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        error.querySelector('.error-msg').textContent = "Teks tidak dikonfigurasi.";
        return;
    }

    try {
        const data = await loadQiraatTextData(key, config);
        if (!data) {
            throw new Error("Gagal mengunduh teks dari repositori.");
        }

        // Filter by page
        const verses = data.filter(item => {
            const p = parseInt(item.page || item.page_no || item.page);
            return p === currentQiraatPage;
        });

        if (verses.length === 0) {
            loading.classList.add('hidden');
            error.classList.remove('hidden');
            error.querySelector('.error-msg').textContent = `Teks Halaman ${currentQiraatPage} tidak ditemukan.`;
            return;
        }

        // Sort verses
        verses.sort((a, b) => {
            const aSura = parseInt(a.sura_no || a.sora || a.surah_no);
            const bSura = parseInt(b.sura_no || b.sora || b.surah_no);
            if (aSura !== bSura) return aSura - bSura;
            const aAya = parseInt(a.aya_no || a.aya);
            const bAya = parseInt(b.aya_no || b.aya);
            return aAya - bAya;
        });

        // Set font class
        content.className = `qiraat-text-content ${config.fontClass}`;

        // Render HTML
        let html = '';
        let currentSura = null;

        verses.forEach(item => {
            const surahId = parseInt(item.sura_no || item.sora || item.surah_no);
            const surahNameAr = item.sura_name_ar || item.sora_name_ar || `سورة ${surahId}`;
            
            if (surahId !== currentSura) {
                currentSura = surahId;
                // Append Surah Header
                html += `<div class="qiraat-surah-header">`;
                html += `<div class="surah-title">سُورَةُ ${surahNameAr}</div>`;
                html += `</div>`;
                
                // Show Bismillah only if it's the actual start of the Surah (aya_no === 1) and not Surah 9
                if (parseInt(item.aya_no || item.aya) === 1 && surahId !== 9) {
                    const textNormalized = (item.aya_text || "").trim();
                    const startsWithBismillah = textNormalized.startsWith("بِسۡمِ") || textNormalized.startsWith("بِسْمِ");
                    if (!startsWithBismillah) {
                        html += `<div class="qiraat-bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
                    }
                }
            }
            
            // Render verse
            html += `<span class="qiraat-aya">${item.aya_text}</span> `;
        });

        content.innerHTML = html;
        loading.classList.add('hidden');
    } catch (err) {
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        error.querySelector('.error-msg').textContent = err.message || "Gagal menampilkan teks.";
    }
}

function adjustTextSizes() {
    const text1 = document.getElementById('qiraat-text-content-1');
    const text2 = document.getElementById('qiraat-text-content-2');
    if (!text1 || !text2) return;
    
    const currentFontSize = 26 * qiraatScale;
    text1.style.fontSize = currentFontSize + 'px';
    text2.style.fontSize = currentFontSize + 'px';
}

function updateQiraatViewer() {
    const imam = qiraatData[currentQiraatIndex];
    document.getElementById('qiraat-viewer-imam-name').textContent = "MUSHAF IMAM " + imam.name.toUpperCase();
    document.getElementById('qiraat-narrator-1-name').textContent = imam.narrators[0].toUpperCase();
    document.getElementById('qiraat-narrator-2-name').textContent = imam.narrators[1].toUpperCase();
    document.getElementById('qiraat-page-input').value = currentQiraatPage;

    updateQiraatToggleState();

    if (state.qiraatMode === 'pdf') {
        const basePath = "qiraat/";
        const iframe1 = document.getElementById('qiraat-iframe-1');
        const iframe2 = document.getElementById('qiraat-iframe-2');

        const src1 = `${basePath}${imam.files[0]}?p=${currentQiraatPage}#page=${currentQiraatPage}&toolbar=0&navpanes=0&view=FitH`;
        const src2 = `${basePath}${imam.files[1]}?p=${currentQiraatPage}#page=${currentQiraatPage}&toolbar=0&navpanes=0&view=FitH`;

        if (iframe1 && iframe1.src !== src1) iframe1.src = src1;
        if (iframe2 && iframe2.src !== src2) iframe2.src = src2;

        // Adjust sizes to fit scale
        setTimeout(adjustImageSizes, 50); // slight delay to allow wrapper layout calculation
    } else if (state.qiraatMode === 'jpg') {
        const basePath = "https://multiqiraat.github.io/mushaf-qiraats/";
        const img1 = document.getElementById('qiraat-img-1');
        const img2 = document.getElementById('qiraat-img-2');

        const src1 = `${basePath}${imam.folders[0]}/page_${currentQiraatPage}.png`;
        const src2 = `${basePath}${imam.folders[1]}/page_${currentQiraatPage}.png`;

        if (img1 && img1.src !== src1) img1.src = src1;
        if (img2 && img2.src !== src2) img2.src = src2;

        // Adjust sizes to fit scale
        setTimeout(adjustImageSizes, 50); // slight delay to allow wrapper layout calculation
    } else {
        // Render text
        renderPaneText(1, imam.narrators[0]);
        renderPaneText(2, imam.narrators[1]);
        
        // Also call adjustTextSizes to ensure it matches current qiraatScale
        setTimeout(adjustTextSizes, 50);
    }
}

function adjustImageSizes() {
    const wrapper1 = document.getElementById('pdfWrapper1');
    const iframe1 = document.getElementById('qiraat-iframe-1');
    const iframe2 = document.getElementById('qiraat-iframe-2');
    const img1 = document.getElementById('qiraat-img-1');
    const img2 = document.getElementById('qiraat-img-2');
    if (!wrapper1) return;

    // Use clientWidth of wrapper or default to 700
    const baseWidth = wrapper1.clientWidth || 700;
    const currentWidth = baseWidth * qiraatScale;

    if (state.qiraatMode === 'pdf') {
        const currentHeight = currentWidth * 1.45;
        if (iframe1) {
            iframe1.style.width = currentWidth + 'px';
            iframe1.style.height = currentHeight + 'px';
        }
        if (iframe2) {
            iframe2.style.width = currentWidth + 'px';
            iframe2.style.height = currentHeight + 'px';
        }
    } else if (state.qiraatMode === 'jpg') {
        if (img1) {
            img1.style.width = currentWidth + 'px';
            img1.style.height = 'auto';
        }
        if (img2) {
            img2.style.width = currentWidth + 'px';
            img2.style.height = 'auto';
        }
    }

    adjustTextSizes();
}

function setupQiraatScrollSync() {
    const wrapper1 = document.getElementById('pdfWrapper1');
    const wrapper2 = document.getElementById('pdfWrapper2');
    const textWrapper1 = document.getElementById('textWrapper1');
    const textWrapper2 = document.getElementById('textWrapper2');
    if (!wrapper1 || !wrapper2 || !textWrapper1 || !textWrapper2) return;

    let syncing = false;

    // PDF / Image Wrappers
    wrapper1.addEventListener('scroll', function() {
        if (syncing || (state.qiraatMode !== 'pdf' && state.qiraatMode !== 'jpg')) return;
        syncing = true;
        wrapper2.scrollTop = wrapper1.scrollTop;
        wrapper2.scrollLeft = wrapper1.scrollLeft;
        setTimeout(() => syncing = false, 10);
    });

    wrapper2.addEventListener('scroll', function() {
        if (syncing || (state.qiraatMode !== 'pdf' && state.qiraatMode !== 'jpg')) return;
        syncing = true;
        wrapper1.scrollTop = wrapper2.scrollTop;
        wrapper1.scrollLeft = wrapper2.scrollLeft;
        setTimeout(() => syncing = false, 10);
    });

    // Text Wrappers
    textWrapper1.addEventListener('scroll', function() {
        if (syncing || state.qiraatMode !== 'text') return;
        syncing = true;
        textWrapper2.scrollTop = textWrapper1.scrollTop;
        setTimeout(() => syncing = false, 10);
    });

    textWrapper2.addEventListener('scroll', function() {
        if (syncing || state.qiraatMode !== 'text') return;
        syncing = true;
        textWrapper1.scrollTop = textWrapper2.scrollTop;
        setTimeout(() => syncing = false, 10);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Ensure renderQiraatImams is called when DOM is ready
    renderQiraatImams();
    setupQiraatScrollSync();

    const btnBack = document.getElementById('btn-qiraat-back');
    if (btnBack) btnBack.addEventListener('click', closeQiraatViewer);

    const btnNext = document.getElementById('btn-qiraat-next');
    if (btnNext) btnNext.addEventListener('click', () => {
        if (currentQiraatPage < 604) {
            currentQiraatPage++;
            updateQiraatViewer();
            const w1 = document.getElementById('pdfWrapper1');
            const w2 = document.getElementById('pdfWrapper2');
            if (w1) w1.scrollTop = 0;
            if (w2) w2.scrollTop = 0;
            const tw1 = document.getElementById('textWrapper1');
            const tw2 = document.getElementById('textWrapper2');
            if (tw1) tw1.scrollTop = 0;
            if (tw2) tw2.scrollTop = 0;
        }
    });

    const btnPrev = document.getElementById('btn-qiraat-prev');
    if (btnPrev) btnPrev.addEventListener('click', () => {
        if (currentQiraatPage > 1) {
            currentQiraatPage--;
            updateQiraatViewer();
            const w1 = document.getElementById('pdfWrapper1');
            const w2 = document.getElementById('pdfWrapper2');
            if (w1) w1.scrollTop = 0;
            if (w2) w2.scrollTop = 0;
            const tw1 = document.getElementById('textWrapper1');
            const tw2 = document.getElementById('textWrapper2');
            if (tw1) tw1.scrollTop = 0;
            if (tw2) tw2.scrollTop = 0;
        }
    });

    const pageInput = document.getElementById('qiraat-page-input');
    if (pageInput) {
        pageInput.addEventListener('change', (e) => {
            let page = parseInt(e.target.value);
            if (isNaN(page) || page < 1) page = 1;
            if (page > 604) page = 604;
            currentQiraatPage = page;
            updateQiraatViewer();
            const w1 = document.getElementById('pdfWrapper1');
            const w2 = document.getElementById('pdfWrapper2');
            if (w1) w1.scrollTop = 0;
            if (w2) w2.scrollTop = 0;
            const tw1 = document.getElementById('textWrapper1');
            const tw2 = document.getElementById('textWrapper2');
            if (tw1) tw1.scrollTop = 0;
            if (tw2) tw2.scrollTop = 0;
        });
    }

    const btnNextImam = document.getElementById('btn-qiraat-next-imam');
    if (btnNextImam) btnNextImam.addEventListener('click', () => {
        if (currentQiraatIndex < qiraatData.length - 1) {
            currentQiraatIndex++;
            updateQiraatViewer();
        }
    });

    const btnPrevImam = document.getElementById('btn-qiraat-prev-imam');
    if (btnPrevImam) btnPrevImam.addEventListener('click', () => {
        if (currentQiraatIndex > 0) {
            currentQiraatIndex--;
            updateQiraatViewer();
        }
    });

    const btnZoomIn = document.getElementById('btn-qiraat-zoom-in');
    if (btnZoomIn) btnZoomIn.addEventListener('click', () => {
        if (qiraatScale < 3.0) {
            qiraatScale += 0.15;
            adjustImageSizes();
        }
    });

    const btnZoomOut = document.getElementById('btn-qiraat-zoom-out');
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => {
        if (qiraatScale > 0.5) {
            qiraatScale -= 0.15;
            adjustImageSizes();
        }
    });

    // Toggle PDF / JPG / Text modes
    const togglePdfBtn = document.getElementById('qiraat-toggle-pdf');
    const toggleJpgBtn = document.getElementById('qiraat-toggle-jpg');
    const toggleTextBtn = document.getElementById('qiraat-toggle-text');
    
    if (togglePdfBtn) {
        togglePdfBtn.addEventListener('click', () => {
            state.qiraatMode = 'pdf';
            updateQiraatToggleState();
            updateQiraatViewer();
        });
    }
    if (toggleJpgBtn) {
        toggleJpgBtn.addEventListener('click', () => {
            state.qiraatMode = 'jpg';
            updateQiraatToggleState();
            updateQiraatViewer();
        });
    }
    if (toggleTextBtn) {
        toggleTextBtn.addEventListener('click', () => {
            const imam = qiraatData[currentQiraatIndex];
            const n1 = imam.narrators[0].toLowerCase();
            const n2 = imam.narrators[1].toLowerCase();
            if (!narratorTextConfigs[n1] || !narratorTextConfigs[n2]) {
                return; // Mode text not available
            }
            state.qiraatMode = 'text';
            updateQiraatToggleState();
            updateQiraatViewer();
        });
    }

    // Handle window resize to keep iframe width responsive
    window.addEventListener('resize', adjustImageSizes);
});
