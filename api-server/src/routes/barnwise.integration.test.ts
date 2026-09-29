import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, before, test } from "node:test";
import { inArray } from "drizzle-orm";
import app from "../app";
import { db, pool, usersTable } from "@workspace/db";

process.env.SESSION_SECRET ??= "barnwise-integration-test-secret";

const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const usernames = [`test_rider_${suffix}`, `test_owner_${suffix}`];
const duplicateIdUsernames = [`test_duplicate_a_${suffix}`, `test_duplicate_b_${suffix}`];
const password = "barnwise-test-password";

let server: Server;
let baseUrl: string;

before(async () => {
  server = createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Testserver kon niet starten.");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await db.delete(usersTable).where(inArray(usersTable.username, [...usernames, ...duplicateIdUsernames]));
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await pool.end();
});

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const raw = await response.text();
  return {
    response,
    body: raw ? (JSON.parse(raw) as Record<string, any>) : null,
  };
}

function jsonBody(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

test("accounts keep BarnWise data isolated and revoked sessions cannot read it", async () => {
  const riderRegistration = await request(
    "/api/auth/register",
    jsonBody({
      username: usernames[0],
      password,
      role: "rider",
      data: {
        horses: [
          {
            id: "test-rider-horse",
            name: "Atlas",
            breed: "",
            birthYear: "",
            sex: "Ruin",
            coat: "",
            notes: "",
          },
        ],
        entries: [
          {
            id: "test-rider-entry",
            horseId: "test-rider-horse",
            kind: "ride",
            title: "Test rit",
            date: "2026-09-27",
            detail: "",
            status: "completed",
          },
        ],
        profile: { name: "Test Ruiter", role: "rider" },
      },
    }),
  );
  assert.equal(riderRegistration.response.status, 201);
  assert.equal(riderRegistration.body?.user.role, "rider");

  const ownerRegistration = await request(
    "/api/auth/register",
    jsonBody({
      username: usernames[1],
      password,
      role: "owner",
    }),
  );
  assert.equal(ownerRegistration.response.status, 201);
  assert.equal(ownerRegistration.body?.user.role, "owner");
  assert.equal(ownerRegistration.body?.user.name, "Paardenliefhebber");

  const riderToken = riderRegistration.body?.token as string;
  const ownerToken = ownerRegistration.body?.token as string;
  const riderData = await request("/api/me/data", {
    headers: { authorization: `Bearer ${riderToken}` },
  });
  const ownerData = await request("/api/me/data", {
    headers: { authorization: `Bearer ${ownerToken}` },
  });

  assert.equal(riderData.response.status, 200);
  assert.equal(riderData.body?.data.horses[0].name, "Atlas");
  assert.equal(riderData.body?.data.entries.length, 1);
  assert.equal(ownerData.response.status, 200);
  assert.equal(ownerData.body?.data.horses.length, 0);
  assert.equal(ownerData.body?.data.entries.length, 0);

  const ownerSave = await request(
    "/api/me/data",
    {
      ...jsonBody({
        horses: [
          {
            id: "test-owner-horse",
            name: "Nova",
            breed: "",
            birthYear: "",
            sex: "Merrie",
            coat: "",
            notes: "",
          },
        ],
        entries: [],
        profile: { name: "Test Paardenhouder", role: "owner" },
      }),
      method: "PUT",
      headers: { authorization: `Bearer ${ownerToken}`, "content-type": "application/json" },
    },
  );
  assert.equal(ownerSave.response.status, 200);
  assert.equal(ownerSave.body?.data.horses[0].name, "Nova");

  const riderStillOwnsData = await request("/api/me/data", {
    headers: { authorization: `Bearer ${riderToken}` },
  });
  assert.equal(riderStillOwnsData.body?.data.horses[0].name, "Atlas");

  const logout = await request("/api/auth/logout", {
    method: "POST",
    headers: { authorization: `Bearer ${riderToken}` },
  });
  assert.equal(logout.response.status, 204);

  const revokedRead = await request("/api/me/data", {
    headers: { authorization: `Bearer ${riderToken}` },
  });
  assert.equal(revokedRead.response.status, 401);
});

test("registration remaps legacy client ids so accounts cannot collide", async () => {
  const data = {
    horses: [
      {
        id: "horse-milo",
        name: "Milo",
        breed: "Belgisch warmbloed",
        birthYear: "2017",
        sex: "Ruin",
        coat: "Vos",
        notes: "",
      },
    ],
    entries: [
      {
        id: "entry-ride",
        horseId: "horse-milo",
        kind: "ride",
        title: "Bosrit",
        date: "2026-09-27",
        detail: "",
        status: "completed",
      },
    ],
    profile: { name: "Paardenliefhebber", role: "owner" },
  };

  const first = await request(
    "/api/auth/register",
    jsonBody({ username: duplicateIdUsernames[0], password, role: "owner", data }),
  );
  const second = await request(
    "/api/auth/register",
    jsonBody({ username: duplicateIdUsernames[1], password, role: "owner", data }),
  );

  assert.equal(first.response.status, 201);
  assert.equal(second.response.status, 201);
  assert.notEqual(first.body?.data.horses[0].id, "horse-milo");
  assert.notEqual(second.body?.data.horses[0].id, "horse-milo");
  assert.notEqual(first.body?.data.horses[0].id, second.body?.data.horses[0].id);
  assert.equal(first.body?.data.entries[0].horseId, first.body?.data.horses[0].id);
  assert.equal(second.body?.data.entries[0].horseId, second.body?.data.horses[0].id);
});