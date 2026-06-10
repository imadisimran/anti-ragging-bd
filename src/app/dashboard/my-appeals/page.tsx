import StudentAppeals from "@/components/dashboard/student/StudentAppeals";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function MyAppealsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const role = session.user.role;
  if (role && role !== "student") {
    redirect("/dashboard");
  }

  return <StudentAppeals />;
}
