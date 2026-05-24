import StudentDashboardHome from "@/components/dashboard/home/StudentDashboardHome";
import AuthoritiesDashboardHome from "@/components/dashboard/home/AuthoritiesDashboardHome";
import { Role } from "./types";

export default function DashboardPage() {
  const role: Role = Role.TEACHER;

  if (role === Role.TEACHER || role === Role.ADMIN) {
    return <AuthoritiesDashboardHome />;
  }

  return (
    <StudentDashboardHome />
  );
}
