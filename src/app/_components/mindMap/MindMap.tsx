"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Circle, Line, Text } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from 'konva/lib/Node';

interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
}

interface Link {
  from: string;
  to: string;
}

const MindMap: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [nodes, setNodes] = useState<Node[]>([
    { id: "root", x: 400, y: 300, text: "Root" }
  ]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleNodeClick = useCallback((node: Node, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setSelectedNode(node);
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    if (pointerPosition) {
      setContextMenu({ x: pointerPosition.x, y: pointerPosition.y });
    }
    console.log('Node clicked:', node); // Add this line for debugging
  }, []);

  const handleStageClick = useCallback(() => {
    setContextMenu(null);
    setSelectedNode(null);
  }, []);

  const handleGenerate = useCallback(() => {
    if (selectedNode) {
      const newNodes: Node[] = [];
      const newLinks: Link[] = [];
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 / 3) * i;
        const newNode: Node = {
          id: `${selectedNode.id}-${i}`,
          x: selectedNode.x + Math.cos(angle) * 100,
          y: selectedNode.y + Math.sin(angle) * 100,
          text: `Child ${i + 1}`
        };
        newNodes.push(newNode);
        newLinks.push({ from: selectedNode.id, to: newNode.id });
      }
      setNodes(prevNodes => [...prevNodes, ...newNodes]);
      setLinks(prevLinks => [...prevLinks, ...newLinks]);
    }
    setContextMenu(null);
  }, [selectedNode]);

  const handleDelete = useCallback(() => {
    if (selectedNode && selectedNode.id !== "root") {
      setNodes(prevNodes => prevNodes.filter(node => node.id !== selectedNode.id));
      setLinks(prevLinks => prevLinks.filter(link => link.from !== selectedNode.id && link.to !== selectedNode.id));
    }
    setContextMenu(null);
    setSelectedNode(null);
  }, [selectedNode]);

  const handleMenuClick = useCallback((node: Node, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setSelectedNode(node);
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    if (pointerPosition) {
      setContextMenu({ x: pointerPosition.x, y: pointerPosition.y });
    }
  }, []);

  return (
    <>
      <Stage width={dimensions.width} height={dimensions.height} onClick={handleStageClick}>
        <Layer>
          {links.map(link => {
            const fromNode = nodes.find(n => n.id === link.from);
            const toNode = nodes.find(n => n.id === link.to);
            if (fromNode && toNode) {
              return (
                <Line
                  key={`${link.from}-${link.to}`}
                  points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
                  stroke="black"
                  strokeWidth={1}
                />
              );
            }
            return null;
          })}
          {nodes.map(node => (
            <React.Fragment key={node.id}>
              <Circle
                x={node.x}
                y={node.y}
                radius={30}
                fill={node.id === "root" ? "lightblue" : "lightgreen"}
                stroke="black"
                strokeWidth={2}
                onClick={(e: KonvaEventObject<MouseEvent>) => {
                  console.log('Circle clicked:', node.id); // Add this line
                  e.cancelBubble = true;
                  handleNodeClick(node, e);
                }}
              />
              <Text
                x={node.x - 25}
                y={node.y - 6}
                text={node.text}
                fontSize={12}
                fill="black"
                width={50}
                align="center"
              />
              {/* Menu button */}
              <Circle
                x={node.x - 25}
                y={node.y - 25}
                radius={8}
                fill="white"
                stroke="black"
                strokeWidth={1}
                onClick={(e: KonvaEventObject<MouseEvent>) => handleMenuClick(node, e)}
              />
              <Text
                x={node.x - 29}
                y={node.y - 29}
                text="☰"
                fontSize={10}
                fill="black"
                onClick={(e: KonvaEventObject<MouseEvent>) => handleMenuClick(node, e)}
              />
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
      {contextMenu && selectedNode && (
        <div
          style={{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'white',
            border: '1px solid black',
            borderRadius: '5px',
            padding: '5px',
          }}
        >
          <button onClick={handleGenerate}>Generate</button>
          {selectedNode.id !== "root" && (
            <button onClick={handleDelete}>Delete</button>
          )}
        </div>
      )}
    </>
  );
};

export default MindMap;
