import { useEffect, useState, useCallback } from 'react'
import { TopNav, BottomNav } from './components/Nav'
import Dashboard from './pages/Dashboard'
import Agreements from './pages/Agreements'
import CreateAgreement from './pages/CreateAgreement'
import AgreementDetail from './pages/AgreementDetail'
import { getAgreements, getAgreement, seedDemoData } from './lib/storage'
import { generateSchedule } from './lib/calc'

export default function App() {
  const [view, setView] = useState('dashboard')
  const [agreements, setAgreements] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  const refresh = useCallback(() => {
    setAgreements(getAgreements())
  }, [])

  useEffect(() => {
    seedDemoData(generateSchedule)
    refresh()
  }, [refresh])

  function openAgreement(id) {
    setSelectedId(id)
    setView('detail')
  }

  function goTo(nextView) {
    setSelectedId(null)
    setView(nextView)
  }

  const selected = selectedId ? getAgreement(selectedId) : null

  return (
    <div className="min-h-screen pb-24 md:pb-0 font-body">
      <TopNav view={view} setView={goTo} />
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
      <BottomNav view={view} setView={goTo} />
    </div>
  )
}
