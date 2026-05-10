-- Adminer 5.4.2 PostgreSQL 16.13 dump

DROP FUNCTION IF EXISTS "set_payment_completed_time";;
CREATE FUNCTION "set_payment_completed_time" () RETURNS trigger LANGUAGE plpgsql AS '
BEGIN
    IF NEW.status = 1 AND (OLD.status IS NULL OR OLD.status != 1) THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
';

DROP FUNCTION IF EXISTS "update_updated_at_column";;
CREATE FUNCTION "update_updated_at_column" () RETURNS trigger LANGUAGE plpgsql AS '
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
';

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
(5,	'Natalie Portman'),
(6,	'คอตต้อน'),
(7,	'ไทเกอร์'),
(8,	'ลุ้ย'),
(9,	'พี'),
(10,	'มอส'),
(11,	'ต้นน้ำ'),
(12,	'ภูมิ'),
(13,	'Keanu Reeves'),
(14,	'Matthew McConaughey'),
(15,	'Christian Bale'),
(16,	'Song Kang-ho'),
(17,	'Lee Sun-kyun'),
(18,	'Cho Yeo-jeong'),
(21,	'Nadech Kugimiya'),
(22,	'Winai Kraibutr'),
(23,	'Bin Bunluerit'),
(24,	'Jaran Ngamdee');

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
(5,	'Ridley Scott'),
(6,	'ธนนันท์'),
(7,	'Lilly Wachowski'),
(8,	'Lana Wachowski'),
(9,	'Chad Stahelski'),
(10,	'Derek Kolstad'),
(11,	'Anthony Russo'),
(12,	'Bong Joon Ho'),
(13,	'Robert Zemeckis'),
(14,	'Kittikorn Liasirikun'),
(15,	'Tanit Jitnukul');

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
(15,	1,	'2026-05-08 13:37:16.722089',	'2026-05-08 13:37:16.722089'),
(16,	14,	'2026-05-08 15:33:34.345881',	'2026-05-08 15:33:34.345881'),
(17,	14,	'2026-05-08 15:33:34.34541',	'2026-05-08 15:33:34.34541'),
(18,	14,	'2026-05-08 15:58:45.628167',	'2026-05-08 15:58:45.628167'),
(19,	14,	'2026-05-08 15:58:45.628749',	'2026-05-08 15:58:45.628749'),
(20,	16,	'2026-05-08 16:09:30.703392',	'2026-05-08 16:09:30.703392'),
(21,	16,	'2026-05-08 16:09:30.703524',	'2026-05-08 16:09:30.703524'),
(22,	14,	'2026-05-08 18:22:50.98506',	'2026-05-08 18:22:50.98506'),
(23,	14,	'2026-05-08 18:24:54.093273',	'2026-05-08 18:24:54.093273'),
(24,	14,	'2026-05-08 18:51:02.489668',	'2026-05-08 18:51:02.489668'),
(25,	16,	'2026-05-09 12:56:03.20079',	'2026-05-09 12:56:03.20079');

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
(15,	10),
(19,	11),
(18,	11),
(22,	11),
(24,	12);

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
(11,	14,	10,	'0'),
(13,	14,	5,	'0'),
(15,	14,	7,	'0'),
(16,	14,	13,	'0'),
(10,	14,	9,	'0'),
(12,	14,	6,	'0'),
(14,	14,	4,	'0'),
(17,	14,	11,	'0'),
(18,	16,	11,	'0'),
(19,	16,	10,	'0'),
(20,	16,	9,	'0');

DROP TABLE IF EXISTS "movie_actor";
CREATE TABLE "public"."movie_actor" (
    "movie_id" integer NOT NULL,
    "actor_id" integer NOT NULL,
    CONSTRAINT "movie_actor_pkey" PRIMARY KEY ("movie_id", "actor_id")
)
WITH (oids = false);

INSERT INTO "movie_actor" ("movie_id", "actor_id") VALUES
(12,	7),
(12,	13),
(9,	9),
(9,	21),
(8,	8),
(8,	11),
(7,	2),
(5,	1),
(5,	2),
(5,	3),
(5,	4),
(5,	5),
(6,	16),
(6,	17),
(6,	18),
(1,	1),
(10,	8),
(10,	9),
(10,	10),
(13,	6),
(13,	7),
(11,	22),
(11,	23),
(4,	15),
(3,	14),
(2,	13),
(11,	24),
(11,	12);

DROP TABLE IF EXISTS "movie_author";
CREATE TABLE "public"."movie_author" (
    "movie_id" integer NOT NULL,
    "author_id" integer NOT NULL,
    CONSTRAINT "movie_author_pkey" PRIMARY KEY ("movie_id", "author_id")
)
WITH (oids = false);

INSERT INTO "movie_author" ("movie_id", "author_id") VALUES
(10,	6),
(13,	6),
(11,	6),
(11,	15),
(4,	1),
(3,	1),
(2,	7),
(2,	8),
(12,	6),
(12,	9),
(12,	10),
(9,	6),
(9,	14),
(8,	4),
(7,	13),
(5,	2),
(5,	11),
(6,	12),
(1,	1);

DROP TABLE IF EXISTS "movie_genre";
CREATE TABLE "public"."movie_genre" (
    "movie_id" integer NOT NULL,
    "genre_id" integer NOT NULL,
    CONSTRAINT "movie_genre_pkey" PRIMARY KEY ("movie_id", "genre_id")
)
WITH (oids = false);

INSERT INTO "movie_genre" ("movie_id", "genre_id") VALUES
(9,	3),
(9,	6),
(8,	3),
(8,	6),
(7,	3),
(5,	1),
(6,	7),
(1,	4),
(10,	2),
(10,	6),
(13,	1),
(13,	3),
(13,	4),
(13,	6),
(11,	1),
(4,	1),
(3,	4),
(2,	4),
(12,	1);

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
    "detail" text NOT NULL,
    "video_url" text,
    CONSTRAINT "movies_pkey" PRIMARY KEY ("movie_id")
)
WITH (oids = false);

INSERT INTO "movies" ("movie_id", "movie_name", "movie_cost", "movie_rating", "movie_releasedate", "movie_poster", "detail", "video_url") VALUES
(7,	'Forrest Gump',	79.00,	NULL,	'1994-07-02',	'https://www.themoviedb.org/t/p/w600_and_h900_face/Cw4hIUIAmSYfK9QfaUW5igp9La.jpg',	'A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him.',	'https://vimeo.com/1190578734?fl=pl&fe=sh'),
(10,	'รักสามเศร้า เราคำหนึ่ง',	1.00,	5,	'2026-02-11',	'https://img1.pic.in.th/images/Gemini_Generated_Image_2cwahb2cwahb2cwa.png',	'เรื่องราวของมิตรภาพอันแน่นแฟ้นระหว่างสามเพื่อนซี้ พี (คนซ้ายสุด) หนุ่มแว่นมาดนิ่ง, มอส (คนกลาง) เพื่อนผู้สดใส และ ลุ้ย (คนขวาสุด) ชายหนุ่มที่ดูเหมือนจะไม่มีพิษมีภัย แต่ทว่าความเชื่อใจที่สั่งสมมานานกลับต้องพังทลายลงในมื้ออาหารเพียงมื้อเดียว!

เมื่อความหิวครอบงำจนหน้ามืดบอด ลุ้ย ตัดสินใจก่อคดีอาชญากรรมทางโภชนาการด้วยการ "แอบกินข้าว" ของพีและมอสจนเกลี้ยงจาน ความลับที่ถูกซ่อนไว้ภายใต้รอยยิ้มถูดเปิดโปง นำไปสู่มหากาพย์ความโกรธแค้นที่สั่นสะเทือนไปทั้งกลุ่มเพื่อน

ท่ามกลางบรรยากาศที่มาคุและการเผชิญหน้าเพื่อทวงคืนความยุติธรรมให้กับอาหารที่จากไป พวกเขาต้องเรียนรู้ที่จะให้อภัยและแบ่งปัน จนกลายเป็นที่มาของวลีในตำนานที่ผูกมัดใจพวกเขาไว้ว่า "เราคำหนึ่ง" — คำพูดสั้นๆ ที่เต็มไปด้วยความหมาย (และความหิว) ที่จะทำให้คุณรู้ว่า มิตรภาพที่แท้จริง... บางครั้งก็วัดกันที่ข้าวแค่คำเดียว',	'https://vimeo.com/1190705421?share=copy&fl=sv&fe=ci'),
(5,	'Avengers: Endgame',	159.00,	NULL,	'2019-04-19',	'https://www.themoviedb.org/t/p/w600_and_h900_face/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg',	'After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos'' actions and restore order to the universe once and for all, no matter what consequences may be in store.',	'https://vimeo.com/1190562626?share=copy&fl=sv&fe=ci'),
(6,	'Parasite',	89.00,	NULL,	'2019-05-23',	'https://www.themoviedb.org/t/p/w600_and_h900_face/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',	'All unemployed, Ki-taek''s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',	'https://vimeo.com/1190585627?fl=pl&fe=sh'),
(8,	'Titanic(remake)',	109.00,	NULL,	'1997-12-10',	'https://img2.pic.in.th/55619.jpg',	'Set against the ill-fated maiden voyage of the R.M.S. Titanic, Lui and Tonnam find a connection that transcends social boundaries. Amidst the grandeur of the ''unsinkable'' ship, their brief but intense romance defies the odds, proving that even in the face of an impending tragedy, love remains the ultimate anchor of the soul.',	'https://vimeo.com/1190583996?fl=pl&fe=sh'),
(1,	'Inception',	129.00,	NULL,	'2010-07-12',	'https://www.themoviedb.org/t/p/w600_and_h900_face/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',	'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person''s idea into a target''s subconscious.',	'https://vimeo.com/1190576869?share=copy&fl=sv&fe=ci'),
(9,	'Sunset at BangPakok',	1.00,	5,	'2014-03-28',	'https://img1.pic.in.th/images/Gemini_Generated_Image_xa4ag3xa4ag3xa4a.png',	'A forbidden romance blossoms on the banks of Bang Pakok during World War II between P, a young local, and a high-ranking Japanese navy officer. Their passionate but perilous love story unfolds against the backdrop of war-torn Thailand, captured during a final, poignant moment before an uncertain future.',	'https://vimeo.com/1190582221?share=copy&fl=sv&fe=ci'),
(4,	'The Dark Knight',	119.00,	NULL,	'2008-07-12',	'https://www.themoviedb.org/t/p/w600_and_h900_face/qJ2tW6WMUDux911r6m7haRef0WH.jpg',	'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',	'https://vimeo.com/1190586542?fl=pl&fe=sh'),
(3,	'Interstellar',	149.00,	NULL,	'2014-11-04',	'https://www.themoviedb.org/t/p/w600_and_h900_face/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',	'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',	'https://vimeo.com/1190587183?fl=pl&fe=sh'),
(2,	'The Matrix',	99.00,	NULL,	'1999-03-27',	'https://www.themoviedb.org/t/p/w600_and_h900_face/aOIuZAjPaRIE6CMzbazvcHuHXDc.jpg',	'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',	'https://vimeo.com/1190584646?fl=pl&fe=sh'),
(12,	'John Wick 2 southern edition',	20.00,	NULL,	'2026-05-01',	'https://img2.pic.in.th/S__50241566.jpg',	'ไทเกอร์  อดีตหนุ่มกรีดยางระดับตำนานแห่งดินแดนด้ามขวาน ผู้ขึ้นชื่อเรื่องความไวและความคมของใบมีดระดับพระกาฬ เขาตัดสินใจล้างมือจากวงการสวนยางและคำครหาเพื่อไปใช้ชีวิตอย่างสงบ แต่ทว่าความสงบนั้นกลับพังทลายลง เมื่อศัตรูเก่าตามมาล้ำเส้นและพรากสิ่งสำคัญไปจากเขา เสือร้ายแห่งปักษ์ใต้จึงต้องคืนวงการอีกครั้ง แต่ครั้งนี้เป้าหมายไม่ใช่หน้ายาง แต่เป็นชีวิตของใครก็ตามที่ขวางหน้า ท่ามกลางกระสุนและคมมีดที่รุมล้อมจากทุกทิศทาง ไทเกอร์ต้องงัดทุกทักษะการ "กรีด" ที่มี เพื่อปิดบัญชีแค้นและพิสูจน์ว่าตำนานที่ลาวงการไปแล้ว... ยังคงเฉียบคมและอันตรายเสมอ',	'https://vimeo.com/1190580045?fl=pl&fe=sh'),
(11,	'ภูมิ ตำนานแห่งหมู่บ้านบางระจัน',	1.00,	5,	'2026-05-01',	'https://img2.pic.in.th/Gemini_Generated_Image_1kkfcn1kkfcn1kkf.png',	'ในปี พ.ศ. 2309 ช่วงวิกฤตของกรุงศรีอยุธยา กองทัพพม่ากำลังรุกคืบเข้ามาใกล้เมืองหลวง. หมู่บ้านบางระจันกลายเป็นป้อมปราการแห่งสุดท้ายที่ขวางทางเดินทัพพม่า. ท่ามกลางความสิ้นหวังและความกลัวของชาวบ้าน ชาวบ้านคนอื่นๆ ที่พึ่งพิงความแกร่งและความกล้าหาญกลับไม่เพียงพอที่จะสู้กับกองทัพที่เหนือกว่า. ภูมิ, ชายหนุ่มผู้มีความรู้และสติปัญญา (สวมแว่นตาตาเดียว) ที่มีความเข้าใจในกลยุทธ์การรบและภูมิปัญญาท้องถิ่น, ตระหนักว่าการต่อสู้แบบเดิมๆ จะไม่สามารถปกป้องหมู่บ้านได้. เขาจึงใช้สติปัญญาของเขาในการวางแผนกลยุทธ์, การสร้างป้อมปราการที่แข็งแกร่ง, และการนำชาวบ้านที่มีความหลากหลายมารวมตัวกัน. เรื่องราวของการรวมพลังชาวบางระจันภายใต้การนำของภูมิที่ใช้ทั้งความแกร่งและสติปัญญาในการต่อสู้เพื่อปกป้องบ้านเกิดและสร้างตำนานที่ไม่มีวันลืม',	'https://youtu.be/P83n-n-W_Wk?si=By8C073aOAckEnA7'),
(13,	'ทลายเหมืองทอง',	5.00,	3,	'2026-04-27',	'/uploads/posters/1778177456071-messageImage_1778176496619.jpg',	'เมื่อ Cotton อดีตนักศึกษาหนุ่มจากเมืองกรุงถูกรีไทร์จนต้องระเห็จมาพิสูจน์ตัวเองในเหมืองแร่อันห่างไกลในภาคใต้ ที่นั่นเขาได้พบกับ Tiger หนุ่มเจ้าถิ่นผู้ใช้ชีวิตเรียบง่ายแต่เต็มไปด้วยความแข็งแกร่ง ท่ามกลางบรรยากาศการทำงานที่หนักหน่วงและบททดสอบของธรรมชาติ มิตรภาพระหว่าง "เด็กมหาลัย" และ "เด็กใต้" ก็ได้เริ่มต้นขึ้น เป็นบทเรียนนอกตำราที่สอนให้พวกเขารู้จักความหมายของชีวิตและการยืนหยัดด้วยลำแข้งของตัวเอง',	'https://vimeo.com/1190555254?fl=pl&fe=sh');

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
(7,	14,	13,	2.00,	NULL,	1,	'2026-05-08 13:46:10.503661',	'2026-05-09 13:46:10.503661',	'2026-05-08 13:46:19.848343',	7),
(8,	14,	12,	89.00,	NULL,	1,	'2026-05-08 15:32:47.329837',	'2026-05-09 15:32:47.329837',	'2026-05-08 15:32:59.835182',	8),
(9,	14,	16,	357.00,	'/qr_codes/promptpay_qr.jpg',	1,	'2026-05-08 15:54:53.64609',	'2026-05-09 15:54:53.64609',	'2026-05-08 15:55:09.874111',	9),
(10,	14,	17,	2.00,	'/qr_codes/promptpay_qr.jpg',	1,	'2026-05-08 15:58:28.092783',	'2026-05-09 15:58:28.092783',	'2026-05-08 15:58:40.028996',	10),
(11,	14,	19,	1.00,	'/qr_codes/promptpay_qr.jpg',	2,	'2026-05-08 18:14:08.511349',	'2026-05-09 18:14:08.511349',	NULL,	11),
(12,	14,	18,	1.00,	'/qr_codes/promptpay_qr.jpg',	2,	'2026-05-08 18:22:50.9603',	'2026-05-09 18:22:50.9603',	NULL,	12),
(13,	14,	22,	1.00,	'/qr_codes/promptpay_qr.jpg',	2,	'2026-05-08 18:24:54.077256',	'2026-05-09 18:24:54.077256',	NULL,	13),
(14,	14,	23,	1.00,	'/qr_codes/promptpay_qr.jpg',	1,	'2026-05-08 18:51:02.049828',	'2026-05-09 18:51:02.049828',	'2026-05-08 18:51:02.049828',	14),
(15,	16,	21,	1.00,	'/qr_codes/promptpay_qr.jpg',	1,	'2026-05-09 12:55:11.926419',	'2026-05-10 12:55:11.926419',	'2026-05-09 12:55:11.926419',	20),
(16,	16,	20,	2.00,	'/qr_codes/promptpay_qr.jpg',	1,	'2026-05-09 12:56:02.649614',	'2026-05-10 12:56:02.649614',	'2026-05-09 12:56:02.649614',	21);

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
(3,	'หนังเทพ',	10),
(4,	'หนังฝรั่ง',	11),
(5,	'ลองหน่อย',	11),
(6,	'หนังเก',	11),
(7,	'หนังเก',	18);

DROP TABLE IF EXISTS "playlist_movie";
CREATE TABLE "public"."playlist_movie" (
    "playlist_id" integer NOT NULL,
    "movie_id" integer NOT NULL,
    "sort_order" integer,
    CONSTRAINT "playlist_movie_pkey" PRIMARY KEY ("playlist_id", "movie_id")
)
WITH (oids = false);

INSERT INTO "playlist_movie" ("playlist_id", "movie_id", "sort_order") VALUES
(1,	12,	1),
(1,	13,	2),
(2,	12,	1),
(2,	13,	2),
(4,	7,	1),
(4,	5,	2),
(4,	4,	3),
(3,	10,	1),
(3,	9,	2),
(5,	13,	1),
(5,	5,	2),
(5,	7,	3),
(6,	13,	1),
(6,	9,	2),
(6,	10,	3),
(7,	11,	1),
(7,	10,	2),
(7,	9,	3);

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

CREATE UNIQUE INDEX review_one_per_user_movie ON public.review USING btree (user_id, movie_id);

INSERT INTO "review" ("review_id", "user_id", "movie_id", "review_number", "rating", "comment", "date_review") VALUES
(4,	1,	13,	1,	5.0,	'ชอบฉันไทเกอร์เล่นเกกับคอตต้อน',	'2026-05-08 16:24:08.555996'),
(5,	14,	13,	2,	1.0,	'ไม่เห็นเจี๋ยวไทเกอร์ไม่ชอบหนังกาก',	'2026-05-08 16:25:17.089959'),
(6,	14,	10,	1,	5.0,	'ดูแล้วน้ำตาไหล',	'2026-05-08 16:26:37.170656'),
(7,	14,	11,	1,	5.0,	'โคตรคุ้ม 1 บาทได้ดูเต็มเรื่อง',	'2026-05-08 20:16:48.996985'),
(8,	14,	9,	1,	5.0,	'เสวปิ๊',	'2026-05-08 20:20:45.424675');

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
(7,	14,	'/uploads/slips/1778247970500-1107056.jpg',	2.00,	'2026-05-08 13:46:10.503661'),
(8,	14,	'/uploads/slips/1778254367314-1107056.jpg',	89.00,	'2026-05-08 15:32:47.329837'),
(9,	14,	'/uploads/slips/1778255693633-1107056.jpg',	357.00,	'2026-05-08 15:54:53.64609'),
(10,	14,	'/uploads/slips/1778255908090-1107056.jpg',	2.00,	'2026-05-08 15:58:28.092783'),
(11,	14,	'/uploads/slips/1778264048498-IMG_6593.jpg',	1.00,	'2026-05-08 18:14:08.511349'),
(12,	14,	'/uploads/slips/1778264570948-IMG_6593.jpg',	1.00,	'2026-05-08 18:22:50.9603'),
(13,	14,	'/uploads/slips/1778264694073-IMG_6593.jpg',	1.00,	'2026-05-08 18:24:54.077256'),
(14,	14,	'/uploads/slips/1778266262046-IMG_6593.jpg',	1.00,	'2026-05-08 18:51:02.049828'),
(20,	16,	'/uploads/slips/1778331311924-IMG_6593.jpg',	1.00,	'2026-05-09 12:55:11.926419'),
(21,	16,	'/uploads/slips/1778331362637-IMG_6593.jpg',	2.00,	'2026-05-09 12:56:02.649614');

DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS "public".users_user_id_seq;
CREATE SEQUENCE "public".users_user_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."users" (
    "user_id" integer DEFAULT nextval('users_user_id_seq') NOT NULL,
    "username" character varying(50) NOT NULL,
    "email" character varying(100) NOT NULL,
    "telephone" character varying(15) NOT NULL,
    "password" text NOT NULL,
    "register_date" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
)
WITH (oids = false);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_telephone_key ON public.users USING btree (telephone);

INSERT INTO "users" ("user_id", "username", "email", "telephone", "password", "register_date") VALUES
(2,	'user_2',	'test2@example.com',	'081234562',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'2026-05-07 13:56:55.398889'),
(3,	'user_3',	'test3@example.com',	'081234563',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'2026-05-07 13:56:55.398889'),
(4,	'user_4',	'test4@example.com',	'081234564',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'2026-05-07 13:56:55.398889'),
(5,	'user_5',	'test5@example.com',	'081234565',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'2026-05-07 13:56:55.398889'),
(6,	'user_6',	'test6@example.com',	'081234566',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'2026-05-07 13:56:55.398889'),
(7,	'user_7',	'test7@example.com',	'081234567',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'2026-05-07 13:56:55.398889'),
(8,	'user_8',	'test8@example.com',	'081234568',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'2026-05-07 13:56:55.398889'),
(9,	'user_9',	'test9@example.com',	'081234569',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'2026-05-07 13:56:55.398889'),
(13,	'TestUser',	'user@movie.com',	'0812345678',	'$2a$10$skIFr38n1BlcHNyIAYBTdupQw6pYgESj1pJ0FAZ3v8tEx7eGIZdN6',	'2026-05-07 17:00:58.433799'),
(1,	'MOSราชาSpaylater',	'mos@mail.com',	'081234561',	'$2a$10$UK7Rf4z6PODbAafINMSlVuu13EszsOA12PIAjf1zEfgJ8eiV2OojS',	'2026-05-07 13:56:55.398889'),
(16,	'lui2',	'phalat.101@gmail.com',	'999',	'$2a$10$jRzh6DUO7actIrOoRhBeoOy8WUZr2KDAjcG7.uAmTsNOTX.a8YokG',	'2026-05-08 14:38:00.435253'),
(17,	'12313',	'phalat1.lui@gmail.com',	'123',	'$2a$10$GUcfEQ3S7JyNCqbKihQhp.JoB1XmRUTwk2BalKzZyI8Hja.wFs.KK',	'2026-05-08 14:38:58.127515'),
(14,	'Lui',	'phalat.lui@gmail.com',	'0877777777',	'$2a$10$lUCMn6HFEE9OGYU.36LjGOnRxz1.bqjArJUIOmDJ4/QkoytZd8c2.',	'2026-05-08 13:20:16.44417');

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

-- 2026-05-10 05:16:56 UTC