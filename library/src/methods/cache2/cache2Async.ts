import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
  StandardProps,
  UnknownDataset,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';
import { _LruCache } from './_LruCache.ts';
import type { CacheConfig2 } from './types.ts';

/**
 * Schema with cache2 async type.
 */
export type SchemaWithCache2Async<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TCacheConfig extends CacheConfig2 | undefined,
> = Omit<TSchema, 'async' | '~standard' | '~run'> & {
  /**
   * Whether it's async.
   */
  readonly async: true;

  /**
   * The cache config.
   */
  readonly cacheConfig: TCacheConfig;

  /**
   * The cache instance.
   */
  readonly cache: _LruCache<
    OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>
  >;

  /**
   * The Standard Schema properties.
   *
   * @internal
   */
  readonly '~standard': StandardProps<
    InferInput<TSchema>,
    InferOutput<TSchema>
  >;

  /**
   * Parses unknown input values.
   *
   * @param dataset The input dataset.
   * @param config The configuration.
   *
   * @returns The output dataset.
   *
   * @internal
   */
  readonly '~run': (
    dataset: UnknownDataset,
    config: Config<BaseIssue<unknown>>
  ) => Promise<OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>>;
};

/**
 * Caches the output of a schema.
 *
 * @param schema The schema to cache.
 *
 * @returns The cached schema.
 */
// @ts-expect-error
export function cache2Async<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): SchemaWithCache2Async<TSchema, undefined>;

/**
 * Caches the output of a schema.
 *
 * @param schema The schema to cache.
 * @param config The cache config.
 *
 * @returns The cached schema.
 */
export function cache2Async<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TCacheConfig extends CacheConfig2 | undefined,
>(
  schema: TSchema,
  config: TCacheConfig
): SchemaWithCache2Async<TSchema, TCacheConfig>;

// @__NO_SIDE_EFFECTS__
export function cache2Async(
  schema:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  config?: CacheConfig2
): SchemaWithCache2Async<
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  CacheConfig2 | undefined
> {
  return {
    ...schema,
    async: true,
    cacheConfig: config,
    cache: new _LruCache(config),
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(dataset, runConfig) {
      let outputDataset = this.cache.get(dataset.value);
      if (!outputDataset) {
        this.cache.set(
          dataset.value,
          (outputDataset = await schema['~run'](dataset, runConfig))
        );
      }
      return outputDataset;
    },
  };
}
