import type { BlueprintGraph } from '../types';

const BASE_URL = 'http://localhost:3000';

/**
 * Fetches the action-blueprint graph for the given tenant + blueprint IDs.
 * Matches the mock-server route:
 *   GET /api/v1/:tenantId/actions/blueprints/:blueprintId/graph
 */
export async function fetchBlueprintGraph(
  tenantId: string,
  blueprintId: string,
): Promise<BlueprintGraph> {
  const url = `${BASE_URL}/api/v1/${tenantId}/actions/blueprints/${blueprintId}/graph`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch blueprint graph: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<BlueprintGraph>;
}
