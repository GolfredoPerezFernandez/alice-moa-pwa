CREATE TABLE IF NOT EXISTS legalDocument (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    documentType TEXT NOT NULL,
    publicationDate TEXT, -- Store as ISO8601 string (YYYY-MM-DD HH:MM:SS.SSS) or (YYYY-MM-DD)
    createdAt TEXT NOT NULL, -- Store as ISO8601 string
    updatedAt TEXT NOT NULL -- Store as ISO8601 string
);

-- Optional: Add indexes for frequently queried columns if needed, e.g., on documentType or publicationDate
-- CREATE INDEX IF NOT EXISTS idx_legalDocument_documentType ON legalDocument(documentType);
-- CREATE INDEX IF NOT EXISTS idx_legalDocument_publicationDate ON legalDocument(publicationDate);
-- CREATE INDEX IF NOT EXISTS idx_legalDocument_updatedAt ON legalDocument(updatedAt);