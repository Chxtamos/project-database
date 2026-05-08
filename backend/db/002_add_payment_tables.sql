-- 1. Create transfer_slip table
CREATE SEQUENCE IF NOT EXISTS "public".transfer_slip_slip_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE IF NOT EXISTS "public"."transfer_slip" (
    "slip_id" integer DEFAULT nextval('transfer_slip_slip_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "slip_image" text NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "uploaded_at" timestamp DEFAULT now(),
    CONSTRAINT "transfer_slip_pkey" PRIMARY KEY ("slip_id")
) WITH (oids = false);

-- 2. Add foreign key to transfer_slip
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transfer_slip_user_id_fkey') THEN
        ALTER TABLE "public"."transfer_slip" ADD CONSTRAINT "transfer_slip_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id);
    END IF;
END $$;

-- 3. Modify existing payment table
ALTER TABLE "public"."payment" ADD COLUMN IF NOT EXISTS "qr_ref" text;
ALTER TABLE "public"."payment" ADD COLUMN IF NOT EXISTS "payment_date" timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."payment" ADD COLUMN IF NOT EXISTS "completed_at" timestamp;
ALTER TABLE "public"."payment" ADD COLUMN IF NOT EXISTS "slip_id" integer;

-- 4. Add foreign keys to payment table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_slip_id_fkey') THEN
        ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_slip_id_fkey" FOREIGN KEY (slip_id) REFERENCES transfer_slip(slip_id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_cart_id_fkey') THEN
        ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_user_id_fkey') THEN
        ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
    END IF;
END $$;
