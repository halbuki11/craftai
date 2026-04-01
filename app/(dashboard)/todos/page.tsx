import type { Metadata } from "next";
import { TodoList } from "@/components/todos/todo-list";

export const metadata: Metadata = {
  title: "Tasks",
};

export default function TodosPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white/90">Tasks</h1>
        <p className="text-white/50 mt-1">
          Manage tasks created from your notes
        </p>
      </div>

      <TodoList />
    </div>
  );
}
