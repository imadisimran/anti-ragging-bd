import OversightReports from "@/components/dashboard/admin/OversightReports";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function OversightReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MASTER_ADMIN") {
    redirect("/dashboard");
  }

  return <OversightReports />;
}
