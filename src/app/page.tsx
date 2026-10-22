import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

async function HomeContent(): Promise<never> {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login");
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
