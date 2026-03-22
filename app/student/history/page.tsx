import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/utils";
import { CheckCircle, XCircle, MapPin } from "lucide-react";

export default async function StudentHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: records } = await supabase
    .from("attendance_records")
    .select(`
      *,
      sessions (
        created_at,
        subjects (name),
        divisions (name)
      )
    `)
    .eq("student_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">My Attendance History</h1>
        <p className="text-muted-foreground mt-1">View your past attendance records</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {!records || records.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No attendance records yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your attendance history will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {records.map((record) => (
              <div key={record.id} className="p-4 flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    record.is_within_range
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {record.is_within_range ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {record.sessions?.subjects?.name || "Unknown Subject"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {record.sessions?.divisions?.name || "No Division"} -{" "}
                    {formatDate(record.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {formatTime(record.created_at)}
                  </p>
                  <p
                    className={`text-xs ${
                      record.is_within_range ? "text-success" : "text-destructive"
                    }`}
                  >
                    {record.is_within_range ? "Present" : `${record.distance_meters}m away`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
