--
-- PostgreSQL database dump
--

\restrict UCj0fi3UUBYok6BgulCiVuQgfZJFNSdZLbkxDDKugNmATSmerDAKJfA0FRaBIQ0

-- Dumped from database version 16.12 (Debian 16.12-1.pgdg13+1)
-- Dumped by pg_dump version 16.12 (Debian 16.12-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."WriteOff" DROP CONSTRAINT IF EXISTS "WriteOff_writtenOffByUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."WriteOff" DROP CONSTRAINT IF EXISTS "WriteOff_propId_fkey";
ALTER TABLE IF EXISTS ONLY public."WriteOff" DROP CONSTRAINT IF EXISTS "WriteOff_orgId_fkey";
ALTER TABLE IF EXISTS ONLY public."Warehouse" DROP CONSTRAINT IF EXISTS "Warehouse_orgId_fkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_orgId_fkey";
ALTER TABLE IF EXISTS ONLY public."Prop" DROP CONSTRAINT IF EXISTS "Prop_orgId_fkey";
ALTER TABLE IF EXISTS ONLY public."Prop" DROP CONSTRAINT IF EXISTS "Prop_currentContainerId_fkey";
ALTER TABLE IF EXISTS ONLY public."Prop" DROP CONSTRAINT IF EXISTS "Prop_createdByUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Media" DROP CONSTRAINT IF EXISTS "Media_orgId_fkey";
ALTER TABLE IF EXISTS ONLY public."Media" DROP CONSTRAINT IF EXISTS "Media_createdByUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Issue" DROP CONSTRAINT IF EXISTS "Issue_returnedByUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Issue" DROP CONSTRAINT IF EXISTS "Issue_propId_fkey";
ALTER TABLE IF EXISTS ONLY public."Issue" DROP CONSTRAINT IF EXISTS "Issue_orgId_fkey";
ALTER TABLE IF EXISTS ONLY public."Issue" DROP CONSTRAINT IF EXISTS "Issue_issuedByUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Issue" DROP CONSTRAINT IF EXISTS "Issue_actorUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Container" DROP CONSTRAINT IF EXISTS "Container_warehouseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Container" DROP CONSTRAINT IF EXISTS "Container_parentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Container" DROP CONSTRAINT IF EXISTS "Container_orgId_fkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_orgId_fkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_actorUserId_fkey";
DROP INDEX IF EXISTS public."WriteOff_propId_key";
DROP INDEX IF EXISTS public."WriteOff_orgId_idx";
DROP INDEX IF EXISTS public."Warehouse_orgId_idx";
DROP INDEX IF EXISTS public."User_orgId_role_idx";
DROP INDEX IF EXISTS public."User_orgId_email_key";
DROP INDEX IF EXISTS public."Prop_orgId_status_idx";
DROP INDEX IF EXISTS public."Prop_currentContainerId_idx";
DROP INDEX IF EXISTS public."Media_orgId_entityType_entityId_idx";
DROP INDEX IF EXISTS public."Issue_propId_status_idx";
DROP INDEX IF EXISTS public."Issue_orgId_status_idx";
DROP INDEX IF EXISTS public."Issue_actorUserId_status_idx";
DROP INDEX IF EXISTS public."Container_parentId_idx";
DROP INDEX IF EXISTS public."Container_orgId_warehouseId_idx";
DROP INDEX IF EXISTS public."Container_orgId_qrCode_key";
DROP INDEX IF EXISTS public."AuditLog_orgId_entityType_entityId_idx";
DROP INDEX IF EXISTS public."AuditLog_orgId_createdAt_idx";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."WriteOff" DROP CONSTRAINT IF EXISTS "WriteOff_pkey";
ALTER TABLE IF EXISTS ONLY public."Warehouse" DROP CONSTRAINT IF EXISTS "Warehouse_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."Prop" DROP CONSTRAINT IF EXISTS "Prop_pkey";
ALTER TABLE IF EXISTS ONLY public."Org" DROP CONSTRAINT IF EXISTS "Org_pkey";
ALTER TABLE IF EXISTS ONLY public."Media" DROP CONSTRAINT IF EXISTS "Media_pkey";
ALTER TABLE IF EXISTS ONLY public."Issue" DROP CONSTRAINT IF EXISTS "Issue_pkey";
ALTER TABLE IF EXISTS ONLY public."Container" DROP CONSTRAINT IF EXISTS "Container_pkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_pkey";
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."WriteOff";
DROP TABLE IF EXISTS public."Warehouse";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Prop";
DROP TABLE IF EXISTS public."Org";
DROP TABLE IF EXISTS public."Media";
DROP TABLE IF EXISTS public."Issue";
DROP TABLE IF EXISTS public."Container";
DROP TABLE IF EXISTS public."AuditLog";
DROP TYPE IF EXISTS public."UserRole";
DROP TYPE IF EXISTS public."PropStatus";
DROP TYPE IF EXISTS public."MediaEntityType";
DROP TYPE IF EXISTS public."IssueStatus";
--
-- Name: IssueStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."IssueStatus" AS ENUM (
    'OPEN',
    'CLOSED'
);


--
-- Name: MediaEntityType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MediaEntityType" AS ENUM (
    'CONTAINER',
    'PROP',
    'ISSUE',
    'WRITEOFF'
);


--
-- Name: PropStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PropStatus" AS ENUM (
    'IN_STORAGE',
    'ISSUED',
    'WRITTEN_OFF'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'COSTUMER',
    'ACTOR'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    "actorUserId" text NOT NULL,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    meta jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Container; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Container" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    "warehouseId" text NOT NULL,
    "parentId" text,
    name text NOT NULL,
    "qrCode" text NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Issue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Issue" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    "propId" text NOT NULL,
    "actorUserId" text NOT NULL,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "issuedByUserId" text NOT NULL,
    "returnPlannedAt" timestamp(3) without time zone,
    "returnedAt" timestamp(3) without time zone,
    "returnedByUserId" text,
    status public."IssueStatus" DEFAULT 'OPEN'::public."IssueStatus" NOT NULL,
    comment text
);


--
-- Name: Media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Media" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    "entityType" public."MediaEntityType" NOT NULL,
    "entityId" text NOT NULL,
    url text NOT NULL,
    caption text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdByUserId" text
);


--
-- Name: Org; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Org" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Prop; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Prop" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    name text NOT NULL,
    description text,
    "inventoryNumber" text,
    status public."PropStatus" DEFAULT 'IN_STORAGE'::public."PropStatus" NOT NULL,
    "currentContainerId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdByUserId" text NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    role public."UserRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Warehouse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Warehouse" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    name text NOT NULL,
    address text,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: WriteOff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WriteOff" (
    id text NOT NULL,
    "orgId" text NOT NULL,
    "propId" text NOT NULL,
    "writtenOffAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "writtenOffByUserId" text NOT NULL,
    reason text,
    comment text
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "orgId", "actorUserId", action, "entityType", "entityId", meta, "createdAt") FROM stdin;
cmlm70mbw0001lguya34kuniq	org_demo	cmlm0a62z0000fcuyy2kfptq9	ISSUED	PROP	cmlm0a63l0005fcuygm75ptuk	{"issueId": "cmlm70mbj0000lguyay4xpof1", "actorUserId": "cmlm0a63c0002fcuysvfq92i6"}	2026-02-14 10:48:01.292
cmlma2p160003dkuyut6maujh	org_demo	cmlm0a62z0000fcuyy2kfptq9	ISSUED	PROP	cmlm9m3g30001dkuyoft7iya4	{"issueId": "cmlma2p0z0002dkuys4r3wwe6", "actorUserId": "cmlm9907e0000dkuyaznp7j6z"}	2026-02-14 12:13:36.954
cmlma60cu0005dkuytvm6cepl	org_demo	cmlm0a62z0000fcuyy2kfptq9	ISSUED	PROP	cmlm9m3g30001dkuyoft7iya4	{"issueId": "cmlma60cr0004dkuyzcoogzsk", "actorUserId": "cmlm0a63c0002fcuysvfq92i6"}	2026-02-14 12:16:11.598
cmlmac4s30007dkuy7qq7uv61	org_demo	cmlm0a62z0000fcuyy2kfptq9	ISSUED	PROP	cmlm9m3g30001dkuyoft7iya4	{"issueId": "cmlmac4s00006dkuyocsrg9ie", "actorUserId": "cmlm9907e0000dkuyaznp7j6z"}	2026-02-14 12:20:57.267
\.


--
-- Data for Name: Container; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Container" (id, "orgId", "warehouseId", "parentId", name, "qrCode", comment, "createdAt") FROM stdin;
cmlm0a63i0004fcuyxild539m	org_demo	cmlm0a63f0003fcuy2e0l93tn	\N	Стеллаж A / Полка 1	A-01	У двери	2026-02-14 07:39:29.502
cmlm8k9on0004lguysqjwqf67	org_demo	cmlm87r0s0003lguy3jbxd7cy	\N	Большая деревянная коробка	C-0Q1CPLXJ	Моя любимая	2026-02-14 11:31:17.639
cmlm8lqc80005lguyku6q7jtk	org_demo	cmlm87r0s0003lguy3jbxd7cy	\N	Большая деревянная коробка	C-BMY2M5BH	Моя любимая	2026-02-14 11:32:25.88
\.


--
-- Data for Name: Issue; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Issue" (id, "orgId", "propId", "actorUserId", "issuedAt", "issuedByUserId", "returnPlannedAt", "returnedAt", "returnedByUserId", status, comment) FROM stdin;
cmlm70mbj0000lguyay4xpof1	org_demo	cmlm0a63l0005fcuygm75ptuk	cmlm0a63c0002fcuysvfq92i6	2026-02-14 10:48:01.279	cmlm0a62z0000fcuyy2kfptq9	\N	2026-02-14 11:07:12.491	\N	CLOSED	12345
cmlma2p0z0002dkuys4r3wwe6	org_demo	cmlm9m3g30001dkuyoft7iya4	cmlm9907e0000dkuyaznp7j6z	2026-02-14 12:13:36.947	cmlm0a62z0000fcuyy2kfptq9	\N	2026-02-14 12:15:58.294	\N	CLOSED	\N
cmlma60cr0004dkuyzcoogzsk	org_demo	cmlm9m3g30001dkuyoft7iya4	cmlm0a63c0002fcuysvfq92i6	2026-02-14 12:16:11.595	cmlm0a62z0000fcuyy2kfptq9	\N	2026-02-14 12:20:50.846	\N	CLOSED	\N
cmlmac4s00006dkuyocsrg9ie	org_demo	cmlm9m3g30001dkuyoft7iya4	cmlm9907e0000dkuyaznp7j6z	2026-02-14 12:20:57.264	cmlm0a62z0000fcuyy2kfptq9	\N	\N	\N	OPEN	\N
\.


--
-- Data for Name: Media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Media" (id, "orgId", "entityType", "entityId", url, caption, "createdAt", "createdByUserId") FROM stdin;
\.


--
-- Data for Name: Org; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Org" (id, name, "createdAt") FROM stdin;
org_demo	Galёrka Hub (demo)	2026-02-14 07:39:29.448
\.


--
-- Data for Name: Prop; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Prop" (id, "orgId", name, description, "inventoryNumber", status, "currentContainerId", "createdAt", "createdByUserId") FROM stdin;
cmlm0a63l0005fcuygm75ptuk	org_demo	Шпага реквизитная	Лёгкая (demo)	\N	IN_STORAGE	cmlm0a63i0004fcuyxild539m	2026-02-14 07:39:29.505	cmlm0a62z0000fcuyy2kfptq9
cmlm9m3g30001dkuyoft7iya4	org_demo	Палка ковырялка	Палка замечательная	000001	ISSUED	\N	2026-02-14 12:00:42.483	cmlm0a62z0000fcuyy2kfptq9
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, "orgId", email, name, role, "createdAt") FROM stdin;
cmlm0a62z0000fcuyy2kfptq9	org_demo	admin@demo.local	Режиссёр	ADMIN	2026-02-14 07:39:29.481
cmlm0a6360001fcuy48vlutio	org_demo	costumer@demo.local	Костюмер	COSTUMER	2026-02-14 07:39:29.488
cmlm0a63c0002fcuysvfq92i6	org_demo	actor@demo.local	Актёр	ACTOR	2026-02-14 07:39:29.495
cmlm9907e0000dkuyaznp7j6z	org_demo	123	Ололш	ACTOR	2026-02-14 11:50:31.754
\.


--
-- Data for Name: Warehouse; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Warehouse" (id, "orgId", name, address, comment, "createdAt") FROM stdin;
cmlm0a63f0003fcuy2e0l93tn	org_demo	Склад №1	Адрес (demo)	Комментарий к складу	2026-02-14 07:39:29.499
cmlm84ev50002lguy063qgthz	org_demo	Склад Крутой	Москва, ул Пушкина 15	Мой любимый склад	2026-02-14 11:18:57.857
cmlm87r0s0003lguy3jbxd7cy	org_demo	Склад 444	\N	\N	2026-02-14 11:21:33.58
\.


--
-- Data for Name: WriteOff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WriteOff" (id, "orgId", "propId", "writtenOffAt", "writtenOffByUserId", reason, comment) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f898fea9-3bdb-4da8-b33a-a82bf4be0db8	a1880f293f5bcb06511b156e6f74417e035eaaa7620997a693f113cad14d0cae	2026-02-14 07:24:42.338358+00	20260214072442_init	\N	\N	2026-02-14 07:24:42.173873+00	1
\.


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Container Container_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Container"
    ADD CONSTRAINT "Container_pkey" PRIMARY KEY (id);


--
-- Name: Issue Issue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Issue"
    ADD CONSTRAINT "Issue_pkey" PRIMARY KEY (id);


--
-- Name: Media Media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_pkey" PRIMARY KEY (id);


--
-- Name: Org Org_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Org"
    ADD CONSTRAINT "Org_pkey" PRIMARY KEY (id);


--
-- Name: Prop Prop_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prop"
    ADD CONSTRAINT "Prop_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Warehouse Warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Warehouse"
    ADD CONSTRAINT "Warehouse_pkey" PRIMARY KEY (id);


--
-- Name: WriteOff WriteOff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WriteOff"
    ADD CONSTRAINT "WriteOff_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AuditLog_orgId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_orgId_createdAt_idx" ON public."AuditLog" USING btree ("orgId", "createdAt");


--
-- Name: AuditLog_orgId_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_orgId_entityType_entityId_idx" ON public."AuditLog" USING btree ("orgId", "entityType", "entityId");


--
-- Name: Container_orgId_qrCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Container_orgId_qrCode_key" ON public."Container" USING btree ("orgId", "qrCode");


--
-- Name: Container_orgId_warehouseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Container_orgId_warehouseId_idx" ON public."Container" USING btree ("orgId", "warehouseId");


--
-- Name: Container_parentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Container_parentId_idx" ON public."Container" USING btree ("parentId");


--
-- Name: Issue_actorUserId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Issue_actorUserId_status_idx" ON public."Issue" USING btree ("actorUserId", status);


--
-- Name: Issue_orgId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Issue_orgId_status_idx" ON public."Issue" USING btree ("orgId", status);


--
-- Name: Issue_propId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Issue_propId_status_idx" ON public."Issue" USING btree ("propId", status);


--
-- Name: Media_orgId_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Media_orgId_entityType_entityId_idx" ON public."Media" USING btree ("orgId", "entityType", "entityId");


--
-- Name: Prop_currentContainerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Prop_currentContainerId_idx" ON public."Prop" USING btree ("currentContainerId");


--
-- Name: Prop_orgId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Prop_orgId_status_idx" ON public."Prop" USING btree ("orgId", status);


--
-- Name: User_orgId_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_orgId_email_key" ON public."User" USING btree ("orgId", email);


--
-- Name: User_orgId_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_orgId_role_idx" ON public."User" USING btree ("orgId", role);


--
-- Name: Warehouse_orgId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Warehouse_orgId_idx" ON public."Warehouse" USING btree ("orgId");


--
-- Name: WriteOff_orgId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WriteOff_orgId_idx" ON public."WriteOff" USING btree ("orgId");


--
-- Name: WriteOff_propId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "WriteOff_propId_key" ON public."WriteOff" USING btree ("propId");


--
-- Name: AuditLog AuditLog_actorUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AuditLog AuditLog_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Org"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Container Container_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Container"
    ADD CONSTRAINT "Container_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Org"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Container Container_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Container"
    ADD CONSTRAINT "Container_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Container"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Container Container_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Container"
    ADD CONSTRAINT "Container_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public."Warehouse"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Issue Issue_actorUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Issue"
    ADD CONSTRAINT "Issue_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Issue Issue_issuedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Issue"
    ADD CONSTRAINT "Issue_issuedByUserId_fkey" FOREIGN KEY ("issuedByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Issue Issue_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Issue"
    ADD CONSTRAINT "Issue_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Org"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Issue Issue_propId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Issue"
    ADD CONSTRAINT "Issue_propId_fkey" FOREIGN KEY ("propId") REFERENCES public."Prop"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Issue Issue_returnedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Issue"
    ADD CONSTRAINT "Issue_returnedByUserId_fkey" FOREIGN KEY ("returnedByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Media Media_createdByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Media Media_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Org"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Prop Prop_createdByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prop"
    ADD CONSTRAINT "Prop_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Prop Prop_currentContainerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prop"
    ADD CONSTRAINT "Prop_currentContainerId_fkey" FOREIGN KEY ("currentContainerId") REFERENCES public."Container"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Prop Prop_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prop"
    ADD CONSTRAINT "Prop_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Org"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Org"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Warehouse Warehouse_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Warehouse"
    ADD CONSTRAINT "Warehouse_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Org"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WriteOff WriteOff_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WriteOff"
    ADD CONSTRAINT "WriteOff_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Org"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WriteOff WriteOff_propId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WriteOff"
    ADD CONSTRAINT "WriteOff_propId_fkey" FOREIGN KEY ("propId") REFERENCES public."Prop"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WriteOff WriteOff_writtenOffByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WriteOff"
    ADD CONSTRAINT "WriteOff_writtenOffByUserId_fkey" FOREIGN KEY ("writtenOffByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict UCj0fi3UUBYok6BgulCiVuQgfZJFNSdZLbkxDDKugNmATSmerDAKJfA0FRaBIQ0

