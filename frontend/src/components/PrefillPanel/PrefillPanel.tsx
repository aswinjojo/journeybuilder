import { useState } from 'react';
import type { GraphNode, FormSchema, InputMapping, DataField } from '../../types';
import type { SourceGroup } from '../../hooks/usePrefillSources';
import { DataSourceModal } from '../DataSourceModal/DataSourceModal';
import styles from './PrefillPanel.module.css';

interface PrefillPanelProps {
  node: GraphNode;
  form: FormSchema;
  sourceGroups: SourceGroup[];
  inputMapping: InputMapping;
  onMappingChange: (nodeId: string, newMapping: InputMapping) => void;
}

export function PrefillPanel({
  node,
  form,
  sourceGroups,
  inputMapping,
  onMappingChange,
}: PrefillPanelProps) {
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);

  const fields = Object.entries(form.field_schema.properties).filter(
    ([, schema]) => schema.avantos_type !== 'button',
  );

  function handleSelectSource(field: DataField) {
    const newMapping: InputMapping = {
      ...inputMapping,
      [activeFieldKey!]: {
        sourceType: field.sourceType,
        sourceId: field.sourceId,
        fieldKey: field.fieldKey,
        label: field.label,
      },
    };
    onMappingChange(node.id, newMapping);
    setActiveFieldKey(null);
  }

  function handleClearMapping(fieldKey: string) {
    const { [fieldKey]: _removed, ...rest } = inputMapping;
    onMappingChange(node.id, rest);
  }

  const activeFieldSchema =
    activeFieldKey ? form.field_schema.properties[activeFieldKey] : null;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.heading}>Prefill</h2>
          <p className={styles.subheading}>Prefill fields for this form</p>
        </div>
        <label className={styles.toggle} aria-label="Prefill enabled">
          <input type="checkbox" defaultChecked />
          <span className={styles.slider} />
        </label>
      </div>

      <div className={styles.fieldList}>
        {fields.map(([fieldKey, schema]) => {
          const mapped = inputMapping[fieldKey];
          const fieldLabel = schema.title ?? fieldKey;

          if (mapped) {
            // Mapped field — solid pill with "fieldKey: SourceName.sourceFieldKey" + X
            const pillText = `${fieldKey}: ${mapped.label.replace(' > ', '.')}`;
            return (
              <div
                key={fieldKey}
                className={styles.fieldRowMapped}
                onClick={() => setActiveFieldKey(fieldKey)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActiveFieldKey(fieldKey);
                }}
                aria-label={`Configure prefill for ${fieldLabel}`}
              >
                <span className={styles.pillIcon}>⊞</span>
                <span className={styles.pillText}>{pillText}</span>
                <button
                  className={styles.clearBtn}
                  aria-label={`Clear prefill for ${fieldLabel}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearMapping(fieldKey);
                  }}
                >
                  ✕
                </button>
              </div>
            );
          }

          // Unmapped field — dashed border box, just the field name
          return (
            <div
              key={fieldKey}
              className={styles.fieldRowEmpty}
              onClick={() => setActiveFieldKey(fieldKey)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActiveFieldKey(fieldKey);
              }}
              aria-label={`Configure prefill for ${fieldLabel}`}
            >
              <span className={styles.pillIcon}>⊞</span>
              <span className={styles.emptyFieldName}>{fieldKey}</span>
            </div>
          );
        })}
      </div>

      {activeFieldKey && activeFieldSchema && (
        <DataSourceModal
          fieldName={activeFieldKey}
          fieldLabel={activeFieldSchema.title ?? activeFieldKey}
          sourceGroups={sourceGroups}
          onSelect={handleSelectSource}
          onClose={() => setActiveFieldKey(null)}
        />
      )}
    </div>
  );
}
