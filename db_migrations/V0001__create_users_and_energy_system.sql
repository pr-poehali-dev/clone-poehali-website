CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    energy INTEGER DEFAULT 100,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

INSERT INTO users (email, password_hash, name, energy, is_admin)
VALUES ('den.nazarenko.02@internet.ru', '$2b$10$dummy_hash_will_be_replaced', 'Admin User', 100000, TRUE)
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS energy_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount INTEGER NOT NULL,
    reason VARCHAR(255),
    admin_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_energy_transactions_user_id ON energy_transactions(user_id);
