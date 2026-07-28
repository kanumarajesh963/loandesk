import { LayoutGrid, FilePlus2, ListChecks, HandCoins } from 'lucide-react'

const ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'agreements', label: 'Agreements', icon: ListChecks },
  { id: 'create', label: 'New Agreement', icon: FilePlus2 }
]

export function TopNav({ view, setView }) {
  return (
    <header className="hidden md:flex items-center justify-between px-8 py-5 sticky top-0 z-30 glass border-x-0 border-t-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-teal/20 border border-teal/30 flex items-center justify-center">
          <HandCoins size={18} className="text-teal" />
        </div>
        <span className="font-display font-bold text-lg tracking-tight">LoanDesk</span>
      </div>
      <nav className="flex items-center gap-1">
        {ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`focus-ring flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              view === id ? 'bg-white/10 text-white' : 'text-mist hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}

export function BottomNav({ view, setView }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-strong px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around">
        {ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`focus-ring flex flex-col items-center gap-1 py-2.5 px-3 flex-1 text-[11px] font-medium ${
              view === id ? 'text-teal' : 'text-mist'
            }`}
          >
            <Icon size={20} />
            {label === 'New Agreement' ? 'New' : label}
          </button>
        ))}
      </div>
    </nav>
  )
}
