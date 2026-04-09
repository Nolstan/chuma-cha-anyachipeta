const API_BASE = '/api';

// State
let currentView = 'dashboard';

// DOM Elements
const views = {
    dashboard: document.getElementById('dashboard'),
    transactions: document.getElementById('transactions')
};

const summary = {
    totalReceived: document.getElementById('total-received'),
    totalInvested: document.getElementById('total-invested'),
    cashBalance: document.getElementById('cash-balance'),
    totalLent: document.getElementById('total-lent'),
    totalLoans: document.getElementById('total-loans'),
    loansRemaining: document.getElementById('loans-remaining')
};

const modal = document.getElementById('modal-container');
const modalTitle = document.getElementById('modal-title');
const formFields = document.getElementById('form-fields');
const transactionForm = document.getElementById('transaction-form');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchSummary();
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => showView(btn.dataset.view));
    });

    transactionForm.addEventListener('submit', handleFormSubmit);
}

function showView(viewId) {
    currentView = viewId;
    Object.keys(views).forEach(v => {
        views[v].classList.toggle('hidden', v !== viewId);
    });

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    if (viewId === 'transactions') {
        fetchHistory();
    }
}

async function fetchSummary() {
    try {
        const response = await fetch(`${API_BASE}/summary`);
        const data = await response.json();

        summary.totalReceived.innerText = formatCurrency(data.totalReceived);
        summary.totalInvested.innerText = formatCurrency(data.totalInvested);
        summary.cashBalance.innerText = formatCurrency(data.cashBalance);
        summary.totalLent.innerText = formatCurrency(data.totalLent);
        summary.totalLoans.innerText = formatCurrency(data.totalLoansTaken);
        summary.loansRemaining.innerText = formatCurrency(data.loansRemaining);

        // Update summary card color for cash balance
        summary.cashBalance.parentElement.parentElement.classList.toggle('warning', data.cashBalance < 0);
    } catch (error) {
        console.error('Error fetching summary:', error);
    }
}

async function fetchHistory() {
    try {
        const response = await fetch(`${API_BASE}/summary`);
        const data = await response.json();
        const container = document.getElementById('history-container');
        container.innerHTML = '';

        const allHistory = [
            ...data.history.investments.map(i => ({ ...i, type: 'Mwagula', color: 'expense' })),
            ...data.history.loans.map(l => ({ ...l, type: 'Ngongole ya', color: 'income', label: l.lender })),
            ...data.history.repayments.map(rp => ({ ...rp, type: 'Mwawezga Ngongole ya', color: 'expense', label: rp.lender })),
            ...data.history.moneyLent.map(m => ({ ...m, type: 'Mwabwelekeska', color: 'expense', label: m.person })),
            ...data.history.moneyReceived.map(r => ({ ...r, type: 'Income', color: 'income', label: r.source }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        allHistory.forEach(record => {
            const card = document.createElement('div');
            card.className = 'history-card';
            card.innerHTML = `
                <div class="record-info">
                    <h4>${record.type} ${record.category ? `(${record.category})` : ''} ${record.label ? `- ${record.label}` : ''}</h4>
                    <span>${new Date(record.date).toLocaleDateString()}</span>
                </div>
                <div class="record-amount ${record.color}">${record.color === 'expense' ? '-' : '+'}${formatCurrency(record.amount)}</div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching history:', error);
    }
}

/** Modal Functions **/
window.openModal = async function (type) {
    modal.classList.remove('hidden');
    formFields.innerHTML = '';
    transactionForm.dataset.type = type;

    switch (type) {
        case 'investment':
            modalTitle.innerText = 'Mwagula Vichi / Expense';
            addField('Amount', 'amount', 'number');
            addField('Ngeti (seeds,Feteleza , Ganyu)', 'category', 'text');
            addField('Date', 'date', 'date', new Date().toISOString().split('T')[0]);
            break;
        case 'loan':
            modalTitle.innerText = 'Ikanipo Ngongole mwatola';
            addField('Amount', 'amount', 'number');
            addField('Lender', 'lender', 'text');
            addField('Date', 'date', 'date', new Date().toISOString().split('T')[0]);
            addField('Due Date', 'due_date', 'date');
            break;
        case 'repayment':
            modalTitle.innerText = 'Mwawezga Ngongole zilinga';
            const loans = await fetchLoans();
            addSelect('Select Loan', 'loanId', loans.map(l => ({ value: l._id, label: `${l.lender} - Balance: ${formatCurrency(l.balance)}` })));
            addField('Amount', 'amount', 'number');
            addField('Date', 'date', 'date', new Date().toISOString().split('T')[0]);
            break;
        case 'moneyLent':
            modalTitle.innerText = 'Add Money Lent';
            addField('Amount', 'amount', 'number');
            addField('Person', 'person', 'text');
            addField('Date', 'date', 'date', new Date().toISOString().split('T')[0]);
            addField('Expected Return Date', 'expectedReturnDate', 'date');
            break;
        case 'income':
            modalTitle.innerText = 'Add Income / Money Received';
            addField('Amount', 'amount', 'number');
            addField('Source', 'source', 'text');
            addField('Date', 'date', 'date', new Date().toISOString().split('T')[0]);
            break;
    }
    lucide.createIcons();
};

window.closeModal = function () {
    modal.classList.add('hidden');
};

function addField(label, name, type, value = '') {
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `
        <label>${label}</label>
        <input type="${type}" name="${name}" value="${value}" required>
    `;
    formFields.appendChild(div);
}

function addSelect(label, name, options) {
    const div = document.createElement('div');
    div.className = 'form-group';
    let optionsHtml = options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
    div.innerHTML = `
        <label>${label}</label>
        <select name="${name}" required>${optionsHtml}</select>
    `;
    formFields.appendChild(div);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const type = transactionForm.dataset.type;
    const formData = new FormData(transactionForm);
    const data = Object.fromEntries(formData.entries());

    let endpoint = '';
    switch (type) {
        case 'investment': endpoint = '/investments'; break;
        case 'loan': endpoint = '/loans'; break;
        case 'repayment': endpoint = '/repayments'; break;
        case 'moneyLent': endpoint = '/money-lent'; break;
        case 'income': endpoint = '/money-received'; break;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showNotification(`Record added successfully!`);
            closeModal();
            fetchSummary();
            if (currentView === 'transactions') fetchHistory();
        } else {
            const err = await response.json();
            alert(`Error: ${err.error}`);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
}

async function fetchLoans() {
    const res = await fetch(`${API_BASE}/loans`);
    return await res.json();
}

/** Utils **/
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK' }).format(amount);
}

function showNotification(message) {
    const notif = document.getElementById('notification');
    document.getElementById('notif-message').innerText = message;
    notif.classList.remove('hidden');
    setTimeout(() => notif.classList.add('hidden'), 3000);
}
