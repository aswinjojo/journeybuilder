import { useState, useCallback } from 'react';
import { useBlueprintGraph } from './hooks/useBlueprintGraph';
import { usePrefillSources } from './hooks/usePrefillSources';
import { FormList } from './components/FormList/FormList';
import { PrefillPanel } from './components/PrefillPanel/PrefillPanel';
import type { InputMapping } from './types';
import styles from './App.module.css';

const TENANT_ID = '1';
const BLUEPRINT_ID = 'bp_01jk766tckfwx84xjcxazggzyc';

export default function App() {
  const { graph, loading, error } = useBlueprintGraph(TENANT_ID, BLUEPRINT_ID);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Local overrides for input_mapping so edits are reflected immediately
  const [mappingOverrides, setMappingOverrides] = useState<
    Record<string, InputMapping>
  >({});

  const sourceGroups = usePrefillSources(graph, selectedNodeId);

  const handleMappingChange = useCallback(
    (nodeId: string, newMapping: InputMapping) => {
      setMappingOverrides((prev) => ({ ...prev, [nodeId]: newMapping }));
    },
    [],
  );

  const selectedNode = graph?.nodes.find((n) => n.id === selectedNodeId) ?? null;
  const selectedForm = selectedNode
    ? graph?.forms.find((f) => f.id === selectedNode.data.component_id) ?? null
    : null;

  const activeMapping: InputMapping =
    selectedNodeId && mappingOverrides[selectedNodeId]
      ? mappingOverrides[selectedNodeId]
      : selectedNode?.data.input_mapping ?? {};

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Journey Builder</h1>
        {graph && (
          <span className={styles.blueprintName}>{graph.name}</span>
        )}
      </header>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <p className={styles.sidebarLabel}>Forms</p>
          {loading && <p className={styles.status}>Loading…</p>}
          {error && (
            <p className={styles.error}>
              Could not load graph: {error}
              <br />
              <small>Make sure the mock server is running on port 3000.</small>
            </p>
          )}
          {graph && (
            <FormList
              nodes={graph.nodes}
              selectedNodeId={selectedNodeId}
              onSelect={setSelectedNodeId}
            />
          )}
        </aside>

        <main className={styles.main}>
          {!selectedNode && !loading && !error && (
            <div className={styles.placeholder}>
              <p>← Select a form to configure its prefill mapping.</p>
            </div>
          )}

          {selectedNode && selectedForm && (
            <PrefillPanel
              node={selectedNode}
              form={selectedForm}
              sourceGroups={sourceGroups}
              inputMapping={activeMapping}
              onMappingChange={handleMappingChange}
            />
          )}

          {selectedNode && !selectedForm && (
            <div className={styles.placeholder}>
              <p>Form schema not found for this node.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
