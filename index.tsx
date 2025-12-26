import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Sprout, 
  Users, 
  Wallet, 
  History, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Trash2, 
  Edit, 
  Plus, 
  Save, 
  X, 
  AlertTriangle,
  LogOut,
  LandPlot,
  PieChart,
  UserCheck,
  CreditCard,
  Briefcase,
  Coins,
  Download,
  Upload,
  Database,
  FileJson,
  CheckCircle2
} from 'lucide-react';

// --- Types ---

type PaymentSource = 'FARM_CASH' | 'FARM_BANK' | 'PARTNER';
type TransactionType = 'INCOME' | 'EXPENSE' | 'WORKER_ADVANCE' | 'PARTNER_CONTRIBUTION' | 'PARTNER_WITHDRAWAL';
type SeasonStatus = 'OPEN' | 'CLOSED';

interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: SeasonStatus;
}

interface Partner {
  id: string;
  name: string;
}

interface Worker {
  id: string;
  name: string;
  phone: string;
  joinedDate: string;
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  paymentSource: PaymentSource;
  payerPartnerId?: string; // If paymentSource is PARTNER
  category: string;
  description: string;
  seasonId: string;
  workerId?: string; // If advance
  partnerId?: string; // If partner transaction target (e.g. withdrawal by Girish)
}

// --- Initial Data ---

const INITIAL_PARTNERS: Partner[] = [
  { id: 'p1', name: 'Girish' },
  { id: 'p2', name: 'Dilip' },
];

const CATEGORIES = {
  INCOME: ['Crop Sale', 'By-product Sale', 'Subsidy', 'Other Income'],
  EXPENSE: ['Seeds', 'Fertilizer', 'Pesticides', 'Diesel/Fuel', 'Machinery Rent', 'Labor Wages', 'Repair', 'Other Expense'],
  WORKER_ADVANCE: ['Grocery', 'Medical', 'Personal Loan', 'Other'],
  PARTNER: ['Capital Injection', 'Personal Withdrawal']
};

// --- Helper Functions ---

const generateId = () => Math.random().toString(36).substr(2, 9);
const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

// --- Components ---

const App = () => {
  // State
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TRANSACTIONS' | 'SEASONS' | 'WORKERS' | 'PARTNERS' | 'DATA'>('DASHBOARD');
  
  // Data State with LocalStorage Persistence
  const [seasons, setSeasons] = useState<Season[]>(() => {
    try {
      const saved = localStorage.getItem('agri_seasons');
      return saved ? JSON.parse(saved) : [{ id: 's1', name: 'Potato Season 2025', startDate: '2025-01-01', status: 'OPEN' }];
    } catch (e) { return []; }
  });

  const [partners, setPartners] = useState<Partner[]>(() => {
    try {
      const saved = localStorage.getItem('agri_partners');
      return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
    } catch (e) { return INITIAL_PARTNERS; }
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    try {
      const saved = localStorage.getItem('agri_workers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('agri_transactions');
      let parsed = saved ? JSON.parse(saved) : [];
      // Migration: Add paymentSource if missing
      return parsed.map((t: any) => ({
        ...t,
        paymentSource: t.paymentSource || (t.mode === 'BANK' ? 'FARM_BANK' : 'FARM_CASH')
      }));
    } catch (e) { return []; }
  });

  // Persist Effects
  useEffect(() => localStorage.setItem('agri_seasons', JSON.stringify(seasons)), [seasons]);
  useEffect(() => localStorage.setItem('agri_partners', JSON.stringify(partners)), [partners]);
  useEffect(() => localStorage.setItem('agri_workers', JSON.stringify(workers)), [workers]);
  useEffect(() => localStorage.setItem('agri_transactions', JSON.stringify(transactions)), [transactions]);

  // Derived Calculations
  const activeSeason = seasons.find(s => s.status === 'OPEN') || seasons[0];

  const financials = useMemo(() => {
    let cash = 0;
    let bank = 0;
    let totalAdvances = 0;
    let partnerBalances: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpense = 0;
    
    partners.forEach(p => partnerBalances[p.id] = 0);

    transactions.forEach(t => {
      const amt = Number(t.amount);
      
      if (t.type === 'INCOME') totalIncome += amt;
      if (t.type === 'EXPENSE') totalExpense += amt;

      // 1. Calculate Farm Cash/Bank position
      if (t.paymentSource === 'FARM_CASH') {
        if (t.type === 'INCOME' || t.type === 'PARTNER_CONTRIBUTION') cash += amt;
        else cash -= amt;
      } else if (t.paymentSource === 'FARM_BANK') {
        if (t.type === 'INCOME' || t.type === 'PARTNER_CONTRIBUTION') bank += amt;
        else bank -= amt;
      }
      
      // 2. Partner Ledger Logic
      if (t.paymentSource === 'PARTNER' && t.payerPartnerId) {
        if (t.type === 'EXPENSE' || t.type === 'WORKER_ADVANCE') {
           // Partner paid from pocket for farm -> Farm Owes Partner (Credit)
          partnerBalances[t.payerPartnerId] = (partnerBalances[t.payerPartnerId] || 0) + amt;
        } else if (t.type === 'INCOME') {
           // Partner received income in pocket -> Partner Owes Farm (Debit)
           partnerBalances[t.payerPartnerId] = (partnerBalances[t.payerPartnerId] || 0) - amt;
        }
      }

      // Explicit Partner Contribution/Withdrawal
      if (t.type === 'PARTNER_CONTRIBUTION') {
        // Increases their stake
        if (t.partnerId) partnerBalances[t.partnerId] = (partnerBalances[t.partnerId] || 0) + amt;
      } else if (t.type === 'PARTNER_WITHDRAWAL') {
        // Decreases their stake
        if (t.partnerId) partnerBalances[t.partnerId] = (partnerBalances[t.partnerId] || 0) - amt;
      }

      // 3. Worker Advances
      if (t.type === 'WORKER_ADVANCE') {
        totalAdvances += amt;
      }
    });

    // Profit Sharing Estimation (80% for partners, split equally)
    // Note: This is purely for display "Estimated Share", not ledger balance
    const netFarmProfit = (totalIncome - totalExpense);
    const partnersShareTotal = netFarmProfit * 0.80; // 80% remains after 20% worker share logic
    const sharePerPartner = partnersShareTotal / (partners.length || 1);

    return { cash, bank, totalAdvances, partnerBalances, sharePerPartner };
  }, [transactions, partners]);

  // --- CRUD Operations ---

  const addTransaction = (t: Transaction) => setTransactions(prev => [t, ...prev]);
  const updateTransaction = (t: Transaction) => setTransactions(prev => prev.map(x => x.id === t.id ? t : x));
  
  // Custom Delete Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const performDelete = () => {
    if (deleteId) {
      setTransactions(prev => prev.filter(t => t.id !== deleteId));
      setDeleteId(null);
    }
  };

  const addWorker = (w: Worker) => setWorkers(prev => [...prev, w]);
  const deleteWorker = (id: string) => {
    // Check if worker has transactions
    const hasHistory = transactions.some(t => t.workerId === id);
    if (hasHistory) {
      alert("Cannot delete this worker because they have linked transactions. Please delete their transactions first.");
      return;
    }
    if (confirm("Are you sure you want to delete this worker profile?")) {
      setWorkers(prev => prev.filter(w => w.id !== id));
    }
  };

  const addSeason = (s: Season) => setSeasons(prev => [s, ...prev]);

  // --- Data Management Functions ---
  const handleExportData = () => {
    const data = {
      transactions,
      workers,
      partners,
      seasons,
      meta: {
        exportDate: new Date().toISOString(),
        version: "1.2"
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgriBooks_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.transactions && json.seasons) {
          if (confirm("WARNING: importing data will replace all current data on this device. Are you sure?")) {
            setTransactions(json.transactions);
            setWorkers(json.workers || []);
            setPartners(json.partners || INITIAL_PARTNERS);
            setSeasons(json.seasons);
            alert("Data restored successfully!");
          }
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Error reading file");
      }
    };
    reader.readAsText(file);
  };
  
  // --- View Components ---

  const Dashboard = () => (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cash Card */}
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2">
            <Wallet size={100} />
          </div>
          <div className="flex items-center gap-3 text-emerald-800 mb-2 relative z-10">
            <div className="p-2 bg-emerald-200 rounded-lg"><Wallet className="w-5 h-5" /></div>
            <h3 className="font-bold text-lg">Farm Cash</h3>
          </div>
          <p className={`text-3xl font-extrabold relative z-10 ${financials.cash < 0 ? 'text-red-600' : 'text-emerald-900'}`}>
            {formatCurrency(financials.cash)}
          </p>
          <p className="text-xs text-emerald-700 mt-2 font-medium">Physical Cash Box</p>
        </div>
        
        {/* Bank Card */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden">
           <div className="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2">
            <LandPlot size={100} />
          </div>
          <div className="flex items-center gap-3 text-blue-800 mb-2 relative z-10">
            <div className="p-2 bg-blue-200 rounded-lg"><LandPlot className="w-5 h-5" /></div>
            <h3 className="font-bold text-lg">Bank Balance</h3>
          </div>
          <p className={`text-3xl font-extrabold relative z-10 ${financials.bank < 0 ? 'text-red-600' : 'text-blue-900'}`}>
            {formatCurrency(financials.bank)}
          </p>
          <p className="text-xs text-blue-700 mt-2 font-medium">Linked Farm Accounts</p>
        </div>

        {/* Advances Card */}
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 shadow-sm relative overflow-hidden">
           <div className="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2">
            <Users size={100} />
          </div>
          <div className="flex items-center gap-3 text-orange-800 mb-2 relative z-10">
            <div className="p-2 bg-orange-200 rounded-lg"><Users className="w-5 h-5" /></div>
            <h3 className="font-bold text-lg">Worker Advances</h3>
          </div>
          <p className="text-3xl font-extrabold text-orange-900 relative z-10">
            {formatCurrency(financials.totalAdvances)}
          </p>
          <p className="text-xs text-orange-700 mt-2 font-medium">Recoverable from Settlements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {partners.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
             <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Net Balance</p>
                <p className="font-bold text-lg text-gray-800">{p.name}</p>
             </div>
             <div className="text-right">
                <p className={`font-mono font-bold text-xl ${financials.partnerBalances[p.id] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financials.partnerBalances[p.id] || 0)}
                </p>
                <p className="text-[10px] text-gray-500">{financials.partnerBalances[p.id] >= 0 ? '(Credit/Invested)' : '(Withdrawn/Held)'}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5" /> Recent Activity
        </h3>
        <TransactionList 
          transactions={transactions.slice(0, 5)} 
          seasons={seasons} 
          partners={partners} 
          workers={workers}
          onDelete={setDeleteId}
          onEdit={() => setActiveTab('TRANSACTIONS')} 
          readonly
        />
      </div>
    </div>
  );

  const SeasonsView = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [newSeasonName, setNewSeasonName] = useState('');

    const handleCreateSeason = () => {
      if (!newSeasonName) return;
      const newSeason: Season = {
        id: generateId(),
        name: newSeasonName,
        startDate: new Date().toISOString().split('T')[0],
        status: 'OPEN'
      };
      addSeason(newSeason);
      setIsCreating(false);
      setNewSeasonName('');
    };

    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Seasons</h2>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200"
          >
            <Plus className="w-4 h-4" /> New Season
          </button>
        </div>

        {isCreating && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 animate-in slide-in-from-top-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Season Name</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900" 
                placeholder="e.g., Potato 2026"
                value={newSeasonName}
                onChange={e => setNewSeasonName(e.target.value)}
              />
              <button onClick={handleCreateSeason} className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium">Create</button>
              <button onClick={() => setIsCreating(false)} className="text-gray-600 px-4 py-2">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {seasons.map(season => (
            <SeasonCard 
              key={season.id} 
              season={season} 
              transactions={transactions.filter(t => t.seasonId === season.id)}
              workers={workers}
              onCloseSeason={(id) => {
                setSeasons(prev => prev.map(s => s.id === id ? { ...s, status: 'CLOSED', endDate: new Date().toISOString().split('T')[0] } : s));
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const WorkersView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [newWorker, setNewWorker] = useState<Partial<Worker>>({});

    const handleAdd = () => {
      if (!newWorker.name) return;
      addWorker({
        id: generateId(),
        name: newWorker.name,
        phone: newWorker.phone || '',
        joinedDate: new Date().toISOString().split('T')[0]
      });
      setIsAdding(false);
      setNewWorker({});
    };

    return (
      <div className="space-y-6 pb-20 md:pb-0">
         <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Workers (Bhaiya Ji)</h2>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200"
          >
            <Plus className="w-4 h-4" /> Add Worker
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                placeholder="Name" 
                className="p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" 
                value={newWorker.name || ''} 
                onChange={e => setNewWorker(prev => ({ ...prev, name: e.target.value }))}
              />
              <input 
                placeholder="Phone (Optional)" 
                className="p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                value={newWorker.phone || ''}
                onChange={e => setNewWorker(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium">Save</button>
              <button onClick={() => setIsAdding(false)} className="text-gray-600 px-4 py-2">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workers.map(worker => {
            const workerAdvances = transactions
              .filter(t => t.type === 'WORKER_ADVANCE' && t.workerId === worker.id)
              .reduce((sum, t) => sum + Number(t.amount), 0);

            return (
              <div key={worker.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:border-emerald-300 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-700">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{worker.name}</h3>
                    <p className="text-sm text-gray-500">{worker.phone || 'No Phone'}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Joined: {worker.joinedDate}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Debt</p>
                    <p className="text-xl font-bold text-orange-600">{formatCurrency(workerAdvances)}</p>
                  </div>
                  <button 
                    onClick={() => deleteWorker(worker.id)}
                    className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Worker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {workers.length === 0 && <p className="text-gray-500 italic p-4 bg-white rounded-lg border border-dashed border-gray-300">No workers added yet.</p>}
        </div>
      </div>
    );
  };

  const TransactionManager = () => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
          <button 
            onClick={() => { setEditingId(null); setIsFormOpen(true); }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>

        {isFormOpen && (
          <TransactionForm 
            initialData={editingId ? transactions.find(t => t.id === editingId) : undefined}
            onSave={(t) => {
              if (editingId) updateTransaction(t);
              else addTransaction(t);
              setIsFormOpen(false);
              setEditingId(null);
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingId(null);
            }}
            seasons={seasons}
            workers={workers}
            partners={partners}
          />
        )}

        <TransactionList 
          transactions={transactions} 
          seasons={seasons} 
          partners={partners} 
          workers={workers}
          onEdit={(id) => {
            setEditingId(id);
            setIsFormOpen(true);
            window.scrollTo(0, 0);
          }}
          onDelete={setDeleteId}
        />
      </div>
    );
  };

  const DataManagementView = () => {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           <Database className="w-6 h-6 text-emerald-600" /> Data Backup & Restore
         </h2>
         
         <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="p-6 bg-emerald-50 border-b border-emerald-100">
               <h3 className="font-bold text-emerald-900 text-lg mb-1">Why do I need this?</h3>
               <p className="text-sm text-emerald-700">
                 Since this app is free and secure, data is stored only on this device. 
                 To share data between partners (Girish & Dilip), download the backup and send the file via WhatsApp.
               </p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Export Section */}
               <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">1. Download Data</h4>
                      <p className="text-xs text-gray-500">Save current data to a file</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click below to download a <code>.json</code> file. Send this file to your partner.
                  </p>
                  <button 
                    onClick={handleExportData}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <FileJson className="w-5 h-5" /> Download Backup File
                  </button>
               </div>

               {/* Import Section */}
               <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">2. Restore Data</h4>
                      <p className="text-xs text-gray-500">Load data from a file</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Select the <code>.json</code> file you received. 
                    <span className="block text-red-600 font-bold text-xs mt-1">WARNING: This replaces current data!</span>
                  </p>
                  <label className="w-full py-3 bg-white border-2 border-dashed border-orange-300 hover:border-orange-500 text-orange-600 font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-orange-50">
                    <Upload className="w-5 h-5" /> Select Backup File
                    <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                  </label>
               </div>
            </div>
         </div>

         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-700 text-sm mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Best Practice Workflow
            </h4>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 ml-1">
              <li>Girish adds transactions during the day.</li>
              <li>In the evening, Girish clicks <b>Download Backup</b>.</li>
              <li>Girish sends the file to Dilip via WhatsApp.</li>
              <li>Dilip opens the app, clicks <b>Restore Data</b>, and selects the file.</li>
              <li>Now both partners have the same data!</li>
            </ol>
         </div>
      </div>
    );
  };

  const PartnersView = () => (
    <div className="space-y-6 pb-20 md:pb-0">
       <h2 className="text-2xl font-bold text-gray-800">Partner Accounts</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {partners.map(partner => {
           // Calculations
           // 1. Direct Contributions
           const directContribution = transactions
             .filter(t => t.partnerId === partner.id && t.type === 'PARTNER_CONTRIBUTION')
             .reduce((sum, t) => sum + Number(t.amount), 0);
           
           // 2. Expenses Paid Personally
           const expensesPaid = transactions
             .filter(t => t.paymentSource === 'PARTNER' && t.payerPartnerId === partner.id && t.type === 'EXPENSE')
             .reduce((sum, t) => sum + Number(t.amount), 0);

           // 3. Worker Advances Paid Personally
           const advancesPaid = transactions
             .filter(t => t.paymentSource === 'PARTNER' && t.payerPartnerId === partner.id && t.type === 'WORKER_ADVANCE')
             .reduce((sum, t) => sum + Number(t.amount), 0);

           // 4. Income Received Personally (Deduction from their balance with farm)
           const incomeReceived = transactions
             .filter(t => t.paymentSource === 'PARTNER' && t.payerPartnerId === partner.id && t.type === 'INCOME')
             .reduce((sum, t) => sum + Number(t.amount), 0);

           const totalInvested = directContribution + expensesPaid + advancesPaid;

           const withdrawal = transactions
             .filter(t => t.partnerId === partner.id && t.type === 'PARTNER_WITHDRAWAL')
             .reduce((sum, t) => sum + Number(t.amount), 0);
            
           // Ledger Balance
           const netBalance = totalInvested - withdrawal - incomeReceived;

           return (
             <div key={partner.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-700">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{partner.name}</h3>
                    <p className="text-xs text-gray-500">Partner</p>
                  </div>
               </div>
               
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">Direct Cash Injection</span>
                   <span className="font-medium text-emerald-600">{formatCurrency(directContribution)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">Expenses Paid Personally</span>
                   <span className="font-medium text-emerald-600">{formatCurrency(expensesPaid)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">Advances Paid Personally</span>
                   <span className="font-medium text-emerald-600">{formatCurrency(advancesPaid)}</span>
                 </div>

                 {incomeReceived > 0 && (
                   <div className="flex justify-between items-center text-sm text-red-600 bg-red-50 p-1 px-2 rounded">
                     <span>Income Collected (Pocket)</span>
                     <span className="font-medium">-{formatCurrency(incomeReceived)}</span>
                   </div>
                 )}
                 
                 <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                   <span className="text-gray-500">Total Withdrawn</span>
                   <span className="font-bold text-red-600">-{formatCurrency(withdrawal)}</span>
                 </div>
                 
                 <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                   <span className="font-bold text-gray-800 text-lg">Net Invested</span>
                   <span className={`font-bold text-xl ${netBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                     {formatCurrency(netBalance)}
                   </span>
                 </div>

                 {/* Profit Estimation Section */}
                 <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center gap-2 mb-2 text-yellow-800 font-bold text-xs uppercase tracking-wider">
                      <Coins className="w-4 h-4" /> Estimated Season Share
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Farm Net Profit (50% Share)</span>
                      <span className={`font-bold text-lg ${financials.sharePerPartner >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {formatCurrency(financials.sharePerPartner)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      *Reflects 50% of (Total Income - Total Expense - Worker Share). This is not cash in hand, but your share of the profit.
                    </p>
                 </div>
               </div>
             </div>
           );
         })}
       </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'DASHBOARD': return <Dashboard />;
      case 'TRANSACTIONS': return <TransactionManager />;
      case 'SEASONS': return <SeasonsView />;
      case 'WORKERS': return <WorkersView />;
      case 'PARTNERS': return <PartnersView />;
      case 'DATA': return <DataManagementView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f0fdf4] font-sans text-gray-900">
      {/* Mobile Nav Header */}
      <div className="md:hidden bg-emerald-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-emerald-300" />
          <h1 className="text-lg font-bold">AgriBooks</h1>
        </div>
        <button onClick={() => setActiveTab('DATA')} className="text-emerald-200 hover:text-white flex flex-col items-center">
          <Database className="w-5 h-5" />
          <span className="text-[10px]">Data</span>
        </button>
      </div>

      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col bg-emerald-900 text-white w-64 flex-shrink-0 h-screen sticky top-0">
        <div className="p-6 flex items-center gap-2">
          <Sprout className="w-8 h-8 text-emerald-300" />
          <h1 className="text-xl font-bold">AgriBooks</h1>
        </div>
        <nav className="px-4 py-2 space-y-1 flex-1">
          <NavButton icon={<PieChart />} label="Dashboard" active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} />
          <NavButton icon={<DollarSign />} label="Transactions" active={activeTab === 'TRANSACTIONS'} onClick={() => setActiveTab('TRANSACTIONS')} />
          <NavButton icon={<Calendar />} label="Seasons" active={activeTab === 'SEASONS'} onClick={() => setActiveTab('SEASONS')} />
          <NavButton icon={<Users />} label="Workers" active={activeTab === 'WORKERS'} onClick={() => setActiveTab('WORKERS')} />
          <NavButton icon={<TrendingUp />} label="Partners" active={activeTab === 'PARTNERS'} onClick={() => setActiveTab('PARTNERS')} />
          <div className="pt-4 mt-4 border-t border-emerald-800">
             <NavButton icon={<Database />} label="Backup / Restore" active={activeTab === 'DATA'} onClick={() => setActiveTab('DATA')} />
          </div>
        </nav>
        <div className="p-6 bg-emerald-950">
          <p className="text-xs text-emerald-400">System Built: Dec 25, 2025</p>
          <p className="text-xs text-emerald-500">Updated: Dec 26, 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-20 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <MobileNavBtn icon={<PieChart />} label="Home" active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} />
        <MobileNavBtn icon={<DollarSign />} label="Trans" active={activeTab === 'TRANSACTIONS'} onClick={() => setActiveTab('TRANSACTIONS')} />
        <MobileNavBtn icon={<Calendar />} label="Seasons" active={activeTab === 'SEASONS'} onClick={() => setActiveTab('SEASONS')} />
        <MobileNavBtn icon={<Users />} label="Workers" active={activeTab === 'WORKERS'} onClick={() => setActiveTab('WORKERS')} />
        <MobileNavBtn icon={<TrendingUp />} label="Partners" active={activeTab === 'PARTNERS'} onClick={() => setActiveTab('PARTNERS')} />
      </div>

      {/* Global Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
             <div className="flex flex-col items-center text-center">
               <div className="bg-red-100 p-3 rounded-full text-red-600 mb-4">
                 <AlertTriangle className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Transaction?</h3>
               <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this record? This action cannot be undone and will affect your financial balances.</p>
               <div className="flex gap-3 w-full">
                 <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                 <button onClick={performDelete} className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 shadow-md shadow-red-200">Delete</button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Components ---

const NavButton = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span className="font-medium">{label}</span>
  </button>
);

const MobileNavBtn = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-lg ${active ? 'text-emerald-700 bg-emerald-50' : 'text-gray-400'}`}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);

const TransactionForm = ({ initialData, onSave, onCancel, seasons, workers, partners }: any) => {
  const [formData, setFormData] = useState<Partial<Transaction>>(initialData || {
    date: new Date().toISOString().split('T')[0],
    paymentSource: 'FARM_CASH',
    type: 'EXPENSE',
    seasonId: seasons.find((s: Season) => s.status === 'OPEN')?.id || seasons[0]?.id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.seasonId) return;
    
    // Safety check for partner payment
    if (formData.paymentSource === 'PARTNER' && !formData.payerPartnerId) {
      alert('Please select which partner is involved.');
      return;
    }

    onSave({
      id: initialData?.id || generateId(),
      ...formData,
      amount: Number(formData.amount)
    } as Transaction);
  };

  const getSourceLabel = () => {
    if (formData.type === 'INCOME') return "Deposit To (Where received?)";
    return "Payment Source (Who paid?)";
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100 mb-6 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {initialData ? <Edit className="w-5 h-5 text-emerald-600" /> : <Plus className="w-5 h-5 text-emerald-600" />}
          {initialData ? 'Edit Transaction' : 'New Transaction'}
        </h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full"><X className="w-6 h-6" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Row 1: Date & Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
          <input 
            type="date" 
            required
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (₹)</label>
          <input 
            type="number" 
            required
            min="0"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono text-lg text-gray-900"
            value={formData.amount || ''}
            onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
          />
        </div>
        
        {/* Row 2: Type & Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Transaction Type</label>
          <select 
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType, category: '' })}
          >
            <option value="INCOME">Income (Sale)</option>
            <option value="EXPENSE">Expense (Farm Cost)</option>
            <option value="WORKER_ADVANCE">Worker Advance</option>
            <option value="PARTNER_CONTRIBUTION">Partner Contribution (In)</option>
            <option value="PARTNER_WITHDRAWAL">Partner Withdrawal (Out)</option>
          </select>
        </div>

        <div>
           <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
           <select 
             className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900"
             value={formData.category || ''}
             onChange={e => setFormData({ ...formData, category: e.target.value })}
           >
              <option value="">-- Select --</option>
              {formData.type === 'INCOME' && CATEGORIES.INCOME.map(c => <option key={c} value={c}>{c}</option>)}
              {formData.type === 'EXPENSE' && CATEGORIES.EXPENSE.map(c => <option key={c} value={c}>{c}</option>)}
              {formData.type === 'WORKER_ADVANCE' && CATEGORIES.WORKER_ADVANCE.map(c => <option key={c} value={c}>{c}</option>)}
              {formData.type && formData.type.startsWith('PARTNER') && CATEGORIES.PARTNER.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
         </div>

        {/* Row 3: Paid From / Source */}
        <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
           <label className="block text-sm font-bold text-gray-800 mb-2">{getSourceLabel()}</label>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <select 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                  value={formData.paymentSource}
                  onChange={e => setFormData({ ...formData, paymentSource: e.target.value as PaymentSource, payerPartnerId: '' })}
                >
                  <option value="FARM_CASH">Farm Cash (Galla)</option>
                  <option value="FARM_BANK">Farm Bank Account</option>
                  <option value="PARTNER">Partner Personal Pocket</option>
                </select>
             </div>
             
             {formData.paymentSource === 'PARTNER' && (
                <div className="animate-in fade-in slide-in-from-left-2">
                   <select 
                     required
                     className="w-full p-2.5 border border-orange-300 bg-orange-50 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-orange-900"
                     value={formData.payerPartnerId || ''}
                     onChange={e => setFormData({ ...formData, payerPartnerId: e.target.value })}
                   >
                     <option value="">-- Select Partner --</option>
                     {partners.map((p: Partner) => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                   <p className="text-[10px] text-orange-700 mt-1">
                     {formData.type === 'INCOME' 
                       ? `* Money held by ${partners.find((p: Partner) => p.id === formData.payerPartnerId)?.name || 'partner'} (Debit)`
                       : `* Farm owes ${partners.find((p: Partner) => p.id === formData.payerPartnerId)?.name || 'partner'} (Credit)`
                     }
                   </p>
                </div>
             )}
           </div>
        </div>

        {/* Dynamic Fields */}
        {formData.type === 'WORKER_ADVANCE' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Worker (Bhaiya ji)</label>
            <select 
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
              value={formData.workerId || ''}
              onChange={e => setFormData({ ...formData, workerId: e.target.value })}
            >
              <option value="">-- Select Worker --</option>
              {workers.map((w: Worker) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        )}

        {(formData.type === 'PARTNER_CONTRIBUTION' || formData.type === 'PARTNER_WITHDRAWAL') && (
           <div className="md:col-span-2">
           <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target Partner</label>
           <select 
             required
             className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
             value={formData.partnerId || ''}
             onChange={e => setFormData({ ...formData, partnerId: e.target.value })}
           >
             <option value="">-- Select Partner --</option>
             {partners.map((p: Partner) => <option key={p.id} value={p.id}>{p.name}</option>)}
           </select>
         </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Season</label>
          <select 
            required
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
            value={formData.seasonId}
            onChange={e => setFormData({ ...formData, seasonId: e.target.value })}
          >
            {seasons.map((s: Season) => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea 
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
            rows={2}
            value={formData.description || ''}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 text-gray-600 font-semibold rounded-lg hover:bg-gray-100">Cancel</button>
        <button type="submit" className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2">
          <Save className="w-5 h-5" /> Save Record
        </button>
      </div>
    </form>
  );
};

const TransactionList = ({ transactions, seasons, partners, workers, onDelete, onEdit, readonly }: any) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  
  const filtered = transactions.filter((t: Transaction) => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    return true;
  });

  const getTypeStyle = (type: TransactionType) => {
    switch(type) {
      case 'INCOME': return 'bg-green-100 text-green-800 border-green-200';
      case 'EXPENSE': return 'bg-red-100 text-red-800 border-red-200';
      case 'WORKER_ADVANCE': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSourceLabel = (t: Transaction) => {
    if (t.paymentSource === 'FARM_CASH') return 'Farm Cash';
    if (t.paymentSource === 'FARM_BANK') return 'Farm Bank';
    if (t.paymentSource === 'PARTNER') {
        const p = partners.find((x: Partner) => x.id === t.payerPartnerId);
        if (t.type === 'INCOME') return `Received by ${p?.name || 'Partner'}`;
        return `Paid by ${p?.name || 'Partner'}`;
    }
    return 'Unknown';
  };

  return (
    <div>
      {!readonly && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
          <button onClick={() => setFilterType('ALL')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'ALL' ? 'bg-gray-800 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>All</button>
          <button onClick={() => setFilterType('INCOME')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'INCOME' ? 'bg-green-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-green-50'}`}>Income</button>
          <button onClick={() => setFilterType('EXPENSE')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'EXPENSE' ? 'bg-red-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-red-50'}`}>Expense</button>
          <button onClick={() => setFilterType('WORKER_ADVANCE')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'WORKER_ADVANCE' ? 'bg-orange-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-orange-50'}`}>Worker Advance</button>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filtered.map((t: Transaction) => {
          const season = seasons.find((s: Season) => s.id === t.seasonId);
          const worker = t.workerId ? workers.find((w: Worker) => w.id === t.workerId) : null;
          
          return (
            <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 relative">
               <div className="flex justify-between items-start mb-2">
                 <div className="flex flex-col">
                   <span className="text-gray-500 text-xs font-semibold">{t.date}</span>
                   <span className="font-bold text-gray-900 text-lg">{t.category}</span>
                 </div>
                 <span className={`text-xs px-2 py-1 rounded-md font-bold border ${getTypeStyle(t.type)}`}>
                    {t.type === 'WORKER_ADVANCE' ? 'ADVANCE' : t.type}
                  </span>
               </div>
               
               <p className="text-sm text-gray-600 mb-3">{t.description}</p>
               
               <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> {getSourceLabel(t)}
                  </span>
                  {worker && <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100 flex items-center gap-1"><UserCheck className="w-3 h-3" /> {worker.name}</span>}
                  {season && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1"><Calendar className="w-3 h-3" /> {season.name}</span>}
               </div>

               <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                 <span className={`text-xl font-bold ${['INCOME', 'PARTNER_CONTRIBUTION'].includes(t.type) ? 'text-emerald-600' : 'text-gray-800'}`}>
                    {['INCOME', 'PARTNER_CONTRIBUTION'].includes(t.type) ? '+' : '-'} {formatCurrency(t.amount)}
                 </span>
                 {!readonly && (
                   <div className="flex gap-3">
                      <button onClick={() => onEdit(t.id)} className="text-blue-600 font-medium text-sm flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"><Edit className="w-3.5 h-3.5" /> Edit</button>
                      <button onClick={() => onDelete(t.id)} className="text-red-600 font-medium text-sm flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                   </div>
                 )}
               </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              {!readonly && <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((t: Transaction) => {
              const season = seasons.find((s: Season) => s.id === t.seasonId);
              const worker = t.workerId ? workers.find((w: Worker) => w.id === t.workerId) : null;
              const partner = t.partnerId ? partners.find((p: Partner) => p.id === t.partnerId) : null;

              return (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-700 whitespace-nowrap">{t.date}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${getTypeStyle(t.type)}`}>
                      {t.type === 'WORKER_ADVANCE' ? 'ADVANCE' : t.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{t.category}</p>
                    <p className="text-xs text-gray-500">{t.description}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {season && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-medium">{season.name}</span>}
                      {worker && <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-100 font-medium">Worker: {worker.name}</span>}
                      {partner && <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100 font-medium">Partner: {partner.name}</span>}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {getSourceLabel(t)}
                  </td>
                  <td className={`p-4 text-right font-bold text-base ${['INCOME', 'PARTNER_CONTRIBUTION'].includes(t.type) ? 'text-emerald-700' : 'text-gray-800'}`}>
                    {['INCOME', 'PARTNER_CONTRIBUTION'].includes(t.type) ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  {!readonly && (
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-2">
                         <button onClick={() => onEdit(t.id)} className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                         <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-12 text-center text-gray-400">No transactions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SeasonCard = ({ season, transactions, workers, onCloseSeason }: any) => {
  // Logic: 20% Rule
  const income = transactions.filter((t: Transaction) => t.type === 'INCOME').reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
  const expense = transactions.filter((t: Transaction) => t.type === 'EXPENSE').reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
  
  const workerGrossShare = income * 0.20;
  const workerExpenseShare = expense * 0.20;
  const workerNetShare = workerGrossShare - workerExpenseShare;

  // Calculate total advances taken by workers during this season
  const seasonAdvances = transactions
    .filter((t: Transaction) => t.type === 'WORKER_ADVANCE' && t.seasonId === season.id)
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
  
  const finalPayable = workerNetShare - seasonAdvances;

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${season.status === 'OPEN' ? 'border-emerald-200' : 'border-gray-200 opacity-80'} overflow-hidden`}>
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" /> {season.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {season.startDate} - {season.endDate || 'Present'} 
            <span className={`ml-2 px-2.5 py-0.5 text-xs font-bold rounded-full ${season.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
              {season.status}
            </span>
          </p>
        </div>
        {season.status === 'OPEN' && (
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to CLOSE this season? This acts as the financial year end.')) {
                onCloseSeason(season.id);
              }
            }}
            className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-100 hover:bg-red-100 flex items-center gap-1 font-semibold"
          >
            <LogOut className="w-4 h-4" /> Close Season
          </button>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Farm Performance */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Farm Performance</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
              <span className="text-gray-600 font-medium">Total Revenue</span>
              <span className="font-bold text-emerald-600 text-lg">{formatCurrency(income)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
              <span className="text-gray-600 font-medium">Total Expenses</span>
              <span className="font-bold text-red-600 text-lg">{formatCurrency(expense)}</span>
            </div>
          </div>
          <div className="flex justify-between pt-3 border-t border-dashed border-gray-300">
            <span className="font-bold text-gray-800">Net Farm Profit</span>
            <span className={`font-bold text-xl ${(income - expense) >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
              {formatCurrency(income - expense)}
            </span>
          </div>
        </div>

        {/* Worker Calculation (The 20% Logic) */}
        <div className="bg-orange-50 p-5 rounded-xl space-y-4 border border-orange-100">
          <h4 className="text-xs font-bold text-orange-800 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4" /> Worker Share (20%)
          </h4>
          
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">20% of Income</span>
              <span className="font-bold text-gray-900">{formatCurrency(workerGrossShare)}</span>
            </div>
            <div className="flex justify-between text-red-700">
              <span className="font-medium">20% of Expense (Liability)</span>
              <span className="font-bold">-{formatCurrency(workerExpenseShare)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-orange-200/50">
             <div className="flex justify-between items-center mb-2">
               <span className="font-bold text-orange-900">Net Share Entitlement</span>
               <span className="font-bold text-orange-900">{formatCurrency(workerNetShare)}</span>
             </div>
             <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
               <span>Less: Advances Taken</span>
               <span>-{formatCurrency(seasonAdvances)}</span>
             </div>
             <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-orange-100">
               <span className="font-bold text-emerald-800">Final Payable</span>
               <span className={`font-black text-xl ${finalPayable >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                 {formatCurrency(finalPayable)}
               </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
