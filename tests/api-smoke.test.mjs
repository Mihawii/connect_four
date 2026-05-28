import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomInt } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, test } from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.TEST_PORT ?? String(randomInt(4100, 4900));
const baseUrl = `http://127.0.0.1:${port}`;
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

let server;
let serverLog = "";

function roomCode() {
  return Array.from({ length: 5 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

async function waitForServer() {
  for (let i = 0; i < 120; i += 1) {
    try {
      const res = await fetch(`${baseUrl}/api/coach`, { cache: "no-store" });
      if (res.ok) return;
    } catch {
      // Keep waiting while Next starts.
    }
    await delay(500);
  }

  throw new Error(`Next dev server did not become ready.\n${serverLog.slice(-4000)}`);
}

before(async () => {
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", port],
    {
      cwd: root,
      env: {
        ...process.env,
        OPENAI_API_KEY: "",
        OPENAI_COACH_MODEL: "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (chunk) => {
    serverLog += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverLog += chunk.toString();
  });

  await waitForServer();
});

after(() => {
  if (server && !server.killed) server.kill("SIGTERM");
});

test("database health returns HTTP 200", async () => {
  const res = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.checks.api.status, 200);
  assert.equal(data.checks.database.status, 200);
});

test("room invite returns a valid QR value and links two friends", async () => {
  const code = roomCode();
  const hostId = `host-${randomInt(100000)}`;
  const guestId = `guest-${randomInt(100000)}`;

  const hostRes = await fetch(`${baseUrl}/api/room/${code}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: baseUrl },
    body: JSON.stringify({ action: "join", clientId: hostId, mode: "classic" }),
  });
  assert.equal(hostRes.status, 200);

  const hostData = await hostRes.json();
  assert.equal(hostData.success, true);
  assert.equal(hostData.room.mode, "classic");
  assert.equal(hostData.room.shareUrl, hostData.room.qrValue);

  const qrUrl = new URL(hostData.room.qrValue);
  assert.equal(qrUrl.origin, baseUrl);
  assert.equal(qrUrl.pathname, `/room/${code}`);
  assert.equal(qrUrl.searchParams.get("mode"), "classic");

  const guestRes = await fetch(`${baseUrl}/api/room/${code}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: baseUrl },
    body: JSON.stringify({ action: "join", clientId: guestId, mode: "classic" }),
  });
  assert.equal(guestRes.status, 200);

  const getRes = await fetch(`${baseUrl}/api/room/${code}`, {
    cache: "no-store",
    headers: { origin: baseUrl },
  });
  assert.equal(getRes.status, 200);

  const room = await getRes.json();
  assert.deepEqual(room.peers, [hostId, guestId]);
  assert.equal(room.qrValue, `${baseUrl}/room/${code}?mode=classic`);
});

test("leaderboard endpoint returns ranked rows for every format", async () => {
  for (const format of ["blitzInferno", "inferno", "classic"]) {
    const res = await fetch(`${baseUrl}/api/leaderboard?format=${format}`, { cache: "no-store" });
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.ok, true);
    assert.equal(data.format, format);
    assert.ok(data.rows.length >= 10);
    assert.equal(data.rows[0].rank, 1);

    for (let i = 1; i < data.rows.length; i += 1) {
      assert.equal(data.rows[i].rank, i + 1);
      assert.ok(data.rows[i - 1].rating >= data.rows[i].rating);
    }
  }
});

test("coach health and suggestion analysis return HTTP 200", async () => {
  const healthRes = await fetch(`${baseUrl}/api/coach`, { cache: "no-store" });
  assert.equal(healthRes.status, 200);
  const health = await healthRes.json();
  assert.equal(health.ok, true);
  assert.equal(health.analysisEngine, "ready");

  const coachRes = await fetch(`${baseUrl}/api/coach`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      mode: "classic",
      cols: [3, 2, 3, 2, 3, 2, 3],
      forPlayer: 1,
      persona: "analyst",
    }),
  });
  assert.equal(coachRes.status, 200);

  const data = await coachRes.json();
  assert.match(data.source, /^heuristic/);
  assert.equal(typeof data.review.summary, "string");
  assert.ok(Array.isArray(data.review.moves));
  assert.equal(typeof data.stats.accuracyP1, "number");
});
