import { createClient } from "@/lib/supabase/server";
import { SessionHistoryList } from "@/components/teacher/session-history-list";

export default async function TeacherHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      *,
      subjects (name),
      divisions (name),
      attendance_records (
        id,
        is_within_range,
        distance_meters,
        marked_at,
        profiles:student_id (full_name)
      )
    `)
    .eq("teacher_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance History</h1>
        <p className="text-muted-foreground mt-1">View and export past attendance sessions</p>
      </div>

      <SessionHistoryList sessions={sessions || []} />
    </div>
  );
}
