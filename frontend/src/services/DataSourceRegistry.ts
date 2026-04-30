import type { DataSource, DataSourceContext, DataField } from '../types';

/**
 * Central registry for all prefill data sources.
 *
 * ### Extending with a new data source
 * 1. Create a class implementing `DataSource`.
 * 2. Call `dataSourceRegistry.register(new MySource())` before the app mounts
 *    (e.g. in main.tsx or a dedicated setup file).
 * 3. No other code changes are required.
 */
export class DataSourceRegistry {
  private sources: Map<string, DataSource> = new Map();

  /** Add a data source. Throws if a source with the same id is already registered. */
  register(source: DataSource): void {
    if (this.sources.has(source.id)) {
      throw new Error(`DataSource with id "${source.id}" is already registered.`);
    }
    this.sources.set(source.id, source);
  }

  /** Remove a previously registered source (useful for testing). */
  unregister(sourceId: string): void {
    this.sources.delete(sourceId);
  }

  /** Retrieve all registered sources in insertion order. */
  getAll(): DataSource[] {
    return Array.from(this.sources.values());
  }

  /**
   * Collect fields from all registered sources for the given context.
   * Results are grouped by source so callers can render them separately.
   */
  resolveFields(
    context: DataSourceContext,
  ): Array<{ source: DataSource; fields: DataField[] }> {
    return this.getAll()
      .map((source) => ({ source, fields: source.getFields(context) }))
      .filter(({ fields }) => fields.length > 0);
  }
}

/** Singleton registry shared across the application. */
export const dataSourceRegistry = new DataSourceRegistry();
