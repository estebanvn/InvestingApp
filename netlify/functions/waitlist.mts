import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { waitlist } from "../../db/schema.js";
import { sql } from "drizzle-orm";

export default async (req: Request) => {
  if (req.method === "GET") {
    const result = await db.select({ count: sql<number>`count(*)` }).from(waitlist);
    return Response.json({ count: Number(result[0].count) });
  }

  if (req.method === "POST") {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    try {
      await db.insert(waitlist).values({ email: trimmed });
      return Response.json({ success: true }, { status: 201 });
    } catch (err: any) {
      if (err?.code === "23505" || err?.message?.includes("unique")) {
        return Response.json({ error: "This email is already on the waitlist." }, { status: 409 });
      }
      return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/waitlist",
};
