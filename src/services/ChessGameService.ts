import type { Board, MoveRecord, Piece, PieceType, Square } from "../types/chess";

type Listener = () => void;

function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}



function pieceChar(p: Piece): string {
  // Unicode chess pieces
  const mapWhite: Record<PieceType, string> = {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  };
  const mapBlack: Record<PieceType, string> = {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  };
  return p.color === "white" ? mapWhite[p.type] : mapBlack[p.type];
}

function inBounds(sq: Square) {
  return sq.file >= 0 && sq.file < 8 && sq.rank >= 0 && sq.rank < 8;
}

export class ChessGameService {
  private board: Board;
  private history: MoveRecord[] = [];
  private listeners = new Set<Listener>();

  constructor() {
    this.board = this.createInitialBoard();
  }

  // --- subscription (pour que React se mette à jour)
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  private emit() {
    this.listeners.forEach((l) => l());
  }

  // --- getters
  getBoard(): Board {
    return cloneBoard(this.board);
  }

  getHistory(): MoveRecord[] {
    return this.history.slice();
  }

  getPieceAt(square: Square): Piece | null {
    if (!inBounds(square)) return null;
    return this.board[square.rank][square.file];
  }

  getPositions(): Record<string, Square> {
    const positions: Record<string, Square> = {};
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = this.board[r][f];
        if (p) positions[p.id] = { file: f, rank: r };
      }
    }
    return positions;
  }

  getPieceChar(piece: Piece) {
    return pieceChar(piece);
  }

  // --- actions
  movePiece(from: Square, to: Square) {
    if (!inBounds(from) || !inBounds(to)) return;

    const moving = this.getPieceAt(from);
    if (!moving) return;

    const captured = this.getPieceAt(to);

    // Déplacement libre + remplacement si occupé
    this.board[to.rank][to.file] = moving;
    this.board[from.rank][from.file] = null;

    this.history.push({
      pieceId: moving.id,
      pieceType: moving.type,
      color: moving.color,
      from,
      to,
      captured: captured ? { id: captured.id, type: captured.type, color: captured.color } : undefined,
      at: Date.now(),
    });

    this.emit();
  }

  reset() {
    this.board = this.createInitialBoard();
    this.history = [];
    this.emit();
  }

  // --- init
  private createInitialBoard(): Board {
    const empty: Board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));

    const mk = (color: "white" | "black", type: PieceType, n: number): Piece => ({
      id: `${color}-${type}-${n}`,
      color,
      type,
    });

    // rank 0 = ligne du haut (côté noir)
    // Noirs
    empty[0][0] = mk("black", "rook", 1);
    empty[0][1] = mk("black", "knight", 1);
    empty[0][2] = mk("black", "bishop", 1);
    empty[0][3] = mk("black", "queen", 1);
    empty[0][4] = mk("black", "king", 1);
    empty[0][5] = mk("black", "bishop", 2);
    empty[0][6] = mk("black", "knight", 2);
    empty[0][7] = mk("black", "rook", 2);
    for (let f = 0; f < 8; f++) empty[1][f] = mk("black", "pawn", f + 1);

    // Blancs
    for (let f = 0; f < 8; f++) empty[6][f] = mk("white", "pawn", f + 1);
    empty[7][0] = mk("white", "rook", 1);
    empty[7][1] = mk("white", "knight", 1);
    empty[7][2] = mk("white", "bishop", 1);
    empty[7][3] = mk("white", "queen", 1);
    empty[7][4] = mk("white", "king", 1);
    empty[7][5] = mk("white", "bishop", 2);
    empty[7][6] = mk("white", "knight", 2);
    empty[7][7] = mk("white", "rook", 2);

    return empty;
  }
}
