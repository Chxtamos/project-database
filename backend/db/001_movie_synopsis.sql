ALTER TABLE "public"."movies" ADD COLUMN "detail" TEXT;
UPDATE "public"."movies" SET "detail" = '-';
ALTER TABLE "public"."movies" ALTER COLUMN "detail" SET NOT NULL;
