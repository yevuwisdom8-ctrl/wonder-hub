import { Router } from "express";
import { db, tipsTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  ListTipsQueryParams,
  CreateTipBody,
  UpdateTipBody,
  GetTipParams,
  UpdateTipParams,
  DeleteTipParams,
  GetRecentResultsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/tips/today", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const tips = await db
      .select()
      .from(tipsTable)
      .where(eq(tipsTable.matchDate, today))
      .orderBy(desc(tipsTable.createdAt));
    res.json(tips.map(formatTip));
  } catch (err) {
    req.log.error({ err }, "Failed to get today's tips");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tips/recent-results", async (req, res) => {
  try {
    const parsed = GetRecentResultsQueryParams.safeParse(req.query);
    const limit = parsed.success && parsed.data.limit ? Number(parsed.data.limit) : 20;
    const tips = await db
      .select()
      .from(tipsTable)
      .where(sql`${tipsTable.status} IN ('won', 'lost')`)
      .orderBy(desc(tipsTable.matchDate), desc(tipsTable.createdAt))
      .limit(limit);
    res.json(tips.map(formatTip));
  } catch (err) {
    req.log.error({ err }, "Failed to get recent results");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tips", async (req, res) => {
  try {
    const parsed = ListTipsQueryParams.safeParse(req.query);
    const filters = parsed.success ? parsed.data : {};

    const conditions = [];
    if (filters.date) conditions.push(eq(tipsTable.matchDate, filters.date));
    if (filters.sport) conditions.push(eq(tipsTable.sport, filters.sport));
    if (filters.status) conditions.push(eq(tipsTable.status, filters.status as "pending" | "won" | "lost" | "void"));

    const tips = await db
      .select()
      .from(tipsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tipsTable.matchDate), desc(tipsTable.createdAt));

    res.json(tips.map(formatTip));
  } catch (err) {
    req.log.error({ err }, "Failed to list tips");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tips", async (req, res) => {
  try {
    const parsed = CreateTipBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { odds, confidence, ...rest } = parsed.data;
    const [tip] = await db
      .insert(tipsTable)
      .values({
        ...rest,
        odds: String(odds),
        confidence: confidence ?? null,
      })
      .returning();
    res.status(201).json(formatTip(tip));
  } catch (err) {
    req.log.error({ err }, "Failed to create tip");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tips/:id", async (req, res) => {
  try {
    const parsed = GetTipParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const [tip] = await db.select().from(tipsTable).where(eq(tipsTable.id, parsed.data.id));
    if (!tip) {
      res.status(404).json({ error: "Tip not found" });
      return;
    }
    res.json(formatTip(tip));
  } catch (err) {
    req.log.error({ err }, "Failed to get tip");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/tips/:id", async (req, res) => {
  try {
    const idParsed = UpdateTipParams.safeParse({ id: Number(req.params.id) });
    if (!idParsed.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const bodyParsed = UpdateTipBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: bodyParsed.error.message });
      return;
    }
    const { odds, confidence, ...rest } = bodyParsed.data;
    const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };
    if (odds !== undefined) updateData.odds = String(odds);
    if (confidence !== undefined) updateData.confidence = confidence;

    const [tip] = await db
      .update(tipsTable)
      .set(updateData)
      .where(eq(tipsTable.id, idParsed.data.id))
      .returning();

    if (!tip) {
      res.status(404).json({ error: "Tip not found" });
      return;
    }
    res.json(formatTip(tip));
  } catch (err) {
    req.log.error({ err }, "Failed to update tip");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/tips/:id", async (req, res) => {
  try {
    const parsed = DeleteTipParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    await db.delete(tipsTable).where(eq(tipsTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete tip");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const tips = await db.select().from(tipsTable);
    const won = tips.filter((t) => t.status === "won");
    const lost = tips.filter((t) => t.status === "lost");
    const pending = tips.filter((t) => t.status === "pending");
    const voidTips = tips.filter((t) => t.status === "void");
    const resolved = won.length + lost.length;
    const winRate = resolved > 0 ? (won.length / resolved) * 100 : 0;
    const totalOddsWon = won.reduce((sum, t) => sum + parseFloat(t.odds), 0);

    res.json({
      total: tips.length,
      won: won.length,
      lost: lost.length,
      pending: pending.length,
      void: voidTips.length,
      winRate: Math.round(winRate * 10) / 10,
      totalOddsWon: Math.round(totalOddsWon * 100) / 100,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatTip(tip: typeof tipsTable.$inferSelect) {
  return {
    ...tip,
    odds: parseFloat(tip.odds),
    createdAt: tip.createdAt.toISOString(),
    updatedAt: tip.updatedAt ? tip.updatedAt.toISOString() : null,
  };
}

export default router;
