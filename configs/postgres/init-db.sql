SELECT 'CREATE DATABASE urlshortener'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'urlshortener')\gexec

-- Connect to the urlshortener database
\c urlshortener;

CREATE TABLE IF NOT EXISTS urls (
    short_code VARCHAR(20) PRIMARY KEY,
    original_url TEXT NOT NULL,
    click_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_created_at ON urls(created_at);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_updated_at ON urls;
CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON urls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert sample data
INSERT INTO urls (short_code, original_url, click_count) VALUES
    ('google', 'https://www.google.com', 10),
    ('github', 'https://www.github.com', 5)
ON CONFLICT (short_code) DO NOTHING;