import dynamic from "next/dynamic";
import { MindMapProvider } from "~/app/_contexts/MindMapContext";
const DynamicMindMap = dynamic(
  () => import("~/app/_components/mindMap/MindMap"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  },
);

export default function MindMapPage() {
  return (
    <MindMapProvider>
      <DynamicMindMap />
    </MindMapProvider>
  );
}
