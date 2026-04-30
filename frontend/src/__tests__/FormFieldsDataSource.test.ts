import { describe, it, expect } from 'vitest';
import { FormFieldsDataSource } from '../services/dataSources/FormFieldsDataSource';
import { mockGraph } from './fixtures';
import type { DataSourceContext } from '../types';

const source = new FormFieldsDataSource();

function ctx(nodeId: string): DataSourceContext {
  return { graph: mockGraph, currentNodeId: nodeId };
}

describe('FormFieldsDataSource', () => {
  it('returns no fields for a root node (no ancestors)', () => {
    expect(source.getFields(ctx('node-a'))).toHaveLength(0);
  });

  it('returns fields only from the direct parent for node-b', () => {
    const fields = source.getFields(ctx('node-b'));
    const sourceIds = new Set(fields.map((f) => f.sourceId));
    expect(sourceIds).toEqual(new Set(['node-a']));
  });

  it('excludes button-type fields', () => {
    const fields = source.getFields(ctx('node-b'));
    expect(fields.every((f) => !f.id.includes('button'))).toBe(true);
  });

  it('tags direct parents as form_field_direct', () => {
    const fields = source.getFields(ctx('node-d'));
    const bFields = fields.filter((f) => f.sourceId === 'node-b');
    expect(bFields.length).toBeGreaterThan(0);
    expect(bFields.every((f) => f.sourceType === 'form_field_direct')).toBe(true);
  });

  it('tags transitive ancestors as form_field_transitive', () => {
    const fields = source.getFields(ctx('node-d'));
    const aFields = fields.filter((f) => f.sourceId === 'node-a');
    expect(aFields.length).toBeGreaterThan(0);
    expect(aFields.every((f) => f.sourceType === 'form_field_transitive')).toBe(true);
  });

  it('returns fields from all ancestors of node-f', () => {
    const fields = source.getFields(ctx('node-f'));
    const sourceIds = new Set(fields.map((f) => f.sourceId));
    // Direct: node-d, node-e; Transitive: node-b, node-c, node-a
    expect(sourceIds).toContain('node-a');
    expect(sourceIds).toContain('node-b');
    expect(sourceIds).toContain('node-c');
    expect(sourceIds).toContain('node-d');
    expect(sourceIds).toContain('node-e');
  });

  it('does not include the current node in the results', () => {
    const fields = source.getFields(ctx('node-d'));
    expect(fields.every((f) => f.sourceId !== 'node-d')).toBe(true);
  });

  it('builds a readable label including the form name', () => {
    const fields = source.getFields(ctx('node-b'));
    const emailField = fields.find((f) => f.fieldKey === 'email');
    expect(emailField?.label).toBe('Form A > Email');
  });
});
