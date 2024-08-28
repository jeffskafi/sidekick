import type { NodeObject } from "react-force-graph-2d";

export interface Node extends NodeObject {
  id: string;
  name: string;
  label: string;
  isRoot?: boolean;
  isLoading?: boolean;
  x?: number;
  y?: number;
  __bckgDimensions?: [number, number];
}

export interface Link {
  source: string | Node;
  target: string | Node;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}