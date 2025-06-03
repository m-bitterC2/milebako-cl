import { AuthProvider } from "@/hooks/use-auth";
import TaskBoard from "../components/task-board/task-board";

export default function Page() {
  return (
    <AuthProvider>
      <TaskBoard />
    </AuthProvider>
  );
}
