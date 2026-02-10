import { useEffect, useMemo, useState } from "react";
import type { Board, Piece, Square } from "../types/chess";
import { ChessGameService } from "../services/ChessGameService";

type Props = {
  service: ChessGameService;
};

function sqKey(s: Square) {
  return `${s.rank}-${s.file}`;
}

function toAlg(s: Square) {
  const file = String.fromCharCode(97 + s.file); // 0..7 => a..h
  const rank = 8 - s.rank; // rank 0 en haut => "8", rank 7 => "1"
  return `${file}${rank}`;
}

export default function ChessBoard({ service }: Props) {
  const [board, setBoard] = useState<Board>(() => service.getBoard());
  const [historyCount, setHistoryCount] = useState<number>(() => service.getHistory().length);

  // drag source
  const [dragFrom, setDragFrom] = useState<Square | null>(null);

  // surlignage
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Set<string>>(new Set());

  // feedback coup illégal
  const [illegalMsg, setIllegalMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = service.subscribe(() => {
      setBoard(service.getBoard());
      setHistoryCount(service.getHistory().length);
    });

    return () => {
      unsub();
    };
  }, [service]);

  const files = useMemo(() => ["a", "b", "c", "d", "e", "f", "g", "h"], []);

  const clearDragUI = () => {
    setDragFrom(null);
    setSelected(null);
    setLegalTargets(new Set());
  };

  const onDropSquare = (to: Square) => {
    if (!dragFrom) return;

    const ok = service.tryMove(dragFrom, to);
    clearDragUI();

    if (!ok) {
      setIllegalMsg(`Coup illégal : ${toAlg(dragFrom)} → ${toAlg(to)}`);
      window.setTimeout(() => setIllegalMsg(null), 2000);
    } else {
      setIllegalMsg(null);
    }
  };

  const renderPiece = (p: Piece, from: Square) => {
    return (
      <span
        data-testid={`piece-${p.id}`}
        className="piece"
        draggable
        onDragStart={() => {
          setIllegalMsg(null);
          setDragFrom(from);
          setSelected(from);

          // récupère les coups légaux depuis la case
          const targets = service.getLegalMovesFrom(from); // ex: ["a3","a4"]
          setLegalTargets(new Set(targets));
        }}
        onDragEnd={() => clearDragUI()}
        title={`${p.color} ${p.type} (${p.id})`}
      >
        {service.getPieceChar(p)}
      </span>
    );
  };

  return (
    <div className="boardWrap">
      <div className="boardHeader">
        <div className="title">Échiquier (règles activées)</div>

        <div className="meta">
          Coups: <b>{historyCount}</b>
          <button className="btn" onClick={() => service.reset()}>
            Reset
          </button>
        </div>
      </div>

      {illegalMsg ? <div className="warning">{illegalMsg}</div> : null}

      <div className="board">
        {board.map((row, rank) =>
          row.map((cell, file) => {
            const square: Square = { rank, file };
            const isDark = (rank + file) % 2 === 1;

            const alg = toAlg(square);
            const isSelected = selected ? toAlg(selected) === alg : false;
            const isLegalTarget = legalTargets.has(alg);

            return (
              <div
                data-testid={`sq-${alg}`}
                key={sqKey(square)}
                className={`square ${isDark ? "dark" : "light"} ${isSelected ? "selected" : ""} ${
                  isLegalTarget ? "legalTarget" : ""
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropSquare(square)}
              >
                <div className="coords">
                  {file === 0 ? <span className="rank">{8 - rank}</span> : <span />}
                  {rank === 7 ? <span className="file">{files[file]}</span> : <span />}
                </div>

                {cell ? renderPiece(cell, square) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
