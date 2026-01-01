const STORAGE_KEY = "hp_v14_final";
const $ = (id) => document.getElementById(id);

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    role: "child", balance: 0, savedAmount: 0, 
    interestRate: 10, unboxDate: "", pointsPerP: 100, logs: []
};

function save() { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); 
    updateUI(); 
}

function updateUI() {
    const pCount = Math.floor(state.savedAmount / state.pointsPerP);
    $('balanceDisplay').innerText = state.balance;
    $('pointsDisplay').innerText = pCount;
    $('v-bal').innerText = state.balance;
    $('v-pts').innerText = pCount;
    $('v-saved').innerText = state.savedAmount;

    const isParent = state.role === "parent";
    $('info-parent-view').classList.toggle('hidden', !isParent);
    $('info-child-view').classList.toggle('hidden', isParent);
    $('parent-settings').classList.toggle('hidden', !isParent);
    $('child-lock-msg').classList.toggle('hidden', isParent);
    renderHistory();
}

window.quickSettle = () => {
    const p = parseInt($('itemPrice').value);
    const n = $('itemName').value;
    if (!p || !n) return alert("請填寫品名與金額");
    if(confirm(`確認直接扣除 $${p} (計畫性消費)？`)) {
        state.balance -= p;
        state.logs.unshift({ time: new Date().toLocaleDateString(), name: `(計) ${n}`, val: `-$${p}`, color: "text-gray-500" });
        save(); resetPractice();
    }
};

window.startCooldown = () => {
    if (!parseInt($('itemPrice').value)) return alert("請填寫正確金額");
    $('step-input').classList.add('hidden');
    $('step-cooldown').classList.remove('hidden');
    let t = 30;
    const timer = setInterval(() => {
        if(--t <= 0) { 
            clearInterval(timer); 
            $('step-cooldown').classList.add('hidden'); 
            $('step-decision').classList.remove('hidden'); 
        }
        $('timerNum').innerText = t;
    }, 1000);
};

window.saveDecision = (buy) => {
    const p = parseInt($('itemPrice').value);
    const n = $('itemName').value;
    if (buy) {
        state.balance -= p;
        state.logs.unshift({ time: new Date().toLocaleDateString(), name: n, val: `-$${p}`, color: "text-red-500" });
    } else {
        state.savedAmount += p;
        state.logs.unshift({ time: new Date().toLocaleDateString(), name: n, val: `+$${p}`, color: "text-blue-400" });
        confetti();
    }
    save(); resetPractice();
};

window.saveSettings = () => {
    state.balance = parseInt($('setBalance').value) || 0;
    state.pointsPerP = parseInt($('setRate').value) || 100;
    state.interestRate = parseInt($('setInterest').value) || 0;
    state.unboxDate = $('setUnboxDate').value;
    save(); alert("✅ 設定已更新，理智隊長準備就緒！");
};

window.switchRole = (r) => { state.role = r; save(); };

window.showPage = (id) => {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    $('page-' + id).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('tab-active'));
    $('nav-' + id).classList.add('tab-active');
    if(id === 'settings' && state.role === 'parent') {
        $('setBalance').value = state.balance;
        $('setRate').value = state.pointsPerP;
        $('setInterest').value = state.interestRate;
        $('setUnboxDate').value = state.unboxDate;
    }
};

function resetPractice() {
    $('step-input').classList.remove('hidden'); $('step-decision').classList.add('hidden');
    $('itemPrice').value = ''; $('itemName').value = ''; showPage('vault');
}

function renderHistory() {
    $('historyList').innerHTML = state.logs.slice(0, 15).map(l => `
        <div class="card-dark p-4 flex justify-between items-center">
            <div><div class="text-[10px] opacity-40">${l.time}</div><div class="font-bold text-lg">${l.name}</div></div>
            <div class="${l.color} font-black text-xl">${l.val}</div>
        </div>`).join('');
}
document.addEventListener('DOMContentLoaded', updateUI);
