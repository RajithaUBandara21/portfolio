// Test-only stub for the `server-only` package. The real package throws when imported outside
// Next.js's server bundler, which is exactly what it's for in production — but that also means
// it throws under plain Vitest. This no-op stands in for it (see vitest.config.mts's alias) so
// business logic that legitimately guards itself with `import "server-only"` stays testable.
export {};
