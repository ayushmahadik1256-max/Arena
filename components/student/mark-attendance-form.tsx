"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { calculateDistance } from "@/lib/utils";
import { MapPin, Loader2, CheckCircle, XCircle, Navigation } from "lucide-react";

export function MarkAttendanceForm() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    getLocation();
  }, []);

  function getLocation() {
    setIsGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsGettingLocation(false);
        },
        () => {
          toast.error("Could not get your location. Please enable location services.");
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
    }
  }

  function handleCodeChange(index: number, value: string) {
    const char = value.toUpperCase().slice(-1);
    if (char && !/^[A-Z0-9]$/.test(char)) return;

    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);

    // Auto-focus next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every((c) => c) && newCode.join("").length === 6) {
      handleSubmit(newCode.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").toUpperCase().slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pastedText.length; i++) {
      if (/^[A-Z0-9]$/.test(pastedText[i])) {
        newCode[i] = pastedText[i];
      }
    }
    setCode(newCode);

    if (newCode.every((c) => c)) {
      handleSubmit(newCode.join(""));
    }
  }

  async function handleSubmit(sessionCode: string) {
    if (!location) {
      toast.error("Please enable location services");
      return;
    }

    setIsLoading(true);
    setStatus("idle");
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in");
      setIsLoading(false);
      return;
    }

    // Find the session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select(`
        *,
        subjects (name),
        divisions (name)
      `)
      .eq("session_code", sessionCode)
      .eq("is_active", true)
      .single();

    if (sessionError || !session) {
      setStatus("error");
      setMessage("Invalid or expired session code");
      setIsLoading(false);
      return;
    }

    // Check if already marked
    const { data: existing } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("session_id", session.id)
      .eq("student_id", user.id)
      .single();

    if (existing) {
      setStatus("error");
      setMessage("You have already marked attendance for this session");
      setIsLoading(false);
      return;
    }

    // Calculate distance
    const distance = calculateDistance(
      location.lat,
      location.lng,
      session.latitude,
      session.longitude
    );

    // Default radius is 100 meters
    const allowedRadius = 100;
    const isWithinRange = distance <= allowedRadius;

    // Insert attendance record
    const { error: insertError } = await supabase.from("attendance_records").insert({
      session_id: session.id,
      student_id: user.id,
      latitude: location.lat,
      longitude: location.lng,
      distance_from_teacher: Math.round(distance),
    });

    if (insertError) {
      setStatus("error");
      setMessage(insertError.message);
      setIsLoading(false);
      return;
    }

    if (isWithinRange) {
      setStatus("success");
      setMessage(`Attendance marked for ${session.subjects?.name || "Unknown Subject"}`);
      toast.success("Attendance marked successfully!");
    } else {
      setStatus("error");
      setMessage(`You are ${Math.round(distance)}m away. Required: within ${allowedRadius}m`);
    }

    setIsLoading(false);
  }

  function resetForm() {
    setCode(Array(6).fill(""));
    setStatus("idle");
    setMessage("");
    inputRefs.current[0]?.focus();
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {/* Location Status */}
      <div className="flex items-center justify-center gap-2 mb-8 p-3 bg-muted rounded-lg">
        <MapPin className={`w-4 h-4 ${location ? "text-success" : "text-muted-foreground"}`} />
        {isGettingLocation ? (
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Getting your location...
          </span>
        ) : location ? (
          <span className="text-sm text-success">Location verified</span>
        ) : (
          <button onClick={getLocation} className="text-sm text-primary hover:underline">
            Enable location services
          </button>
        )}
      </div>

      {status === "idle" && (
        <>
          {/* Code Input */}
          <div className="flex justify-center gap-2 mb-6">
            {code.map((char, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                value={char}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                maxLength={1}
                disabled={isLoading || !location}
                className="w-12 h-14 text-center text-xl font-mono font-bold bg-background border-2 border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                placeholder="-"
              />
            ))}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying attendance...</span>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Enter the 6-character code shown by your teacher
          </p>
        </>
      )}

      {status === "success" && (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Attendance Marked!</h3>
          <p className="text-muted-foreground mb-4">{message}</p>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Mark Another
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Unable to Mark Attendance</h3>
          <p className="text-muted-foreground mb-4">{message}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            {message.includes("away") && (
              <button
                onClick={getLocation}
                className="px-4 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Refresh Location
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
