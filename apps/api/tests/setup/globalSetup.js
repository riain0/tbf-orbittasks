/**
 * Jest globalSetup — starts the mock HTTP server once per test run.
 *
 * Students in Session 5 will discover that the integration tests are slow
 * because they each make real HTTP calls to this server. The "fix" they'll
 * apply is to use Jest's manual mocks for the SDK modules so unit tests
 * don't hit a real server at all — only true integration tests do.
 */

const { start } = require('../../../../scripts/mock-server');

module.exports = async () => {
  // Avoid double-start if a teammate forgot to call teardown
  if (global.__MOCK_SERVER__) return;

  const server = await start();
  global.__MOCK_SERVER__ = server;
  process.env.MOCK_SERVER_URL = `http://localhost:${server.address().port}`;
};
