import StudentDashboardHome from "@/components/dashboard/home/StudentDashboardHome";
import AuthoritiesDashboardHome from "@/components/dashboard/home/AuthoritiesDashboardHome";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function DashboardPage() {
  // const role: Role = Role.TEACHER;

  const session = await getServerSession(authOptions)
  const role = session?.user.role

  // if (role === Role.TEACHER || role === Role.ADMIN) {
  //   return <AuthoritiesDashboardHome />;
  // }

  return (
    <StudentDashboardHome />
  );
}
