import { NextResponse } from "next/server";
import db from "@/lib/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = db.select().from(users).where(users.email.eq(email)).get();
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: role || "CLIENT",
    }).returning().get();

    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
