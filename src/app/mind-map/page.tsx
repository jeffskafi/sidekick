import dynamic from "next/dynamic";
import { MindMapProvider } from "~/app/_contexts/MindMapContext";

const DynamicMindMap = dynamic(
  () => import("~/app/_components/mindMap/MindMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-primary-light dark:text-primary-dark">
          Loading...
        </div>
      </div>
    ),
  },
);

export default function MindMapPage() {
  return (
    <MindMapProvider>
      <div className="h-full w-full bg-background-light dark:bg-background-dark">
        <DynamicMindMap />
      </div>
    </MindMapProvider>
  );
}
