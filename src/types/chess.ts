export type Color = "white" | "black";
export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

export type Square = {
  file: number; // 0..7  (a..h)
  rank: number; // 0..7  (8..1 visuellement si on affiche rank 0 en haut)
};

export type Piece = {
  id: string;
  color: Color;
  type: PieceType;
};

export type MoveRecord = {
  pieceId: string;
  pieceType: PieceType;
  color: Color;
  from: Square;
  to: Square;
  captured?: { id: string; type: PieceType; color: Color };
  at: number; // timestamp
};

export type Board = (Piece | null)[][];
