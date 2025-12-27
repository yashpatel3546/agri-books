import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Sprout, 
  Users, 
  Wallet, 
  History, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Trash2, 
  Edit, 
  Plus, 
  Save, 
  X, 
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
  ChevronRight,
  Lock,
  CheckCircle,
  Info,
  AlertCircle
} from 'lucide-react';

// --- Types ---

type PaymentSource = 'FARM_CASH' | 'FARM_BANK' | 'PARTNER';
type TransactionType = 'INCOME' | 'EXPENSE' | 'WORKER_ADVANCE' | 'PARTNER_CONTRIBUTION' | 'PARTNER_WITHDRAWAL';
type SeasonStatus = 'OPEN' | 'CLOSED';
type NotificationType = 'success' | 'error' | 'info';

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
  payerPartnerId?: string;
  category: string;
  description: string;
  seasonId: string;
  workerId?: string;
  partnerId?: string;
  includeInWorkerShare?: boolean;
}

interface CategoryMap {
  INCOME: string[];
  EXPENSE: string[];
  WORKER_ADVANCE: string[];
  PARTNER: string[];
}

// --- Initial Data ---

const INITIAL_PARTNERS: Partner[] = [
  { id: 'p1', name: 'Girish' },
  { id: 'p2', name: 'Dilip' },
];

const DEFAULT_CATEGORIES: CategoryMap = {
  INCOME: ['Crop Sale', 'By-product Sale', 'Subsidy', 'Other Income'],
  EXPENSE: ['Seeds', 'Fertilizer', 'Pesticides', 'Diesel/Fuel', 'Machinery Rent', 'Labor Wages', 'Repair', 'Other Expense'],
  WORKER_ADVANCE: ['Grocery', 'Medical', 'Personal Loan', 'Other'],
  PARTNER: ['Capital Injection', 'Personal Withdrawal']
};

// --- Helper Functions ---

const generateId = () => Math.random().toString(36).substr(2, 9);
const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

// --- SUB-COMPONENTS (Defined Outside App for Stability) ---

const NavButton = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span className="font-medium">{label}</span>
  </button>
);

const MobileNavBtn = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${active ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}
  >
    {React.cloneElement(icon, { size: 22 })}
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);

// --- View Components ---

const Dashboard = ({ financials, transactions, seasons, partners, workers, onDeleteTransaction, onEditTransaction, onViewAll }: any) => (
  <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div className="absolute right-0 top-0 opacity-[0.03] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
          <Wallet size={120} />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-500" /> Farm Cash</span>
          <span className={`text-3xl font-bold tracking-tight ${financials.cash < 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {formatCurrency(financials.cash)}
          </span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
         <div className="absolute right-0 top-0 opacity-[0.03] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
          <LandPlot size={120} />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2"><LandPlot className="w-4 h-4 text-blue-500" /> Bank Balance</span>
          <span className={`text-3xl font-bold tracking-tight ${financials.bank < 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {formatCurrency(financials.bank)}
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
         <div className="absolute right-0 top-0 opacity-[0.03] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
          <Users size={120} />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2"><Users className="w-4 h-4 text-orange-500" /> Worker Advances</span>
          <span className="text-3xl font-bold tracking-tight text-slate-900">
            {formatCurrency(financials.totalAdvances)}
          </span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {partners.map((p: Partner) => (
        <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                {p.name.charAt(0)}
              </div>
              <div>
                 <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Partner</p>
                 <p className="font-bold text-lg text-slate-800">{p.name}</p>
              </div>
           </div>
           <div className="text-right">
              <p className={`font-mono font-bold text-lg ${financials.partnerBalances[p.id] >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(financials.partnerBalances[p.id] || 0)}
              </p>
              <p className="text-[10px] text-slate-400">{financials.partnerBalances[p.id] >= 0 ? 'Invested' : 'Withdrawn'}</p>
           </div>
        </div>
      ))}
    </div>

    <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-slate-400" /> Recent Activity
        </h3>
        <button onClick={onViewAll} className="text-emerald-600 text-sm font-medium hover:underline flex items-center">View All <ChevronRight size={16}/></button>
      </div>
      <TransactionList 
        transactions={transactions.slice(0, 5)} 
        seasons={seasons} 
        partners={partners} 
        workers={workers}
        onDelete={onDeleteTransaction}
        onEdit={onEditTransaction} 
        readonly
      />
    </div>
  </div>
);

const SeasonsView = ({ seasons, transactions, workers, onAddSeason, onCloseSeason, onDeleteSeason }: any) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');

  const handleCreateSeason = () => {
    if (!newSeasonName) return;
    onAddSeason({
      id: generateId(),
      name: newSeasonName,
      startDate: new Date().toISOString().split('T')[0],
      status: 'OPEN'
    });
    setIsCreating(false);
    setNewSeasonName('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Seasons</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Season
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4 animate-in slide-in-from-top-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Season Name</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" 
              placeholder="e.g., Potato 2026"
              value={newSeasonName}
              onChange={e => setNewSeasonName(e.target.value)}
            />
            <button onClick={handleCreateSeason} className="bg-emerald-600 text-white px-6 rounded-xl font-medium">Create</button>
            <button onClick={() => setIsCreating(false)} className="text-slate-500 px-4">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {seasons.map((season: Season) => (
          <SeasonCard 
            key={season.id} 
            season={season} 
            transactions={transactions.filter((t: Transaction) => t.seasonId === season.id)}
            workers={workers}
            onCloseSeason={onCloseSeason}
            onDeleteSeason={onDeleteSeason}
          />
        ))}
      </div>
    </div>
  );
};

const SeasonCard = ({ season, transactions, workers, onCloseSeason, onDeleteSeason }: any) => {
  const incomeTransactions = transactions.filter((t: Transaction) => t.type === 'INCOME' && t.includeInWorkerShare !== false);
  const expenseTransactions = transactions.filter((t: Transaction) => t.type === 'EXPENSE' && t.includeInWorkerShare !== false);

  const totalIncome = transactions.filter((t: Transaction) => t.type === 'INCOME').reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter((t: Transaction) => t.type === 'EXPENSE').reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
  
  const workerIncomeBase = incomeTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
  const workerExpenseBase = expenseTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

  const workerGrossShare = workerIncomeBase * 0.20;
  const workerExpenseShare = workerExpenseBase * 0.20;
  const workerNetShare = workerGrossShare - workerExpenseShare;

  const seasonAdvances = transactions
    .filter((t: Transaction) => t.type === 'WORKER_ADVANCE' && t.seasonId === season.id)
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
  
  const finalPayable = workerNetShare - seasonAdvances;

  return (
    <div className={`bg-white rounded-3xl shadow-sm border ${season.status === 'OPEN' ? 'border-emerald-200' : 'border-slate-200 grayscale'} overflow-hidden transition-all hover:shadow-md`}>
      <div className={`p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${season.status === 'OPEN' ? 'bg-slate-50/50' : 'bg-slate-100'}`}>
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {season.status === 'OPEN' ? <Sprout className="w-5 h-5 text-emerald-600" /> : <Lock className="w-5 h-5 text-slate-500" />}
            {season.name}
          </h3>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> {season.startDate} - {season.endDate || 'Present'} 
            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${season.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
              {season.status}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {season.status === 'OPEN' && (
            <button 
              onClick={() => onCloseSeason(season.id)}
              className="text-sm bg-white text-rose-600 px-4 py-2 rounded-xl border border-rose-100 hover:bg-rose-50 flex items-center gap-2 font-semibold shadow-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> Close Season
            </button>
          )}
          <button 
            onClick={() => onDeleteSeason(season.id)}
            className="text-sm bg-white text-gray-500 px-4 py-2 rounded-xl border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 flex items-center gap-2 font-semibold shadow-sm transition-colors"
            title="Delete Season"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className={`p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 ${season.status === 'CLOSED' ? 'opacity-70' : ''}`}>
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <LandPlot className="w-4 h-4" /> Farm Performance
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
              <span className="text-slate-600 font-medium text-sm">Total Revenue</span>
              <span className="font-bold text-emerald-600 text-lg">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-rose-50/50 border border-rose-100/50">
              <span className="text-slate-600 font-medium text-sm">Total Expenses</span>
              <span className="font-bold text-rose-600 text-lg">{formatCurrency(totalExpense)}</span>
            </div>
          </div>
          <div className="flex justify-between pt-4 border-t border-dashed border-slate-200">
            <span className="font-bold text-slate-900">Net Farm Profit</span>
            <span className={`font-bold text-2xl ${(totalIncome - totalExpense) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatCurrency(totalIncome - totalExpense)}
            </span>
          </div>
        </div>

        <div className="bg-amber-50/50 p-6 rounded-2xl space-y-5 border border-amber-100/50">
          <div className="flex justify-between items-start">
             <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-2">
               <Users className="w-4 h-4" /> Worker Share (20%)
             </h4>
             { (totalIncome !== workerIncomeBase || totalExpense !== workerExpenseBase) && (
               <span className="text-[10px] bg-white px-2 py-1 rounded-md text-amber-600 border border-amber-100 font-medium" title="Some transactions were excluded from this calculation">
                 *Adjusted Base
               </span>
             )}
          </div>
          
          <div className="text-sm space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">20% of Income</span>
              <span className="font-bold text-slate-900">{formatCurrency(workerGrossShare)}</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span className="font-medium">20% of Expense (Liability)</span>
              <span className="font-bold">-{formatCurrency(workerExpenseShare)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-amber-200/50">
             <div className="flex justify-between items-center mb-2">
               <span className="font-bold text-amber-900 text-sm">Net Share Entitlement</span>
               <span className="font-bold text-amber-900">{formatCurrency(workerNetShare)}</span>
             </div>
             <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
               <span>Less: Advances Taken</span>
               <span>-{formatCurrency(seasonAdvances)}</span>
             </div>
             <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-amber-100">
               <span className="font-bold text-slate-800">Final Payable</span>
               <span className={`font-black text-xl ${finalPayable >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                 {formatCurrency(finalPayable)}
               </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkersView = ({ workers, transactions, onAddWorker, onDeleteWorker }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newWorker, setNewWorker] = useState<Partial<Worker>>({});

  const handleAdd = () => {
    if (!newWorker.name) return;
    onAddWorker({
      id: generateId(),
      name: newWorker.name,
      phone: newWorker.phone || '',
      joinedDate: new Date().toISOString().split('T')[0]
    });
    setIsAdding(false);
    setNewWorker({});
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Workers (Bhaiya Ji)</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add Worker
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input 
              placeholder="Name" 
              className="px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-50 text-slate-900" 
              value={newWorker.name || ''} 
              onChange={e => setNewWorker(prev => ({ ...prev, name: e.target.value }))}
            />
            <input 
              placeholder="Phone (Optional)" 
              className="px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-50 text-slate-900"
              value={newWorker.phone || ''}
              onChange={e => setNewWorker(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium">Save</button>
            <button onClick={() => setIsAdding(false)} className="text-slate-500 px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workers.map((worker: Worker) => {
          const workerAdvances = transactions
            .filter((t: Transaction) => t.type === 'WORKER_ADVANCE' && t.workerId === worker.id)
            .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

          return (
            <div key={worker.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center hover:border-emerald-200 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{worker.name}</h3>
                  <p className="text-sm text-slate-500">{worker.phone || 'No Phone'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Joined: {worker.joinedDate}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Debt</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(workerAdvances)}</p>
                </div>
                <button 
                  onClick={() => onDeleteWorker(worker.id)}
                  className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                  title="Delete Worker"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
        {workers.length === 0 && <p className="text-slate-400 italic p-6 text-center w-full">No workers added yet.</p>}
      </div>
    </div>
  );
};

const TransactionManager = ({ transactions, seasons, partners, workers, categories, onAddTransaction, onUpdateTransaction, onDeleteTransaction, onAddCategory, onNotify }: any) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Transactions</h2>
        <button 
          onClick={() => { setEditingId(null); setIsFormOpen(true); }}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add New
        </button>
      </div>

      {isFormOpen && (
        <TransactionForm 
          initialData={editingId ? transactions.find((t: Transaction) => t.id === editingId) : undefined}
          onSave={(t: Transaction) => {
            if (editingId) onUpdateTransaction(t);
            else onAddTransaction(t);
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
          categories={categories}
          onAddCategory={onAddCategory}
          onNotify={onNotify}
        />
      )}

      <TransactionList 
        transactions={transactions} 
        seasons={seasons} 
        partners={partners} 
        workers={workers}
        onEdit={(id: string) => {
          setEditingId(id);
          setIsFormOpen(true);
          window.scrollTo(0, 0);
        }}
        onDelete={onDeleteTransaction}
      />
    </div>
  );
};

const TransactionForm = ({ initialData, onSave, onCancel, seasons, workers, partners, categories, onAddCategory, onNotify }: any) => {
  const [formData, setFormData] = useState<Partial<Transaction>>(initialData || {
    date: new Date().toISOString().split('T')[0],
    paymentSource: 'FARM_CASH',
    type: 'EXPENSE',
    seasonId: seasons.find((s: Season) => s.status === 'OPEN')?.id || seasons[0]?.id || '',
    includeInWorkerShare: true
  });
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.seasonId) return;
    
    if (formData.paymentSource === 'PARTNER' && !formData.payerPartnerId) {
      onNotify('Please select which partner is involved.', 'error');
      return;
    }

    onSave({
      id: initialData?.id || generateId(),
      ...formData,
      amount: Number(formData.amount)
    } as Transaction);
  };

  const handleCreateCategory = () => {
    if (newCategoryName && formData.type) {
      // @ts-ignore
      onAddCategory(formData.type, newCategoryName);
      setFormData({ ...formData, category: newCategoryName });
      setIsAddingCategory(false);
      setNewCategoryName('');
    }
  };

  const currentCategories = (formData.type && categories[formData.type as keyof CategoryMap]) || [];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
             {initialData ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
          {initialData ? 'Edit Transaction' : 'New Transaction'}
        </h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-6 h-6" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-sm font-semibold text-slate-500 mb-2">Date</label>
          <input 
            type="date" 
            required
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 font-medium"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-500 mb-2">Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400">₹</span>
            <input 
              type="number" 
              required
              min="0"
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono text-lg text-slate-900 font-bold"
              value={formData.amount || ''}
              onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
            />
          </div>
        </div>
        
        {/* Row 2: Type & Category */}
        <div>
          <label className="block text-sm font-semibold text-slate-500 mb-2">Transaction Type</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium cursor-pointer"
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
           <label className="block text-sm font-semibold text-slate-500 mb-2">Category</label>
           {!isAddingCategory ? (
             <select 
               className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium cursor-pointer"
               value={formData.category || ''}
               onChange={e => {
                 if (e.target.value === '__NEW__') {
                   setIsAddingCategory(true);
                 } else {
                   setFormData({ ...formData, category: e.target.value });
                 }
               }}
             >
                <option value="">-- Select --</option>
                {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__NEW__" className="font-bold text-emerald-600">+ Create New...</option>
             </select>
           ) : (
             <div className="flex gap-2">
                <input 
                  type="text"
                  autoFocus
                  placeholder="Enter new category..."
                  className="flex-1 px-4 py-3 bg-white border border-emerald-500 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
                <button type="button" onClick={handleCreateCategory} className="bg-emerald-600 text-white px-4 rounded-xl font-medium">Add</button>
                <button type="button" onClick={() => setIsAddingCategory(false)} className="text-slate-400 px-2"><X size={20}/></button>
             </div>
           )}
         </div>

         {(formData.type === 'INCOME' || formData.type === 'EXPENSE') && (
            <div className="md:col-span-2">
               <label className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                    checked={formData.includeInWorkerShare !== false}
                    onChange={e => setFormData({ ...formData, includeInWorkerShare: e.target.checked })}
                  />
                  <div>
                    <span className="block font-bold text-emerald-900 text-sm">Apply 20% Worker Share?</span>
                    <span className="block text-xs text-emerald-700">Uncheck to exclude this record from worker payment calculations.</span>
                  </div>
               </label>
            </div>
         )}

        <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
           <label className="block text-sm font-bold text-slate-700 mb-3">{formData.type === 'INCOME' ? "Deposit To" : "Payment Source"}</label>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <select 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
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
                     className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-orange-900 font-medium"
                     value={formData.payerPartnerId || ''}
                     onChange={e => setFormData({ ...formData, payerPartnerId: e.target.value })}
                   >
                     <option value="">-- Select Partner --</option>
                     {partners.map((p: Partner) => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>
             )}
           </div>
        </div>

        {formData.type === 'WORKER_ADVANCE' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-500 mb-2">Select Worker (Bhaiya ji)</label>
            <select 
              required
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
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
           <label className="block text-sm font-semibold text-slate-500 mb-2">Target Partner</label>
           <select 
             required
             className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
             value={formData.partnerId || ''}
             onChange={e => setFormData({ ...formData, partnerId: e.target.value })}
           >
             <option value="">-- Select Partner --</option>
             {partners.map((p: Partner) => <option key={p.id} value={p.id}>{p.name}</option>)}
           </select>
         </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-500 mb-2">Season</label>
          <select 
            required
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
            value={formData.seasonId}
            onChange={e => setFormData({ ...formData, seasonId: e.target.value })}
          >
            {seasons.map((s: Season) => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-500 mb-2">Description</label>
          <textarea 
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
            rows={2}
            value={formData.description || ''}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="px-6 py-3 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
        <button type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all active:scale-95">
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
      case 'INCOME': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EXPENSE': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'WORKER_ADVANCE': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSourceLabel = (t: Transaction) => {
    if (t.paymentSource === 'FARM_CASH') return 'Farm Cash';
    if (t.paymentSource === 'FARM_BANK') return 'Farm Bank';
    if (t.paymentSource === 'PARTNER') {
        const p = partners.find((x: Partner) => x.id === t.payerPartnerId);
        return `By ${p?.name || 'Partner'}`;
    }
    return 'Unknown';
  };

  return (
    <div>
      {!readonly && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {['ALL', 'INCOME', 'EXPENSE', 'WORKER_ADVANCE'].map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)} 
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filterType === type ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {type === 'ALL' ? 'All Transactions' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filtered.map((t: Transaction) => {
          const season = seasons.find((s: Season) => s.id === t.seasonId);
          const worker = t.workerId ? workers.find((w: Worker) => w.id === t.workerId) : null;
          
          return (
            <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-start mb-3">
                 <div className="flex flex-col">
                   <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">{t.date}</span>
                   <span className="font-bold text-slate-900 text-lg leading-tight">{t.category}</span>
                 </div>
                 <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${getTypeStyle(t.type)}`}>
                        {t.type === 'WORKER_ADVANCE' ? 'ADVANCE' : t.type}
                    </span>
                    {t.includeInWorkerShare === false && (
                       <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">Excluded 20%</span>
                    )}
                 </div>
               </div>
               
               {t.description && <p className="text-sm text-slate-500 mb-2">{t.description}</p>}
               
               <div className="flex flex-wrap gap-2 mb-4 mt-2">
                  <span className="text-[10px] bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5 font-medium">
                    <CreditCard className="w-3 h-3" /> {getSourceLabel(t)}
                  </span>
                  {worker && <span className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg border border-amber-100 flex items-center gap-1.5 font-medium"><UserCheck className="w-3 h-3" /> {worker.name}</span>}
                  {season && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5 font-medium"><Calendar className="w-3 h-3" /> {season.name}</span>}
               </div>

               <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                 <span className={`text-2xl font-bold ${['INCOME', 'PARTNER_CONTRIBUTION'].includes(t.type) ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {['INCOME', 'PARTNER_CONTRIBUTION'].includes(t.type) ? '+' : '-'} {formatCurrency(t.amount)}
                 </span>
                 {!readonly && (
                   <div className="flex gap-2">
                      <button onClick={() => onEdit(t.id)} className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(t.id)} className="text-red-600 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                   </div>
                 )}
               </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Details</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Source</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
              {!readonly && <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((t: Transaction) => {
              const season = seasons.find((s: Season) => s.id === t.seasonId);
              const worker = t.workerId ? workers.find((w: Worker) => w.id === t.workerId) : null;
              const partner = t.partnerId ? partners.find((p: Partner) => p.id === t.partnerId) : null;

              return (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5 text-sm font-medium text-slate-600 whitespace-nowrap">{t.date}</td>
                  <td className="p-5">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${getTypeStyle(t.type)}`}>
                        {t.type === 'WORKER_ADVANCE' ? 'ADVANCE' : t.type.replace(/_/g, ' ')}
                      </span>
                      {t.includeInWorkerShare === false && <span className="text-[9px] text-slate-400">Excluded 20%</span>}
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-slate-800">{t.category}</p>
                    <p className="text-xs text-slate-500">{t.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {season && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-medium">{season.name}</span>}
                      {worker && <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 font-medium">Worker: {worker.name}</span>}
                      {partner && <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 font-medium">Partner: {partner.name}</span>}
                    </div>
                  </td>
                  <td className="p-5 text-sm text-slate-500 font-medium">
                    {getSourceLabel(t)}
                  </td>
                  <td className={`p-5 text-right font-bold text-base ${['INCOME', 'PARTNER_CONTRIBUTION'].includes(t.type) ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {['INCOME', 'PARTNER_CONTRIBUTION'].includes(t.type) ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  {!readonly && (
                    <td className="p-5 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onEdit(t.id)} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                         <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-12 text-center text-slate-400">No transactions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PartnersView = ({ partners, transactions, financials }: any) => (
  <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in">
     <h2 className="text-2xl font-bold text-slate-800">Partner Accounts</h2>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {partners.map((partner: Partner) => {
         const directContribution = transactions
           .filter((t: Transaction) => t.partnerId === partner.id && t.type === 'PARTNER_CONTRIBUTION')
           .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
         
         const expensesPaid = transactions
           .filter((t: Transaction) => t.paymentSource === 'PARTNER' && t.payerPartnerId === partner.id && t.type === 'EXPENSE')
           .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

         const advancesPaid = transactions
           .filter((t: Transaction) => t.paymentSource === 'PARTNER' && t.payerPartnerId === partner.id && t.type === 'WORKER_ADVANCE')
           .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

         const incomeReceived = transactions
           .filter((t: Transaction) => t.paymentSource === 'PARTNER' && t.payerPartnerId === partner.id && t.type === 'INCOME')
           .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

         const totalInvested = directContribution + expensesPaid + advancesPaid;

         const withdrawal = transactions
           .filter((t: Transaction) => t.partnerId === partner.id && t.type === 'PARTNER_WITHDRAWAL')
           .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
          
         const netBalance = totalInvested - withdrawal - incomeReceived;

         return (
           <div key={partner.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-full text-blue-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{partner.name}</h3>
                  <p className="text-xs text-slate-500">Partner</p>
                </div>
             </div>
             
             <div className="space-y-3">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500">Direct Cash Injection</span>
                 <span className="font-medium text-emerald-600">{formatCurrency(directContribution)}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500">Expenses Paid Personally</span>
                 <span className="font-medium text-emerald-600">{formatCurrency(expensesPaid)}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500">Advances Paid Personally</span>
                 <span className="font-medium text-emerald-600">{formatCurrency(advancesPaid)}</span>
               </div>

               {incomeReceived > 0 && (
                 <div className="flex justify-between items-center text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                   <span>Income Collected (Pocket)</span>
                   <span className="font-medium">-{formatCurrency(incomeReceived)}</span>
                 </div>
               )}
               
               <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-100">
                 <span className="text-slate-500">Total Withdrawn</span>
                 <span className="font-bold text-red-600">-{formatCurrency(withdrawal)}</span>
               </div>
               
               <div className="flex justify-between items-center pt-2 mt-2">
                 <span className="font-bold text-slate-800 text-lg">Net Invested</span>
                 <span className={`font-bold text-xl ${netBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                   {formatCurrency(netBalance)}
                 </span>
               </div>

               <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                    <Coins className="w-4 h-4" /> Estimated Season Share
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Farm Net Profit (50% Share)</span>
                    <span className={`font-bold text-lg ${financials.sharePerPartner >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {formatCurrency(financials.sharePerPartner)}
                    </span>
                  </div>
               </div>
             </div>
           </div>
         );
       })}
     </div>
  </div>
);

const DataManagementView = ({ onImport, onExport, seasons, onExportSeason }: any) => {
  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in">
       <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
         <Database className="w-6 h-6 text-emerald-600" /> Data Backup & Restore
       </h2>
       
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
             <h3 className="font-bold text-slate-800 text-lg mb-1">Backup Options</h3>
             <p className="text-sm text-slate-600">
               Save your data securely. Data is stored on your device. Backup regularly.
             </p>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Export Section */}
             <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">1. Full Backup</h4>
                    <p className="text-xs text-slate-500">Download everything (All Seasons)</p>
                  </div>
                </div>
                <button 
                  onClick={onExport}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200 active:scale-[0.98]"
                >
                  <FileJson className="w-5 h-5" /> Download Full Data
                </button>
             </div>

             {/* Import Section */}
             <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-50 p-3 rounded-full text-orange-600">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">2. Restore Data</h4>
                    <p className="text-xs text-slate-500">Load previously saved file</p>
                  </div>
                </div>
                <label className="w-full py-4 bg-white border-2 border-dashed border-orange-200 hover:border-orange-500 text-orange-600 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-orange-50 active:scale-[0.98]">
                  <Upload className="w-5 h-5" /> Select Backup File
                  <input type="file" accept=".json" onChange={onImport} className="hidden" />
                </label>
             </div>
          </div>

          <div className="p-8 border-t border-slate-200 bg-slate-50/50">
             <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="font-bold text-slate-800">3. Season-wise Backup</h4>
                   <p className="text-xs text-slate-500">Download data for a specific season only</p>
                </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {seasons.map((s: Season) => (
                   <button 
                     key={s.id}
                     onClick={() => onExportSeason(s.id)}
                     className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-left hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500 transition-all flex items-center justify-between group"
                   >
                      <span className="text-sm font-medium text-slate-700">{s.name}</span>
                      <Download className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                   </button>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TRANSACTIONS' | 'SEASONS' | 'WORKERS' | 'PARTNERS' | 'DATA'>('DASHBOARD');
  
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

  const [categories, setCategories] = useState<CategoryMap>(() => {
    try {
      const saved = localStorage.getItem('agri_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch (e) { return DEFAULT_CATEGORIES; }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('agri_transactions');
      let parsed = saved ? JSON.parse(saved) : [];
      return parsed.map((t: any) => ({
        ...t,
        paymentSource: t.paymentSource || (t.mode === 'BANK' ? 'FARM_BANK' : 'FARM_CASH'),
        includeInWorkerShare: t.includeInWorkerShare !== undefined ? t.includeInWorkerShare : true
      }));
    } catch (e) { return []; }
  });

  // Persist Effects
  useEffect(() => localStorage.setItem('agri_seasons', JSON.stringify(seasons)), [seasons]);
  useEffect(() => localStorage.setItem('agri_partners', JSON.stringify(partners)), [partners]);
  useEffect(() => localStorage.setItem('agri_workers', JSON.stringify(workers)), [workers]);
  useEffect(() => localStorage.setItem('agri_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('agri_categories', JSON.stringify(categories)), [categories]);

  // Derived Calculations
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

      if (t.paymentSource === 'FARM_CASH') {
        if (t.type === 'INCOME' || t.type === 'PARTNER_CONTRIBUTION') cash += amt;
        else cash -= amt;
      } else if (t.paymentSource === 'FARM_BANK') {
        if (t.type === 'INCOME' || t.type === 'PARTNER_CONTRIBUTION') bank += amt;
        else bank -= amt;
      }
      
      if (t.paymentSource === 'PARTNER' && t.payerPartnerId) {
        if (t.type === 'EXPENSE' || t.type === 'WORKER_ADVANCE') {
          partnerBalances[t.payerPartnerId] = (partnerBalances[t.payerPartnerId] || 0) + amt;
        } else if (t.type === 'INCOME') {
           partnerBalances[t.payerPartnerId] = (partnerBalances[t.payerPartnerId] || 0) - amt;
        }
      }

      if (t.type === 'PARTNER_CONTRIBUTION') {
        if (t.partnerId) partnerBalances[t.partnerId] = (partnerBalances[t.partnerId] || 0) + amt;
      } else if (t.type === 'PARTNER_WITHDRAWAL') {
        if (t.partnerId) partnerBalances[t.partnerId] = (partnerBalances[t.partnerId] || 0) - amt;
      }

      if (t.type === 'WORKER_ADVANCE') {
        totalAdvances += amt;
      }
    });

    const netFarmProfit = (totalIncome - totalExpense);
    const partnersShareTotal = netFarmProfit * 0.80; 
    const sharePerPartner = partnersShareTotal / (partners.length || 1);

    return { cash, bank, totalAdvances, partnerBalances, sharePerPartner };
  }, [transactions, partners]);

  // --- Actions ---

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [seasonAction, setSeasonAction] = useState<{ type: 'CLOSE' | 'DELETE', id: string } | null>(null);
  const [workerDeleteId, setWorkerDeleteId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: NotificationType} | null>(null);
  const [pendingImport, setPendingImport] = useState<any>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({ message, type });
  };

  const performDelete = () => {
    if (deleteId) {
      setTransactions(prev => prev.filter(t => t.id !== deleteId));
      setDeleteId(null);
      showNotification('Transaction deleted successfully', 'success');
    }
  };

  const handleAddTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
    showNotification('Transaction added successfully', 'success');
  };

  const handleUpdateTransaction = (t: Transaction) => {
    setTransactions(prev => prev.map(x => x.id === t.id ? t : x));
    showNotification('Transaction updated', 'success');
  };

  const handleAddWorker = (w: Worker) => {
    setWorkers(prev => [...prev, w]);
    showNotification('Worker added successfully', 'success');
  };
  
  const handleDeleteWorker = (id: string) => {
    const hasHistory = transactions.some(t => t.workerId === id);
    if (hasHistory) {
      showNotification("Cannot delete this worker because they have linked transactions.", 'error');
      return;
    }
    setWorkerDeleteId(id);
  };

  const executeDeleteWorker = () => {
    if (workerDeleteId) {
      setWorkers(prev => prev.filter(w => w.id !== workerDeleteId));
      setWorkerDeleteId(null);
      showNotification('Worker deleted', 'success');
    }
  };

  const handleAddSeason = (s: Season) => {
    setSeasons(prev => [s, ...prev]);
    showNotification('New season created', 'success');
  };
  
  const handleCloseSeason = (id: string) => {
     setSeasonAction({ type: 'CLOSE', id });
  };

  const handleDeleteSeason = (id: string) => {
     setSeasonAction({ type: 'DELETE', id });
  };

  const executeSeasonAction = () => {
    if (!seasonAction) return;
    if (seasonAction.type === 'CLOSE') {
       setSeasons(prev => prev.map(s => s.id === seasonAction.id ? { ...s, status: 'CLOSED', endDate: new Date().toISOString().split('T')[0] } : s));
       showNotification('Season closed successfully', 'success');
    } else {
       setSeasons(prev => prev.filter(s => s.id !== seasonAction.id));
       setTransactions(prev => prev.filter(t => t.seasonId !== seasonAction.id));
       showNotification('Season deleted', 'success');
    }
    setSeasonAction(null);
  };

  const handleAddCategory = (type: keyof CategoryMap, newCat: string) => {
    const exists = categories[type].some(c => c.toLowerCase().trim() === newCat.toLowerCase().trim());
    if (exists) {
      showNotification(`The category "${newCat}" already exists!`, 'error');
      return;
    }
    setCategories(prev => ({
      ...prev,
      [type]: [...prev[type], newCat]
    }));
    showNotification('Category added', 'success');
  };

  const handleExportData = () => {
    const data = {
      transactions,
      workers,
      partners,
      seasons,
      categories,
      meta: { exportDate: new Date().toISOString(), version: "1.4" }
    };
    downloadJSON(data, `AgriBooks_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleExportSeason = (seasonId: string) => {
    const season = seasons.find(s => s.id === seasonId);
    if (!season) return;
    const seasonTrans = transactions.filter(t => t.seasonId === seasonId);
    
    const data = {
      season,
      transactions: seasonTrans,
      workers,
      partners,
      categories,
      meta: { exportDate: new Date().toISOString(), version: "1.4", type: "SEASON_EXPORT" }
    };
    downloadJSON(data, `AgriBooks_${season.name.replace(/\s+/g, '_')}_Backup.json`);
  };

  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Download started', 'success');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.transactions && (json.seasons || json.season)) {
           setPendingImport(json);
           // Clear input so same file can be selected again if needed
           event.target.value = '';
        } else {
           showNotification("Invalid backup file format.", 'error');
        }
      } catch (err) {
        showNotification("Error reading file", 'error');
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (pendingImport) {
       setTransactions(pendingImport.transactions || []);
       setWorkers(pendingImport.workers || []);
       setPartners(pendingImport.partners || INITIAL_PARTNERS);
       setSeasons(pendingImport.seasons || (pendingImport.season ? [pendingImport.season] : []));
       if(pendingImport.categories) setCategories(pendingImport.categories);
       showNotification("Data restored successfully!", 'success');
       setPendingImport(null);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'DASHBOARD': return (
        <Dashboard 
          financials={financials} 
          transactions={transactions} 
          seasons={seasons} 
          partners={partners} 
          workers={workers}
          onDeleteTransaction={setDeleteId}
          onEditTransaction={(id: string) => { setActiveTab('TRANSACTIONS'); }} 
          onViewAll={() => setActiveTab('TRANSACTIONS')}
        />
      );
      case 'TRANSACTIONS': return (
        <TransactionManager 
          transactions={transactions} 
          seasons={seasons} 
          partners={partners} 
          workers={workers} 
          categories={categories}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={setDeleteId}
          onAddCategory={handleAddCategory}
          onNotify={showNotification}
        />
      );
      case 'SEASONS': return (
        <SeasonsView 
          seasons={seasons} 
          transactions={transactions} 
          workers={workers} 
          onAddSeason={handleAddSeason}
          onCloseSeason={handleCloseSeason}
          onDeleteSeason={handleDeleteSeason}
        />
      );
      case 'WORKERS': return (
        <WorkersView 
          workers={workers} 
          transactions={transactions} 
          onAddWorker={handleAddWorker}
          onDeleteWorker={handleDeleteWorker}
        />
      );
      case 'PARTNERS': return <PartnersView partners={partners} transactions={transactions} financials={financials} />;
      case 'DATA': return (
        <DataManagementView 
           onImport={handleImportData} 
           onExport={handleExportData} 
           seasons={seasons}
           onExportSeason={handleExportSeason}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in">
           <div className={`px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 border ${
             notification.type === 'success' ? 'bg-white text-emerald-700 border-emerald-100' : 
             notification.type === 'error' ? 'bg-white text-red-700 border-red-100' : 
             'bg-slate-800 text-white border-slate-700'
           }`}>
              {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
              {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {notification.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
              <span className="font-medium">{notification.message}</span>
           </div>
        </div>
      )}

      {/* Mobile Nav Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-emerald-400" />
          <h1 className="text-lg font-bold tracking-tight">AgriBooks</h1>
        </div>
        <button onClick={() => setActiveTab('DATA')} className="text-slate-300 hover:text-white flex flex-col items-center">
          <Database className="w-5 h-5" />
          <span className="text-[10px]">Data</span>
        </button>
      </div>

      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col bg-slate-900 text-white w-72 flex-shrink-0 h-screen sticky top-0 border-r border-slate-800">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-white">
            <Sprout className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AgriBooks</h1>
        </div>
        <nav className="px-4 py-2 space-y-2 flex-1">
          <NavButton icon={<PieChart />} label="Dashboard" active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} />
          <NavButton icon={<DollarSign />} label="Transactions" active={activeTab === 'TRANSACTIONS'} onClick={() => setActiveTab('TRANSACTIONS')} />
          <NavButton icon={<Calendar />} label="Seasons" active={activeTab === 'SEASONS'} onClick={() => setActiveTab('SEASONS')} />
          <NavButton icon={<Users />} label="Workers" active={activeTab === 'WORKERS'} onClick={() => setActiveTab('WORKERS')} />
          <NavButton icon={<TrendingUp />} label="Partners" active={activeTab === 'PARTNERS'} onClick={() => setActiveTab('PARTNERS')} />
          <div className="pt-6 mt-6 border-t border-slate-800">
             <NavButton icon={<Database />} label="Backup / Restore" active={activeTab === 'DATA'} onClick={() => setActiveTab('DATA')} />
          </div>
        </nav>
        <div className="p-6 bg-slate-950/50">
          <p className="text-xs text-slate-500">v1.4 &bull; Offline Ready</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-20 pb-safe shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
        <MobileNavBtn icon={<PieChart />} label="Home" active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} />
        <MobileNavBtn icon={<DollarSign />} label="Trans" active={activeTab === 'TRANSACTIONS'} onClick={() => setActiveTab('TRANSACTIONS')} />
        <MobileNavBtn icon={<Calendar />} label="Seasons" active={activeTab === 'SEASONS'} onClick={() => setActiveTab('SEASONS')} />
        <MobileNavBtn icon={<Users />} label="Workers" active={activeTab === 'WORKERS'} onClick={() => setActiveTab('WORKERS')} />
        <MobileNavBtn icon={<TrendingUp />} label="Partners" active={activeTab === 'PARTNERS'} onClick={() => setActiveTab('PARTNERS')} />
      </div>

      {/* Global Delete Modal for Transactions */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
             <div className="flex flex-col items-center text-center">
               <div className="bg-red-50 p-4 rounded-full text-red-600 mb-6">
                 <Trash2 className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Transaction?</h3>
               <p className="text-sm text-slate-500 mb-8">This action cannot be undone and will affect your financial balances.</p>
               <div className="flex gap-3 w-full">
                 <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                 <button onClick={performDelete} className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors">Delete</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Season Action Modal */}
      {seasonAction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
             <div className="flex flex-col items-center text-center">
               <div className={`p-4 rounded-full mb-4 ${seasonAction.type === 'DELETE' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                 {seasonAction.type === 'DELETE' ? <Trash2 className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">
                 {seasonAction.type === 'DELETE' ? 'Delete Season?' : 'Close Season?'}
               </h3>
               <p className="text-sm text-slate-600 mb-6 whitespace-pre-line font-medium leading-relaxed">
                 {seasonAction.type === 'DELETE' 
                   ? `શું તમે ચોક્કસપણે આ સીઝન અને તેના તમામ ડેટાને કાઢી નાખવા માંગો છો? \n\nઆ ક્રિયા પાછી ખેંચી શકાતી નથી. બધો હિસાબ જતો રહેશે.\n(Are you sure you want to delete this season and all its transactions?)`
                   : `શું તમે ચોક્કસપણે આ સીઝન પૂરી (Close) કરવા માંગો છો? \n\nઆ પછી તમે તેમાં ફેરફાર કરી શકશો નહીં.\n(Are you sure you want to close this season?)`
                 }
               </p>
               <div className="flex gap-3 w-full">
                 <button onClick={() => setSeasonAction(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                 <button 
                   onClick={executeSeasonAction} 
                   className={`flex-1 py-3 text-white font-semibold rounded-xl shadow-lg transition-colors ${seasonAction.type === 'DELETE' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'}`}
                 >
                   {seasonAction.type === 'DELETE' ? 'Delete' : 'Close Season'}
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Worker Delete Modal */}
      {workerDeleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
             <div className="flex flex-col items-center text-center">
               <div className="bg-red-50 p-4 rounded-full text-red-600 mb-4">
                 <Users className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Worker?</h3>
               <p className="text-sm text-slate-600 mb-6">
                 Are you sure you want to remove this worker profile? This action cannot be undone.
               </p>
               <div className="flex gap-3 w-full">
                 <button onClick={() => setWorkerDeleteId(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                 <button 
                   onClick={executeDeleteWorker} 
                   className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
                 >
                   Delete
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Import Confirmation Modal */}
      {pendingImport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
             <div className="flex flex-col items-center text-center">
               <div className="bg-orange-50 p-4 rounded-full text-orange-600 mb-4">
                 <Upload className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Restore Data?</h3>
               <p className="text-sm text-slate-600 mb-6 font-medium">
                 WARNING: This will replace ALL current data with the data from the backup file. This action cannot be undone.
               </p>
               <div className="flex gap-3 w-full">
                 <button onClick={() => setPendingImport(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                 <button 
                   onClick={confirmImport} 
                   className="flex-1 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-200 transition-colors"
                 >
                   Restore Data
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
