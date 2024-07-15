import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";
import dynamic from "next/dynamic";

const DynamicAgentDrawer = dynamic(() => import("./AgentDrawer"), { ssr: false });

export function AgentInfoDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Show Agent Data
        </button>
      </DrawerTrigger>
      <DrawerContent className="w-1/3 max-w-md mx-auto left-0 right-0">
        <DynamicAgentDrawer />
      </DrawerContent>
    </Drawer>
  );
}