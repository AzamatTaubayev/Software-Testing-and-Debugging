// Used only by `npx playwright merge-reports --config merge.config.ts ./all-blob-reports`:
// turns the blob reports of all shards into one HTML report and one JUnit file.
export default {
  testDir: './tests',
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'reports/junit-merged.xml' }],
  ],
};
