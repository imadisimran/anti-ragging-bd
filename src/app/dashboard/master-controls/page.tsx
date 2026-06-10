import MasterControls from "@/components/dashboard/admin/MasterControls";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function MasterControlsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MASTER_ADMIN") {
    redirect("/dashboard");
  }

  return <MasterControls />;
}
