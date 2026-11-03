import db from "@/lib/db";
import { users, appointments, availability } from "@/db/schema";
import bcrypt from "bcryptjs";

async function init() {
  const doctorPassword = await bcrypt.hash("doctor123", 10);
  const clientPassword = await bcrypt.hash("client123", 10);
  const receptionistPassword = await bcrypt.hash("receptionist123", 10);

  const doctor = db.insert(users).values({
    name: "Dr. Demo",
    email: "doctor@clincos.com",
    password: doctorPassword,
    role: "DOCTOR",
  }).returning().get();

  const client = db.insert(users).values({
    name: "John Doe",
    email: "client@clincos.com",
    password: clientPassword,
    role: "CLIENT",
  }).returning().get();

  const receptionist = db.insert(users).values({
    name: "Jane Smith",
    email: "receptionist@clincos.com",
    password: receptionistPassword,
    role: "RECEPTIONIST",
  }).returning().get();

  db.insert(availability).values([
    { doctorId: doctor.id, dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
    { doctorId: doctor.id, dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
    { doctorId: doctor.id, dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
    { doctorId: doctor.id, dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
    { doctorId: doctor.id, dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
  ]).run();

  db.insert(appointments).values({
    clientId: client.id,
    doctorId: doctor.id,
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    type: "Consultation",
    status: "CONFIRMED",
    notes: "Regular checkup",
  }).run();

  console.log("Database initialized successfully!");
  console.log("Demo accounts:");
  console.log("  Doctor: doctor@clincos.com / doctor123");
  console.log("  Client: client@clincos.com / client123");
  console.log("  Receptionist: receptionist@clincos.com / receptionist123");
}

init().catch(console.error);
