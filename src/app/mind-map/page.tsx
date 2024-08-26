import { MindMapProvider } from '~/app/_contexts/MindMapContext';
import MindMap from '~/app/_components/mindMap/MindMap';

export default function MindMapPage() {
  return (
    <div className="h-screen w-screen">
      <MindMapProvider>
        <MindMap />
      </MindMapProvider>
    </div>
  );
}