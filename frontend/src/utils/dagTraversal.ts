import type { GraphNode } from '../types';

/**
 * Builds a map of nodeId → array of direct prerequisite nodeIds.
 */
function buildPrerequisiteMap(nodes: GraphNode[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const node of nodes) {
    map.set(node.id, node.data.prerequisites);
  }
  return map;
}

/**
 * Returns all ancestor node IDs of `startNodeId` in topological order
 * (direct parents first, then their parents, etc.) using BFS.
 *
 * The start node itself is NOT included in the result.
 */
export function getAncestors(nodes: GraphNode[], startNodeId: string): string[] {
  const prereqMap = buildPrerequisiteMap(nodes);
  const visited = new Set<string>();
  const order: string[] = [];
  const queue: string[] = [...(prereqMap.get(startNodeId) ?? [])];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    order.push(current);
    const parents = prereqMap.get(current) ?? [];
    queue.push(...parents);
  }

  return order;
}

/**
 * Returns only the direct prerequisite node IDs of `nodeId`.
 */
export function getDirectPrerequisites(
  nodes: GraphNode[],
  nodeId: string,
): string[] {
  return nodes.find((n) => n.id === nodeId)?.data.prerequisites ?? [];
}
