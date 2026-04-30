import { describe, it, expect } from 'vitest';
import { getAncestors, getDirectPrerequisites } from '../utils/dagTraversal';
import { mockGraph } from './fixtures';

const { nodes } = mockGraph;

describe('getDirectPrerequisites', () => {
  it('returns empty array for a root node', () => {
    expect(getDirectPrerequisites(nodes, 'node-a')).toEqual([]);
  });

  it('returns direct parents for a node with one parent', () => {
    expect(getDirectPrerequisites(nodes, 'node-b')).toEqual(['node-a']);
  });

  it('returns multiple direct parents for a node with two parents', () => {
    expect(getDirectPrerequisites(nodes, 'node-f')).toEqual(['node-d', 'node-e']);
  });

  it('returns empty array for an unknown node', () => {
    expect(getDirectPrerequisites(nodes, 'nonexistent')).toEqual([]);
  });
});

describe('getAncestors', () => {
  it('returns empty for a root node', () => {
    expect(getAncestors(nodes, 'node-a')).toEqual([]);
  });

  it('returns only the direct parent when depth is 1', () => {
    expect(getAncestors(nodes, 'node-b')).toEqual(['node-a']);
  });

  it('returns direct parent first, then grandparent (BFS order)', () => {
    const ancestors = getAncestors(nodes, 'node-d');
    expect(ancestors[0]).toBe('node-b');
    expect(ancestors).toContain('node-a');
  });

  it('does not include the node itself', () => {
    const ancestors = getAncestors(nodes, 'node-d');
    expect(ancestors).not.toContain('node-d');
  });

  it('deduplicates ancestors that appear via multiple paths', () => {
    // Form F → D → B → A  AND  F → E → C → A  (A appears via two paths)
    const ancestors = getAncestors(nodes, 'node-f');
    const nodeACount = ancestors.filter((id) => id === 'node-a').length;
    expect(nodeACount).toBe(1);
  });

  it('includes all transitive ancestors for a deep node', () => {
    const ancestors = getAncestors(nodes, 'node-f');
    expect(ancestors).toContain('node-a');
    expect(ancestors).toContain('node-b');
    expect(ancestors).toContain('node-c');
    expect(ancestors).toContain('node-d');
    expect(ancestors).toContain('node-e');
  });
});
