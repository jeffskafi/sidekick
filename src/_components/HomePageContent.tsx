import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AddAgentButton } from "../_components/AddAgentButton";
import { WorkContent } from "../_components/WorkContent";
import { AgentInfoDrawer } from "../_components/AgentInfoDrawer";

const DynamicAgentCanvas = dynamic(
  () => import("../_components/AgentCanvas/AgentCanvas"),
  { ssr: false },
);

export default function HomePageContent() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="flex h-screen flex-col">
        <div className="flex-grow overflow-hidden">
          <Tabs defaultValue="agents" className="flex h-full flex-col">
            <TabsList className="mb-4 justify-start">
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="work">Work</TabsTrigger>
            </TabsList>
            <div className="flex-grow overflow-hidden">
              <TabsContent value="agents" className="h-full">
                <div className="flex h-full flex-col">
                  <div className="mb-4">
                    <AddAgentButton />
                  </div>
                  <div className="relative flex-grow">
                    <Suspense fallback={<div>Loading Canvas...</div>}>
                      <DynamicAgentCanvas className="absolute inset-0" />
                    </Suspense>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="work" className="h-full">
                <WorkContent />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      <AgentInfoDrawer />
    </main>
  );
}
