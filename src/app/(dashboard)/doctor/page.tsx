import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import DoctorDashboardClient from "./doctor-dashboard-client";

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return <DoctorDashboardClient doctorId={session.user.id} />;
}
