import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CandidateShell from "@/components/account/CandidateShell";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/dashboard");
  }

  return (
    <CandidateShell>
      {children}
    </CandidateShell>
  );
}
