import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TeacherNavbar } from "@/components/teacher/navbar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher") {
    redirect("/student");
  }

  return (
    <div className="min-h-screen bg-background">
      <TeacherNavbar user={user} profile={profile} />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
