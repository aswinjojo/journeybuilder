import { describe, it, expect, beforeEach } from 'vitest';
import { DataSourceRegistry } from '../services/DataSourceRegistry';
import type { DataSource, DataSourceContext, DataField } from '../types';
import { mockGraph } from './fixtures';

function makeSource(id: string, label: string, fields: DataField[] = []): DataSource {
  return {
    id,
    label,
    getFields: () => fields,
  };
}

const ctx: DataSourceContext = { graph: mockGraph, currentNodeId: 'node-d' };

describe('DataSourceRegistry', () => {
  let registry: DataSourceRegistry;

  beforeEach(() => {
    registry = new DataSourceRegistry();
  });

  it('starts empty', () => {
    expect(registry.getAll()).toHaveLength(0);
  });

  it('registers a source and returns it via getAll', () => {
    registry.register(makeSource('s1', 'Source 1'));
    expect(registry.getAll()).toHaveLength(1);
    expect(registry.getAll()[0].id).toBe('s1');
  });

  it('throws when registering duplicate id', () => {
    registry.register(makeSource('s1', 'Source 1'));
    expect(() => registry.register(makeSource('s1', 'Dupe'))).toThrow(
      /already registered/,
    );
  });

  it('unregisters a source', () => {
    registry.register(makeSource('s1', 'Source 1'));
    registry.unregister('s1');
    expect(registry.getAll()).toHaveLength(0);
  });

  it('resolveFields returns groups with fields', () => {
    const field: DataField = {
      id: 'src::f1',
      sourceId: 'src',
      fieldKey: 'f1',
      label: 'Source > F1',
      sourceType: 'form_field',
    };
    registry.register(makeSource('s1', 'Source 1', [field]));
    const groups = registry.resolveFields(ctx);
    expect(groups).toHaveLength(1);
    expect(groups[0].fields).toHaveLength(1);
  });

  it('resolveFields omits sources that return no fields', () => {
    registry.register(makeSource('s1', 'Empty', []));
    registry.register(makeSource('s2', 'Has fields', [
      { id: 'x::y', sourceId: 'x', fieldKey: 'y', label: 'X > Y', sourceType: 'global' },
    ]));
    const groups = registry.resolveFields(ctx);
    expect(groups).toHaveLength(1);
    expect(groups[0].source.id).toBe('s2');
  });

  it('maintains insertion order', () => {
    registry.register(makeSource('first', 'First'));
    registry.register(makeSource('second', 'Second'));
    registry.register(makeSource('third', 'Third'));
    const ids = registry.getAll().map((s) => s.id);
    expect(ids).toEqual(['first', 'second', 'third']);
  });
});
