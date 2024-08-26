"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useMindMapContext } from '~/app/_contexts/MindMapContext';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  isRoot?: boolean;
  isLoading?: boolean;
}

interface Link {
  source: string | Node;
  target: string | Node;
}

interface Data {
  nodes: Node[];
  links: Link[];
}

const MindMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<Data>({
    nodes: [{ id: "1", name: "Central Idea", isRoot: true }],
    links: []
  });
  const { generateRelatedWords } = useMindMapContext();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr("width", width).attr("height", height);

    svg.selectAll("*").remove();

    const g = svg.append("g");

    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force("link", d3.forceLink<Node, Link>(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(50));

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom)
      .on("dblclick.zoom", null);

    function update() {
      const link = g.selectAll<SVGLineElement, Link>(".link")
        .data(data.links)
        .join("line")
        .attr("class", "link")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2);

      const node = g.selectAll<SVGGElement, Node>(".node")
        .data(data.nodes)
        .join("g")
        .attr("class", "node")
        .call(d3.drag<SVGGElement, Node>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

      node.selectAll("circle")
        .data(d => [d])
        .join("circle")
        .attr("r", 30)
        .attr("fill", d => d.isRoot ? "#ff7f0e" : "#1f77b4");

      node.selectAll("text")
        .data(d => [d])
        .join("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(d => d.name)
        .style("fill", "white")
        .style("font-weight", "bold")
        .style("font-size", "12px");

      const addButton = node.selectAll(".add-button")
        .data(d => [d])
        .join("g")
        .attr("class", "add-button")
        .attr("transform", "translate(30,-30)")
        .on("click", (event: MouseEvent, d: Node) => {
          event.stopPropagation();
          void handleAddChildren(d);
        });

      addButton.selectAll("circle")
        .data(d => [d])
        .join("circle")
        .attr("r", 15)
        .attr("fill", "#4CAF50");

      addButton.selectAll("text")
        .data(d => [d])
        .join("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(d => d.isLoading ? "..." : "+")
        .style("fill", "white")
        .style("font-weight", "bold")
        .style("font-size", "20px");

      const editButton = node.selectAll(".edit-button")
        .data(d => [d])
        .join("g")
        .attr("class", "edit-button")
        .attr("transform", "translate(-30,-30)")
        .on("click", (event: MouseEvent, d: Node) => {
          event.stopPropagation();
          void handleNodeEdit(event, d);
        });

      editButton.selectAll("circle")
        .data(d => [d])
        .join("circle")
        .attr("r", 15)
        .attr("fill", "#FFA500");

      editButton.selectAll("text")
        .data(d => [d])
        .join("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text("✎")
        .style("fill", "white")
        .style("font-weight", "bold")
        .style("font-size", "20px");

      simulation.nodes(data.nodes).on("tick", ticked);

      simulation.force<d3.ForceLink<Node, Link>>("link")?.links(data.links);

      function ticked() {
        link
          .attr("x1", d => (d.source as Node).x!)
          .attr("y1", d => (d.source as Node).y!)
          .attr("x2", d => (d.target as Node).x!)
          .attr("y2", d => (d.target as Node).y!);

        node
          .attr("transform", d => `translate(${d.x},${d.y})`);
      }
    }

    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      if (!d.isRoot) {
        d.fx = null;
        d.fy = null;
      }
    }

    async function handleAddChildren(d: Node) {
      if (d.isLoading) return;

      setData(prevData => ({
        ...prevData,
        nodes: prevData.nodes.map(node =>
          node.id === d.id ? { ...node, isLoading: true } : node
        )
      }));

      try {
        const relatedWords = await generateRelatedWords(d.name);
        const newChildren = relatedWords.map((word, i) => ({
          id: Date.now().toString() + i,
          name: word
        }));

        setData(prevData => ({
          nodes: [
            ...prevData.nodes.map(node =>
              node.id === d.id ? { ...node, isLoading: false } : node
            ),
            ...newChildren
          ],
          links: [
            ...prevData.links,
            ...newChildren.map(child => ({ source: d.id, target: child.id }))
          ]
        }));
      } catch (error) {
        console.error('Failed to generate related words:', error);
        setData(prevData => ({
          ...prevData,
          nodes: prevData.nodes.map(node =>
            node.id === d.id ? { ...node, isLoading: false } : node
          )
        }));
      }
    }

    function handleNodeEdit(event: MouseEvent, d: Node) {
      event.stopPropagation();
      const newName = prompt("Enter new name:", d.name);
      if (newName !== null && newName !== d.name) {
        setData(prevData => ({
          ...prevData,
          nodes: prevData.nodes.map(node =>
            node.id === d.id ? { ...node, name: newName } : node
          )
        }));
      }
    }

    update();

    const resizeObserver = new ResizeObserver(() => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      svg.attr("width", newWidth).attr("height", newHeight);
      simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
      simulation.alpha(1).restart();
    });

    resizeObserver.observe(container);

    return () => {
      simulation.stop();
      resizeObserver.disconnect();
    };
  }, [data, generateRelatedWords]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default MindMap;