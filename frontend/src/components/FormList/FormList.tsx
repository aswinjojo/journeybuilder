import type { GraphNode } from '../../types';
import styles from './FormList.module.css';

interface FormListProps {
  nodes: GraphNode[];
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
}

export function FormList({ nodes, selectedNodeId, onSelect }: FormListProps) {
  if (nodes.length === 0) {
    return <p className={styles.empty}>No forms found in this blueprint.</p>;
  }

  return (
    <ul className={styles.list} role="listbox" aria-label="Forms">
      {nodes.map((node) => (
        <li
          key={node.id}
          role="option"
          aria-selected={node.id === selectedNodeId}
          className={`${styles.item} ${node.id === selectedNodeId ? styles.selected : ''}`}
          onClick={() => onSelect(node.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSelect(node.id);
          }}
          tabIndex={0}
        >
          <span className={styles.icon}>⊞</span>
          <span className={styles.name}>{node.data.name}</span>
          {node.data.prerequisites.length === 0 && (
            <span className={styles.badge}>root</span>
          )}
        </li>
      ))}
    </ul>
  );
}
