import { useEffect, useState, useCallback } from 'react'
import { TopNav, BottomNav } from './components/Nav'
import Dashboard from './pages/Dashboard'
import Agreements from './pages/Agreements'
import CreateAgreement from './pages/CreateAgreement'
import AgreementDetail from './pages/AgreementDetail'
import Login from './pages/Login'
import BorrowerView from './pages/BorrowerView'
import { getAgreements, getAgreement, seedDemoData } from './lib/storage'
import { generateSchedule } from './lib/calc'
import { getCurrentUser, logout } from './lib/auth'
import { decodeShareLink } from './lib/shareLink'

export default function App() {
  const [user, setUser] = useState(() => getCurrentUser())
  const [view, setView] = useState('dashboard')
  const [agreements, setAgreements] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  const refresh = useCallback(() => {
    setAgreements(getAgreements())
  }, [])

  useEffect(() => {
    if (!user) return
    seedDemoData(generateSchedule)
    refresh()
  }, [user, refresh])

  // Shared read-only borrower link — works with no login, checked first.
  const params = new URLSearchParams(window.location.search)
  const sharedParam = params.get('share')
  if (sharedParam) {
    const shared = decodeShareLink(sharedParam)
    if (shared) {
      return <BorrowerView agreement={shared} />
    }
  }

  function handleAuthed(authedUser) {
    setUser(authedUser)
    setView('dashboard')
  }

  function handleLogout() {
    logout()
    setUser(null)
    setAgreements([])
    setSelectedId(null)
    setView('dashboard')
  }

  function openAgreement(id) {
    setSelectedId(id)
    setView('detail')
  }

  function goTo(nextView) {
    setSelectedId(null)
    setView(nextView)
  }

  if (!user) {
    return <Login onAuthed={handleAuthed} />
  }

  const selected = selectedId ? getAgreement(selectedId) : null

  return (
    <div className="min-h-screen pb-24 md:pb-0 font-body">
      <TopNav view={view} setView={goTo} user={user} onLogout={handleLogout} />
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {view === 'dashboard' && (
          <Dashboard agreements={agreements} openAgreement={openAgreement} setView={goTo} />
        )}
        {view === 'agreements' && (
          <Agreements agreements={agreements} openAgreement={openAgreement} />
        )}
        {view === 'create' && (
          <CreateAgreement onCreated={refresh} />
        )}
        {view === 'detail' && (
          <AgreementDetail
            agreement={selected}
            back={() => goTo('agreements')}
            refresh={refresh}
          />
        )}
      </main>
      <BottomNav view={view} setView={goTo} onLogout={handleLogout} />
    </div>
  )
}
