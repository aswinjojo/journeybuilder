import { describe, it, expect } from 'vitest';
import {
  ActionPropertiesDataSource,
  ClientOrgPropertiesDataSource,
} from '../services/dataSources/GlobalDataSource';
import { mockGraph } from './fixtures';
import type { DataSourceContext } from '../types';

const ctx: DataSourceContext = { graph: mockGraph, currentNodeId: 'node-d' };

describe('ActionPropertiesDataSource', () => {
  const source = new ActionPropertiesDataSource();

  it('has id "global_action_properties"', () => {
    expect(source.id).toBe('global_action_properties');
  });

  it('always returns fields regardless of context', () => {
    expect(source.getFields(ctx).length).toBeGreaterThan(0);
  });

  it('all fields have sourceType "global"', () => {
    expect(source.getFields(ctx).every((f) => f.sourceType === 'global')).toBe(true);
  });

  it('labels include the group name', () => {
    const labels = source.getFields(ctx).map((f) => f.label);
    expect(labels.every((l) => l.startsWith('Action Properties'))).toBe(true);
  });
});

describe('ClientOrgPropertiesDataSource', () => {
  const source = new ClientOrgPropertiesDataSource();

  it('has id "global_client_org_properties"', () => {
    expect(source.id).toBe('global_client_org_properties');
  });

  it('always returns fields regardless of context', () => {
    expect(source.getFields(ctx).length).toBeGreaterThan(0);
  });

  it('all fields have sourceType "global"', () => {
    expect(source.getFields(ctx).every((f) => f.sourceType === 'global')).toBe(true);
  });
});
