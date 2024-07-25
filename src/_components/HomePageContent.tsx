import { AgentInfoDrawer } from "../_components/AgentInfoDrawer";
import { ThemeProvider } from "./ThemeProvider";
import TodoApp from "./TodoApp";

export default function HomePageContent() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="flex h-screen flex-col">
        <div className="flex-grow overflow-hidden">
          <ThemeProvider>
            <TodoApp />
          </ThemeProvider>
        </div>
      </div>
      <AgentInfoDrawer />
    </main>
  );
}
