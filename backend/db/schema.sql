-- ============================================================
-- Movie Streaming Database Schema
-- Based on init_db.sql (pg_dump 2026-05-06)
-- ============================================================

-- ─── Extensions / Settings ────────────────────────────────────
SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

-- ─── Drop all tables (clean re-run) ───────────────────────────
DROP TABLE IF EXISTS public.report_review   CASCADE;
DROP TABLE IF EXISTS public.review          CASCADE;
DROP TABLE IF EXISTS public.movie_actor     CASCADE;
DROP TABLE IF EXISTS public.movie_author    CASCADE;
DROP TABLE IF EXISTS public.movie_genre     CASCADE;
DROP TABLE IF EXISTS public.playlist_movie  CASCADE;
DROP TABLE IF EXISTS public.playlist        CASCADE;
DROP TABLE IF EXISTS public.payment         CASCADE;
DROP TABLE IF EXISTS public.cart_movies     CASCADE;
DROP TABLE IF EXISTS public.cart            CASCADE;
DROP TABLE IF EXISTS public.library         CASCADE;
DROP TABLE IF EXISTS public.actor           CASCADE;
DROP TABLE IF EXISTS public.author          CASCADE;
DROP TABLE IF EXISTS public.genre           CASCADE;
DROP TABLE IF EXISTS public.movies          CASCADE;
DROP TABLE IF EXISTS public.users           CASCADE;

-- ─── Drop functions ───────────────────────────────────────────
DROP FUNCTION IF EXISTS public.set_payment_completed_time() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- ─── Functions ────────────────────────────────────────────────
CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE FUNCTION public.set_payment_completed_time() RETURNS trigger
    LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status = 1 AND (OLD.status IS NULL OR OLD.status != 1) THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$;

-- ============================================================
-- TABLES
-- ============================================================

-- ─── users ────────────────────────────────────────────────────
CREATE TABLE public.users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    telephone     VARCHAR(15)  NOT NULL UNIQUE,
    password      TEXT         NOT NULL,
    register_date TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─── movies ───────────────────────────────────────────────────
CREATE TABLE public.movies (
    movie_id          SERIAL PRIMARY KEY,
    movie_name        VARCHAR(100)   NOT NULL,
    movie_cost        NUMERIC(10,2)  NOT NULL,
    movie_rating      INTEGER,
    movie_releasedate DATE           NOT NULL,
    movie_poster      TEXT           NOT NULL DEFAULT 'https://example.com/default-poster.png'
);

-- ─── genre ────────────────────────────────────────────────────
CREATE TABLE public.genre (
    genre_id   SERIAL PRIMARY KEY,
    genre_name VARCHAR(50) NOT NULL
);

-- ─── actor ────────────────────────────────────────────────────
CREATE TABLE public.actor (
    actor_id   SERIAL PRIMARY KEY,
    actor_name VARCHAR(100) NOT NULL
);

-- ─── author ───────────────────────────────────────────────────
CREATE TABLE public.author (
    author_id   SERIAL PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL
);

-- ─── library ──────────────────────────────────────────────────
CREATE TABLE public.library (
    library_id SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES public.users(user_id)   ON DELETE CASCADE,
    movie_id   INTEGER NOT NULL REFERENCES public.movies(movie_id) ON DELETE CASCADE,
    favorite   BOOLEAN NOT NULL DEFAULT false
);

-- ─── cart ─────────────────────────────────────────────────────
CREATE TABLE public.cart (
    cart_id    SERIAL PRIMARY KEY,
    user_id    INTEGER   NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── cart_movies ──────────────────────────────────────────────
CREATE TABLE public.cart_movies (
    cart_id  INTEGER NOT NULL REFERENCES public.cart(cart_id)     ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES public.movies(movie_id)  ON DELETE CASCADE,
    PRIMARY KEY (cart_id, movie_id)
);

-- ─── payment ──────────────────────────────────────────────────
CREATE TABLE public.payment (
    payment_id      SERIAL PRIMARY KEY,
    user_id         INTEGER        NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    cart_id         INTEGER        NOT NULL REFERENCES public.cart(cart_id)  ON DELETE CASCADE,
    amount          NUMERIC(10,2)  NOT NULL,
    transaction_ref VARCHAR(100)   UNIQUE,
    qr_ref          TEXT,
    status          INTEGER        NOT NULL DEFAULT 0,
    payment_date    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    expired_at      TIMESTAMP      NOT NULL,
    completed_at    TIMESTAMP
);

-- ─── playlist ─────────────────────────────────────────────────
CREATE TABLE public.playlist (
    playlist_id   SERIAL PRIMARY KEY,
    playlist_name VARCHAR(100),
    library_id    INTEGER REFERENCES public.library(library_id) ON DELETE CASCADE
);

-- ─── playlist_movie ───────────────────────────────────────────
CREATE TABLE public.playlist_movie (
    playlist_id INTEGER NOT NULL REFERENCES public.playlist(playlist_id) ON DELETE CASCADE,
    movie_id    INTEGER NOT NULL REFERENCES public.movies(movie_id)      ON DELETE CASCADE,
    PRIMARY KEY (playlist_id, movie_id)
);

-- ─── movie_genre ──────────────────────────────────────────────
CREATE TABLE public.movie_genre (
    movie_id INTEGER NOT NULL REFERENCES public.movies(movie_id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES public.genre(genre_id)  ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

-- ─── movie_actor ──────────────────────────────────────────────
CREATE TABLE public.movie_actor (
    movie_id INTEGER NOT NULL REFERENCES public.movies(movie_id) ON DELETE CASCADE,
    actor_id INTEGER NOT NULL REFERENCES public.actor(actor_id)  ON DELETE CASCADE,
    PRIMARY KEY (movie_id, actor_id)
);

-- ─── movie_author ─────────────────────────────────────────────
CREATE TABLE public.movie_author (
    movie_id  INTEGER NOT NULL REFERENCES public.movies(movie_id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES public.author(author_id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, author_id)
);

-- ─── review ───────────────────────────────────────────────────
CREATE TABLE public.review (
    review_id     SERIAL PRIMARY KEY,
    user_id       INTEGER        NOT NULL REFERENCES public.users(user_id)   ON DELETE CASCADE,
    movie_id      INTEGER        NOT NULL REFERENCES public.movies(movie_id) ON DELETE CASCADE,
    review_number INTEGER        NOT NULL,
    rating        NUMERIC(3,1)   NOT NULL,
    comment       VARCHAR(150),
    date_review   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── report_review ────────────────────────────────────────────
CREATE TABLE public.report_review (
    reporter_id INTEGER   NOT NULL REFERENCES public.users(user_id)   ON DELETE CASCADE,
    review_id   INTEGER   NOT NULL REFERENCES public.review(review_id) ON DELETE CASCADE,
    report_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status      INTEGER   NOT NULL DEFAULT 0,
    reason      TEXT      NOT NULL,
    PRIMARY KEY (review_id, reporter_id)
);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER update_cart_modtime
    BEFORE UPDATE ON public.cart
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_set_completed_at
    BEFORE UPDATE ON public.payment
    FOR EACH ROW EXECUTE FUNCTION public.set_payment_completed_time();

-- ============================================================
-- SEED DATA
-- ============================================================

-- users (10 sample users)
INSERT INTO public.users (username, email, telephone, password) VALUES
    ('user_1',  'test1@example.com',  '081234561',  'hashed_password_example'),
    ('user_2',  'test2@example.com',  '081234562',  'hashed_password_example'),
    ('user_3',  'test3@example.com',  '081234563',  'hashed_password_example'),
    ('user_4',  'test4@example.com',  '081234564',  'hashed_password_example'),
    ('user_5',  'test5@example.com',  '081234565',  'hashed_password_example'),
    ('user_6',  'test6@example.com',  '081234566',  'hashed_password_example'),
    ('user_7',  'test7@example.com',  '081234567',  'hashed_password_example'),
    ('user_8',  'test8@example.com',  '081234568',  'hashed_password_example'),
    ('user_9',  'test9@example.com',  '081234569',  'hashed_password_example'),
    ('user_10', 'test10@example.com', '0812345610', 'hashed_password_example');

-- genre
INSERT INTO public.genre (genre_name) VALUES
    ('Action'), ('Comedy'), ('Drama'), ('Sci-Fi'), ('Horror'),
    ('Romance'), ('Thriller'), ('Animation'), ('Documentary');

-- actor
INSERT INTO public.actor (actor_name) VALUES
    ('Leonardo DiCaprio'), ('Tom Hanks'), ('Scarlett Johansson'),
    ('Robert Downey Jr.'), ('Natalie Portman');

-- author
INSERT INTO public.author (author_name) VALUES
    ('Christopher Nolan'), ('Steven Spielberg'), ('Quentin Tarantino'),
    ('James Cameron'), ('Ridley Scott');

-- movies
INSERT INTO public.movies (movie_name, movie_cost, movie_rating, movie_releasedate) VALUES
    ('Inception',         129.00, 9, '2010-07-16'),
    ('The Matrix',         99.00, 9, '1999-03-31'),
    ('Interstellar',      149.00, 9, '2014-11-07'),
    ('The Dark Knight',   119.00, 9, '2008-07-18'),
    ('Avengers: Endgame', 159.00, 8, '2019-04-26'),
    ('Parasite',           89.00, 9, '2019-05-30'),
    ('Forrest Gump',       79.00, 9, '1994-07-06'),
    ('Titanic',           109.00, 8, '1997-12-19');

-- movie_genre
INSERT INTO public.movie_genre (movie_id, genre_id) VALUES
    (1,4),(2,4),(3,4),(4,1),(5,1),(6,7),(7,3),(8,3);

-- movie_actor
INSERT INTO public.movie_actor (movie_id, actor_id) VALUES
    (1,1),(3,1),(4,4),(5,4),(7,2),(8,3);

-- movie_author
INSERT INTO public.movie_author (movie_id, author_id) VALUES
    (1,1),(3,1),(4,1),(8,4);
