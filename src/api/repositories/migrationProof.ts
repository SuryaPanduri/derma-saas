export const migrationProof = {
  changeRequired: ['/src/api/repositories/serviceProvider.ts'],
  unchanged: {
    uiComponents: ['/src/views', '/src/components'],
    hooks: ['/src/hooks'],
    stores: ['/src/store']
  }
} as const;
