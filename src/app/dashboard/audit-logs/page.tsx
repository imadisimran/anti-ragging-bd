import AuditLogs from "@/components/dashboard/admin/AuditLogs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MASTER_ADMIN") {
    redirect("/dashboard");
  }

  return <AuditLogs />;
}
