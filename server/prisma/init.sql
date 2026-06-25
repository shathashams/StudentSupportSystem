-- Schema for the embedded PGlite database, mirroring prisma/schema.prisma.
-- Applied automatically on server startup (see src/config/db.js) because Prisma 7
-- cannot run `prisma db push` against an in-process PGlite database.
--
-- To regenerate the base DDL from the Prisma schema (offline, no DB needed):
--   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
-- Statements below are written to be idempotent so they are safe to re-run.

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('STUDENT', 'SUPPORT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users" ("email");

CREATE TABLE IF NOT EXISTS "tickets" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
  "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "student_id" INTEGER NOT NULL,
  CONSTRAINT "tickets_student_id_fkey" FOREIGN KEY ("student_id")
    REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "comments" (
  "id" SERIAL PRIMARY KEY,
  "message" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "ticket_id" INTEGER NOT NULL,
  "author_id" INTEGER NOT NULL,
  CONSTRAINT "comments_ticket_id_fkey" FOREIGN KEY ("ticket_id")
    REFERENCES "tickets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id")
    REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
