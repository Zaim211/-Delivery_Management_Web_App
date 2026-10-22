"use client";

import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="max-w-5xl mx-auto pb-24 md:pb-6">{children}</main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </>
  );
}
