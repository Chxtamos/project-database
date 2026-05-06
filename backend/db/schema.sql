-- ============================================================
-- Movie Admin Database Schema
-- Run this file in PostgreSQL to create all required tables
-- ============================================================

-- Drop tables if they already exist (for clean re-runs)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    full_name   VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan        VARCHAR(20)   DEFAULT 'Basic'
                              CHECK (plan IN ('Basic', 'Premium', 'Enterprise')),
    role        VARCHAR(20)   DEFAULT 'user'
                              CHECK (role IN ('user', 'admin')),
    joined_date TIMESTAMP     DEFAULT NOW()
);

-- ============================================================
-- MOVIES TABLE
-- ============================================================
CREATE TABLE movies (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    genre        VARCHAR(100),
    release_year INT          CHECK (release_year BETWEEN 1888 AND 2100),
    status       VARCHAR(20)  DEFAULT 'Draft'
                              CHECK (status IN ('Published', 'Draft', 'Archived')),
    poster_url   TEXT,
    created_at   TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE payments (
    id              SERIAL PRIMARY KEY,
    transaction_id  VARCHAR(50)    UNIQUE NOT NULL,
    user_id         INT            REFERENCES users(id) ON DELETE SET NULL,
    customer_name   VARCHAR(100),
    amount          DECIMAL(10, 2) NOT NULL,
    payment_date    DATE           DEFAULT CURRENT_DATE,
    status          VARCHAR(20)    DEFAULT 'Pending'
                                   CHECK (status IN ('Completed', 'Pending', 'Failed'))
);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE reviews (
    id         SERIAL PRIMARY KEY,
    movie_id   INT         REFERENCES movies(id) ON DELETE CASCADE,
    user_name  VARCHAR(100),
    rating     INT         CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    status     VARCHAR(20) DEFAULT 'Visible'
                           CHECK (status IN ('Visible', 'Hidden')),
    created_at TIMESTAMP   DEFAULT NOW()
);

-- ============================================================
-- SEED DATA (Sample records for testing)
-- ============================================================

-- Seed Users (password = "admin1234" hashed with bcrypt)
INSERT INTO users (full_name, email, password_hash, plan, role) VALUES
    ('Admin User',  'admin@movie.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Enterprise', 'admin'),
    ('John Doe',    'john@movie.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Basic',      'user'),
    ('Jane Smith',  'jane@movie.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Premium',    'user'),
    ('Bob Wilson',  'bob@movie.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Basic',      'user');

-- Seed Movies
INSERT INTO movies (title, genre, release_year, status) VALUES
    ('Inception',        'Sci-Fi',   2010, 'Published'),
    ('The Matrix',       'Sci-Fi',   1999, 'Published'),
    ('Interstellar',     'Sci-Fi',   2014, 'Draft'),
    ('The Dark Knight',  'Action',   2008, 'Published'),
    ('Avengers: Endgame','Action',   2019, 'Published'),
    ('Parasite',         'Thriller', 2019, 'Published');

-- Seed Payments
INSERT INTO payments (transaction_id, user_id, customer_name, amount, payment_date, status) VALUES
    ('TXN001', 2, 'John Doe',   12.99, '2026-05-01', 'Completed'),
    ('TXN002', 3, 'Jane Smith', 12.99, '2026-05-02', 'Pending'),
    ('TXN003', 4, 'Bob Wilson', 25.00, '2026-05-03', 'Completed'),
    ('TXN004', 2, 'John Doe',   12.99, '2026-05-04', 'Failed');

-- Seed Reviews
INSERT INTO reviews (movie_id, user_name, rating, comment, status) VALUES
    (1, 'John Doe',   5, 'Mind-blowing! A masterpiece.',  'Visible'),
    (2, 'Jane Smith', 4, 'Classic, still holds up.',       'Visible'),
    (3, 'Bob Wilson', 5, 'Stunning visuals and story.',    'Visible'),
    (4, 'John Doe',   5, 'Best superhero movie ever.',     'Visible'),
    (2, 'Jane Smith', 3, 'Decent watch.',                  'Hidden');
