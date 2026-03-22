import { createClient } from "@/lib/supabase/server";
import { SubjectManager } from "@/components/teacher/subject-manager";
import { DivisionManager } from "@/components/teacher/division-manager";

export default async function TeacherSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("teacher_id", user?.id)
    .order("name");

  const { data: divisions } = await supabase
    .from("divisions")
    .select("*")
    .eq("teacher_id", user?.id)
    .order("name");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your subjects and divisions</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SubjectManager subjects={subjects || []} />
        <DivisionManager divisions={divisions || []} />
      </div>
    </div>
  );
}
