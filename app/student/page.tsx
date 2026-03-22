import { MarkAttendanceForm } from "@/components/student/mark-attendance-form";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Mark Attendance</h1>
        <p className="text-muted-foreground mt-1">Enter the session code provided by your teacher</p>
      </div>

      <MarkAttendanceForm />
    </div>
  );
}
