import { Chess, type Square as ChessSquare, type PieceSymbol } from "chess.js";
import type { Board, Piece, Square } from "../types/chess";

// mapping "a1" <-> {rank,file}
export function toAlg(s: Square): ChessSquare {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
  const file = files[s.file];
  const rank = String(8 - s.rank) as "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
  return `${file}${rank}` as ChessSquare;
}

export function fromAlg(a: ChessSquare): Square {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const file = files.indexOf(a[0]);
  const rankNum = Number(a[1]); // 1..8
  return { rank: 8 - rankNum, file };
}

type Listener = () => void;

export type MoveRecord = {
  from: ChessSquare;
  to: ChessSquare;
  san: string;
  fenAfter: string;
  captured?: string;
  promotion?: PieceSymbol;
  at: number;
};

export class ChessGameService {
  private chess = new Chess();
  private listeners = new Set<Listener>();
  private moveHistory: MoveRecord[] = [];

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    for (const fn of this.listeners) fn();
  }

  reset() {
    this.chess.reset();
    this.moveHistory = [];
    this.notify();
  }

  /** coups légaux depuis une case (utile pour surligner) */
  getLegalMovesFrom(from: Square): ChessSquare[] {
    const fromAlg = toAlg(from);
    const moves = this.chess.moves({ square: fromAlg, verbose: true });
    return moves.map((m) => m.to as ChessSquare);
  }

  /** essaie un coup ; retourne true si légal */
  tryMove(from: Square, to: Square): boolean {
    const fromAlg = toAlg(from);
    const toAlgSq = toAlg(to);

    // Promotion : si besoin, tu peux demander à l’utilisateur.
    // Ici on choisit reine par défaut si une promotion est possible.
    const piece = this.chess.get(fromAlg);
    const isPromotion =
      piece?.type === "p" && ((piece.color === "w" && toAlgSq[1] === "8") || (piece.color === "b" && toAlgSq[1] === "1"));

    const result = this.chess.move({
      from: fromAlg,
      to: toAlgSq,
      promotion: isPromotion ? "q" : undefined,
    });

    if (!result) return false;

    this.moveHistory.push({
      from: result.from as ChessSquare,
      to: result.to as ChessSquare,
      san: result.san,
      fenAfter: this.chess.fen(),
      captured: result.captured,
      promotion: result.promotion,
      at: Date.now(),
    });

    this.notify();
    return true;
  }

  getFen() {
    return this.chess.fen();
  }

  getTurn() {
    return this.chess.turn(); // 'w' ou 'b'
  }

  isGameOver() {
    return this.chess.isGameOver();
  }

  getHistory() {
    return [...this.moveHistory];
  }

  /** Convertit l'état chess.js -> Board UI */
  getBoard(): Board {
    const empty: Board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));

    // chess.board() renvoie 8 rangées de 8, du côté noir vers blanc
    const b = this.chess.board();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const cell = b[r][f];
        if (!cell) continue;

        const uiPiece: Piece = {
          id: `${cell.color}${cell.type}-${r}-${f}`, // id simple (tu peux mieux faire)
          color: cell.color === "w" ? "white" : "black",
          type: mapType(cell.type),
        };
        empty[r][f] = uiPiece;
      }
    }
    return empty;
  }

  /** Même affichage que ton projet (♟ etc.) */
 getPieceChar(p: Piece) {
  const map: Record<Piece["type"], { white: string; black: string }> = {
    king:   { white: "♔", black: "♚" },
    queen:  { white: "♕", black: "♛" },
    rook:   { white: "♖", black: "♜" },
    bishop: { white: "♗", black: "♝" },
    knight: { white: "♘", black: "♞" },
    pawn:   { white: "♙", black: "♟" },
  };

  return p.color === "white" ? map[p.type].white : map[p.type].black;
}

}

function mapType(t: "p" | "n" | "b" | "r" | "q" | "k"): Piece["type"] {
  switch (t) {
    case "p": return "pawn";
    case "n": return "knight";
    case "b": return "bishop";
    case "r": return "rook";
    case "q": return "queen";
    case "k": return "king";
  }
}
