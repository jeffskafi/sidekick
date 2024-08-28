"use client";

import React from "react";
import type { ForceGraphProps, ForceGraphMethods } from "react-force-graph-2d";
import type { Node } from "./types";
import ForceGraph from "react-force-graph-2d";

export interface Link {
  source: string | Node;
  target: string | Node;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

const ForceGraphComponent = React.forwardRef<
  ForceGraphMethods,
  ForceGraphProps<Node, Link>
>((props, _) => {
  return <ForceGraph {...props} />;
});

ForceGraphComponent.displayName = "ForceGraphComponent";

export default ForceGraphComponent;
