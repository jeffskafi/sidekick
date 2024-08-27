"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Circle, Line, Text } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from 'konva/lib/Node';
import { Html } from "react-konva-utils";

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

interface TextInputProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  align: 'left' | 'center' | 'right';
  defaultValue: string;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const MindMap: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [nodes, setNodes] = useState<Node[]>([
    { id: "root", x: 400, y: 300, text: "Root" }
  ]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);

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

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    
    if (!stage) {
      return; // Exit the function if stage is null
    }

    const oldScale = stage.scaleX();
    const pointerPosition = stage.getPointerPosition();

    if (!pointerPosition) {
      return; // Exit the function if pointerPosition is null
    }

    const mousePointTo = {
      x: (pointerPosition.x - stage.x()) / oldScale,
      y: (pointerPosition.y - stage.y()) / oldScale,
    };

    // Adjust the scale change based on the delta
    const zoomSensitivity = 0.01; // Lower value for less sensitivity
    const newScale = e.evt.deltaY < 0 
      ? oldScale * (1 + zoomSensitivity) 
      : oldScale / (1 + zoomSensitivity);

    setScale(newScale);
    setPosition({
      x: pointerPosition.x - mousePointTo.x * newScale,
      y: pointerPosition.y - mousePointTo.y * newScale,
    });
  }, []);

  const handleDragStart = useCallback(() => {
    setContextMenu(null);
    setSelectedNode(null);
  }, []);

  const handleNodeClick = useCallback((node: Node, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setSelectedNode(node);
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    if (pointerPosition) {
      setContextMenu({ 
        x: pointerPosition.x, 
        y: pointerPosition.y, 
        nodeId: node.id  // Add this line
      });
    }
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
      const nodesToDelete = new Set<string>();

      const recursivelyFindNodesToDelete = (nodeId: string) => {
        nodesToDelete.add(nodeId);
        links.forEach(link => {
          if (link.from === nodeId) {
            recursivelyFindNodesToDelete(link.to);
          }
        });
      };

      recursivelyFindNodesToDelete(selectedNode.id);

      setNodes(prevNodes => prevNodes.filter(node => !nodesToDelete.has(node.id)));
      setLinks(prevLinks => prevLinks.filter(link => !nodesToDelete.has(link.from) && !nodesToDelete.has(link.to)));
    }
    setContextMenu(null);
    setSelectedNode(null);
  }, [selectedNode, links]);

  const handleMenuClick = useCallback((node: Node, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setSelectedNode(node);
    const stage = e.target.getStage();
    if (stage) {
      const menuButtonPosition = {
        x: node.x - 25, // This is the x position of the menu button
        y: node.y - 25, // This is the y position of the menu button
      };
      // Remove the unused stagePosition variable
      setContextMenu({
        x: menuButtonPosition.x,
        y: menuButtonPosition.y,
        nodeId: node.id
      });
    }
  }, []);

  const handleTextEdit = useCallback((nodeId: string, newText: string) => {
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId ? { ...node, text: newText } : node
      )
    );
    setEditingNode(null);
  }, []);

  const TextInput: React.FC<TextInputProps> = ({ x, y, width, height, fontSize, align, defaultValue, onBlur }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        inputRef.current?.blur();
      }
    };

    return (
      <Html>
        <input
          ref={inputRef}
          style={{
            position: 'absolute',
            top: `${y}px`,
            left: `${x}px`,
            width: `${width}px`,
            height: `${height}px`,
            fontSize: `${fontSize}px`,
            textAlign: align,
            border: 'none',
            background: 'transparent',
            outline: 'none',
          }}
          defaultValue={defaultValue}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
        />
      </Html>
    );
  };

  return (
    <>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={(e: KonvaEventObject<DragEvent>) => {
          const stage = e.target.getStage();
          if (stage) {
            setPosition({ x: stage.x(), y: stage.y() });
          }
        }}
        onClick={handleStageClick}
        ref={stageRef}
      >
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
              {editingNode === node.id ? (
                <TextInput
                  x={node.x - 25}
                  y={node.y - 6}
                  width={50}
                  height={12}
                  fontSize={12}
                  align="center"
                  defaultValue={node.text}
                  onBlur={(e) => handleTextEdit(node.id, e.target.value)}
                />
              ) : (
                <Text
                  x={node.x - 25}
                  y={node.y - 6}
                  text={node.text}
                  fontSize={12}
                  fill="black"
                  width={50}
                  align="center"
                  onDblClick={() => setEditingNode(node.id)}
                />
              )}
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
            top: (contextMenu.y * scale) + position.y,
            left: (contextMenu.x * scale) + position.x,
            background: 'white',
            border: '1px solid black',
            borderRadius: '5px',
            padding: '5px',
            transformOrigin: 'top left',
          }}
        >
          <button onClick={handleGenerate}>Generate</button>
          <button onClick={() => setEditingNode(selectedNode.id)}>Edit</button>
          {selectedNode.id !== "root" && (
            <button onClick={handleDelete}>Delete</button>
          )}
        </div>
      )}
    </>
  );
};

export default MindMap;
