import { useMemo, useState } from "react";
import ChessBoard from "./components/ChessBoard";
import { ChessGameService } from "./services/ChessGameService";

export default function App() {
  const service = useMemo(() => new ChessGameService(), []);
  const [showHistory, setShowHistory] = useState(true);

  const history = service.getHistory(); // lecture "instantanée" (la board se re-render via subscribe)

  return (
    <div className="app">
      <h1>Jeu d’échecs</h1>
      <p className="muted">
        Drag & drop : tu peux déplacer n’importe quelle pièce sur n’importe quelle case. Si la case est occupée, la pièce
        est remplacée (capture “libre”).
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
              <ol className="history">
                {history
                  .slice()
                  .reverse()
                  .map((m) => (
                    <li key={`${m.at}-${m.pieceId}`}>
                      <b>{m.color}</b> {m.pieceType} ({m.pieceId}) :{" "}
                      {String.fromCharCode(97 + m.from.file)}
                      {8 - m.from.rank} → {String.fromCharCode(97 + m.to.file)}
                      {8 - m.to.rank}
                      {m.captured ? (
                        <>
                          {" "}
                          — remplace <i>{m.captured.color} {m.captured.type}</i> ({m.captured.id})
                        </>
                      ) : null}
                    </li>
                  ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
