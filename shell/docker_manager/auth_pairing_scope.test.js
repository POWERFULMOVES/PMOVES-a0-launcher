const assert = require('node:assert/strict');
const { test } = require('node:test');

const { normalizeActivationOptions, normalizeCustomImageOptions } = require('./index');

test('custom third-party image may carry lone AUTH_LOGIN (pairing not enforced)', () => {
  const out = normalizeCustomImageOptions({
    image: 'example/vendor-tool:1',
    envText: 'AUTH_LOGIN=vendor-machine-id\nOTHER=1'
  });
  assert.ok(out.env.some((l) => l === 'AUTH_LOGIN=vendor-machine-id'));
});

test('managed agent-zero image still enforces AUTH pairing', () => {
  assert.throws(
    () => normalizeCustomImageOptions({ image: 'agent0ai/agent-zero:v0.1', envText: 'AUTH_LOGIN=op' }),
    (e) => e.code === 'INVALID_ENV_VARS'
  );
});

test('explicit complete pair is preserved over saved credentials', () => {
  const out = normalizeActivationOptions({
    envText: 'AUTH_LOGIN=explicit-user\nAUTH_PASSWORD=explicit-pass',
    credentials: { username: 'dialog-user', password: 'dialog-pass' }
  });
  assert.ok(out.env.includes('AUTH_LOGIN=explicit-user'));
  assert.ok(out.env.includes('AUTH_PASSWORD=explicit-pass'));
  assert.ok(!out.env.includes('AUTH_LOGIN=dialog-user'));
});

test('partial explicit pair is completed from dialog values', () => {
  const out = normalizeActivationOptions({
    envText: 'OTHER=1\nAUTH_LOGIN=explicit-user',
    credentials: { username: 'dialog-user', password: 'dialog-pass' }
  });
  assert.ok(out.env.includes('AUTH_LOGIN=dialog-user'));
  assert.ok(out.env.includes('AUTH_PASSWORD=dialog-pass'));
  assert.ok(!out.env.includes('AUTH_LOGIN=explicit-user'));
});

test('absent pair is injected from dialog values', () => {
  const out = normalizeActivationOptions({
    envText: 'OTHER=1',
    credentials: { username: 'dialog-user', password: 'dialog-pass' }
  });
  assert.ok(out.env.includes('AUTH_LOGIN=dialog-user'));
  assert.ok(out.env.includes('AUTH_PASSWORD=dialog-pass'));
});
