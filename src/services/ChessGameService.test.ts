import { describe, it, expect, vi } from "vitest";
import { ChessGameService } from "./ChessGameService";
import type { Square } from "../types/chess";

const sq = (file: number, rank: number): Square => ({ file, rank });

describe("ChessGameService", () => {
  it("getBoard() retourne une matrice 8x8", () => {
    const service = new ChessGameService();
    const board = service.getBoard();

    expect(board).toHaveLength(8);
    for (const row of board) expect(row).toHaveLength(8);
  });

  it("getHistory() est vide au départ", () => {
    const service = new ChessGameService();
    expect(service.getHistory()).toHaveLength(0);
  });

  it("getPieceAt() retourne une pièce sur une case initiale connue", () => {
    const service = new ChessGameService();

    // position initiale: roi blanc en e1 (file=4, rank=7 si rank 0 en haut)
    const piece = service.getPieceAt(sq(4, 7));
    expect(piece).not.toBeNull();
    expect(piece!.color).toBe("white");
    expect(piece!.type).toBe("king");
  });

  it("getPositions() contient toutes les pièces au départ (32)", () => {
    const service = new ChessGameService();
    const positions = service.getPositions();

    expect(Object.keys(positions)).toHaveLength(32);

    // Vérifie qu'une pièce connue existe (roi blanc id = white-king-1 dans notre init)
    expect(positions["white-king-1"]).toEqual({ file: 4, rank: 7 });
  });

  it("movePiece() déplace une pièce vers une case vide (nouvelle position + ancienne vide)", () => {
    const service = new ChessGameService();

    // Pion blanc en a2 = file 0, rank 6 -> vers a4 = file 0, rank 4 (case vide)
    const from = sq(0, 6);
    const to = sq(0, 4);

    const moving = service.getPieceAt(from);
    expect(moving).not.toBeNull();

    service.movePiece(from, to);

    expect(service.getPieceAt(from)).toBeNull();
    expect(service.getPieceAt(to)).not.toBeNull();
    expect(service.getPieceAt(to)!.id).toBe(moving!.id);

    // historique mis à jour
    const hist = service.getHistory();
    expect(hist).toHaveLength(1);
    expect(hist[0].pieceId).toBe(moving!.id);
    expect(hist[0].from).toEqual(from);
    expect(hist[0].to).toEqual(to);
    expect(hist[0].captured).toBeUndefined();
  });

  it("movePiece() remplace une pièce si la case d'arrivée est occupée (captured + remplacement)", () => {
    const service = new ChessGameService();

    // Exemple simple : déplacer la reine blanche d1 -> d8 (occupée par reine noire en d8)
    // reine blanche: d1 = file 3, rank 7
    // reine noire: d8 = file 3, rank 0
    const from = sq(3, 7);
    const to = sq(3, 0);

    const whiteQueen = service.getPieceAt(from);
    const blackQueen = service.getPieceAt(to);

    expect(whiteQueen).not.toBeNull();
    expect(whiteQueen!.color).toBe("white");
    expect(whiteQueen!.type).toBe("queen");

    expect(blackQueen).not.toBeNull();
    expect(blackQueen!.color).toBe("black");
    expect(blackQueen!.type).toBe("queen");

    service.movePiece(from, to);

    // Départ vide
    expect(service.getPieceAt(from)).toBeNull();

    // Arrivée = reine blanche
    const arrived = service.getPieceAt(to);
    expect(arrived).not.toBeNull();
    expect(arrived!.id).toBe(whiteQueen!.id);

    // Historique: captured doit être la reine noire
    const last = service.getHistory().at(-1)!;
    expect(last.pieceId).toBe(whiteQueen!.id);
    expect(last.captured).toEqual({
      id: blackQueen!.id,
      type: blackQueen!.type,
      color: blackQueen!.color,
    });
  });

  it("movePiece() ne fait rien si la case source est vide", () => {
    const service = new ChessGameService();
    const histBefore = service.getHistory().length;

    // case vide typique en début: e4 = file 4, rank 4
    service.movePiece(sq(4, 4), sq(4, 3));

    expect(service.getHistory()).toHaveLength(histBefore);
  });

  it("reset() remet l'état initial (historique vidé + pièces remises)", () => {
    const service = new ChessGameService();

    service.movePiece(sq(0, 6), sq(0, 4)); // un coup
    expect(service.getHistory().length).toBe(1);

    service.reset();

    expect(service.getHistory().length).toBe(0);

    // Roi blanc de retour en e1
    const king = service.getPieceAt(sq(4, 7));
    expect(king).not.toBeNull();
    expect(king!.id).toBe("white-king-1");
  });

  it("subscribe() notifie les listeners lors d'un movePiece() puis un unsubscribe empêche les notifications", () => {
    const service = new ChessGameService();
    const listener = vi.fn();

    const unsub = service.subscribe(listener);

    service.movePiece(sq(0, 6), sq(0, 4));
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
    service.movePiece(sq(1, 6), sq(1, 4));
    expect(listener).toHaveBeenCalledTimes(1); // pas d'appel supplémentaire
  });
});
