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
        scoreMethod: 'average'
    },
    participants: [],
    judges: {}, // { branch: [names] }
    currentMaqra: {
        surah: null,
        startAyah: 1,
        verses: [],
        currentChunk: 0,
        chunkSize: 15
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

    applySettingsToUI();
    renderParticipants();
    renderJudges();
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

    if (state.settings.logo) {
        document.getElementById('event-logo').src = state.settings.logo;
        document.getElementById('event-logo').classList.remove('hidden');
        document.getElementById('default-logo').classList.add('hidden');
    }

    // Update Scoring UI (Dynamic Judges)
    const container = document.getElementById('dynamic-judges-container');
    container.innerHTML = '';
    for (let i = 1; i <= state.settings.judgeCount; i++) {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label>Nilai Hakim ${i}</label>
            <input type="number" class="judge-score-input" min="0" max="100" placeholder="0-100">
        `;
        container.appendChild(div);
    }

    // Update Participant Selects
    const selects = ['maqra-participant-select', 'score-participant-select'];
    selects.forEach(id => {
        const sel = document.getElementById(id);
        const currentVal = sel.value;
        sel.innerHTML = id.includes('score') ? '<option value="">-- Pilih Peserta --</option>' : '<option value="">-- Bebas --</option>';
        state.participants.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.nama;
            opt.textContent = `${p.nama} (${p.cabang})`;
            sel.appendChild(opt);
        });
        sel.value = currentVal;
    });
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
    const titles = { dashboard: 'Dashboard', settings: 'Pengaturan Utama', maqra: 'Tampilan Maqra & Timer', scoring: 'e-Scoring' };
    document.getElementById('page-title').textContent = titles[target] || 'Layar Publik';
}

// --- Excel Handler ---
function initSettingsListeners() {
    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
    document.getElementById('btn-reset-event').addEventListener('click', resetEvent);
    document.getElementById('btn-reset-participants').addEventListener('click', resetParticipants);
    
    document.getElementById('btn-add-participant').addEventListener('click', () => {
        const name = document.getElementById('manual-participant-name').value;
        const cabang = document.getElementById('manual-participant-cabang').value;
        if (!name) return alert('Nama peserta tidak boleh kosong!');
        
        state.participants.push({ nama: name, cabang: cabang });
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
            const json = XLSX.utils.sheet_to_json(sheet, { header: ['nama', 'cabang'], range: 1 });
            
            state.participants = json.filter(p => p.nama);
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
            <td><span class="badge" style="background: rgba(16,185,129,0.1); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${p.cabang}</span></td>
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
    if (newName) {
        p.nama = newName;
        localStorage.setItem('mtq_participants', JSON.stringify(state.participants));
        renderParticipants();
        applySettingsToUI();
    }
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
        let surahNum, ayah = 1;
        
        switch(cabang) {
            case 'juz_30':
                surahNum = Math.floor(Math.random() * (114 - 78 + 1)) + 78;
                break;
            case 'juz_1':
                surahNum = 2; // Al-Baqarah
                ayah = Math.floor(Math.random() * 141) + 1;
                break;
            case 'tilawah_tartil':
                // Exclude Short Surahs (78-114) and Fatihah (1)
                surahNum = Math.floor(Math.random() * 76) + 2; // 2 to 77
                break;
            case '5_juz':
                surahNum = Math.floor(Math.random() * 4) + 1;
                break;
            case '10_juz':
                surahNum = Math.floor(Math.random() * 9) + 1;
                break;
            case '20_juz':
                surahNum = Math.floor(Math.random() * 29) + 1;
                break;
            case '30_juz':
                surahNum = Math.floor(Math.random() * 114) + 1;
                break;
            default:
                surahNum = Math.floor(Math.random() * 114) + 1;
        }

        // Randomize Ayah if not juz_1 (which is already randomized above)
        if (cabang !== 'juz_1') {
            try {
                const res = await fetch(`https://api.quran.gading.dev/surah/${surahNum}`);
                const data = await res.json();
                const verses = data.data.verses;

                if (cabang === 'tilawah_tartil') {
                    // Filter verses that are the start of a Ruku'
                    const rukuStarts = verses.filter((v, idx) => {
                        if (idx === 0) return true;
                        return v.meta.ruku !== verses[idx - 1].meta.ruku;
                    });
                    const randomRuku = rukuStarts[Math.floor(Math.random() * rukuStarts.length)];
                    ayah = randomRuku.number.inSurah;
                } else {
                    const totalVerses = data.data.numberOfVerses;
                    ayah = Math.floor(Math.random() * totalVerses) + 1;
                }
            } catch (e) { ayah = 1; }
        }
        
        loadMaqra(surahNum, ayah);
    });

    document.getElementById('btn-manual-maqra').addEventListener('click', () => {
        const s = document.getElementById('manual-surah').value;
        const a = document.getElementById('manual-ayah').value || 1;
        if (s) loadMaqra(s, parseInt(a));
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
        const res = await fetch(`https://api.quran.gading.dev/surah/${surahNum}`);
        const data = await res.json();
        const surah = data.data;
        
        state.currentMaqra.surah = surah;
        state.currentMaqra.startAyah = startAyah;
        state.currentMaqra.verses = surah.verses;
        
        // Find chunk index containing startAyah
        state.currentMaqra.currentChunk = Math.floor((startAyah - 1) / state.currentMaqra.chunkSize);
        
        updateMaqraDisplay();
        
        // Update Public Info
        const pNameInput = document.getElementById('maqra-participant-select');
        const pName = pNameInput.value || 'Bebas';
        const pCabang = pNameInput.options[pNameInput.selectedIndex]?.text.split('(')[1]?.replace(')', '') || '-';
        
        document.getElementById('side-p-name').textContent = pName;
        document.getElementById('side-p-cabang').textContent = pCabang;
        
        document.getElementById('public-participant-name').textContent = pName;
        document.getElementById('public-maqra-surah').textContent = `${surah.name.transliteration.id}: ${startAyah}`;

    } catch (e) {
        alert('Gagal memuat mushaf.');
    } finally {
        loading.classList.add('hidden');
        content.classList.remove('hidden');
    }
}

function toArabicDigits(num) {
    const id = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, function(w) {
        return id[+w];
    });
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
    
    updateTimerUI();
    
    state.timer.interval = setInterval(() => {
        state.timer.secondsElapsed++;
        if (state.timer.mode === 'prep' && state.timer.secondsElapsed >= state.settings.timerPrep) {
            // Switch to Reading Phase (Green)
            state.timer.mode = 'reading';
            state.timer.secondsElapsed = 0;
            state.timer.totalSeconds = state.settings.timerDuration * 60;
        } else if (state.timer.mode === 'reading') {
            const timeLeft = state.timer.totalSeconds - state.timer.secondsElapsed;
            if (timeLeft <= state.settings.timerYellow2 * 60 && timeLeft > 0) {
                state.timer.mode = 'warning';
            } else if (timeLeft <= 0) {
                state.timer.mode = 'stop';
                clearInterval(state.timer.interval);
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

    let displayTime = state.timer.secondsElapsed;
    if (state.timer.mode === 'reading' || state.timer.mode === 'warning') {
        displayTime = state.timer.totalSeconds - state.timer.secondsElapsed;
    }

    const m = Math.floor(displayTime / 60);
    const s = displayTime % 60;
    const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    display.textContent = timeStr;
    pubDisplay.textContent = timeStr;

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
    
    // Update judge inputs when participant/branch changes
    document.getElementById('score-participant-select').addEventListener('change', (e) => {
        const selected = e.target.options[e.target.selectedIndex]?.text || '';
        const branchMatch = selected.match(/\(([^)]+)\)/);
        if (branchMatch) {
            // Mapping UI name to state key
            const branchMap = {
                'Juz 30': 'juz_30',
                'Juz 1': 'juz_1',
                '5 Juz': '5_juz',
                '10 Juz': '10_juz',
                '20 Juz': '20_juz',
                '30 Juz': '30_juz',
                'Tilawah': 'tilawah_tartil',
                'Tartil': 'tilawah_tartil'
            };
            let branchKey = 'default';
            for (let key in branchMap) {
                if (branchMatch[1].includes(key)) branchKey = branchMap[key];
            }
            updateJudgeInputsForBranch(branchKey);
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
    tbody.innerHTML = Object.entries(state.judges).map(([branch, names]) => `
        <tr>
            <td style="font-weight:600;">${branch.replace('_', ' ').toUpperCase()}</td>
            <td>${names.join(', ')}</td>
        </tr>
    `).join('');
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
    const participant = pInput.value;
    if (!participant) return alert('Pilih peserta!');
    
    const cabang = pInput.options[pInput.selectedIndex]?.text.split('(')[1]?.replace(')', '') || '-';

    const inputs = document.querySelectorAll('.judge-score-input');
    let vals = [];
    inputs.forEach(i => { if(i.value) vals.push(parseFloat(i.value)); });

    if (vals.length < state.settings.judgeCount) return alert(`Masukkan nilai untuk semua hakim (${state.settings.judgeCount})`);

    let final = 0;
    if (state.settings.scoreMethod === 'average') {
        final = vals.reduce((a, b) => a + b, 0) / vals.length;
    } else {
        const sorted = [...vals].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        final = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2;
    }

    state.scores.push({ name: participant, cabang: cabang, score: final.toFixed(2), details: vals });
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
            <td style="color:var(--gold); font-weight:700; font-size:18px;">${s.score}</td>
        </tr>
    `).join('');
}
