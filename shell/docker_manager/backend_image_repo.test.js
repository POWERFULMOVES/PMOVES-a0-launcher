const assert = require('node:assert/strict');
const { test } = require('node:test');

const dockerManager = require('./index');
const { getBackendImageRepo } = dockerManager;
const ENV_VAR = 'A0_BACKEND_IMAGE_REPO';

function withEnv(value, fn) {
  const had = ENV_VAR in process.env;
  const prev = process.env[ENV_VAR];
  if (value === undefined) delete process.env[ENV_VAR];
  else process.env[ENV_VAR] = value;
  try { fn(); } finally {
    if (had) process.env[ENV_VAR] = prev;
    else delete process.env[ENV_VAR];
  }
}

test('registry-qualified override is accepted', () => {
  withEnv('ghcr.io/powerfulmoves/pmoves-agent-zero', () => {
    assert.equal(getBackendImageRepo(), 'ghcr.io/powerfulmoves/pmoves-agent-zero');
  });
});

test('localhost with port override is accepted', () => {
  withEnv('localhost:5000/pmoves/agent-zero', () => {
    assert.equal(getBackendImageRepo(), 'localhost:5000/pmoves/agent-zero');
  });
});

test('plain owner/name override still works', () => {
  withEnv('pmoves/agent-zero', () => {
    assert.equal(getBackendImageRepo(), 'pmoves/agent-zero');
  });
});

test('bare 3-segment path is rejected', () => {
  withEnv('myagent/agent-zero/sub', () => {
    assert.equal(getBackendImageRepo(), 'agent0ai/agent-zero');
  });
});

test('garbage is rejected', () => {
  withEnv('not a repo', () => {
    assert.equal(getBackendImageRepo(), 'agent0ai/agent-zero');
  });
});

test('unset env keeps upstream default', () => {
  withEnv(undefined, () => {
    assert.equal(getBackendImageRepo(), 'agent0ai/agent-zero');
  });
});
