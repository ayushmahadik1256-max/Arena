"use client";

import { useState } from "react";
import { formatDate, formatTime } from "@/lib/utils";
import {
  History,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
  Download,
  CheckCircle,
  XCircle,
  Radio,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  is_within_range: boolean;
  distance_meters: number;
  marked_at: string;
  profiles: { full_name: string | null } | null;
}

interface Session {
  id: string;
  session_code: string;
  created_at: string;
  is_active: boolean;
  radius_meters: number;
  subjects: { name: string } | null;
  divisions: { name: string } | null;
  attendance_records: AttendanceRecord[];
}

export function SessionHistoryList({ sessions }: { sessions: Session[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function exportToCSV(session: Session) {
    const headers = ["Student Name", "Status", "Distance (m)", "Time"];
    const rows = session.attendance_records.map((record) => [
      record.profiles?.full_name || "Unknown",
      record.is_within_range ? "Present" : "Out of Range",
      record.distance_meters.toString(),
      formatTime(record.marked_at),
    ]);

    const csvContent = [
      `Session: ${session.subjects?.name || "Unknown"} - ${session.divisions?.name || "No Division"}`,
      `Date: ${formatDate(session.created_at)}`,
      `Code: ${session.session_code}`,
      "",
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${session.session_code}-${formatDate(session.created_at)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
          <History className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No sessions found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create a session to see history here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const isExpanded = expandedId === session.id;
        const presentCount = session.attendance_records.filter((r) => r.is_within_range).length;

        return (
          <div
            key={session.id}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : session.id)}
              className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  session.is_active
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {session.is_active ? (
                  <Radio className="w-5 h-5" />
                ) : (
                  <History className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">
                    {session.subjects?.name || "Unknown Subject"}
                  </span>
                  {session.is_active && (
                    <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                  <span>{session.divisions?.name || "No Division"}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(session.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {presentCount}/{session.attendance_records.length}
                  </p>
                  <p className="text-xs text-muted-foreground">present</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-border">
                <div className="p-4 bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-mono text-foreground">{session.session_code}</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {session.attendance_records.length} student(s)
                    </span>
                  </div>
                  <button
                    onClick={() => exportToCSV(session)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>

                {session.attendance_records.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No attendance records for this session
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {session.attendance_records.map((record) => (
                      <div key={record.id} className="p-4 flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            record.is_within_range
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {record.is_within_range ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {record.profiles?.full_name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(record.marked_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-xs font-medium ${
                              record.is_within_range ? "text-success" : "text-destructive"
                            }`}
                          >
                            {record.is_within_range ? "Present" : "Out of Range"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {record.distance_meters}m
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
