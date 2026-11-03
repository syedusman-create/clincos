import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import ClientDashboardClient from "./client-dashboard-client";

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return <ClientDashboardClient clientId={session.user.id} />;
}
