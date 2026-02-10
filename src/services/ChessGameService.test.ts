import { describe, it, expect, beforeEach } from "vitest";
import { ChessGameService, toAlg } from "./ChessGameService";
import type { Square } from "../types/chess";

function sq(alg: string): Square {
  // "a1".."h8" -> {rank,file} selon ton mapping
  const file = alg.charCodeAt(0) - 97; // a=0
  const rankNum = Number(alg[1]); // 1..8
  return { rank: 8 - rankNum, file };
}

function getPieceAt(service: ChessGameService, alg: string) {
  const b = service.getBoard();
  const s = sq(alg);
  return b[s.rank][s.file];
}

describe("ChessGameService (avec chess.js)", () => {
  let service: ChessGameService;

  beforeEach(() => {
    service = new ChessGameService();
    service.reset();
  });

  it("état initial : roi blanc en e1, roi noir en e8", () => {
    const wK = getPieceAt(service, "e1");
    const bK = getPieceAt(service, "e8");

    expect(wK).not.toBeNull();
    expect(wK!.color).toBe("white");
    expect(wK!.type).toBe("king");

    expect(bK).not.toBeNull();
    expect(bK!.color).toBe("black");
    expect(bK!.type).toBe("king");
  });

  it("getTurn : commence aux blancs", () => {
    expect(service.getTurn()).toBe("w");
  });

  it("coup légal : a2 -> a4 (pion blanc) doit réussir + historique mis à jour", () => {
    const ok = service.tryMove(sq("a2"), sq("a4"));
    expect(ok).toBe(true);

    // positions
    expect(getPieceAt(service, "a2")).toBeNull();
    const p = getPieceAt(service, "a4");
    expect(p).not.toBeNull();
    expect(p!.color).toBe("white");
    expect(p!.type).toBe("pawn");

    // tour doit être aux noirs
    expect(service.getTurn()).toBe("b");

    // historique
    const h = service.getHistory();
    expect(h.length).toBe(1);
    expect(h[0].from).toBe("a2");
    expect(h[0].to).toBe("a4");
    expect(typeof h[0].san).toBe("string");
    expect(typeof h[0].fenAfter).toBe("string");
    expect(typeof h[0].at).toBe("number");
  });

  it("coup illégal : a2 -> a5 doit être refusé (pas de changement + pas d'historique)", () => {
    const ok = service.tryMove(sq("a2"), sq("a5"));
    expect(ok).toBe(false);

    // plateau inchangé
    const a2 = getPieceAt(service, "a2");
    expect(a2).not.toBeNull();
    expect(a2!.color).toBe("white");
    expect(a2!.type).toBe("pawn");

    expect(getPieceAt(service, "a5")).toBeNull();
    expect(service.getHistory().length).toBe(0);
  });

  it("respect du tour : après un coup blanc, un deuxième coup blanc est refusé", () => {
    expect(service.tryMove(sq("a2"), sq("a4"))).toBe(true);

    // blanc tente encore (b2 -> b4) alors que c'est aux noirs
    const ok2 = service.tryMove(sq("b2"), sq("b4"));
    expect(ok2).toBe(false);

    // l'historique ne doit contenir qu'un coup
    expect(service.getHistory().length).toBe(1);
  });

  it("capture : e2-e4, d7-d5, e4xd5 (capture du pion noir)", () => {
    // blanc
    expect(service.tryMove(sq("e2"), sq("e4"))).toBe(true);
    // noir
    expect(service.tryMove(sq("d7"), sq("d5"))).toBe(true);
    // blanc capture
    expect(service.tryMove(sq("e4"), sq("d5"))).toBe(true);

    // d5 = pion blanc
    const onD5 = getPieceAt(service, "d5");
    expect(onD5).not.toBeNull();
    expect(onD5!.color).toBe("white");
    expect(onD5!.type).toBe("pawn");

    // l'ancien pion noir sur d5 n'existe plus, e4 est vide
    expect(getPieceAt(service, "e4")).toBeNull();

    // historique
    const h = service.getHistory();
    expect(h.length).toBe(3);
    expect(h[2].from).toBe("e4");
    expect(h[2].to).toBe("d5");
    // chess.js met souvent "captured" = 'p' pour pawn
    expect(h[2].captured).toBe("p");
  });

  it("getLegalMovesFrom : a2 doit proposer a3 et a4 au départ", () => {
    const targets = service.getLegalMovesFrom(sq("a2"));
    // targets sont des ChessSquare "a3", "a4", etc.
    expect(targets).toContain("a3");
    expect(targets).toContain("a4");
  });

  it("reset : remet le plateau + vide l'historique + retour au tour blanc", () => {
    expect(service.tryMove(sq("a2"), sq("a4"))).toBe(true);
    expect(service.getHistory().length).toBe(1);
    expect(service.getTurn()).toBe("b");

    service.reset();

    expect(service.getHistory().length).toBe(0);
    expect(service.getTurn()).toBe("w");

    const a2 = getPieceAt(service, "a2");
    expect(a2).not.toBeNull();
    expect(a2!.color).toBe("white");
    expect(a2!.type).toBe("pawn");
  });

  it("toAlg : mapping Square -> algébrique est cohérent (a2)", () => {
    const a2 = sq("a2");
    expect(toAlg(a2)).toBe("a2");
  });
});
