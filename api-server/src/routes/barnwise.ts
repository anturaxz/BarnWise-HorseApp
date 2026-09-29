import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import {
  db,
  entriesTable,
  horsesTable,
  usersTable,
} from "@workspace/db";
import {
  LoginAccountBody,
  RegisterAccountBody,
  SaveMyBarnWiseDataBody,
} from "@workspace/api-zod";
import {
  createSession,
  getBearerToken,
  hashPassword,
  requireAuth,
  revokeSession,
  verifyPassword,
} from "../lib/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

type BarnWisePayload = {
  horses: Array<{
    id: string;
    name: string;
    breed: string;
    birthYear: string;
    sex: "Merrie" | "Ruin" | "Hengst";
    coat: string;
    notes: string;
  }>;
  entries: Array<{
    id: string;
    horseId: string;
    kind: "ride" | "training" | "care" | "health" | "appointment";
    title: string;
    date: string;
    detail: string;
    status: "planned" | "completed";
  }>;
  profile: { name: string; role: "owner" | "rider" };
};

function serverErrorMessage(error: unknown) {
  logger.error({ err: error }, "BarnWise request failed");
  return "Er ging iets mis. Probeer opnieuw.";
}

function emptyData(): BarnWisePayload {
  return { horses: [], entries: [], profile: { name: "Paardenliefhebber", role: "owner" as const } };
}

function makeRegistrationData(data: BarnWisePayload): BarnWisePayload {
  const horseIds = new Map<string, string>();
  const horses = data.horses.map((horse) => {
    const id = randomUUID();
    horseIds.set(horse.id, id);
    return { ...horse, id };
  });

  return {
    ...data,
    horses,
    entries: data.entries.map((entry) => ({
      ...entry,
      id: randomUUID(),
      horseId: horseIds.get(entry.horseId) ?? entry.horseId,
    })),
  };
}

function toUser(user: { id: string; username: string; displayName: string; role: string }) {
  return {
    id: user.id,
    username: user.username,
    name: user.displayName,
    role: user.role === "rider" ? ("rider" as const) : ("owner" as const),
  };
}

async function loadEnvelope(userId: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) throw new Error("Account niet gevonden.");

  const horses = await db
    .select({
      id: horsesTable.id,
      name: horsesTable.name,
      breed: horsesTable.breed,
      birthYear: horsesTable.birthYear,
      sex: horsesTable.sex,
      coat: horsesTable.coat,
      notes: horsesTable.notes,
    })
    .from(horsesTable)
    .where(eq(horsesTable.userId, userId))
    .orderBy(asc(horsesTable.createdAt));

  const entries = await db
    .select({
      id: entriesTable.id,
      horseId: entriesTable.horseId,
      kind: entriesTable.kind,
      title: entriesTable.title,
      date: entriesTable.date,
      detail: entriesTable.detail,
      status: entriesTable.status,
    })
    .from(entriesTable)
    .where(eq(entriesTable.userId, userId))
    .orderBy(asc(entriesTable.createdAt));

  return {
    user: toUser(user),
    data: {
      horses,
      entries,
      profile: {
        name: user.displayName,
        role: user.role === "rider" ? ("rider" as const) : ("owner" as const),
      },
    },
  };
}

type DataExecutor = Pick<typeof db, "update" | "delete" | "insert">;

async function replaceDataWithExecutor(
  executor: DataExecutor,
  userId: string,
  data: BarnWisePayload,
) {
  await executor
    .update(usersTable)
    .set({ displayName: data.profile.name.trim(), role: data.profile.role })
    .where(eq(usersTable.id, userId));
  await executor.delete(entriesTable).where(eq(entriesTable.userId, userId));
  await executor.delete(horsesTable).where(eq(horsesTable.userId, userId));

  if (data.horses.length > 0) {
    await executor.insert(horsesTable).values(
      data.horses.map((horse) => ({
        ...horse,
        userId,
      })),
    );
  }
  const horseIds = new Set(data.horses.map((horse) => horse.id));
  const entries = data.entries.filter((entry) => horseIds.has(entry.horseId));
  if (entries.length > 0) {
    await executor.insert(entriesTable).values(entries.map((entry) => ({ ...entry, userId })));
  }
}

async function replaceData(userId: string, data: BarnWisePayload) {
  await db.transaction(async (tx) => {
    await replaceDataWithExecutor(tx, userId, data);
  });
}

router.post("/auth/register", async (request, response) => {
  const parsed = RegisterAccountBody.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Vul gebruikersnaam, wachtwoord, naam en rol correct in." });
    return;
  }

  const username = parsed.data.username.trim().toLowerCase();
  if (!/^[a-z0-9._-]+$/.test(username)) {
    response.status(400).json({ message: "Een gebruikersnaam mag alleen letters, cijfers, punten, streepjes en underscores bevatten." });
    return;
  }

  try {
    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existing) {
      response.status(409).json({ message: "Deze gebruikersnaam is al in gebruik." });
      return;
    }

    const userId = randomUUID();
    const existingData = parsed.data.data;
    const profileName = existingData?.profile.name.trim() || "Paardenliefhebber";
    const data = makeRegistrationData(existingData
      ? { ...existingData, profile: { ...existingData.profile, name: profileName, role: parsed.data.role } }
      : { ...emptyData(), profile: { name: profileName, role: parsed.data.role } });

    const passwordHash = await hashPassword(parsed.data.password);
    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        id: userId,
        username,
        passwordHash,
        displayName: data.profile.name,
        role: data.profile.role,
      });
      await replaceDataWithExecutor(tx, userId, data);
    });

    const token = await createSession(userId);
    const envelope = await loadEnvelope(userId);
    response.status(201).json({ token, ...envelope });
  } catch (error) {
    response.status(500).json({ message: serverErrorMessage(error) });
  }
});

router.post("/auth/login", async (request, response) => {
  const parsed = LoginAccountBody.safeParse(request.body);
  if (!parsed.success) {
    response.status(401).json({ message: "Ongeldige gebruikersnaam of wachtwoord." });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, parsed.data.username.trim().toLowerCase()))
      .limit(1);
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      response.status(401).json({ message: "Ongeldige gebruikersnaam of wachtwoord." });
      return;
    }

    const token = await createSession(user.id);
    const envelope = await loadEnvelope(user.id);
    response.json({ token, ...envelope });
  } catch (error) {
    response.status(500).json({ message: serverErrorMessage(error) });
  }
});

router.post("/auth/logout", requireAuth, async (request, response) => {
  try {
    await revokeSession(getBearerToken(request));
    response.status(204).send();
  } catch (error) {
    response.status(500).json({ message: serverErrorMessage(error) });
  }
});

router.get("/me/data", requireAuth, async (request, response) => {
  try {
    response.json(await loadEnvelope(request.userId!));
  } catch (error) {
    response.status(500).json({ message: serverErrorMessage(error) });
  }
});

router.put("/me/data", requireAuth, async (request, response) => {
  const parsed = SaveMyBarnWiseDataBody.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "De profielgegevens hebben een ongeldig formaat." });
    return;
  }

  try {
    await replaceData(request.userId!, parsed.data);
    response.json(await loadEnvelope(request.userId!));
  } catch (error) {
    response.status(500).json({ message: serverErrorMessage(error) });
  }
});

export default router;