import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";
import dynamic from "next/dynamic";

const DynamicAgentDrawer = dynamic(() => import("./AgentDrawer"), {
  ssr: false,
});

export function AgentInfoDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
          Show Agent Data
        </button>
      </DrawerTrigger>
      <DrawerContent className="left-0 right-0 mx-auto w-1/3 max-w-md">
        <DynamicAgentDrawer />
      </DrawerContent>
    </Drawer>
  );
}
