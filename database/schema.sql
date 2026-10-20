-- ============================================================================
-- Hackathon Showcase Gallery Database Schema
-- ============================================================================

CREATE DATABASE IF NOT EXISTS backenddb;
USE backenddb;

-- ----------------------------------------------------------------------------
-- 1. Users Table (with Profile & Onboarding Details)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    bio TEXT NULL,
    headline VARCHAR(255) NULL,
    skills VARCHAR(255) NULL,
    avatar_url VARCHAR(500) NULL,
    location VARCHAR(255) NULL,
    github_url VARCHAR(500) DEFAULT '',
    linkedin_url VARCHAR(500) DEFAULT '',
    website_url VARCHAR(500) DEFAULT '',
    twitter_url VARCHAR(500) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Projects Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    github_url VARCHAR(500) DEFAULT '',
    demo_url VARCHAR(500) DEFAULT '',
    image VARCHAR(500) DEFAULT '',
    team_name VARCHAR(255) DEFAULT '',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Votes Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NULL,
    score INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_project_vote (project_id, user_id),
    CONSTRAINT fk_vote_project FOREIGN KEY (project_id) 
        REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_vote_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
