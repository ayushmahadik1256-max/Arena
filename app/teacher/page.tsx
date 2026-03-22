import { createClient } from "@/lib/supabase/server";
import { CreateSessionForm } from "@/components/teacher/create-session-form";
import { ActiveSessions } from "@/components/teacher/active-sessions";

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch teacher's subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("teacher_id", user?.id)
    .order("name");

  // Fetch teacher's divisions
  const { data: divisions } = await supabase
    .from("divisions")
    .select("*")
    .eq("teacher_id", user?.id)
    .order("name");

  // Fetch active sessions
  const { data: activeSessions } = await supabase
    .from("sessions")
    .select(`
      *,
      subjects (name),
      divisions (name),
      attendance_records (id)
    `)
    .eq("teacher_id", user?.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Teacher Dashboard</h1>
        <p className="text-muted-foreground mt-1">Create and manage attendance sessions</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <CreateSessionForm subjects={subjects || []} divisions={divisions || []} />
        <ActiveSessions sessions={activeSessions || []} />
      </div>
    </div>
  );
}
