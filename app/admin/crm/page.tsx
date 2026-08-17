import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import CRMClient from "@/components/admin/CRMClient";

export const dynamic = "force-dynamic";

export default async function AdminCRMPage() {
  const session =
    await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <CRMClient
      userEmail={
        session.user.email ?? ""
      }
    />
  );
}