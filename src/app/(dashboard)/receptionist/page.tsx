import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import ReceptionistDashboardClient from "./receptionist-dashboard-client";

export default async function ReceptionistDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return <ReceptionistDashboardClient />;
}
