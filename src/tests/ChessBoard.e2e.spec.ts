import { test, expect } from "@playwright/test";

test.describe("ChessBoard UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Placement initial : rois et reines visibles sur les bonnes cases", async ({ page }) => {
    await expect(page.getByTestId("sq-e1").getByTestId("piece-white-king-1")).toBeVisible();
    await expect(page.getByTestId("sq-d1").getByTestId("piece-white-queen-1")).toBeVisible();

    await expect(page.getByTestId("sq-e8").getByTestId("piece-black-king-1")).toBeVisible();
    await expect(page.getByTestId("sq-d8").getByTestId("piece-black-queen-1")).toBeVisible();
  });

  test("Drag & drop : déplacer un pion vers une case vide (a2 -> a4)", async ({ page }) => {
    const pawn = page.getByTestId("piece-white-pawn-1"); // pion blanc en a2
    const target = page.getByTestId("sq-a4");

    // Vérif initiale: pion dans a2
    await expect(page.getByTestId("sq-a2").getByTestId("piece-white-pawn-1")).toBeVisible();

    await pawn.dragTo(target);

    await expect(page.getByTestId("sq-a4").getByTestId("piece-white-pawn-1")).toBeVisible();
    await expect(page.getByTestId("sq-a2").getByTestId("piece-white-pawn-1")).toHaveCount(0);
  });

  test("Drag & drop : remplacer une pièce si la case est occupée (d1 -> d8)", async ({ page }) => {
    const whiteQueen = page.getByTestId("piece-white-queen-1");
    const targetD8 = page.getByTestId("sq-d8");

    // d8 contient la reine noire au départ
    await expect(page.getByTestId("sq-d8").getByTestId("piece-black-queen-1")).toBeVisible();

    await whiteQueen.dragTo(targetD8);

    // d8 doit maintenant contenir la reine blanche
    await expect(page.getByTestId("sq-d8").getByTestId("piece-white-queen-1")).toBeVisible();
    // la reine noire n'est plus sur d8
    await expect(page.getByTestId("sq-d8").getByTestId("piece-black-queen-1")).toHaveCount(0);
  });
});
