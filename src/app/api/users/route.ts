import { NextResponse } from "next/server";
import db from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    let userList;

    if (role) {
      userList = db.select().from(users).where(eq(users.role, role)).all();
    } else {
      userList = db.select().from(users).all();
    }

    return NextResponse.json(userList);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
