import type { DataSource, DataSourceContext, DataField } from '../../types';

/**
 * Static global data that can prefill any form field, regardless of the DAG.
 *
 * To add new global fields, extend the `GLOBAL_FIELDS` constant below —
 * no other code changes required.
 *
 * To introduce an entirely different category of global data (e.g., "User
 * Profile Properties"), register a separate DataSource implementation with
 * its own `id` and `label` instead of modifying this class.
 */

interface StaticGlobalField {
  fieldKey: string;
  label: string;
}

const ACTION_PROPERTY_FIELDS: StaticGlobalField[] = [
  { fieldKey: 'action_id', label: 'Action ID' },
  { fieldKey: 'action_created_at', label: 'Action Created At' },
  { fieldKey: 'action_status', label: 'Action Status' },
];

const CLIENT_ORG_FIELDS: StaticGlobalField[] = [
  { fieldKey: 'org_id', label: 'Organisation ID' },
  { fieldKey: 'org_name', label: 'Organisation Name' },
  { fieldKey: 'org_email', label: 'Organisation Email' },
];

function buildGlobalFields(
  groupKey: string,
  groupLabel: string,
  fields: StaticGlobalField[],
): DataField[] {
  return fields.map((f) => ({
    id: `${groupKey}::${f.fieldKey}`,
    sourceId: groupKey,
    fieldKey: f.fieldKey,
    label: `${groupLabel} > ${f.label}`,
    sourceType: 'global',
  }));
}

export class ActionPropertiesDataSource implements DataSource {
  readonly id = 'global_action_properties';
  readonly label = 'Action Properties';

  getFields(_context: DataSourceContext): DataField[] {
    return buildGlobalFields('action_properties', 'Action Properties', ACTION_PROPERTY_FIELDS);
  }
}

export class ClientOrgPropertiesDataSource implements DataSource {
  readonly id = 'global_client_org_properties';
  readonly label = 'Client Organisation Properties';

  getFields(_context: DataSourceContext): DataField[] {
    return buildGlobalFields(
      'client_org_properties',
      'Client Organisation Properties',
      CLIENT_ORG_FIELDS,
    );
  }
}
