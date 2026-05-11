import { Router } from "express";
import { db, subscribersTable, tipsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { SubscribeBody, DeleteSubscriberParams } from "@workspace/api-zod";
import { sendDailyTipsEmail } from "../email";

const router = Router();

router.get("/subscribers", async (req, res) => {
  try {
    const subscribers = await db
      .select()
      .from(subscribersTable)
      .orderBy(desc(subscribersTable.subscribedAt));
    res.json(subscribers.map(formatSubscriber));
  } catch (err) {
    req.log.error({ err }, "Failed to list subscribers");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subscribers", async (req, res) => {
  try {
    const parsed = SubscribeBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const existing = await db
      .select()
      .from(subscribersTable)
      .where(eq(subscribersTable.email, parsed.data.email));
    if (existing.length > 0) {
      if (existing[0].active) {
        res.status(400).json({ error: "This email is already subscribed." });
        return;
      }
      const [reactivated] = await db
        .update(subscribersTable)
        .set({ active: true, name: parsed.data.name ?? existing[0].name })
        .where(eq(subscribersTable.email, parsed.data.email))
        .returning();
      res.status(201).json(formatSubscriber(reactivated));
      return;
    }
    const [subscriber] = await db
      .insert(subscribersTable)
      .values({ email: parsed.data.email, name: parsed.data.name ?? null })
      .returning();
    res.status(201).json(formatSubscriber(subscriber));
  } catch (err) {
    req.log.error({ err }, "Failed to subscribe");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/subscribers/:id", async (req, res) => {
  try {
    const parsed = DeleteSubscriberParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    await db.delete(subscribersTable).where(eq(subscribersTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete subscriber");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/emails/send-daily", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [tips, subscribers] = await Promise.all([
      db.select().from(tipsTable).where(eq(tipsTable.matchDate, today)),
      db.select().from(subscribersTable).where(eq(subscribersTable.active, true)),
    ]);

    if (subscribers.length === 0) {
      res.json({ sent: 0, failed: 0, total: 0, message: "No active subscribers." });
      return;
    }

    const result = await sendDailyTipsEmail(tips, subscribers);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to send daily email");
    res.status(500).json({ error: "Failed to send daily email" });
  }
});

function formatSubscriber(s: typeof subscribersTable.$inferSelect) {
  return {
    ...s,
    subscribedAt: s.subscribedAt.toISOString(),
  };
}

export default router;
