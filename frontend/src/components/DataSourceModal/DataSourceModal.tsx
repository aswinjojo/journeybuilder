import { useState, useEffect, useRef } from 'react';
import type { DataField, SourceGroup } from '../../hooks/usePrefillSources';
import styles from './DataSourceModal.module.css';

interface DataSourceModalProps {
  fieldName: string;
  fieldLabel: string;
  sourceGroups: SourceGroup[];
  onSelect: (field: DataField) => void;
  onClose: () => void;
}

export function DataSourceModal({
  fieldName,
  fieldLabel,
  sourceGroups,
  onSelect,
  onClose,
}: DataSourceModalProps) {
  const [query, setQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(sourceGroups.map((g) => g.source.id)),
  );
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const lowerQuery = query.toLowerCase();

  const filteredGroups = sourceGroups
    .map((group) => ({
      ...group,
      fields: group.fields.filter(
        (f) =>
          !lowerQuery ||
          f.label.toLowerCase().includes(lowerQuery) ||
          f.fieldKey.toLowerCase().includes(lowerQuery),
      ),
    }))
    .filter((g) => g.fields.length > 0);

  function toggleGroup(id: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Select prefill source for ${fieldLabel}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2 className={styles.title}>Select data element to map</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        <p className={styles.subtitle}>
          Prefilling: <strong>{fieldLabel || fieldName}</strong>
        </p>

        <div className={styles.body}>
          <aside className={styles.sidebar}>
            <p className={styles.sectionLabel}>Available data</p>
            <input
              ref={searchRef}
              className={styles.search}
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search data fields"
            />

            {filteredGroups.length === 0 && (
              <p className={styles.noResults}>No matching fields.</p>
            )}

            {filteredGroups.map(({ source, fields }) => (
              <div key={source.id} className={styles.group}>
                <button
                  className={styles.groupHeader}
                  onClick={() => toggleGroup(source.id)}
                  aria-expanded={expandedGroups.has(source.id)}
                >
                  <span className={styles.chevron}>
                    {expandedGroups.has(source.id) ? '∨' : '›'}
                  </span>
                  {source.label}
                </button>

                {expandedGroups.has(source.id) && (
                  <ul className={styles.fieldList}>
                    {fields.map((field) => (
                      <li key={field.id}>
                        <button
                          className={styles.fieldItem}
                          onClick={() => onSelect(field)}
                        >
                          {field.fieldKey}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </aside>

          <div className={styles.preview}>
            <p className={styles.previewHint}>
              Click a field on the left to select it as the prefill source.
            </p>
          </div>
        </div>

        <footer className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            CANCEL
          </button>
        </footer>
      </div>
    </div>
  );
}
