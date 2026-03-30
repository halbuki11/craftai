"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle, Trash2, Loader2, ListTodo, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";

interface Todo {
  id: string;
  title: string;
  status: "pending" | "completed";
  created_at: string;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const refetch = useCallback(() => { fetchTodos(); }, []);

  useEffect(() => {
    fetchTodos();
  }, []);

  useRealtime({ table: "todos", onChange: refetch });

  async function fetchTodos() {
    try {
      const response = await fetch("/api/todos");
      if (!response.ok) throw new Error("Failed to fetch todos");
      const data = await response.json();
      setTodos(data.todos || []);
    } catch {
      toast.error("Görevler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  async function toggleTodo(id: string, currentStatus: string) {
    setUpdating(id);
    try {
      const newStatus = currentStatus === "pending" ? "completed" : "pending";
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update todo");

      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, status: newStatus as "pending" | "completed" } : todo
      ));
    } catch {
      toast.error("Görev güncellenirken hata oluştu");
    } finally {
      setUpdating(null);
    }
  }

  async function deleteTodo(id: string) {
    setUpdating(id);
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete todo");

      setTodos(todos.filter(todo => todo.id !== id));
    } catch {
      toast.error("Görev silinirken hata oluştu");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pendingTodos = todos.filter(t => t.status === "pending");
  const completedTodos = todos.filter(t => t.status === "completed");
  const completionRate = todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;

  if (todos.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent rounded-3xl" />
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
            <ListTodo className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Henüz göreviniz yok
          </h2>
          <p className="text-muted-foreground max-w-sm">
            Sesli notlarınızdan görevler otomatik olarak oluşturulacak.
            &quot;Raporu cuma günü bitir&quot; gibi bir mesaj gönderin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden group hover:border-amber-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                <NumberTicker value={pendingTodos.length} />
              </p>
              <p className="text-sm text-muted-foreground">Bekleyen</p>
            </div>
          </div>
          <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={40} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                <NumberTicker value={completedTodos.length} />
              </p>
              <p className="text-sm text-muted-foreground">Tamamlanan</p>
            </div>
          </div>
          <BorderBeam colorFrom="#10b981" colorTo="#059669" size={40} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden group hover:border-orange-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                %<NumberTicker value={completionRate} />
              </p>
              <p className="text-sm text-muted-foreground">Tamamlanma</p>
            </div>
          </div>
          <BorderBeam colorFrom="#f97316" colorTo="#dc2626" size={40} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">İlerleme</span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
            {completedTodos.length}/{todos.length}
          </span>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Pending Todos */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Circle className="w-3.5 h-3.5" />
          Bekleyen ({pendingTodos.length})
        </h3>

        {pendingTodos.length === 0 ? (
          <div className="relative bg-card border border-border rounded-2xl p-8 text-center overflow-hidden">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-foreground font-semibold">
              Tebrikler! Bekleyen göreviniz yok
            </p>
            <BorderBeam colorFrom="#10b981" colorTo="#059669" size={60} duration={8} borderWidth={1.5} />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {pendingTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors group"
              >
                <button
                  onClick={() => toggleTodo(todo.id, todo.status)}
                  disabled={updating === todo.id}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50"
                >
                  {updating === todo.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                  )}
                </button>
                <span className="flex-1 text-sm font-medium text-foreground">
                  {todo.title}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  disabled={updating === todo.id}
                  className="flex-shrink-0 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Todos */}
      {completedTodos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tamamlanan ({completedTodos.length})
          </h3>

          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors group opacity-60 hover:opacity-80"
              >
                <button
                  onClick={() => toggleTodo(todo.id, todo.status)}
                  disabled={updating === todo.id}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {updating === todo.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                </button>
                <span className="flex-1 text-sm text-muted-foreground line-through">
                  {todo.title}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  disabled={updating === todo.id}
                  className="flex-shrink-0 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
