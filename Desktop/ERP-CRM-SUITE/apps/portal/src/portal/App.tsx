import { useMemo, useState } from 'react'
// import reactLogo from '../assets/react.svg'

type Choice = '' | 'ERP' | 'CRM'

const DEV_URLS = {
  ERP: 'http://localhost:5174',
  CRM: 'http://localhost:5175',
} as const

function resolveTarget(choice: Exclude<Choice, ''>) {
  // In production you will typically serve each build under /erp and /crm.
  // In development we run them on separate ports.
  const isLocal =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  if (isLocal) return DEV_URLS[choice]

  // production default (same domain)
  return choice === 'ERP' ? '/erp' : '/crm'
}

export default function App() {
  const [choice, setChoice] = useState<Choice>('')

  const target = useMemo(() => {
    if (!choice) return ''
    return resolveTarget(choice)
  }, [choice])

  const openApp = () => {
    if (!choice) return
    window.location.href = target
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="hero">
            {/* <img src={reactLogo} alt="logo" /> */}
          </div>
          <div>
            <h1 className="title">Bitta portal — ERP / CRM</h1>
            <p className="subtitle">
              Kerakli tizimni tanlang va ichkariga kiring.
            </p>

            <div className="controls">
              <select value={choice} onChange={(e) => setChoice(e.target.value as Choice)}>
                <option value="">Tanlang...</option>
                <option value="ERP">ERP</option>
                <option value="CRM">CRM</option>
              </select>

              <button onClick={openApp} disabled={!choice}>
                Ochish
              </button>
            </div>
          </div>
        </div>

        <div className="footer">
          Dev rejim: Portal <code>:5173</code>, ERP <code>:5174</code>, CRM <code>:5175</code>.
          &nbsp;Prod rejim: <code>/erp</code> va <code>/crm</code>.
        </div>
      </div>
    </div>
  )
}
