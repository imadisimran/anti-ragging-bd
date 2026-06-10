import AuthorityMyCases from "@/components/dashboard/home/AuthorityMyCases";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function MyCasesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "AUTHORITY") {
    redirect("/dashboard");
  }

  return <AuthorityMyCases />;
}
