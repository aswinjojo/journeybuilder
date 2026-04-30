import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataSourceModal } from '../components/DataSourceModal/DataSourceModal';
import type { SourceGroup } from '../hooks/usePrefillSources';
import type { DataField } from '../types';

const emailField: DataField = {
  id: 'node-a::email',
  sourceId: 'node-a',
  fieldKey: 'email',
  label: 'Form A > Email',
  sourceType: 'form_field_transitive',
};

const sourceGroups: SourceGroup[] = [
  {
    source: { id: 'form_field', label: 'Form Fields', getFields: () => [emailField] },
    fields: [emailField],
  },
];

describe('DataSourceModal', () => {
  it('renders the modal dialog', () => {
    render(
      <DataSourceModal
        fieldName="email"
        fieldLabel="Email"
        sourceGroups={sourceGroups}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays the field label in the subtitle', () => {
    render(
      <DataSourceModal
        fieldName="email"
        fieldLabel="Email"
        sourceGroups={sourceGroups}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(
      <DataSourceModal
        fieldName="email"
        fieldLabel="Email"
        sourceGroups={sourceGroups}
        onSelect={vi.fn()}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText('CANCEL'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onSelect with the field when a field button is clicked', () => {
    const onSelect = vi.fn();
    render(
      <DataSourceModal
        fieldName="email"
        fieldLabel="Email"
        sourceGroups={sourceGroups}
        onSelect={onSelect}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'email' }));
    expect(onSelect).toHaveBeenCalledWith(emailField);
  });

  it('filters fields when search query is typed', () => {
    const otherField: DataField = {
      id: 'node-a::name',
      sourceId: 'node-a',
      fieldKey: 'name',
      label: 'Form A > Name',
      sourceType: 'form_field_transitive',
    };
    const groups: SourceGroup[] = [
      {
        source: {
          id: 'form_field',
          label: 'Form Fields',
          getFields: () => [emailField, otherField],
        },
        fields: [emailField, otherField],
      },
    ];
    render(
      <DataSourceModal
        fieldName="email"
        fieldLabel="Email"
        sourceGroups={groups}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'name' },
    });
    expect(screen.queryByRole('button', { name: 'email' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'name' })).toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <DataSourceModal
        fieldName="email"
        fieldLabel="Email"
        sourceGroups={sourceGroups}
        onSelect={vi.fn()}
        onClose={onClose}
      />,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
