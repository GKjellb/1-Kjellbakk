import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'child_process';

let serverProcess;
const BASE_URL = 'http://localhost:5002';

test.before(async () => {
  return new Promise((resolve) => {
    serverProcess = spawn('node', ['server/server.js'], {
      env: { ...process.env, PORT: '5002' }
    });

    // Poll until server is ready
    const checkServer = async () => {
      for (let i = 0; i < 20; i++) {
        try {
          const res = await fetch(`${BASE_URL}/api/state`);
          if (res.ok) return resolve();
        } catch (e) {
          await new Promise((r) => setTimeout(r, 150));
        }
      }
      resolve();
    };
    checkServer();
  });
});

test.after(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

test('GET /api/state returns full initial data with week parameter support', async () => {
  const res = await fetch(`${BASE_URL}/api/state?week=2026-W42`);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.ok(Array.isArray(data.familyMembers));
  assert.ok(Array.isArray(data.recipes));
  assert.ok(data.weeklyPlan);
  assert.equal(data.currentWeekKey, '2026-W42');
  assert.ok(Array.isArray(data.suggestions));
});

test('POST /api/generate-recipe generates a full recipe with automatic image mapping', async () => {
  const res = await fetch(`${BASE_URL}/api/generate-recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ingredientsPrompt: 'Laks, agurk, rømme'
    })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.recipe.title.includes('Laks'));
  assert.equal(data.recipe.category, 'Fisk');
  assert.ok(data.recipe.image);
  assert.ok(data.recipe.ingredients.length > 0);
  assert.ok(data.recipe.instructions.length > 0);
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
