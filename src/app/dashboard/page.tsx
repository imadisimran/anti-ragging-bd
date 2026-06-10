import StudentDashboardHome from "@/components/dashboard/home/StudentDashboardHome";
import AdminDashboardHome from "@/components/dashboard/home/AdminDashboardHome";
import AuthorityDashboardHome from "@/components/dashboard/home/AuthorityDashboardHome";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role

  if (role === "ADMIN") {
    return <AdminDashboardHome />;
  }

  if (role === "AUTHORITY") {
    return <AuthorityDashboardHome />;
  }

  return (
    <StudentDashboardHome />
  );
}
