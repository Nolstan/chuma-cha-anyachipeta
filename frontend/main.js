const API_BASE = '/api';

// State
let currentView = 'dashboard';

// DOM Elements
const views = {
    dashboard: document.getElementById('dashboard'),
    transactions: document.getElementById('transactions'),
    tenants: document.getElementById('tenants')
};

const summary = {
    totalReceived: document.getElementById('total-received'),
    totalInvested: document.getElementById('total-invested'),
    totalLent: document.getElementById('total-lent'),
    totalLoans: document.getElementById('total-loans'),
    loansRemaining: document.getElementById('loans-remaining'),
    totalTenantAdvances: document.getElementById('total-tenant-advances'),
    netProfit: document.getElementById('net-profit'),
    profitCard: document.getElementById('profit-card'),
    profitIcon: document.getElementById('profit-icon'),
    profitLabel: document.getElementById('profit-label')
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
    if (viewId === 'tenants') {
        renderTenantsView();
    }
}

async function fetchSummary() {
    try {
        const response = await fetch(`${API_BASE}/summary`);
        const data = await response.json();
        window.globalHistoryData = data.history;
        window.globalTenantBreakdown = data.tenantBreakdown;

        summary.totalReceived.innerText = formatCurrency(data.totalReceived);
        summary.totalInvested.innerText = formatCurrency(data.totalInvested);
        summary.totalLent.innerText = formatCurrency(data.totalLent);
        summary.totalLoans.innerText = formatCurrency(data.totalLoansTaken);
        summary.loansRemaining.innerText = formatCurrency(data.loansRemaining);
        if(summary.totalTenantAdvances) summary.totalTenantAdvances.innerText = formatCurrency(data.totalTenantAdvances);

        // Calculate and theme Profit / Loss
        const netProfitValue = data.totalReceived - data.totalInvested;
        if (netProfitValue >= 0) {
            summary.netProfit.innerText = formatCurrency(netProfitValue);
            summary.profitCard.className = 'summary-card highlight';
            summary.profitIcon.className = 'card-icon income';
            summary.profitIcon.innerHTML = '<i data-lucide="trending-up"></i>';
            summary.profitLabel.innerText = 'Phindu (Profit) ✅';
        } else {
            summary.netProfit.innerText = '-' + formatCurrency(Math.abs(netProfitValue));
            summary.profitCard.className = 'summary-card warning';
            summary.profitIcon.className = 'card-icon expense';
            summary.profitIcon.innerHTML = '<i data-lucide="trending-down"></i>';
            summary.profitLabel.innerText = 'Kutaya (Loss) ❌';
        }
        
        lucide.createIcons();
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
            let endpointType = '';
            if (record.type === 'Mwagula' || record.type === 'Investment') endpointType = 'investments';
            else if (record.type === 'Ngongole ya' || record.type === 'Loan Taken') endpointType = 'loans';
            else if (record.type === 'Mwawezga Ngongole ya' || record.type === 'Loan Repayment') endpointType = 'repayments';
            else if (record.type === 'Mwabwelekeska' || record.type === 'Money Lent') endpointType = 'money-lent';
            else if (record.type === 'Income') endpointType = 'money-received';
            else if (record.type === 'Katundu wa Antchito') endpointType = 'tenant-advances';

            card.innerHTML = `
                <div class="record-info">
                    <h4>${record.type} ${record.category ? `(${record.category})` : ''} ${record.label ? `- ${record.label}` : ''}</h4>
                    <span>${new Date(record.date).toLocaleDateString()}</span>
                </div>
                <div class="record-actions">
                    <span class="record-amount ${record.color}">${record.color === 'expense' ? '-' : '+'}${formatCurrency(record.amount)}</span>
                    <button class="icon-btn edit-btn" onclick="editRecord('${record._id}', '${endpointType}')" title="Edit"><i data-lucide="edit"></i></button>
                    <button class="icon-btn delete-btn" onclick="deleteRecord('${record._id}', '${endpointType}')" title="Delete"><i data-lucide="trash-2"></i></button>
                </div>
            `;
            container.appendChild(card);
        });
        
        lucide.createIcons();
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
        case 'tenant':
            modalTitle.innerText = 'Tiyike Wantchito (Add Tenant)';
            addField('Dzina la Wantchito', 'name', 'text');
            break;
        case 'tenantAdvance':
            modalTitle.innerText = 'Zotenga Antchito';
            const tenants = await fetchTenants();
            if(tenants.length === 0) {
                alert('Chonde yambani mwawonjezera dzina la wantchito. (Please add a Tenant first using Tiyike Antchito).');
                closeModal();
                return;
            }
            addField('Ndalama (Value)', 'amount', 'number');
            addField('Zomwe Atenga (e.g. Ufa)', 'label', 'text');
            addSelect('Dzina la Wantchito', 'tenantName', tenants.map(t => ({ value: t.name, label: t.name })));
            addField('Tsiku (Date)', 'date', 'date', new Date().toISOString().split('T')[0]);
            break;
    }
    lucide.createIcons();
};

window.closeModal = function () {
    modal.classList.add('hidden');
    delete transactionForm.dataset.editId;
    delete transactionForm.dataset.editEndpoint;
};

window.deleteRecord = async function(id, endpointType) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
        const response = await fetch(`${API_BASE}/${endpointType}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showNotification('Record deleted successfully');
            fetchSummary();
            fetchHistory();
        } else {
            alert('Failed to delete record');
        }
    } catch (e) { console.error(e); }
};

window.archiveData = async function() {
    if (!confirm('TCHENJEZO: Izitseka deta yonse mu deshibodi yanu ndi kuyamba chaka chatsopano! (WARNING: This will clear the dashboard and start a new season. Your old data is safely stored in the database).')) return;
    try {
        const response = await fetch(`${API_BASE}/archive`, { method: 'POST' });
        if (response.ok) {
            showNotification('Season archived successfully!');
            fetchSummary();
            if (currentView === 'transactions') fetchHistory();
        } else {
            alert('Failed to archive season');
        }
    } catch (e) { console.error(e); }
};

window.editRecord = async function(id, endpointType) {
    let type = '', historyList = [];
    if (endpointType === 'investments') { type = 'investment'; historyList = window.globalHistoryData.investments; }
    if (endpointType === 'loans') { type = 'loan'; historyList = window.globalHistoryData.loans; }
    if (endpointType === 'repayments') { type = 'repayment'; historyList = window.globalHistoryData.repayments; }
    if (endpointType === 'money-lent') { type = 'moneyLent'; historyList = window.globalHistoryData.moneyLent; }
    if (endpointType === 'money-received') { type = 'income'; historyList = window.globalHistoryData.moneyReceived; }
    if (endpointType === 'tenant-advances') { type = 'tenantAdvance'; historyList = window.globalHistoryData.tenantAdvances; }

    const record = historyList.find(r => r._id === id);
    if (!record) return;

    await openModal(type);
    modalTitle.innerText = 'Edit ' + type.charAt(0).toUpperCase() + type.slice(1);
    
    transactionForm.dataset.editId = id;
    transactionForm.dataset.editEndpoint = endpointType;

    Object.keys(record).forEach(key => {
        const input = transactionForm.elements[key];
        if (input) {
            if (input.type === 'date') {
                input.value = new Date(record[key]).toISOString().split('T')[0];
            } else {
                input.value = record[key];
            }
        }
    });
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
        case 'tenantAdvance': endpoint = '/tenant-advances'; break;
        case 'tenant': endpoint = '/tenants'; break;
    }

    let url = `${API_BASE}${endpoint}`;
    let method = 'POST';

    if (transactionForm.dataset.editId) {
        url = `${API_BASE}/${transactionForm.dataset.editEndpoint}/${transactionForm.dataset.editId}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showNotification(method === 'POST' ? 'Record added successfully!' : 'Record updated successfully!');
            closeModal();
            fetchSummary();
            if (currentView === 'transactions') fetchHistory();
            if (currentView === 'tenants') renderTenantsView();
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

async function fetchTenants() {
    const res = await fetch(`${API_BASE}/tenants`);
    return await res.json();
}

/** Utils **/
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK' }).format(amount);
}

window.renderTenantsView = async function() {
    const container = document.getElementById('tenants-container');
    container.innerHTML = '<p class="text-muted">Loading...</p>';
    
    try {
        const tenants = await fetchTenants();
        const breakdown = window.globalTenantBreakdown || {};
        
        container.innerHTML = '';
        if (tenants.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Palibe wantchito anayikidwa system. (No tenants active yet).</p>';
            return;
        }
        
        tenants.forEach(t => {
            const nameKey = t.name.trim().toUpperCase();
            const owed = breakdown[nameKey] || 0;
            
            const card = document.createElement('div');
            card.className = 'history-card';
            card.innerHTML = `
                <div class="record-info">
                    <h4><i data-lucide="user" style="display:inline-block; vertical-align:middle; width:16px;"></i> ${t.name}</h4>
                    <span>Yolembedwa pa: ${new Date(t.date).toLocaleDateString()}</span>
                </div>
                <div class="record-actions">
                    <span class="record-amount expense">${owed > 0 ? '-' + formatCurrency(owed) : formatCurrency(0)}</span>
                </div>
            `;
            container.appendChild(card);
        });
        lucide.createIcons();
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p>Failed to load tenants</p>';
    }
};

function showNotification(message) {
    const notif = document.getElementById('notification');
    document.getElementById('notif-message').innerText = message;
    notif.classList.remove('hidden');
    setTimeout(() => notif.classList.add('hidden'), 3000);
}
