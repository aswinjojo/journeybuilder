import { dataSourceRegistry } from './DataSourceRegistry';
import {
  ActionPropertiesDataSource,
  ClientOrgPropertiesDataSource,
} from './dataSources/GlobalDataSource';

/**
 * Registers all built-in data sources.
 * Call once at application startup (main.tsx).
 *
 * Form-field sources (upstream form nodes) are NOT registered here because
 * they are dynamic — one group per ancestor form is produced at runtime by
 * `usePrefillSources`, which uses `FormFieldsDataSource` internally.
 *
 * To add a new global/static data source:
 *   1. Implement the `DataSource` interface.
 *   2. `import` it here and call `dataSourceRegistry.register(new MySource())`.
 */
export function registerDataSources(): void {
  dataSourceRegistry.register(new ActionPropertiesDataSource());
  dataSourceRegistry.register(new ClientOrgPropertiesDataSource());
}
