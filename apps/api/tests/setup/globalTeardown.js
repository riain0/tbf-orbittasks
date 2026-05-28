/**
 * Jest globalTeardown — stops the mock HTTP server.
 */
module.exports = async () => {
  const server = global.__MOCK_SERVER__;
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    global.__MOCK_SERVER__ = undefined;
  }
};
