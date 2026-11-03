import { NextResponse } from "next/server";
import db from "@/lib/db";
import { treatmentHistory } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const doctorId = searchParams.get("doctorId");

    let records;

    if (clientId) {
      records = db.select().from(treatmentHistory).where(eq(treatmentHistory.clientId, Number(clientId))).all();
    } else if (doctorId) {
      records = db.select().from(treatmentHistory).where(eq(treatmentHistory.doctorId, Number(doctorId))).all();
    } else {
      records = db.select().from(treatmentHistory).all();
    }

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, diagnosis, treatment, prescription, notes } = body;

    const record = db.insert(treatmentHistory).values({
      clientId: Number(clientId),
      doctorId: Number(session.user.id),
      diagnosis,
      treatment,
      prescription,
      notes,
    }).returning().get();

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
