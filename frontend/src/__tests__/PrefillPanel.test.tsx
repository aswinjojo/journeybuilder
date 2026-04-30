import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrefillPanel } from '../components/PrefillPanel/PrefillPanel';
import { mockGraph } from './fixtures';
import type { GraphNode, FormSchema, InputMapping } from '../types';
import type { SourceGroup } from '../hooks/usePrefillSources';

const nodeD = mockGraph.nodes.find((n) => n.id === 'node-d')! as GraphNode;
const formD = mockGraph.forms.find(
  (f) => f.id === nodeD.data.component_id,
)! as FormSchema;

const sourceGroups: SourceGroup[] = [];

describe('PrefillPanel', () => {
  it('renders a row for each non-button field', () => {
    render(
      <PrefillPanel
        node={nodeD}
        form={formD}
        sourceGroups={sourceGroups}
        inputMapping={{}}
        onMappingChange={vi.fn()}
      />,
    );
    // Unmapped fields show the raw fieldKey
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    // Button fields are filtered out — no row with "button" fieldKey
    expect(screen.queryByLabelText('Configure prefill for Button')).not.toBeInTheDocument();
  });

  it('shows the raw fieldKey for unmapped fields (dashed row, no "— not set —")', () => {
    render(
      <PrefillPanel
        node={nodeD}
        form={formD}
        sourceGroups={sourceGroups}
        inputMapping={{}}
        onMappingChange={vi.fn()}
      />,
    );
    // The new design shows the field key directly, not "— not set —"
    expect(screen.queryByText('— not set —')).not.toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
  });

  it('shows "fieldKey: SourceName.sourceFieldKey" pill when a mapping exists', () => {
    const mapping: InputMapping = {
      email: {
        sourceType: 'form_field_direct',
        sourceId: 'node-b',
        fieldKey: 'email',
        label: 'Form B > Email',
      },
    };
    render(
      <PrefillPanel
        node={nodeD}
        form={formD}
        sourceGroups={sourceGroups}
        inputMapping={mapping}
        onMappingChange={vi.fn()}
      />,
    );
    // Label format: "fieldKey: SourceName.sourceFieldKey"
    expect(screen.getByText('email: Form B.Email')).toBeInTheDocument();
  });

  it('calls onMappingChange without the cleared field when ✕ is clicked', () => {
    const onMappingChange = vi.fn();
    const mapping: InputMapping = {
      email: {
        sourceType: 'form_field_direct',
        sourceId: 'node-b',
        fieldKey: 'email',
        label: 'Form B > Email',
      },
    };
    render(
      <PrefillPanel
        node={nodeD}
        form={formD}
        sourceGroups={sourceGroups}
        inputMapping={mapping}
        onMappingChange={onMappingChange}
      />,
    );
    const clearBtn = screen.getByLabelText('Clear prefill for Email');
    fireEvent.click(clearBtn);
    expect(onMappingChange).toHaveBeenCalledWith('node-d', {});
  });

  it('opens the modal when an unmapped row is clicked', () => {
    render(
      <PrefillPanel
        node={nodeD}
        form={formD}
        sourceGroups={sourceGroups}
        inputMapping={{}}
        onMappingChange={vi.fn()}
      />,
    );
    const row = screen.getByLabelText('Configure prefill for Email');
    fireEvent.click(row);
    expect(
      screen.getByRole('dialog', { name: /select prefill source for email/i }),
    ).toBeInTheDocument();
  });

  it('opens the modal when a mapped row is clicked (to change source)', () => {
    const mapping: InputMapping = {
      email: {
        sourceType: 'form_field_direct',
        sourceId: 'node-b',
        fieldKey: 'email',
        label: 'Form B > Email',
      },
    };
    render(
      <PrefillPanel
        node={nodeD}
        form={formD}
        sourceGroups={sourceGroups}
        inputMapping={mapping}
        onMappingChange={vi.fn()}
      />,
    );
    const row = screen.getByLabelText('Configure prefill for Email');
    fireEvent.click(row);
    expect(
      screen.getByRole('dialog', { name: /select prefill source for email/i }),
    ).toBeInTheDocument();
  });
});
