"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatTime } from "@/lib/utils";
import { Radio, Copy, X, Users, Clock, Loader2 } from "lucide-react";

interface Session {
  id: string;
  session_code: string;
  created_at: string;
  radius_meters: number;
  subjects: { name: string } | null;
  divisions: { name: string } | null;
  attendance_records: { id: string }[];
}

export function ActiveSessions({ sessions }: { sessions: Session[] }) {
  const [closingId, setClosingId] = useState<string | null>(null);
  const router = useRouter();

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    toast.success("Session code copied!");
  }

  async function closeSession(sessionId: string) {
    setClosingId(sessionId);
    const supabase = createClient();

    const { error } = await supabase
      .from("sessions")
      .update({ is_active: false })
      .eq("id", sessionId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Session closed successfully");
      router.refresh();
    }

    setClosingId(null);
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
          <Radio className="w-5 h-5 text-success" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Active Sessions</h2>
          <p className="text-sm text-muted-foreground">{sessions.length} session(s) running</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Radio className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No active sessions</p>
          <p className="text-sm text-muted-foreground mt-1">Create a new session to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-4 bg-muted/50 rounded-lg border border-border"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground truncate">
                      {session.subjects?.name || "Unknown Subject"}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {session.divisions?.name || "No Division"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(session.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {session.attendance_records.length} present
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => closeSession(session.id)}
                  disabled={closingId === session.id}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Close session"
                >
                  {closingId === session.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-background rounded-lg px-3 py-2 font-mono text-lg text-center font-semibold text-foreground tracking-widest">
                  {session.session_code}
                </div>
                <button
                  onClick={() => copyCode(session.session_code)}
                  className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  title="Copy code"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
