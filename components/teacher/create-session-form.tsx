"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { generateSessionCode } from "@/lib/utils";
import { Plus, MapPin, Loader2, BookOpen, Users } from "lucide-react";

interface Subject {
  id: string;
  name: string;
}

interface Division {
  id: string;
  name: string;
}

export function CreateSessionForm({
  subjects,
  divisions,
}: {
  subjects: Subject[];
  divisions: Division[];
}) {
  const [subjectId, setSubjectId] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [radius, setRadius] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const router = useRouter();

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
        (error) => {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!location) {
      toast.error("Please enable location services to create a session");
      return;
    }

    if (!subjectId || !divisionId) {
      toast.error("Please select a subject and division");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in");
      setIsLoading(false);
      return;
    }

    const sessionCode = generateSessionCode();

    const { error } = await supabase.from("sessions").insert({
      teacher_id: user.id,
      subject_id: subjectId,
      division_id: divisionId,
      session_code: sessionCode,
      latitude: location.lat,
      longitude: location.lng,
      radius_meters: radius,
      is_active: true,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success(`Session created! Code: ${sessionCode}`);
    router.refresh();
    setIsLoading(false);
    setSubjectId("");
    setDivisionId("");
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Plus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Create New Session</h2>
          <p className="text-sm text-muted-foreground">Start an attendance session</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              Subject
            </div>
          </label>
          {subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No subjects found. Add subjects in Settings.
            </p>
          ) : (
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              required
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Division
            </div>
          </label>
          {divisions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No divisions found. Add divisions in Settings.
            </p>
          ) : (
            <select
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              required
            >
              <option value="">Select a division</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Allowed Radius (meters)
            </div>
          </label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value) || 100)}
            min={10}
            max={1000}
            className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Students must be within this distance to mark attendance
          </p>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className={`w-4 h-4 ${location ? "text-success" : "text-muted-foreground"}`} />
              <span className="text-sm text-foreground">Your Location</span>
            </div>
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : location ? (
              <span className="text-xs text-muted-foreground font-mono">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            ) : (
              <button
                type="button"
                onClick={getLocation}
                className="text-xs text-primary hover:underline"
              >
                Retry
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !location || subjects.length === 0 || divisions.length === 0}
          className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create Session
            </>
          )}
        </button>
      </form>
    </div>
  );
}
