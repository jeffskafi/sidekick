import dynamic from "next/dynamic";
import { MindMapProvider } from "~/app/_contexts/MindMapContext";

const DynamicMindMap = dynamic(
  () => import("~/app/_components/mindMap/MindMap"),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-50 dark:bg-dark-bg">Loading...</div>,
  },
);

export default function MindMapPage() {
  return (
    <MindMapProvider>
      <div className="h-full w-full bg-gray-50 dark:bg-dark-bg">
        <DynamicMindMap />
      </div>
    </MindMapProvider>
  );
}
