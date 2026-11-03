import { NextResponse } from "next/server";
import db from "@/lib/db";
import { appointments, users } from "@/db/schema";
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
    const userId = session.user.id;
    const role = session.user.role;

    let userAppointments;

    if (role === "DOCTOR") {
      userAppointments = db.select().from(appointments).where(eq(appointments.doctorId, Number(userId))).all();
    } else if (role === "CLIENT") {
      userAppointments = db.select().from(appointments).where(eq(appointments.clientId, Number(userId))).all();
    } else {
      userAppointments = db.select().from(appointments).all();
    }

    return NextResponse.json(userAppointments);
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
    const { doctorId, date, time, type, notes } = body;

    const appointment = db.insert(appointments).values({
      clientId: Number(session.user.id),
      doctorId: Number(doctorId),
      date,
      time,
      type,
      notes: notes || "",
    }).returning().get();

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    const appointment = db.update(appointments).set({ status }).where(eq(appointments.id, id)).returning().get();

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
