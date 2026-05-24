import { Role } from "../types";
import StudentProfile from "@/components/dashboard/profile/StudentProfile";
import AuthoritiesProfile from "@/components/dashboard/profile/AuthoritiesProfile";

export default function ProfilePage() {
  const role: Role = Role.TEACHER;

  if (role === Role.TEACHER || role === Role.ADMIN) {
    return <AuthoritiesProfile />;
  }

  return (
    <StudentProfile></StudentProfile>
  );
}
