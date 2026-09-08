import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'child_process';

let serverProcess;
const BASE_URL = 'http://localhost:5002';

test.before(async () => {
  return new Promise((resolve, reject) => {
    serverProcess = spawn('node', ['server/server.js'], {
      env: { ...process.env, PORT: '5002' }
    });

    setTimeout(() => {
      resolve();
    }, 1000);
  });
});

test.after(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

test('GET /api/state returns full initial data', async () => {
  const res = await fetch(`${BASE_URL}/api/state`);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.ok(Array.isArray(data.familyMembers));
  assert.ok(Array.isArray(data.recipes));
  assert.ok(data.weeklyPlan);
  assert.ok(Array.isArray(data.suggestions));
});

test('POST & DELETE /api/suggestions handles suggestion lifecycle', async () => {
  // Create suggestion
  const postRes = await fetch(`${BASE_URL}/api/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authorId: 'barna',
      authorName: 'Barna',
      dishTitle: 'Test Pizza'
    })
  });
  assert.equal(postRes.status, 200);
  const postData = await postRes.json();
  assert.equal(postData.success, true);
  const createdId = postData.suggestion.id;

  // Delete suggestion
  const delRes = await fetch(`${BASE_URL}/api/suggestions/${createdId}`, {
    method: 'DELETE'
  });
  assert.equal(delRes.status, 200);
  const delData = await delRes.json();
  assert.equal(delData.success, true);
  assert.ok(!delData.suggestions.some(s => s.id === createdId));
});
