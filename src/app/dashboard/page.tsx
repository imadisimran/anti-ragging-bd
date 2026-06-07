import StudentDashboardHome from "@/components/dashboard/home/StudentDashboardHome";
import AdminDashboardHome from "@/components/dashboard/home/AdminDashboardHome";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function DashboardPage() {
  // const role: Role = Role.TEACHER;

  const session = await getServerSession(authOptions)
  const role = session?.user.role

  if (role === "ADMIN") {
    return <AdminDashboardHome />;
  }

  return (
    <StudentDashboardHome />
  );
}
