"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { BookOpen, Plus, Trash2, Loader2 } from "lucide-react";

interface Subject {
  id: string;
  name: string;
}

export function SubjectManager({ subjects }: { subjects: Subject[] }) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("subjects").insert({
      name: name.trim(),
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Subject added");
      setName("");
      router.refresh();
    }

    setIsLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();

    const { error } = await supabase.from("subjects").delete().eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Subject deleted");
      router.refresh();
    }

    setDeletingId(null);
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Subjects</h2>
          <p className="text-sm text-muted-foreground">{subjects.length} subject(s)</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a subject..."
          className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </form>

      {subjects.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No subjects added yet</p>
      ) : (
        <ul className="space-y-2">
          {subjects.map((subject) => (
            <li
              key={subject.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <span className="text-foreground">{subject.name}</span>
              <button
                onClick={() => handleDelete(subject.id)}
                disabled={deletingId === subject.id}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
              >
                {deletingId === subject.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
