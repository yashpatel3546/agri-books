import React, { useState, useEffect, useMemo } from 'react';
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
  Minus,
  Save, 
  X, 
  LogOut,
  LandPlot,
  PieChart,
  UserCheck,
  Download,
  Upload,
  Database,
  FileJson,
  ChevronRight,
  Lock,
  CheckCircle,
  Info,
  AlertCircle,
  Share2,
  Languages,
  Calculator,
  FileText,
  Filter,
  ArrowUpDown,
  GitMerge,
  ArrowRight,
  Search,
  Coins,
  Eye,
  Printer
} from 'lucide-react';

// --- Types ---

type PaymentSource = 'FARM_CASH' | 'FARM_BANK' | 'PARTNER';
type TransactionType = 'INCOME' | 'EXPENSE' | 'WORKER_ADVANCE' | 'PARTNER_CONTRIBUTION' | 'PARTNER_WITHDRAWAL';
type SeasonStatus = 'OPEN' | 'CLOSED';
type NotificationType = 'success' | 'error' | 'info';
type Language = 'EN' | 'GU';

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
  phone: string;
  joinedDate: string;
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

interface TransactionFilters {
  startDate: string;
  endDate: string;
  type: string;
  seasonId: string;
  workerId: string;
  partnerId: string;
  category: string;
  search: string;
}

interface CategoryMap {
  INCOME: string[];
  EXPENSE: string[];
  WORKER_ADVANCE: string[];
  PARTNER: string[];
}

// --- Initial Data ---

const INITIAL_PARTNERS: Partner[] = [
  { id: 'p1', name: 'Girish', phone: '', joinedDate: '2025-01-01' },
  { id: 'p2', name: 'Dilip', phone: '', joinedDate: '2025-01-01' },
];

const DEFAULT_CATEGORIES: CategoryMap = {
  INCOME: ['Crop Sale', 'By-product Sale', 'Subsidy', 'Other Income'],
  EXPENSE: ['Seeds', 'Fertilizer', 'Pesticides', 'Diesel/Fuel', 'Machinery Rent', 'Labor Wages', 'Repair', 'Other Expense'],
  WORKER_ADVANCE: ['Grocery', 'Medical', 'Personal Loan', 'Other'],
  PARTNER: ['Capital Injection', 'Personal Withdrawal']
};

// --- Translations ---

const TRANSLATIONS = {
  EN: {
    dashboard: "Dashboard",
    transactions: "Transactions",
    seasons: "Seasons",
    workers: "Workers",
    partners: "Partners",
    data: "Data & Sync",
    farmCash: "Farm Cash",
    bankBalance: "Bank Balance",
    workerAdvances: "Worker Advances",
    invested: "Invested",
    withdrawn: "Withdrawn",
    recentActivity: "Recent Activity",
    viewAll: "View All",
    newSeason: "New Season",
    closeSeason: "Close Season",
    delete: "Delete",
    farmPerformance: "Farm Performance",
    totalRevenue: "Total Revenue",
    totalExpenses: "Total Expenses",
    netProfit: "Net Farm Profit",
    workerShare: "Worker Share (20%)",
    finalPayable: "Final Payable",
    addWorker: "Add Worker",
    totalDebt: "Total Debt",
    addNew: "Add New",
    saveRecord: "Save Record",
    cancel: "Cancel",
    backupRestore: "Backup & Sync",
    downloadReport: "Print Report",
    shareWhatsapp: "Share Backup",
    calculationDetails: "Calculation Details",
    printReport: "Print Report",
    income: "Income",
    expense: "Expense",
    description: "Description",
    category: "Category",
    date: "Date",
    amount: "Amount",
    filters: "Filters",
    searchPlaceholder: "Search description...",
    startDate: "Start Date",
    endDate: "End Date",
    filterByEntity: "Filter by Person",
    sortBy: "Sort By",
    reset: "Reset Filters",
    filteredTotal: "Filtered Summary",
    apply: "Apply Filters"
  },
  GU: {
    dashboard: "ડેશબોર્ડ (Dashboard)",
    transactions: "વહેવાર (Transactions)",
    seasons: "સીઝન (Seasons)",
    workers: "મજૂર / ભૈયાજી",
    partners: "ભાગીદાર (Partners)",
    data: "ડેટા અને બેકઅપ",
    farmCash: "રોકડ (Cash)",
    bankBalance: "બેંક બેલેન્સ",
    workerAdvances: "મજૂર ઉપાડ (Advance)",
    invested: "રોકાણ",
    withdrawn: "ઉપાડ",
    recentActivity: "તાજેતરના વહેવાર",
    viewAll: "બધું જુઓ",
    newSeason: "નવી સીઝન",
    closeSeason: "સીઝન પૂરી કરો",
    delete: "ડિલીટ",
    farmPerformance: "ખેતી હિસાબ",
    totalRevenue: "કુલ આવક",
    totalExpenses: "કુલ ખર્ચ",
    netProfit: "ચોખ્ખો નફો",
    workerShare: "મજૂર ભાગ (20%)",
    finalPayable: "ચૂકવવાપાત્ર રકમ",
    addWorker: "મજૂર ઉમેરો",
    totalDebt: "બાકી ઉપાડ",
    addNew: "નવો વહેવાર",
    saveRecord: "સેવ કરો",
    cancel: "રદ કરો",
    backupRestore: "બેકઅપ & સિંક",
    downloadReport: "રિપોર્ટ પ્રિન્ટ કરો",
    shareWhatsapp: "વોટ્સએપ પર મોકલો",
    calculationDetails: "હિસાબની વિગત",
    printReport: "પ્રિન્ટ રિપોર્ટ",
    income: "આવક",
    expense: "ખર્ચ",
    description: "વિગત",
    category: "કેટેગરી",
    date: "તારીખ",
    amount: "રકમ",
    filters: "ફિલ્ટર (Filters)",
    searchPlaceholder: "વિગત શોધો...",
    startDate: "તારીખ થી",
    endDate: "તારીખ સુધી",
    filterByEntity: "વ્યક્તિ પસંદ કરો",
    sortBy: "ક્રમ (Sort)",
    reset: "રીસેટ કરો",
    filteredTotal: "તારણ (Summary)",
    apply: "લાગુ કરો"
  }
};

// --- Helper Functions ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatCurrency = (amount: any) => {
    const num = Number(amount);
    return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
};

// --- Print Component ---

interface PrintProps {
  data: any; // Type depends on report type
  onExit: () => void;
}

const PrintTemplate = ({ data, onExit }: PrintProps) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    // Auto-fit logic for mobile screens
    const paperWidthPx = 794; // A4 width at approx 96dpi
    const screenWidth = window.innerWidth;
    if (screenWidth < paperWidthPx + 40) {
       // Scale to fit screen with some padding
       setZoom((screenWidth - 32) / paperWidthPx);
    }
  }, []);

  const handlePrint = () => {
    try {
        window.print();
    } catch (e) {
        alert("Print action blocked. Please use Ctrl + P on your keyboard.");
    }
  };

  const renderHeader = (title: string, subtitle: string) => (
    <div className="mb-6 border-b-2 border-slate-800 pb-4">
       <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AgriBooks</h1>
            <h2 className="text-xl font-semibold text-slate-700 mt-1">{title}</h2>
          </div>
          <div className="text-right">
             <p className="text-sm text-slate-500">{subtitle}</p>
             <p className="text-xs text-slate-400">Generated: {new Date().toLocaleDateString()}</p>
          </div>
       </div>
    </div>
  );

  const renderTable = (headers: string[], rows: (string|number)[][], footers?: (string|number)[]) => (
    <div className="mt-6">
       <table className="w-full text-sm border-collapse border border-slate-300">
         <thead>
           <tr className="bg-slate-100 print:bg-slate-100">
             {headers.map((h, i) => (
               <th key={i} className={`border border-slate-300 px-3 py-2 text-left text-slate-800 ${i === headers.length - 1 ? 'text-right' : ''}`}>{h}</th>
             ))}
           </tr>
         </thead>
         <tbody>
           {rows.map((row, idx) => (
             <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
                {row.map((cell, i) => (
                  <td key={i} className={`border border-slate-300 px-3 py-2 text-slate-700 ${i === headers.length - 1 ? 'text-right font-mono font-medium' : ''}`}>
                    {cell}
                  </td>
                ))}
             </tr>
           ))}
         </tbody>
         {footers && (
            <tfoot>
               <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 break-inside-avoid">
                 {footers.map((f, i) => (
                    <td key={i} className={`px-3 py-2 text-slate-900 ${i === footers.length - 1 ? 'text-right' : ''}`}>{f}</td>
                 ))}
               </tr>
            </tfoot>
         )}
       </table>
    </div>
  );

  const renderContent = () => {
    if (data.type === 'SEASON_REPORT') {
       const { season, summary, transactions } = data;
       return (
         <>
           {renderHeader("Season Financial Report", `Season: ${season.name}`)}
           
           <div className="grid grid-cols-2 gap-6 mb-8 border border-slate-300 rounded p-4 break-inside-avoid">
              <div>
                 <h3 className="font-bold border-b border-slate-200 pb-2 mb-2">Farm Performance</h3>
                 <div className="flex justify-between py-1 border-b border-dashed border-slate-200"><span>Total Revenue:</span> <strong>{formatCurrency(summary.totalIncome)}</strong></div>
                 <div className="flex justify-between py-1 border-b border-dashed border-slate-200"><span>Total Expenses:</span> <strong>{formatCurrency(summary.totalExpense)}</strong></div>
                 <div className="flex justify-between py-1 pt-2 text-lg"><span>Net Profit:</span> <strong className={summary.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}>{formatCurrency(summary.netProfit)}</strong></div>
              </div>
              <div>
                 <h3 className="font-bold border-b border-slate-200 pb-2 mb-2">Worker Share (20%)</h3>
                 <div className="flex justify-between py-1 border-b border-dashed border-slate-200"><span>Share Entitlement:</span> <strong>{formatCurrency(summary.workerShare)}</strong></div>
                 <div className="flex justify-between py-1 border-b border-dashed border-slate-200"><span>Less Advances:</span> <strong>-{formatCurrency(summary.advances)}</strong></div>
                 <div className="flex justify-between py-1 pt-2 text-lg"><span>Final Payable:</span> <strong>{formatCurrency(summary.payable)}</strong></div>
              </div>
           </div>

           {renderTable(
             ['Date', 'Category', 'Type', 'Description', 'Amount'],
             transactions.map((t: any) => [t.date, t.category, t.type.replace('_',' '), t.description || '-', formatCurrency(t.amount)]),
             ['Total', '', '', `${transactions.length} Records`, formatCurrency(transactions.reduce((s:number, t:any)=>s+Number(t.amount), 0))]
           )}
         </>
       );
    }

    if (data.type === 'PARTNER_DISTRIBUTION') {
      const { partners, financials } = data;
      const { totalIncome, totalExpense, workerShare, netFarmProfit, distributableProfit, sharePerPartner } = financials.shareDetails;
      
      return (
        <>
          {renderHeader("Partner Profit Distribution", "Estimated Calculation")}
          <div className="max-w-xl mx-auto border border-slate-400 rounded-lg p-8 bg-slate-50 print:bg-white break-inside-avoid">
             <div className="space-y-4 text-lg">
                <div className="flex justify-between"><span>Total Farm Revenue</span> <strong>{formatCurrency(totalIncome)}</strong></div>
                <div className="flex justify-between"><span>Total Farm Expenses</span> <strong className="text-red-700">-{formatCurrency(totalExpense)}</strong></div>
                <div className="border-t border-slate-300 my-2"></div>
                <div className="flex justify-between font-bold"><span>Net Farm Profit</span> <strong>{formatCurrency(netFarmProfit)}</strong></div>
                <div className="flex justify-between text-slate-600"><span>Less: Worker Share (20%)</span> <strong>-{formatCurrency(workerShare)}</strong></div>
                <div className="border-t-2 border-slate-800 my-4"></div>
                <div className="flex justify-between text-xl font-bold"><span>Distributable Profit (80%)</span> <strong>{formatCurrency(distributableProfit)}</strong></div>
                
                <div className="mt-8 pt-6 border-t border-dashed border-slate-300 text-center">
                   <p className="text-slate-600 mb-2">Divided by {partners.length} Partners</p>
                   <div className="text-3xl font-black bg-slate-100 py-4 border border-slate-300 rounded">
                      {formatCurrency(sharePerPartner)}
                      <span className="block text-xs font-normal text-slate-500 mt-1">PER PARTNER</span>
                   </div>
                </div>
             </div>
          </div>
        </>
      );
    }

    if (data.type === 'WORKER_SHARE') {
      const { season, workerIncomeBase, workerGrossShare, workerExpenseBase, workerExpenseShare, workerNetShare, transactions } = data;
      return (
         <>
           {renderHeader("Worker Share Statement (20%)", `Season: ${season.name}`)}
           
           <div className="border border-slate-300 p-4 mb-6 bg-slate-50 print:bg-white break-inside-avoid">
              <div className="grid grid-cols-2 gap-8 text-sm">
                 <div>
                    <div className="flex justify-between mb-1"><span>Total Eligible Income:</span> <span>{formatCurrency(workerIncomeBase)}</span></div>
                    <div className="flex justify-between font-bold text-emerald-700 text-lg"><span>(+) 20% Income Share:</span> <span>{formatCurrency(workerGrossShare)}</span></div>
                 </div>
                 <div>
                    <div className="flex justify-between mb-1"><span>Total Eligible Expense:</span> <span>{formatCurrency(workerExpenseBase)}</span></div>
                    <div className="flex justify-between font-bold text-red-700 text-lg"><span>(-) 20% Expense Share:</span> <span>{formatCurrency(workerExpenseShare)}</span></div>
                 </div>
              </div>
              <div className="border-t-2 border-slate-800 mt-4 pt-2 flex justify-between text-xl font-bold">
                 <span>Net Share Payable</span>
                 <span>{formatCurrency(workerNetShare)}</span>
              </div>
           </div>

           <h3 className="font-bold mb-2">Detailed Breakdown</h3>
           {renderTable(
             ['Date', 'Category', 'Type', 'Full Amount', '20% Share Part'],
             transactions.map((t: any) => {
                const sharePart = Number(t.amount) * 0.20;
                const prefix = t.type === 'INCOME' ? '+' : '-';
                return [t.date, t.category, t.type, formatCurrency(t.amount), `${prefix} ${formatCurrency(sharePart)}`];
             }),
             ['Net Share', '', '', '', formatCurrency(workerNetShare)]
           )}
         </>
      );
    }

    if (data.type === 'PARTNER_REPORT') {
      const { partner, summary, transactions } = data;
      return (
         <>
            {renderHeader(`Partner Statement: ${partner.name}`, "Detailed Report")}
            
            <div className="grid grid-cols-2 gap-4 mb-6 border border-slate-300 p-4 break-inside-avoid">
               <div>
                  <h4 className="font-bold mb-2 underline">Inflows (Invested)</h4>
                  <div className="flex justify-between"><span>Direct Capital:</span> <strong>{formatCurrency(summary.directContribution)}</strong></div>
                  <div className="flex justify-between"><span>Expenses (Pocket):</span> <strong>{formatCurrency(summary.expensesPaid)}</strong></div>
                  <div className="flex justify-between"><span>Advances (Pocket):</span> <strong>{formatCurrency(summary.advancesPaid)}</strong></div>
                  <div className="border-t border-slate-300 mt-1 pt-1 flex justify-between font-bold"><span>Total Invested:</span> <span>{formatCurrency(summary.totalInvested)}</span></div>
               </div>
               <div>
                  <h4 className="font-bold mb-2 underline">Outflows</h4>
                  <div className="flex justify-between"><span>Cash Withdrawn:</span> <strong>-{formatCurrency(summary.withdrawal)}</strong></div>
                  <div className="flex justify-between"><span>Income Kept (Pocket):</span> <strong>-{formatCurrency(summary.incomeReceived)}</strong></div>
                  <div className="border-t-2 border-slate-800 mt-4 pt-1 flex justify-between text-lg font-bold">
                     <span>Net Balance:</span> <span className={summary.netBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}>{formatCurrency(summary.netBalance)}</span>
                  </div>
               </div>
            </div>

            {renderTable(
              ['Date', 'Category', 'Type', 'Description', 'Amount'],
              transactions.map((t: any) => {
                 let amountPrefix = ['INCOME', 'PARTNER_CONTRIBUTION'].includes(t.type) ? '+' : '-';
                 // Adjustment for logic specific to partner pocket context
                 if(t.paymentSource === 'PARTNER' && t.payerPartnerId === partner.id) {
                     if(t.type === 'INCOME') amountPrefix = '-'; 
                     else amountPrefix = '+'; 
                 }
                 if(t.type === 'PARTNER_WITHDRAWAL') amountPrefix = '-';
                 if(t.type === 'PARTNER_CONTRIBUTION') amountPrefix = '+';
                 
                 return [t.date, t.category, t.type.replace('_',' '), t.description || '-', `${amountPrefix} ${formatCurrency(t.amount).replace('₹','')}`];
              }),
              ['Total', '', '', '', formatCurrency(transactions.reduce((s:number, t:any) => s + Number(t.amount), 0))]
            )}
         </>
      );
    }

    if (data.type === 'FILTERED_LIST') {
      const { transactions } = data;
      const total = transactions.reduce((s:number, t:any) => s + Number(t.amount), 0);
      return (
        <>
           {renderHeader("Transaction Report", "Filtered List")}
           {renderTable(
             ['Date', 'Category', 'Type', 'Description', 'Amount'],
             transactions.map((t: any) => [t.date, t.category, t.type.replace('_',' '), t.description || '-', formatCurrency(t.amount)]),
             ['Total', '', '', `${transactions.length} Items`, formatCurrency(total)]
           )}
        </>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-slate-100 z-[100] flex flex-col animate-in fade-in print:bg-white print:relative print:inset-auto print:block print:h-auto">
       {/* Toolbar */}
       <div className="print:hidden bg-slate-900 text-white p-3 shadow-lg z-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <span className="font-bold text-sm md:text-lg truncate">Print Preview</span>
             {/* Zoom Controls */}
             <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors" title="Zoom Out"><Minus size={16}/></button>
                <span className="text-xs w-10 text-center font-mono text-slate-300">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(2.5, z + 0.1))} className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors" title="Zoom In"><Plus size={16}/></button>
             </div>
          </div>
          <div className="flex gap-3">
             <button onClick={handlePrint} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-600 flex items-center gap-2 transition-colors text-sm shadow-lg shadow-emerald-900/20"><Printer size={16}/> <span className="hidden sm:inline">Print</span></button>
             <button onClick={onExit} className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors text-sm">Close</button>
          </div>
       </div>

       {/* Scrollable Canvas */}
       <div className="flex-1 overflow-auto bg-slate-100 p-4 md:p-8 flex justify-center print:p-0 print:bg-white print:block print:overflow-visible">
          <div 
            style={{ 
                transform: `scale(${zoom})`, 
                transformOrigin: 'top center',
            }}
            className="transition-transform duration-200 ease-out print:transform-none"
          >
              <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[15mm] md:p-[20mm] text-black font-serif print:w-full print:shadow-none print:p-0 print:m-0 print:min-h-0">
                 {renderContent()}
              </div>
          </div>
       </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

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

const TransactionList = ({ transactions, seasons, partners, workers, onDelete, onEdit, readonly, lang }: any) => {
  const t = TRANSLATIONS[lang as Language];

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
        <FileJson size={32} className="mb-2 opacity-50"/>
        <p className="text-sm">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tr: Transaction) => {
        const season = seasons.find((s: Season) => s.id === tr.seasonId);
        const partner = partners.find((p: Partner) => p.id === tr.payerPartnerId);
        const worker = workers.find((w: Worker) => w.id === tr.workerId);

        let sourceLabel = '';
        if (tr.paymentSource === 'FARM_CASH') sourceLabel = t.farmCash;
        else if (tr.paymentSource === 'FARM_BANK') sourceLabel = t.bankBalance;
        else if (tr.paymentSource === 'PARTNER') sourceLabel = partner?.name || 'Partner';

        const isIncome = tr.type === 'INCOME' || tr.type === 'PARTNER_CONTRIBUTION';

        return (
          <div key={tr.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
             <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div className="flex gap-4 overflow-hidden">
                   <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {isIncome ? <ArrowUpDown size={18} /> : <ArrowRight size={18} />}
                   </div>
                   <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{tr.category}</h4>
                        {tr.paymentSource === 'PARTNER' && <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200">Paid by {partner?.name}</span>}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{tr.description || 'No description'}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                         <span className="text-[10px] flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-slate-500 font-medium"><Calendar size={10}/> {tr.date}</span>
                         <span className="text-[10px] flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-slate-500 font-medium">{sourceLabel}</span>
                         {season && <span className="text-[10px] flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 font-medium border border-emerald-100"><Sprout size={10}/> {season.name}</span>}
                         {worker && <span className="text-[10px] flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-amber-700 font-medium border border-amber-100"><UserCheck size={10}/> {worker.name}</span>}
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0">
                   <span className={`font-mono font-bold text-lg ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {isIncome ? '+' : '-'} {formatCurrency(tr.amount)}
                   </span>
                   
                   {!readonly && (
                     <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(tr)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                        <button onClick={() => onDelete(tr.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                     </div>
                   )}
                </div>
             </div>
          </div>
        );
      })}
    </div>
  );
};

// --- MODALS ---

const PartnerShareModal = ({ isOpen, onClose, partners, financials, onPrint }: any) => {
  if (!isOpen) return null;
  const { totalIncome = 0, totalExpense = 0, workerShare = 0, netFarmProfit = 0, distributableProfit = 0, sharePerPartner = 0 } = financials.shareDetails || {};

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Coins className="w-6 h-6 text-amber-500"/> Profit Distribution
                </h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-600">Total Income</span>
                        <span className="font-bold text-slate-900">{formatCurrency(totalIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Total Expenses</span>
                        <span className="font-bold text-red-600">-{formatCurrency(totalExpense)}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-bold">
                        <span className="text-slate-800">Net Farm Profit</span>
                        <span className="text-emerald-600">{formatCurrency(netFarmProfit)}</span>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm border border-slate-100">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600">Less: Worker Share (20%)</span>
                        <span className="font-bold text-red-600">-{formatCurrency(workerShare)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                        <span className="text-slate-800 font-bold">Distributable Profit (80%)</span>
                        <span className="font-black text-slate-900 text-lg">{formatCurrency(distributableProfit)}</span>
                    </div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                    <p className="text-xs text-emerald-800 uppercase font-bold mb-1">Share Per Partner ({partners.length})</p>
                    <p className="text-3xl font-black text-emerald-700">{formatCurrency(sharePerPartner)}</p>
                </div>
                <button onClick={onPrint} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-slate-200">
                    <Printer size={18} /> Print Calculation
                </button>
            </div>
        </div>
    </div>
  );
};

const WorkerShareModal = ({ isOpen, onClose, transactions, partners, season, onUpdateTransaction, workerIncomeBase, workerExpenseBase, workerGrossShare, workerExpenseShare, workerNetShare, onPrint, lang }: any) => {
    if (!isOpen) return null;
    const t = TRANSLATIONS[lang as Language];

    const TransactionRow = ({ tr }: { tr: Transaction }) => {
        const partner = partners.find((p: Partner) => p.id === tr.payerPartnerId);
        const sourceLabel = tr.paymentSource === 'PARTNER' 
            ? <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px] border border-purple-100 font-bold">{partner?.name}</span> 
            : null;

        return (
            <div className={`flex items-center justify-between p-3 rounded-xl border mb-2 transition-all ${tr.includeInWorkerShare !== false ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <input 
                        type="checkbox" 
                        checked={tr.includeInWorkerShare !== false}
                        onChange={(e) => onUpdateTransaction({ ...tr, includeInWorkerShare: e.target.checked })}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                             <span className={`text-sm font-bold truncate ${tr.includeInWorkerShare !== false ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                                 {tr.category}
                             </span>
                             {sourceLabel}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                             <span>{tr.date}</span>
                             {tr.description && <span className="truncate border-l border-slate-300 pl-2 ml-1 max-w-[150px]">{tr.description}</span>}
                        </div>
                    </div>
                </div>
                <span className={`font-mono font-bold whitespace-nowrap ${tr.includeInWorkerShare !== false ? (tr.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400'}`}>
                    {formatCurrency(tr.amount)}
                </span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Calculator className="w-6 h-6 text-amber-600"/> {t.calculationDetails}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Select/Unselect transactions to adjust share</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onPrint} className="p-2 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 rounded-xl text-slate-600 transition-colors flex items-center gap-2 font-medium text-xs shadow-sm">
                             <Printer size={16}/> Print
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20}/></button>
                    </div>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left relative overflow-hidden">
                         <div className="relative z-10">
                             <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Total Income (Included)</p>
                             <p className="text-xl font-bold text-slate-700">{formatCurrency(workerIncomeBase)}</p>
                             <div className="mt-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded inline-block border border-emerald-200">
                               (+) 20% Share: {formatCurrency(workerGrossShare)}
                             </div>
                         </div>
                         <div className="md:border-l md:border-amber-200 md:pl-4 relative z-10">
                             <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Total Expense (Included)</p>
                             <p className="text-xl font-bold text-slate-700">{formatCurrency(workerExpenseBase)}</p>
                             <div className="mt-2 bg-rose-100 text-rose-800 text-xs font-bold px-2 py-1 rounded inline-block border border-rose-200">
                               (-) 20% Cut: {formatCurrency(workerExpenseShare)}
                             </div>
                         </div>
                         <div className="md:border-l md:border-amber-200 md:pl-4 relative z-10 bg-white/60 rounded-xl p-2 md:p-0 md:bg-transparent flex flex-col justify-center">
                             <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Net Payable Share</p>
                             <p className="text-3xl font-black text-slate-900">{formatCurrency(workerNetShare)}</p>
                             <p className="text-[10px] text-slate-500 font-medium">(Share minus Expense Cut)</p>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 h-full flex flex-col">
                            <h4 className="font-bold text-emerald-700 mb-3 pb-2 border-b border-emerald-100 flex justify-between items-center sticky top-0 bg-slate-50 z-10">
                                <span>Income Sources</span>
                                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg">Adds to Share</span>
                            </h4>
                            <div className="space-y-1 overflow-y-auto flex-1 max-h-[300px] pr-1">
                                {transactions.filter((t: any) => t.type === 'INCOME').sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tr: any) => (
                                    <TransactionRow key={tr.id} tr={tr} />
                                ))}
                                {transactions.filter((t: any) => t.type === 'INCOME').length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No income records</p>}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 h-full flex flex-col">
                            <h4 className="font-bold text-rose-700 mb-3 pb-2 border-b border-rose-100 flex justify-between items-center sticky top-0 bg-slate-50 z-10">
                                <span>Deductible Expenses</span>
                                <span className="text-xs bg-rose-100 text-rose-800 px-2 py-1 rounded-lg">Cuts Share</span>
                            </h4>
                             <div className="space-y-1 overflow-y-auto flex-1 max-h-[300px] pr-1">
                                {transactions.filter((t: any) => t.type === 'EXPENSE').sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tr: any) => (
                                    <TransactionRow key={tr.id} tr={tr} />
                                ))}
                                {transactions.filter((t: any) => t.type === 'EXPENSE').length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No expense records</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50 text-right flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-medium shadow-lg shadow-slate-200">Close</button>
                </div>
            </div>
        </div>
    );
};

const TransactionForm = ({ initialData, onSave, onCancel, seasons, workers, partners, categories, onAddCategory, onNotify, lang }: any) => {
  const t = TRANSLATIONS[lang as Language];
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
          <label className="block text-sm font-semibold text-slate-500 mb-2">{t.date}</label>
          <input 
            type="date" 
            required
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 font-medium"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-500 mb-2">{t.amount} (₹)</label>
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
           <label className="block text-sm font-semibold text-slate-500 mb-2">{t.category}</label>
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
          <label className="block text-sm font-semibold text-slate-500 mb-2">{t.description}</label>
          <textarea 
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
            rows={2}
            value={formData.description || ''}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="px-6 py-3 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors">{t.cancel}</button>
        <button type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all active:scale-95">
          <Save className="w-5 h-5" /> {t.saveRecord}
        </button>
      </div>
    </form>
  );
};

// --- Season Card (Used by SeasonsView) ---

const SeasonCard = ({ season, transactions, workers, partners, onCloseSeason, onDeleteSeason, onUpdateTransaction, onPrint, lang }: any) => {
  const [showShareDetails, setShowShareDetails] = useState(false);
  const t = TRANSLATIONS[lang as Language];

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

  const handlePrintReport = () => {
    onPrint({
      type: 'SEASON_REPORT',
      season,
      transactions,
      summary: { totalIncome, totalExpense, netProfit: totalIncome - totalExpense, workerShare: workerGrossShare - workerExpenseShare, advances: seasonAdvances, payable: finalPayable }
    });
  };

  return (
    <>
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
          <button 
             onClick={handlePrintReport}
             className="text-sm bg-white text-blue-600 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-50 flex items-center gap-2 font-semibold shadow-sm transition-colors"
          >
             <Printer className="w-4 h-4"/> {t.downloadReport}
          </button>
          {season.status === 'OPEN' && (
            <button 
              onClick={() => onCloseSeason(season.id)}
              className="text-sm bg-white text-rose-600 px-4 py-2 rounded-xl border border-rose-100 hover:bg-rose-50 flex items-center gap-2 font-semibold shadow-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> {t.closeSeason}
            </button>
          )}
          <button 
            onClick={() => onDeleteSeason(season.id)}
            className="text-sm bg-white text-gray-500 px-4 py-2 rounded-xl border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 flex items-center gap-2 font-semibold shadow-sm transition-colors"
            title="Delete Season"
          >
            <Trash2 className="w-4 h-4" /> {t.delete}
          </button>
        </div>
      </div>

      <div className={`p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 ${season.status === 'CLOSED' ? 'opacity-70' : ''}`}>
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <LandPlot className="w-4 h-4" /> {t.farmPerformance}
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
              <span className="text-slate-600 font-medium text-sm">{t.totalRevenue}</span>
              <span className="font-bold text-emerald-600 text-lg">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-rose-50/50 border border-rose-100/50">
              <span className="text-slate-600 font-medium text-sm">{t.totalExpenses}</span>
              <span className="font-bold text-rose-600 text-lg">{formatCurrency(totalExpense)}</span>
            </div>
          </div>
          <div className="flex justify-between pt-4 border-t border-dashed border-slate-200">
            <span className="font-bold text-slate-900">{t.netProfit}</span>
            <span className={`font-bold text-2xl ${(totalIncome - totalExpense) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatCurrency(totalIncome - totalExpense)}
            </span>
          </div>
        </div>

        <div className="bg-amber-50/50 p-6 rounded-2xl space-y-5 border border-amber-100/50">
          <div className="flex justify-between items-start">
             <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-2">
               <Users className="w-4 h-4" /> {t.workerShare}
             </h4>
             <button 
                onClick={() => setShowShareDetails(true)} 
                className="text-[10px] bg-white px-2 py-1 rounded-md text-amber-700 border border-amber-200 font-bold hover:bg-amber-100 flex items-center gap-1"
             >
                <FileText size={10} /> Details
             </button>
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
               <span className="font-bold text-slate-800">{t.finalPayable}</span>
               <span className={`font-black text-xl ${finalPayable >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                 {formatCurrency(finalPayable)}
               </span>
             </div>
          </div>
        </div>
      </div>
    </div>
    
    <WorkerShareModal 
        isOpen={showShareDetails}
        onClose={() => setShowShareDetails(false)}
        transactions={transactions}
        partners={partners}
        season={season}
        onUpdateTransaction={onUpdateTransaction}
        workerIncomeBase={workerIncomeBase}
        workerExpenseBase={workerExpenseBase}
        workerGrossShare={workerGrossShare}
        workerExpenseShare={workerExpenseShare}
        workerNetShare={workerNetShare}
        onPrint={(data:any) => onPrint({type: 'WORKER_SHARE', season, workerIncomeBase, workerExpenseBase, workerGrossShare, workerExpenseShare, workerNetShare, transactions: transactions.filter((t: any) => t.includeInWorkerShare !== false && (t.type === 'INCOME' || t.type === 'EXPENSE'))})}
        lang={lang}
    />
    </>
  );
};

// --- VIEW COMPONENTS (Defined After Helpers/Cards) ---

const Dashboard = ({ financials, transactions, seasons, partners, workers, onDeleteTransaction, onEditTransaction, onViewAll, lang }: any) => {
  const t = TRANSLATIONS[lang as Language];
  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 opacity-[0.03] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
            <Wallet size={120} />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-500" /> {t.farmCash}</span>
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
            <span className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2"><LandPlot className="w-4 h-4 text-blue-500" /> {t.bankBalance}</span>
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
            <span className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2"><Users className="w-4 h-4 text-orange-500" /> {t.workerAdvances}</span>
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
                <p className="text-[10px] text-slate-400">{financials.partnerBalances[p.id] >= 0 ? t.invested : t.withdrawn}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" /> {t.recentActivity}
          </h3>
          <button onClick={onViewAll} className="text-emerald-600 text-sm font-medium hover:underline flex items-center">{t.viewAll} <ChevronRight size={16}/></button>
        </div>
        <TransactionList 
          transactions={transactions.slice(0, 5)} 
          seasons={seasons} 
          partners={partners} 
          workers={workers}
          onDelete={onDeleteTransaction}
          onEdit={onEditTransaction} 
          readonly
          lang={lang}
        />
      </div>
    </div>
  );
};

const SeasonsView = ({ seasons, transactions, workers, partners, onAddSeason, onCloseSeason, onDeleteSeason, onUpdateTransaction, onPrint, lang }: any) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const t = TRANSLATIONS[lang as Language];

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
        <h2 className="text-2xl font-bold text-slate-800">{t.seasons}</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> {t.newSeason}
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
            <button onClick={() => setIsCreating(false)} className="text-slate-500 px-4">{t.cancel}</button>
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
            partners={partners}
            onCloseSeason={onCloseSeason}
            onDeleteSeason={onDeleteSeason}
            onUpdateTransaction={onUpdateTransaction}
            onPrint={onPrint}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
};

const WorkersView = ({ workers, transactions, onAddWorker, onDeleteWorker, lang }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newWorker, setNewWorker] = useState<Partial<Worker>>({});
  const t = TRANSLATIONS[lang as Language];

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
        <h2 className="text-2xl font-bold text-slate-800">{t.workers}</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> {t.addWorker}
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
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.totalDebt}</p>
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

const TransactionManager = ({ transactions, seasons, partners, workers, categories, onAddTransaction, onUpdateTransaction, onDeleteTransaction, onAddCategory, onNotify, onPrint, lang }: any) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const t = TRANSLATIONS[lang as Language];

  const defaultFilters: TransactionFilters = {
    startDate: '',
    endDate: '',
    type: 'ALL',
    seasonId: 'ALL',
    workerId: 'ALL',
    partnerId: 'ALL',
    category: 'ALL',
    search: ''
  };

  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: Transaction) => {
      if (filters.search && !t.description?.toLowerCase().includes(filters.search.toLowerCase()) && !t.category.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.type !== 'ALL' && t.type !== filters.type) return false;
      if (filters.seasonId !== 'ALL' && t.seasonId !== filters.seasonId) return false;
      if (filters.workerId !== 'ALL' && t.workerId !== filters.workerId) return false;
      if (filters.partnerId !== 'ALL' && (t.partnerId !== filters.partnerId && t.payerPartnerId !== filters.partnerId)) return false;
      if (filters.category !== 'ALL' && t.category !== filters.category) return false;
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;
      return true;
    }).sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filters]);

  const filteredTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t: Transaction) => {
        if (t.type === 'INCOME' || t.type === 'PARTNER_CONTRIBUTION') income += Number(t.amount);
        if (t.type === 'EXPENSE' || t.type === 'WORKER_ADVANCE' || t.type === 'PARTNER_WITHDRAWAL') expense += Number(t.amount);
    });
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const handleResetFilters = () => setFilters(defaultFilters);
  const activeFilterCount = Object.values(filters).filter(v => v !== 'ALL' && v !== '').length;

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">{t.transactions}</h2>
        <div className="flex gap-2">
            {activeFilterCount > 0 && (
                <button 
                  onClick={() => onPrint({ type: 'FILTERED_LIST', transactions: filteredTransactions })}
                  className="px-3 py-2.5 bg-slate-800 text-white rounded-xl flex items-center gap-2 hover:bg-slate-900 transition-colors shadow-lg shadow-slate-300"
                  title="Export Current List to PDF"
                >
                   <Printer size={18} /> Print
                </button>
            )}
            <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium ${showFilters || activeFilterCount > 0 ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
            <Filter className="w-4 h-4" /> 
            {t.filters}
            {activeFilterCount > 0 && <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
            </button>
            <button 
            onClick={() => { setEditingId(null); setIsFormOpen(true); }}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
            >
            <Plus className="w-5 h-5" /> {t.addNew}
            </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-top-2">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-700 flex items-center gap-2"><Search size={16}/> Filter Options</h3>
             <button onClick={handleResetFilters} className="text-xs text-rose-600 font-bold hover:underline">{t.reset}</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
              />
              <div className="flex gap-2">
                 <input 
                    type="date" 
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    value={filters.startDate}
                    onChange={e => setFilters({...filters, startDate: e.target.value})}
                 />
                 <input 
                    type="date" 
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    value={filters.endDate}
                    onChange={e => setFilters({...filters, endDate: e.target.value})}
                 />
              </div>
              <select 
                 className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                 value={filters.type}
                 onChange={e => setFilters({...filters, type: e.target.value})}
              >
                 <option value="ALL">All Types</option>
                 <option value="INCOME">Income</option>
                 <option value="EXPENSE">Expense</option>
                 <option value="WORKER_ADVANCE">Worker Advance</option>
                 <option value="PARTNER_CONTRIBUTION">Partner Contribution</option>
                 <option value="PARTNER_WITHDRAWAL">Partner Withdrawal</option>
              </select>
              <select 
                 className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                 value={filters.seasonId}
                 onChange={e => setFilters({...filters, seasonId: e.target.value})}
              >
                 <option value="ALL">All Seasons</option>
                 {seasons.map((s: Season) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
               <select 
                 className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                 value={filters.workerId}
                 onChange={e => setFilters({...filters, workerId: e.target.value})}
              >
                 <option value="ALL">All Workers</option>
                 {workers.map((w: Worker) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <select 
                 className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                 value={filters.partnerId}
                 onChange={e => setFilters({...filters, partnerId: e.target.value})}
              >
                 <option value="ALL">All Partners</option>
                 {partners.map((p: Partner) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
           </div>
        </div>
      )}

      {/* Filtered Summary Header */}
      {activeFilterCount > 0 && (
         <div className="bg-slate-800 text-white p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4 shadow-lg animate-in fade-in">
             <div className="flex items-center gap-2">
                 <Filter size={18} className="text-emerald-400" />
                 <span className="font-bold text-sm uppercase tracking-wide">{t.filteredTotal}</span>
             </div>
             <div className="flex gap-6 text-sm">
                 <div className="text-center">
                    <span className="block text-slate-400 text-xs">{t.income}</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(filteredTotals.income)}</span>
                 </div>
                 <div className="text-center">
                    <span className="block text-slate-400 text-xs">{t.expense}</span>
                    <span className="font-bold text-rose-400">{formatCurrency(filteredTotals.expense)}</span>
                 </div>
                 <div className="text-center border-l border-slate-600 pl-6">
                    <span className="block text-slate-400 text-xs">Net</span>
                    <span className={`font-bold ${filteredTotals.balance >= 0 ? 'text-white' : 'text-red-300'}`}>{formatCurrency(filteredTotals.balance)}</span>
                 </div>
             </div>
         </div>
      )}

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
          lang={lang}
        />
      )}

      <TransactionList 
        transactions={filteredTransactions} 
        seasons={seasons} 
        partners={partners} 
        workers={workers}
        onEdit={(tr: Transaction) => {
          setEditingId(tr.id);
          setIsFormOpen(true);
          window.scrollTo(0, 0);
        }}
        onDelete={onDeleteTransaction}
        lang={lang}
      />
    </div>
  );
};

const PartnersView = ({ partners, transactions, financials, onPrint, lang }: any) => {
  const t = TRANSLATIONS[lang as Language];
  const [showShareCalc, setShowShareCalc] = useState(false); 

  const handlePrintPartner = (partner: Partner, partnerTrans: any[], summary: any) => {
      onPrint({ type: 'PARTNER_REPORT', partner, transactions: partnerTrans, summary });
  };

  return (
  <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in">
     <h2 className="text-2xl font-bold text-slate-800">{t.partners}</h2>
     <div className="grid grid-cols-1 gap-6">
       {partners.map((partner: Partner) => {
         // --- Calculations ---
         const partnerTrans = transactions.filter((t: Transaction) => 
            (t.partnerId === partner.id) || 
            (t.paymentSource === 'PARTNER' && t.payerPartnerId === partner.id)
         ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

         const summary = { directContribution, expensesPaid, advancesPaid, incomeReceived, totalInvested, withdrawal, netBalance };

         return (
           <div key={partner.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
             <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl border-4 border-white shadow-sm">
                        {partner.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{partner.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">Partner</p>
                    </div>
                </div>
                <button 
                    onClick={() => handlePrintPartner(partner, partnerTrans, summary)}
                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-emerald-600 transition-colors shadow-sm"
                >
                    <Printer size={16} /> Print Report
                </button>
             </div>
             
             <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Col: Investments */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><ArrowRight size={14} className="text-emerald-500"/> Inflows (Investment)</h4>
                    <div className="bg-emerald-50/50 rounded-2xl p-4 space-y-3 border border-emerald-100/50">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Direct Cash Injection</span>
                            <span className="font-bold text-slate-800">{formatCurrency(directContribution)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Expenses Paid (Pocket)</span>
                            <span className="font-bold text-slate-800">{formatCurrency(expensesPaid)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Advances Paid (Pocket)</span>
                            <span className="font-bold text-slate-800">{formatCurrency(advancesPaid)}</span>
                        </div>
                        <div className="pt-3 border-t border-emerald-100 flex justify-between items-center">
                            <span className="font-bold text-emerald-800 text-sm">Total Invested</span>
                            <span className="font-bold text-emerald-700 text-lg">{formatCurrency(totalInvested)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Col: Withdrawals/Balance */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><ArrowRight size={14} className="text-rose-500"/> Outflows & Balance</h4>
                    <div className="bg-rose-50/50 rounded-2xl p-4 space-y-3 border border-rose-100/50">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Cash Withdrawn</span>
                            <span className="font-bold text-rose-600">-{formatCurrency(withdrawal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Income Kept (Pocket)</span>
                            <span className="font-bold text-rose-600">-{formatCurrency(incomeReceived)}</span>
                        </div>
                         <div className="pt-3 border-t border-rose-100 flex justify-between items-center">
                            <span className="font-bold text-slate-700 text-sm">Net Balance (Invested)</span>
                            <span className={`font-black text-xl ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(netBalance)}</span>
                        </div>
                    </div>
                </div>
             </div>
             
             {/* Bottom: Est Share */}
             <div className="px-6 pb-6 md:px-8 md:pb-8">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="p-2 bg-white rounded-full shadow-sm text-amber-500">
                        <Coins size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <p className="text-xs font-bold text-slate-400 uppercase">Estimated Season Share</p>
                           <button onClick={() => setShowShareCalc(true)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-full transition-colors">
                              <Eye size={16} />
                           </button>
                        </div>
                        <p className="text-sm font-medium text-slate-600">50% of Net Farm Profit</p>
                    </div>
                    <span className={`font-bold text-xl ${financials.sharePerPartner >= 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {formatCurrency(financials.sharePerPartner)}
                    </span>
                </div>
             </div>
           </div>
         );
       })}
     </div>

     <PartnerShareModal 
        isOpen={showShareCalc}
        onClose={() => setShowShareCalc(false)}
        partners={partners}
        financials={financials}
        onPrint={() => onPrint({ type: 'PARTNER_DISTRIBUTION', partners, financials })}
     />
  </div>
);
};

const DataManagementView = ({ onImport, onExport, seasons, onExportSeason, lang }: any) => {
  const t = TRANSLATIONS[lang as Language];
  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in">
       <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
         <Database className="w-6 h-6 text-emerald-600" /> {t.data}
       </h2>

       {/* Guide for Sync */}
       <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="flex items-center gap-2 font-bold text-blue-900 text-lg mb-2">
            <Share2 className="w-5 h-5" /> How to sync between Father & Uncle's mobile?
          </h3>
          <p className="text-sm text-blue-800 mb-4 leading-relaxed">
            Since this app works offline, data is stored on your phone. To share data:
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2 font-medium">
             <li>Click <strong>"Backup for WhatsApp"</strong> below. It will download a file.</li>
             <li>Send that file to your Uncle via WhatsApp.</li>
             <li>Uncle downloads the file on his phone.</li>
             <li>Uncle opens this app, goes to this Data tab, clicks <strong>"Select File to Merge"</strong> and selects the file.</li>
          </ol>
       </div>
       
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
             <h3 className="font-bold text-slate-800 text-lg mb-1">{t.backupRestore}</h3>
             <p className="text-sm text-slate-600">
               Save your data securely. Data is stored on your device. Backup regularly.
             </p>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Export Section */}
             <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">1. {t.shareWhatsapp}</h4>
                    <p className="text-xs text-slate-500">Download file to send via WhatsApp</p>
                  </div>
                </div>
                <button 
                  onClick={onExport}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200 active:scale-[0.98]"
                >
                  <Share2 className="w-5 h-5" /> Backup for WhatsApp
                </button>
             </div>

             {/* Import Section */}
             <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-50 p-3 rounded-full text-orange-600">
                    <GitMerge className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">2. Smart Merge (Import)</h4>
                    <p className="text-xs text-slate-500">Combine incoming data with your existing data.</p>
                  </div>
                </div>
                <label className="w-full py-4 bg-white border-2 border-dashed border-orange-200 hover:border-orange-500 text-orange-600 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-orange-50 active:scale-[0.98]">
                  <Upload className="w-5 h-5" /> Select File to Merge
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
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('agri_lang') as Language) || 'EN');
  const [printData, setPrintData] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('agri_lang', lang);
  }, [lang]);
  
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
    const workerEligibleIncome = transactions.filter((t: any) => t.type === 'INCOME' && t.includeInWorkerShare !== false).reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const workerEligibleExpense = transactions.filter((t: any) => t.type === 'EXPENSE' && t.includeInWorkerShare !== false).reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const workerShareEstimated = (workerEligibleIncome * 0.20) - (workerEligibleExpense * 0.20);
    
    const distributableProfit = netFarmProfit - workerShareEstimated;
    const sharePerPartner = distributableProfit / (partners.length || 1);

    return { 
        cash, 
        bank, 
        totalAdvances, 
        partnerBalances, 
        sharePerPartner,
        shareDetails: {
            totalIncome,
            totalExpense,
            netFarmProfit,
            workerShare: workerShareEstimated,
            distributableProfit,
            sharePerPartner
        }
    };
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
        const content = e.target?.result as string;
        if (!content) throw new Error("Empty file");
        
        const json = JSON.parse(content);
        
        // Robust Validation
        const isValidBackup = (json.transactions && Array.isArray(json.transactions)) || 
                              (json.workers && Array.isArray(json.workers)) ||
                              (json.seasons || json.season);

        if (isValidBackup) {
           // Normalize single 'season' to 'seasons' array if old format
           if (json.season && !json.seasons) {
               json.seasons = [json.season];
           }
           setPendingImport(json);
           // Clear input
           event.target.value = '';
        } else {
           showNotification("Invalid backup file: Missing required data.", 'error');
        }
      } catch (err) {
        showNotification("Error reading file: Invalid JSON format.", 'error');
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (pendingImport) {
       // Helper: Merge new items into current items, updating if ID exists, adding if not.
       // Preserves properties of existing items if new item doesn't have them (though in this case we likely want full overwrite for that ID)
       // We use spread ...item to let import override local for that specific ID.
       const smartMerge = (current: any[], incoming: any[]) => {
          if (!incoming || !Array.isArray(incoming)) return current;
          
          const map = new Map(current.map(i => [i.id, i]));
          
          incoming.forEach(item => {
             if (item && item.id) {
                 const existing = map.get(item.id);
                 // Merge logic: If existing, merge fields (Import takes precedence). If new, add.
                 map.set(item.id, existing ? { ...existing, ...item } : item);
             }
          });
          return Array.from(map.values());
       };

       try {
           setTransactions(prev => smartMerge(prev, pendingImport.transactions));
           setWorkers(prev => smartMerge(prev, pendingImport.workers));
           setPartners(prev => smartMerge(prev, pendingImport.partners));
           setSeasons(prev => smartMerge(prev, pendingImport.seasons));
           
           if (pendingImport.categories) {
              setCategories(prev => {
                 const next = { ...prev };
                 Object.keys(pendingImport.categories).forEach(k => {
                     const key = k as keyof CategoryMap;
                     const incomingCats = pendingImport.categories[key];
                     if (Array.isArray(incomingCats)) {
                         // Case-insensitive check to avoid duplicate categories like "Seeds" and "seeds"
                         const existingLower = new Set(prev[key].map(c => c.toLowerCase().trim()));
                         const newUnique = incomingCats.filter((c: string) => !existingLower.has(c.toLowerCase().trim()));
                         next[key] = [...prev[key], ...newUnique];
                     }
                 });
                 return next;
              });
           }

           showNotification("Data merged successfully!", 'success');
       } catch (e) {
           console.error(e);
           showNotification("An error occurred during merging.", 'error');
       }
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
          lang={lang}
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
          onPrint={setPrintData}
          lang={lang}
        />
      );
      case 'SEASONS': return (
        <SeasonsView 
          seasons={seasons} 
          transactions={transactions} 
          workers={workers} 
          partners={partners} // Added prop
          onAddSeason={handleAddSeason}
          onCloseSeason={handleCloseSeason}
          onDeleteSeason={handleDeleteSeason}
          onUpdateTransaction={handleUpdateTransaction} // Added prop
          onPrint={setPrintData}
          lang={lang}
        />
      );
      case 'WORKERS': return (
        <WorkersView 
          workers={workers} 
          transactions={transactions} 
          onAddWorker={handleAddWorker}
          onDeleteWorker={handleDeleteWorker}
          lang={lang}
        />
      );
      case 'PARTNERS': return <PartnersView partners={partners} transactions={transactions} financials={financials} onPrint={setPrintData} lang={lang} />;
      case 'DATA': return (
        <DataManagementView 
           onImport={handleImportData} 
           onExport={handleExportData} 
           seasons={seasons}
           onExportSeason={handleExportSeason}
           lang={lang}
        />
      );
      default: return null;
    }
  };

  const t = TRANSLATIONS[lang];

  // --- Render (Print Mode Check) ---
  if (printData) {
     return <PrintTemplate data={printData} onExit={() => setPrintData(null)} />;
  }

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
        <div className="flex items-center gap-4">
             <button onClick={() => setLang(l => l === 'EN' ? 'GU' : 'EN')} className="flex items-center gap-1 text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <Languages size={14} /> {lang}
             </button>
            <button onClick={() => setActiveTab('DATA')} className="text-slate-300 hover:text-white flex flex-col items-center">
                <Database className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col bg-slate-900 text-white w-72 flex-shrink-0 h-screen sticky top-0 border-r border-slate-800 print:hidden">
        <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-xl text-white">
                <Sprout className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">AgriBooks</h1>
            </div>
            <button onClick={() => setLang(l => l === 'EN' ? 'GU' : 'EN')} className="flex items-center gap-1 text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">
                <Languages size={14} /> {lang}
            </button>
        </div>
        <nav className="px-4 py-2 space-y-2 flex-1">
          <NavButton icon={<PieChart />} label={t.dashboard} active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} />
          <NavButton icon={<DollarSign />} label={t.transactions} active={activeTab === 'TRANSACTIONS'} onClick={() => setActiveTab('TRANSACTIONS')} />
          <NavButton icon={<Calendar />} label={t.seasons} active={activeTab === 'SEASONS'} onClick={() => setActiveTab('SEASONS')} />
          <NavButton icon={<Users />} label={t.workers} active={activeTab === 'WORKERS'} onClick={() => setActiveTab('WORKERS')} />
          <NavButton icon={<TrendingUp />} label={t.partners} active={activeTab === 'PARTNERS'} onClick={() => setActiveTab('PARTNERS')} />
          <div className="pt-6 mt-6 border-t border-slate-800">
             <NavButton icon={<Database />} label={t.data} active={activeTab === 'DATA'} onClick={() => setActiveTab('DATA')} />
          </div>
        </nav>
        <div className="p-6 bg-slate-950/50">
          <p className="text-xs text-slate-500">v1.5 &bull; Offline Ready</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto print:p-0 print:overflow-visible">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-20 pb-safe shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] print:hidden">
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

      {/* Import Confirmation Modal - UPDATED FOR SMART MERGE */}
      {pendingImport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
             <div className="flex flex-col items-center text-center">
               <div className="bg-emerald-50 p-4 rounded-full text-emerald-600 mb-4">
                 <GitMerge className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Merge Data?</h3>
               <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
                 Safe to perform. <br/>
                 This will <span className="text-emerald-700 font-bold">combine</span> the backup with your existing data. No data will be lost.
               </p>
               <div className="flex gap-3 w-full">
                 <button onClick={() => setPendingImport(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                 <button 
                   onClick={confirmImport} 
                   className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors"
                 >
                   Merge Data
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
