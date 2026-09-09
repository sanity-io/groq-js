import type {KnipConfig} from 'knip'

const config: KnipConfig = {
  // Public source entries are discovered from tsdown.config.mts.
  entry: ['test/**/*.test.ts', 'test/generate.cjs', 'bundle-stats.config.ts'],
  // Exclude build output and generated TAP snapshots from the source inventory.
  project: ['src/**/*.{js,ts}!', 'test/**/*.{cjs,js,ts}', '*.{cjs,mts,ts}'],
  ignoreDependencies: [
    // Loaded through "extends" in .releaserc.json.
    '@sanity/semantic-release-preset',
    // Invoked with npm exec in .github/workflows/pkg-pr-new.yml.
    'pkg-pr-new',
  ],
}

export default config
