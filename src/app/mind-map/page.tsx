import dynamic from 'next/dynamic';

const DynamicMindMap = dynamic(() => import('~/app/_components/mindMap/MindMap'), { 
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function MindMapPage() {
  return <DynamicMindMap />;
}