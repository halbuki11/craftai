import type { Metadata } from "next";
import { TodoList } from "@/components/todos/todo-list";

export const metadata: Metadata = {
  title: "Görevlerim",
};

export default function TodosPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Görevlerim</h1>
        <p className="text-muted-foreground mt-1">
          Sesli notlarından oluşturulan görevleri yönet
        </p>
      </div>

      <TodoList />
    </div>
  );
}
