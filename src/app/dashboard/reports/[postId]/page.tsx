import AuthorityReportDetails from "@/components/dashboard/reports/AuthorityReportDetails";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default async function ReportDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/dashboard");
  }

  const { postId } = await params;

  return <AuthorityReportDetails postId={postId} />;
}
