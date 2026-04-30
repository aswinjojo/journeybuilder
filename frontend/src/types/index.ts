// ── Raw API shapes ────────────────────────────────────────────────────────────

export interface FieldSchema {
  type: string;
  title?: string;
  avantos_type?: string;
  format?: string;
  items?: { type: string; enum?: string[] };
  enum?: unknown[] | null;
  uniqueItems?: boolean;
}

export interface FormSchema {
  id: string;
  name: string;
  description: string;
  is_reusable: boolean;
  field_schema: {
    type: 'object';
    properties: Record<string, FieldSchema>;
    required?: string[];
  };
  ui_schema: {
    type: string;
    elements: Array<{ type: string; scope: string; label: string }>;
  };
}

export interface NodeData {
  id: string;
  component_key: string;
  component_type: string;
  component_id: string;
  name: string;
  prerequisites: string[];
  permitted_roles: string[];
  input_mapping: InputMapping;
  sla_duration: { number: number; unit: string };
  approval_required: boolean;
  approval_roles: string[];
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface BlueprintGraph {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  forms: FormSchema[];
}

// ── Prefill mapping ──────────────────────────────────────────────────────────

/**
 * A single prefill reference stored per field on a form node.
 * sourceType drives how the reference is interpreted at runtime.
 */
export interface PrefillValue {
  /** discriminator – "form_field" | "global" | any future type */
  sourceType: string;
  /** node ID for form_field; arbitrary key for global sources */
  sourceId: string;
  /** the field key on the source object */
  fieldKey: string;
  /** human-readable path shown in the UI, e.g. "Form A > Email" */
  label: string;
}

/** A node's full prefill map: target field name → PrefillValue */
export type InputMapping = Record<string, PrefillValue>;

// ── Data-source abstraction ───────────────────────────────────────────────────

/** A single selectable field exposed by a data source */
export interface DataField {
  /** Unique identifier combining source and field */
  id: string;
  /** The source identifier (node ID or global key) */
  sourceId: string;
  /** The field key on that source */
  fieldKey: string;
  /** Human-readable path, e.g. "Form A > Email" */
  label: string;
  /** Which source type produced this field */
  sourceType: string;
}

/** Contextual information passed to every data source when resolving fields */
export interface DataSourceContext {
  /** The full blueprint graph */
  graph: BlueprintGraph;
  /** The node ID of the form being edited */
  currentNodeId: string;
}

/**
 * Interface every data source must implement.
 * Register new sources via DataSourceRegistry to extend prefill without
 * touching existing code.
 */
export interface DataSource {
  /** Stable identifier used in PrefillValue.sourceType */
  readonly id: string;
  /** Display label shown as a group header in the modal */
  readonly label: string;
  /**
   * Returns the fields this source can offer for the given context.
   * Return [] when the source is not applicable to the current node.
   */
  getFields(context: DataSourceContext): DataField[];
}
