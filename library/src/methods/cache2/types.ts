/**
 * Cache2 config type.
 */
export interface CacheConfig2 {
  /**
   * The maximum number of items to cache.
   *
   * @default 1000
   */
  maxSize?: number;
  /**
   * The maximum age of a cache entry in milliseconds.
   *
   * @default Infinity
   */
  maxAge?: number;
}
