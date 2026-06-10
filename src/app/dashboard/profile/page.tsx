import StudentProfile from "@/components/dashboard/profile/StudentProfile";
import AuthoritiesProfile from "@/components/dashboard/profile/AuthoritiesProfile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (role === "AUTHORITY") {
    return <AuthoritiesProfile />;
  }

  return (
    <StudentProfile />
  );
}
