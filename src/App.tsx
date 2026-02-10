import { useEffect, useMemo, useState } from "react";
import ChessBoard from "./components/ChessBoard";
import { ChessGameService } from "./services/ChessGameService";

export default function App() {
  const service = useMemo(() => new ChessGameService(), []);
  const [showHistory, setShowHistory] = useState(true);

  // on force un re-render quand le service notifie (sinon history reste "figée")
  const [, forceRender] = useState(0);
  useEffect(() => {
    const unsub = service.subscribe(() => forceRender((x) => x + 1));
    return () => unsub();
  }, [service]);

  const history = service.getHistory();

  return (
    <div className="app">
      <h1>Jeu d’échecs</h1>

      <p className="muted">
        Drag & drop : tu peux déplacer une pièce. Les coups illégaux sont refusés (règles chess.js).
      </p>

      <div className="layout">
        <ChessBoard service={service} />

        <div className="panel">
          <div className="panelHeader">
            <h2>Historique</h2>
            <button className="btn" onClick={() => setShowHistory((v) => !v)}>
              {showHistory ? "Masquer" : "Afficher"}
            </button>
          </div>

          {showHistory && (
            <div className="card">
              <h3>Historique des déplacements</h3>

              {history.length === 0 ? (
                <p className="muted">Aucun coup pour le moment.</p>
              ) : (
                <ol className="history">
                  {history
                    .slice()
                    .reverse()
                    .map((m, idx) => (
                      <li key={`${m.at}-${idx}`}>
                        <b>{m.from}</b> → <b>{m.to}</b>{" "}
                        <span className="muted">({m.san})</span>
                        {m.captured ? (
                          <span className="muted"> — capture: {m.captured}</span>
                        ) : null}
                        {m.promotion ? (
                          <span className="muted"> — promotion: {m.promotion}</span>
                        ) : null}
                      </li>
                    ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
