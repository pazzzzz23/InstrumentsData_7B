import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type InstrumentInput = {
  uploaderName?: unknown;
  instrumentName?: unknown;
  partNumber?: unknown;
  serialNumber?: unknown;
  photoUrl?: unknown;
};

function getSql() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) return null;
  return neon(connectionString);
}

async function ensureTable(sql: NonNullable<ReturnType<typeof getSql>>) {
  await sql`CREATE TABLE IF NOT EXISTS instruments (
    id BIGSERIAL PRIMARY KEY,
    uploader_name TEXT NOT NULL,
    instrument_name TEXT NOT NULL,
    part_number TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export async function GET() {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: "Falta configurar la conexión a PostgreSQL." }, { status: 503 });
  }

  try {
    await ensureTable(sql);
    const instruments = await sql`
      SELECT id, uploader_name AS "uploaderName", instrument_name AS "instrumentName",
        part_number AS "partNumber", serial_number AS "serialNumber",
        photo_url AS "photoUrl", created_at AS "createdAt"
      FROM instruments ORDER BY created_at DESC LIMIT 200
    `;
    return NextResponse.json({ instruments });
  } catch {
    return NextResponse.json({ error: "No se pudieron consultar los instrumentos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: "Falta configurar la conexión a PostgreSQL." }, { status: 503 });
  }

  let input: InstrumentInput;
  try {
    input = (await request.json()) as InstrumentInput;
  } catch {
    return NextResponse.json({ error: "La solicitud no contiene datos válidos." }, { status: 400 });
  }

  const fields = [input.uploaderName, input.instrumentName, input.partNumber, input.serialNumber, input.photoUrl];
  if (fields.some((value) => typeof value !== "string" || !value.trim())) {
    return NextResponse.json({ error: "Completa todos los campos y agrega una foto." }, { status: 400 });
  }

  const [uploaderName, instrumentName, partNumber, serialNumber, photoUrl] = fields as string[];
  if (!/^https:\/\//.test(photoUrl)) {
    return NextResponse.json({ error: "La dirección de la foto no es válida." }, { status: 400 });
  }

  try {
    await ensureTable(sql);
    const [instrument] = await sql`
      INSERT INTO instruments (uploader_name, instrument_name, part_number, serial_number, photo_url)
      VALUES (${uploaderName.trim()}, ${instrumentName.trim()}, ${partNumber.trim()}, ${serialNumber.trim()}, ${photoUrl})
      RETURNING id, uploader_name AS "uploaderName", instrument_name AS "instrumentName",
        part_number AS "partNumber", serial_number AS "serialNumber",
        photo_url AS "photoUrl", created_at AS "createdAt"
    `;
    return NextResponse.json({ instrument }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el instrumento." }, { status: 500 });
  }
}