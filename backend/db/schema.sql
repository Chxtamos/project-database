-- Adminer 5.4.2 PostgreSQL 16.13 dump

DROP TABLE IF EXISTS "actor";
DROP SEQUENCE IF EXISTS "public".actor_actor_id_seq;
CREATE SEQUENCE "public".actor_actor_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."actor" (
    "actor_id" integer DEFAULT nextval('actor_actor_id_seq') NOT NULL,
    "actor_name" character varying(100) NOT NULL,
    CONSTRAINT "actor_pkey" PRIMARY KEY ("actor_id")
)
WITH (oids = false);

INSERT INTO "actor" ("actor_id", "actor_name") VALUES
(1,	'Leonardo DiCaprio'),
(2,	'Tom Hanks'),
(3,	'Scarlett Johansson'),
(4,	'Robert Downey Jr.'),
(5,	'Natalie Portman');

DROP TABLE IF EXISTS "admins";
DROP SEQUENCE IF EXISTS "public".admins_admin_id_seq;
CREATE SEQUENCE "public".admins_admin_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."admins" (
    "admin_id" integer DEFAULT nextval('admins_admin_id_seq') NOT NULL,
    "username" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "password" character varying(255) NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admins_pkey" PRIMARY KEY ("admin_id")
)
WITH (oids = false);

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);

INSERT INTO "admins" ("admin_id", "username", "email", "password", "created_at") VALUES
(1,	'SuperAdmin',	'admin@movie.com',	'$2a$10$9OPKA3Uvhnjr3RX6AcbILeICZmi2oro3tlgKBD8HoDROugg8d9SJK',	'2026-05-07 15:14:24.579036');

DROP TABLE IF EXISTS "author";
DROP SEQUENCE IF EXISTS "public".author_author_id_seq;
CREATE SEQUENCE "public".author_author_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."author" (
    "author_id" integer DEFAULT nextval('author_author_id_seq') NOT NULL,
    "author_name" character varying(100) NOT NULL,
    CONSTRAINT "author_pkey" PRIMARY KEY ("author_id")
)
WITH (oids = false);

INSERT INTO "author" ("author_id", "author_name") VALUES
(1,	'Christopher Nolan'),
(2,	'Steven Spielberg'),
(3,	'Quentin Tarantino'),
(4,	'James Cameron'),
(5,	'Ridley Scott');

DROP TABLE IF EXISTS "cart";
DROP SEQUENCE IF EXISTS "public".cart_cart_id_seq;
CREATE SEQUENCE "public".cart_cart_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."cart" (
    "cart_id" integer DEFAULT nextval('cart_cart_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cart_pkey" PRIMARY KEY ("cart_id")
)
WITH (oids = false);

INSERT INTO "cart" ("cart_id", "user_id", "created_at", "updated_at") VALUES
(6,	13,	'2026-05-07 17:53:56.663211',	'2026-05-07 17:53:56.663211'),
(7,	13,	'2026-05-07 17:53:56.664629',	'2026-05-07 17:53:56.664629'),
(8,	1,	'2026-05-07 17:58:45.540595',	'2026-05-07 17:58:45.540595'),
(9,	1,	'2026-05-07 17:58:45.541767',	'2026-05-07 17:58:45.541767'),
(10,	1,	'2026-05-07 18:08:07.293099',	'2026-05-07 18:08:07.293099'),
(11,	1,	'2026-05-07 18:08:07.295016',	'2026-05-07 18:08:07.295016'),
(12,	14,	'2026-05-08 13:24:23.687454',	'2026-05-08 13:24:23.687454'),
(13,	14,	'2026-05-08 13:24:23.699178',	'2026-05-08 13:24:23.699178'),
(14,	1,	'2026-05-08 13:37:16.709095',	'2026-05-08 13:37:16.709095'),
(15,	1,	'2026-05-08 13:37:16.722089',	'2026-05-08 13:37:16.722089');

DELIMITER ;;

CREATE TRIGGER "update_cart_modtime" BEFORE UPDATE ON "public"."cart" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();;

DELIMITER ;

DROP TABLE IF EXISTS "cart_movies";
CREATE TABLE "public"."cart_movies" (
    "cart_id" integer NOT NULL,
    "movie_id" integer NOT NULL,
    CONSTRAINT "cart_movies_pkey" PRIMARY KEY ("cart_id", "movie_id")
)
WITH (oids = false);

INSERT INTO "cart_movies" ("cart_id", "movie_id") VALUES
(15,	10);

DROP TABLE IF EXISTS "genre";
DROP SEQUENCE IF EXISTS "public".genre_genre_id_seq;
CREATE SEQUENCE "public".genre_genre_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."genre" (
    "genre_id" integer DEFAULT nextval('genre_genre_id_seq') NOT NULL,
    "genre_name" character varying(50) NOT NULL,
    CONSTRAINT "genre_pkey" PRIMARY KEY ("genre_id")
)
WITH (oids = false);

INSERT INTO "genre" ("genre_id", "genre_name") VALUES
(1,	'Action'),
(2,	'Comedy'),
(3,	'Drama'),
(4,	'Sci-Fi'),
(5,	'Horror'),
(6,	'Romance'),
(7,	'Thriller'),
(8,	'Animation'),
(9,	'Documentary');

DROP TABLE IF EXISTS "library";
DROP SEQUENCE IF EXISTS "public".library_library_id_seq;
CREATE SEQUENCE "public".library_library_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."library" (
    "library_id" integer DEFAULT nextval('library_library_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "movie_id" integer NOT NULL,
    "favorite" boolean DEFAULT false NOT NULL,
    CONSTRAINT "library_pkey" PRIMARY KEY ("library_id")
)
WITH (oids = false);

INSERT INTO "library" ("library_id", "user_id", "movie_id", "favorite") VALUES
(1,	13,	8,	'0'),
(2,	1,	10,	'0'),
(3,	1,	12,	'0'),
(4,	13,	12,	'0'),
(5,	13,	13,	'0'),
(6,	1,	13,	'0'),
(7,	1,	4,	'0'),
(8,	1,	10,	'0'),
(9,	1,	9,	'0'),
(10,	14,	9,	'0'),
(11,	14,	10,	'0');

DROP TABLE IF EXISTS "movie_actor";
CREATE TABLE "public"."movie_actor" (
    "movie_id" integer NOT NULL,
    "actor_id" integer NOT NULL,
    CONSTRAINT "movie_actor_pkey" PRIMARY KEY ("movie_id", "actor_id")
)
WITH (oids = false);

INSERT INTO "movie_actor" ("movie_id", "actor_id") VALUES
(1,	1),
(3,	1),
(4,	4),
(5,	4),
(7,	2),
(8,	3);

DROP TABLE IF EXISTS "movie_author";
CREATE TABLE "public"."movie_author" (
    "movie_id" integer NOT NULL,
    "author_id" integer NOT NULL,
    CONSTRAINT "movie_author_pkey" PRIMARY KEY ("movie_id", "author_id")
)
WITH (oids = false);

INSERT INTO "movie_author" ("movie_id", "author_id") VALUES
(1,	1),
(3,	1),
(4,	1),
(8,	4);

DROP TABLE IF EXISTS "movie_genre";
CREATE TABLE "public"."movie_genre" (
    "movie_id" integer NOT NULL,
    "genre_id" integer NOT NULL,
    CONSTRAINT "movie_genre_pkey" PRIMARY KEY ("movie_id", "genre_id")
)
WITH (oids = false);

INSERT INTO "movie_genre" ("movie_id", "genre_id") VALUES
(1,	4),
(2,	4),
(3,	4),
(4,	1),
(5,	1),
(6,	7),
(7,	3),
(9,	3),
(9,	6),
(8,	3),
(11,	1),
(12,	1),
(10,	2),
(10,	6),
(13,	3),
(13,	4),
(13,	6),
(13,	1);

DROP TABLE IF EXISTS "movies";
DROP SEQUENCE IF EXISTS "public".movies_movie_id_seq;
CREATE SEQUENCE "public".movies_movie_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."movies" (
    "movie_id" integer DEFAULT nextval('movies_movie_id_seq') NOT NULL,
    "movie_name" character varying(100) NOT NULL,
    "movie_cost" numeric(10,2) NOT NULL,
    "movie_rating" integer,
    "movie_releasedate" date NOT NULL,
    "movie_poster" text DEFAULT 'https://example.com/default-poster.png' NOT NULL,
    CONSTRAINT "movies_pkey" PRIMARY KEY ("movie_id")
)
WITH (oids = false);

INSERT INTO "movies" ("movie_id", "movie_name", "movie_cost", "movie_rating", "movie_releasedate", "movie_poster") VALUES
(2,	'The Matrix',	99.00,	9,	'1999-03-31',	'https://www.themoviedb.org/t/p/w600_and_h900_face/aOIuZAjPaRIE6CMzbazvcHuHXDc.jpg'),
(1,	'Inception',	129.00,	9,	'2010-07-16',	'https://www.themoviedb.org/t/p/w600_and_h900_face/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg'),
(3,	'Interstellar',	149.00,	9,	'2014-11-07',	'https://www.themoviedb.org/t/p/w600_and_h900_face/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg'),
(4,	'The Dark Knight',	119.00,	9,	'2008-07-18',	'https://www.themoviedb.org/t/p/w600_and_h900_face/qJ2tW6WMUDux911r6m7haRef0WH.jpg'),
(7,	'Forrest Gump',	79.00,	9,	'1994-07-06',	'https://www.themoviedb.org/t/p/w600_and_h900_face/Cw4hIUIAmSYfK9QfaUW5igp9La.jpg'),
(6,	'Parasite',	89.00,	9,	'2019-05-30',	'https://www.themoviedb.org/t/p/w600_and_h900_face/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'),
(5,	'Avengers: Endgame',	159.00,	8,	'2019-04-26',	'https://www.themoviedb.org/t/p/w600_and_h900_face/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg'),
(9,	'Sunset at BangPakok',	1.00,	10,	'2014-04-02',	'https://img1.pic.in.th/images/Gemini_Generated_Image_xa4ag3xa4ag3xa4a.png'),
(8,	'Titanic(remake)',	109.00,	8,	'1997-12-15',	'https://img2.pic.in.th/55619.jpg'),
(11,	'ภูมิ ตำนานแห่งหมู่บ้านบางระจัน',	1.00,	10,	'2026-05-07',	'https://img2.pic.in.th/Gemini_Generated_Image_1kkfcn1kkfcn1kkf.png'),
(12,	'John Wick 2 southern edition',	20.00,	10,	'2026-05-07',	'https://img2.pic.in.th/S__50241566.jpg'),
(10,	'รักสามเศร้า เราคำหนึ่ง',	1.00,	10,	'2026-02-14',	'https://img1.pic.in.th/images/Gemini_Generated_Image_2cwahb2cwahb2cwa.png'),
(13,	'ทลายเหมืองทอง',	2.00,	NULL,	'2026-05-07',	'/uploads/posters/1778177456071-messageImage_1778176496619.jpg');

DROP TABLE IF EXISTS "payment";
DROP SEQUENCE IF EXISTS "public".payment_payment_id_seq;
CREATE SEQUENCE "public".payment_payment_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."payment" (
    "payment_id" integer DEFAULT nextval('payment_payment_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "cart_id" integer NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "qr_ref" text,
    "status" integer DEFAULT '0' NOT NULL,
    "payment_date" timestamp DEFAULT CURRENT_TIMESTAMP,
    "expired_at" timestamp NOT NULL,
    "completed_at" timestamp,
    "slip_id" integer,
    CONSTRAINT "payment_pkey" PRIMARY KEY ("payment_id")
)
WITH (oids = false);

INSERT INTO "payment" ("payment_id", "user_id", "cart_id", "amount", "qr_ref", "status", "payment_date", "expired_at", "completed_at", "slip_id") VALUES
(2,	1,	9,	1.00,	NULL,	1,	'2026-05-07 18:05:48.950108',	'2026-05-08 18:05:48.950108',	'2026-05-07 18:06:32.372061',	2),
(3,	1,	8,	20.00,	NULL,	1,	'2026-05-07 18:07:50.185899',	'2026-05-08 18:07:50.185899',	'2026-05-07 18:08:04.593517',	3),
(4,	13,	7,	22.00,	NULL,	1,	'2026-05-08 01:00:49.67024',	'2026-05-09 01:00:49.67024',	'2026-05-08 01:01:26.975843',	4),
(5,	1,	11,	121.00,	NULL,	1,	'2026-05-08 01:06:46.623902',	'2026-05-09 01:06:46.623902',	'2026-05-08 01:07:06.534657',	5),
(6,	1,	10,	2.00,	NULL,	1,	'2026-05-08 13:36:54.35192',	'2026-05-09 13:36:54.35192',	'2026-05-08 13:37:11.129549',	6),
(7,	14,	13,	2.00,	NULL,	1,	'2026-05-08 13:46:10.503661',	'2026-05-09 13:46:10.503661',	'2026-05-08 13:46:19.848343',	7);

DELIMITER ;;

CREATE TRIGGER "trg_set_completed_at" BEFORE UPDATE ON "public"."payment" FOR EACH ROW EXECUTE FUNCTION set_payment_completed_time();;

DELIMITER ;

DROP TABLE IF EXISTS "playlist";
DROP SEQUENCE IF EXISTS "public".playlist_playlist_id_seq;
CREATE SEQUENCE "public".playlist_playlist_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."playlist" (
    "playlist_id" integer DEFAULT nextval('playlist_playlist_id_seq') NOT NULL,
    "playlist_name" character varying(100),
    "library_id" integer,
    CONSTRAINT "playlist_pkey" PRIMARY KEY ("playlist_id")
)
WITH (oids = false);

INSERT INTO "playlist" ("playlist_id", "playlist_name", "library_id") VALUES
(1,	'คนใต้ต้องดู',	2),
(2,	'คนใต้จัด',	1),
(3,	'หนังเทพ',	10);

DROP TABLE IF EXISTS "playlist_movie";
CREATE TABLE "public"."playlist_movie" (
    "playlist_id" integer NOT NULL,
    "movie_id" integer NOT NULL,
    CONSTRAINT "playlist_movie_pkey" PRIMARY KEY ("playlist_id", "movie_id")
)
WITH (oids = false);

INSERT INTO "playlist_movie" ("playlist_id", "movie_id") VALUES
(1,	12),
(1,	13),
(2,	13),
(2,	12),
(3,	10),
(3,	9);

DROP TABLE IF EXISTS "report_review";
CREATE TABLE "public"."report_review" (
    "reporter_id" integer NOT NULL,
    "review_id" integer NOT NULL,
    "report_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "status" integer DEFAULT '0' NOT NULL,
    "reason" text NOT NULL,
    CONSTRAINT "report_review_pkey" PRIMARY KEY ("review_id", "reporter_id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "review";
DROP SEQUENCE IF EXISTS "public".review_review_id_seq;
CREATE SEQUENCE "public".review_review_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."review" (
    "review_id" integer DEFAULT nextval('review_review_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "movie_id" integer NOT NULL,
    "review_number" integer NOT NULL,
    "rating" numeric(3,1) NOT NULL,
    "comment" character varying(150),
    "date_review" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "review_pkey" PRIMARY KEY ("review_id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "transfer_slip";
DROP SEQUENCE IF EXISTS "public".transfer_slip_slip_id_seq;
CREATE SEQUENCE "public".transfer_slip_slip_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."transfer_slip" (
    "slip_id" integer DEFAULT nextval('transfer_slip_slip_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "slip_image" text NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "uploaded_at" timestamp DEFAULT now(),
    CONSTRAINT "transfer_slip_pkey" PRIMARY KEY ("slip_id")
)
WITH (oids = false);

INSERT INTO "transfer_slip" ("slip_id", "user_id", "slip_image", "amount", "uploaded_at") VALUES
(2,	1,	'/uploads/slips/1778177148915-Gemini_Generated_Image_yuh8y6yuh8y6yuh8.png',	1.00,	'2026-05-07 18:05:48.950108'),
(3,	1,	'/uploads/slips/1778177270151-Gemini_Generated_Image_yuh8y6yuh8y6yuh8.png',	20.00,	'2026-05-07 18:07:50.185899'),
(4,	13,	'/uploads/slips/1778202049656-549313.jpg',	22.00,	'2026-05-08 01:00:49.67024'),
(5,	1,	'/uploads/slips/1778202406611-LINE_ALBUM_Total pic_250512_9.jpg',	121.00,	'2026-05-08 01:06:46.623902'),
(6,	1,	'/uploads/slips/1778247414347-1107056.jpg',	2.00,	'2026-05-08 13:36:54.35192'),
(7,	14,	'/uploads/slips/1778247970500-1107056.jpg',	2.00,	'2026-05-08 13:46:10.503661');

DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS "public".users_user_id_seq;
CREATE SEQUENCE "public".users_user_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."users" (
    "user_id" integer DEFAULT nextval('users_user_id_seq') NOT NULL,
    "username" character varying(50) NOT NULL,
    "email" character varying(100) NOT NULL,
    "telephone" character varying(15) NOT NULL,
    "password" text NOT NULL,
    "plan" character varying(20) DEFAULT 'Free',
    "register_date" timestamp DEFAULT CURRENT_TIMESTAMP,
    "reset_token" character varying(255),
    "reset_token_expiry" timestamp,
    "new_email_pending" character varying(255),
    "verify_email_token" character varying(255),
    "verify_email_expiry" timestamp,
    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
)
WITH (oids = false);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_telephone_key ON public.users USING btree (telephone);

INSERT INTO "users" ("user_id", "username", "email", "telephone", "password", "plan", "register_date", "reset_token", "reset_token_expiry", "new_email_pending", "verify_email_token", "verify_email_expiry") VALUES
(2,	'user_2',	'test2@example.com',	'081234562',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'Free',	'2026-05-07 13:56:55.398889',	NULL,	NULL,	NULL,	NULL,	NULL),
(3,	'user_3',	'test3@example.com',	'081234563',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'Premium',	'2026-05-07 13:56:55.398889',	NULL,	NULL,	NULL,	NULL,	NULL),
(4,	'user_4',	'test4@example.com',	'081234564',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'Free',	'2026-05-07 13:56:55.398889',	NULL,	NULL,	NULL,	NULL,	NULL),
(5,	'user_5',	'test5@example.com',	'081234565',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'Premium',	'2026-05-07 13:56:55.398889',	NULL,	NULL,	NULL,	NULL,	NULL),
(6,	'user_6',	'test6@example.com',	'081234566',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'Free',	'2026-05-07 13:56:55.398889',	NULL,	NULL,	NULL,	NULL,	NULL),
(7,	'user_7',	'test7@example.com',	'081234567',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'Free',	'2026-05-07 13:56:55.398889',	NULL,	NULL,	NULL,	NULL,	NULL),
(8,	'user_8',	'test8@example.com',	'081234568',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'Free',	'2026-05-07 13:56:55.398889',	NULL,	NULL,	NULL,	NULL,	NULL),
(9,	'user_9',	'test9@example.com',	'081234569',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'Free',	'2026-05-07 13:56:55.398889',	NULL,	NULL,	NULL,	NULL,	NULL),
(13,	'TestUser',	'user@movie.com',	'0812345678',	'$2a$10$skIFr38n1BlcHNyIAYBTdupQw6pYgESj1pJ0FAZ3v8tEx7eGIZdN6',	'Free',	'2026-05-07 17:00:58.433799',	NULL,	NULL,	NULL,	NULL,	NULL),
(14,	'Lui',	'phalat.lui@gmail.com',	'087',	'$2a$10$lUCMn6HFEE9OGYU.36LjGOnRxz1.bqjArJUIOmDJ4/QkoytZd8c2.',	'Free',	'2026-05-08 13:20:16.44417',	'f108d835b9a1de319cae592c67b6b2c1efb7c4552a0383e4021bdbd0d6d85cfb',	'2026-05-08 21:31:30.131',	NULL,	NULL,	NULL),
(1,	'MOSราชาSpaylater',	'mos@mail.com',	'081234561',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'Premium',	'2026-05-07 13:56:55.398889',	NULL,	NULL,	'mos@example.com',	'd6c0a02af7c9c1fc6921f0873e66bd2dd11674604d3c2dc87c01a68da53cffd7',	'2026-05-08 21:40:14.747');

ALTER TABLE ONLY "public"."cart" ADD CONSTRAINT "cart_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."cart_movies" ADD CONSTRAINT "cart_movies_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."cart_movies" ADD CONSTRAINT "cart_movies_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."library" ADD CONSTRAINT "library_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."library" ADD CONSTRAINT "library_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."movie_actor" ADD CONSTRAINT "movie_actor_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES actor(actor_id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."movie_actor" ADD CONSTRAINT "movie_actor_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."movie_author" ADD CONSTRAINT "movie_author_author_id_fkey" FOREIGN KEY (author_id) REFERENCES author(author_id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."movie_author" ADD CONSTRAINT "movie_author_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."movie_genre" ADD CONSTRAINT "movie_genre_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES genre(genre_id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."movie_genre" ADD CONSTRAINT "movie_genre_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."payment" ADD CONSTRAINT "payment_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."payment" ADD CONSTRAINT "payment_slip_id_fkey" FOREIGN KEY (slip_id) REFERENCES transfer_slip(slip_id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."payment" ADD CONSTRAINT "payment_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."playlist" ADD CONSTRAINT "playlist_library_id_fkey" FOREIGN KEY (library_id) REFERENCES library(library_id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."playlist_movie" ADD CONSTRAINT "playlist_movie_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."playlist_movie" ADD CONSTRAINT "playlist_movie_playlist_id_fkey" FOREIGN KEY (playlist_id) REFERENCES playlist(playlist_id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."report_review" ADD CONSTRAINT "report_review_reporter_id_fkey" FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."report_review" ADD CONSTRAINT "report_review_review_id_fkey" FOREIGN KEY (review_id) REFERENCES review(review_id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."review" ADD CONSTRAINT "review_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."review" ADD CONSTRAINT "review_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."transfer_slip" ADD CONSTRAINT "transfer_slip_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id);

-- 2026-05-08 13:49:40 UTC