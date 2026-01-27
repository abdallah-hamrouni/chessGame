import { useEffect, useMemo, useState } from "react";
import type { Board, Piece, Square } from "../types/chess";
import { ChessGameService } from "../services/ChessGameService";

type Props = {
  service: ChessGameService;
};

function sqKey(s: Square) {
  return `${s.rank}-${s.file}`;
}

export default function ChessBoard({ service }: Props) {
  const [board, setBoard] = useState<Board>(() => service.getBoard());
  const [historyCount, setHistoryCount] = useState<number>(() => service.getHistory().length);

  // drag source
  const [dragFrom, setDragFrom] = useState<Square | null>(null);

 useEffect(() => {
  const unsub = service.subscribe(() => {
    setBoard(service.getBoard());
    setHistoryCount(service.getHistory().length);
  });

  return () => {
    unsub(); // on ignore ce qu'il renvoie
  };
}, [service]);


  const files = useMemo(() => ["a", "b", "c", "d", "e", "f", "g", "h"], []);

  const onDropSquare = (to: Square) => {
    if (!dragFrom) return;
    service.movePiece(dragFrom, to);
    setDragFrom(null);
  };

  const renderPiece = (p: Piece, from: Square) => {
    return (
      <span
        className="piece"
        draggable
        onDragStart={() => setDragFrom(from)}
        onDragEnd={() => setDragFrom(null)}
        title={`${p.color} ${p.type} (${p.id})`}
      >
        {service.getPieceChar(p)}
      </span>
    );
  };

  return (
    <div className="boardWrap">
      <div className="boardHeader">
        <div className="title">Échiquier (déplacements libres)</div>
        <div className="meta">
          Coups: <b>{historyCount}</b>
          <button className="btn" onClick={() => service.reset()}>
            Reset
          </button>
        </div>
      </div>

      <div className="board">
        {board.map((row, rank) =>
          row.map((cell, file) => {
            const square: Square = { rank, file };
            const isDark = (rank + file) % 2 === 1;

            return (
              <div
                key={sqKey(square)}
                className={`square ${isDark ? "dark" : "light"}`}
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
