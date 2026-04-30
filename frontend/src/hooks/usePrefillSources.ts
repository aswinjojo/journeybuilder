import { useMemo } from 'react';
import { dataSourceRegistry } from '../services/DataSourceRegistry';
import { FormFieldsDataSource } from '../services/dataSources/FormFieldsDataSource';
import type { BlueprintGraph, DataField, DataSource } from '../types';

export interface SourceGroup {
  source: DataSource;
  fields: DataField[];
}

// Shared instance — FormFieldsDataSource is stateless so one is enough.
const formFieldsDataSource = new FormFieldsDataSource();

/**
 * Returns all available prefill source groups for `currentNodeId`.
 *
 * Group order (matching the reference UI):
 *   1. Global/static registry sources (Action Properties, Client Org, …)
 *   2. One group per upstream form node, in BFS order (direct parents first,
 *      then transitive ancestors), so each ancestor form is its own
 *      collapsible section in the modal.
 *
 * Results are memoized; they re-compute when graph or nodeId changes.
 */
export function usePrefillSources(
  graph: BlueprintGraph | null,
  currentNodeId: string | null,
): SourceGroup[] {
  return useMemo(() => {
    if (!graph || !currentNodeId) return [];

    // ── 1. Global sources from the registry ─────────────────────────────────
    const globalGroups = dataSourceRegistry.resolveFields({
      graph,
      currentNodeId,
    });

    // ── 2. Per-ancestor-form groups ──────────────────────────────────────────
    // FormFieldsDataSource returns all ancestor fields tagged with sourceId =
    // the ancestor's node ID.  We group those fields by sourceId to produce
    // one SourceGroup (= one collapsible section) per upstream form.
    const allFormFields = formFieldsDataSource.getFields({
      graph,
      currentNodeId,
    });

    // Preserve BFS insertion order (Map maintains insertion order).
    const byNode = new Map<string, DataField[]>();
    for (const field of allFormFields) {
      if (!byNode.has(field.sourceId)) byNode.set(field.sourceId, []);
      byNode.get(field.sourceId)!.push(field);
    }

    const formGroups: SourceGroup[] = Array.from(byNode.entries()).map(
      ([nodeId, fields]) => {
        const node = graph.nodes.find((n) => n.id === nodeId)!;
        const formName = node.data.name;
        // Inline DataSource object — no need to register these in the global
        // registry because they are specific to the currently selected node.
        const source: DataSource = {
          id: nodeId,
          label: formName,
          getFields: () => fields,
        };
        return { source, fields };
      },
    );

    return [...globalGroups, ...formGroups];
  }, [graph, currentNodeId]);
}
