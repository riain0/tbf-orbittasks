import { SearchService } from '../../src/services/search.service';

// Search workloads. Every query is a real round-trip to the search provider
// (the mock server). The dashboard and saved-search features fire a lot of
// them, so running a few hundred queries in a row is a meaningful chunk of the
// slow `test:api` stage.
describe('search reindex + queries (integration — hits mock server)', () => {
  it('answers 160 task search queries', async () => {
    const service = new SearchService();
    for (let i = 0; i < 160; i++) {
      const ids = await service.searchTasks(`launch ${i}`);
      expect(Array.isArray(ids)).toBe(true);
    }
  }, 60_000);

  it('answers 150 dashboard search queries', async () => {
    const service = new SearchService();
    for (let i = 0; i < 150; i++) {
      const ids = await service.searchTasks(`sprint ${i}`);
      expect(Array.isArray(ids)).toBe(true);
    }
  }, 60_000);

  it('answers 150 saved-search queries', async () => {
    const service = new SearchService();
    for (let i = 0; i < 150; i++) {
      const ids = await service.searchTasks(`backlog ${i}`);
      expect(Array.isArray(ids)).toBe(true);
    }
  }, 60_000);
});
