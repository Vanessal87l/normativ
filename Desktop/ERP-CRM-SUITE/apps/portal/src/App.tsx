import { useMemo, useState } from "react";
// import hero from './assets/hero.svg'

type AppChoice = "ERP" | "CRM";

function getTargets() {
  // Dev: portal 5173, ERP 5174, CRM 5175
  // Prod: you can serve them under /erp and /crm on the same domain.
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);

  return {
    erp: isLocal ? "http://localhost:5174" : "/erp",
    crm: isLocal ? "http://localhost:5175" : "/crm",
  };
}

export default function App() {
  const [choice, setChoice] = useState<AppChoice | "">("");
  const targets = useMemo(() => getTargets(), []);

  const go = () => {
    if (choice === "ERP") window.location.href = targets.erp;
    if (choice === "CRM") window.location.href = targets.crm;
  };

  return (
    <div className="page">
      <div className="card">
        {/* <img className="hero" src={hero} alt="Portal" /> */}

        <h1>ERP / CRM</h1>
        <p className="sub">Kerakli modulni tanlang va davom eting.</p>

        <div className="row">
          <select
            value={choice}
            onChange={(e) => setChoice(e.target.value as AppChoice | "")}
          >
            <option value="">— Tanlang —</option>
            <option value="ERP">ERP</option>
            <option value="CRM">CRM</option>
          </select>

          <button onClick={go} disabled={!choice}>
            Ochish
          </button>
        </div>

        <div className="hint">
          <div>
            <b>Dev:</b> ERP → 5174, CRM → 5175
          </div>
          <div>
            <b>Prod:</b> /erp va /crm
          </div>
        </div>
      </div>
    </div>
  );
}
