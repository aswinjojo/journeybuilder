import type { DataSource, DataSourceContext, DataField } from '../../types';
import { getAncestors, getDirectPrerequisites } from '../../utils/dagTraversal';

/**
 * Provides form fields from all upstream forms (direct + transitive ancestors).
 *
 * Each field is tagged as either "form_field_direct" or "form_field_transitive"
 * so consumers can distinguish them if needed, but both share the same
 * sourceType prefix ("form_field") for simple matching.
 */
export class FormFieldsDataSource implements DataSource {
  readonly id = 'form_field';
  readonly label = 'Form Fields';

  getFields(context: DataSourceContext): DataField[] {
    const { graph, currentNodeId } = context;
    const { nodes, forms } = graph;

    const directIds = new Set(getDirectPrerequisites(nodes, currentNodeId));
    const allAncestorIds = getAncestors(nodes, currentNodeId);

    const fields: DataField[] = [];

    for (const ancestorId of allAncestorIds) {
      const ancestorNode = nodes.find((n) => n.id === ancestorId);
      if (!ancestorNode) continue;

      const form = forms.find(
        (f) => f.id === ancestorNode.data.component_id,
      );
      if (!form) continue;

      const isDirect = directIds.has(ancestorId);
      const sourceType = isDirect ? 'form_field_direct' : 'form_field_transitive';

      for (const [fieldKey, schema] of Object.entries(
        form.field_schema.properties,
      )) {
        // Skip non-prefillable button types
        if (schema.avantos_type === 'button') continue;

        const fieldLabel = schema.title ?? fieldKey;
        fields.push({
          id: `${ancestorId}::${fieldKey}`,
          sourceId: ancestorId,
          fieldKey,
          label: `${ancestorNode.data.name} > ${fieldLabel}`,
          sourceType,
        });
      }
    }

    return fields;
  }
}
