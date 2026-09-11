-- Normalise legacy contact status spellings onto the canonical hyphenated form.
--
-- Two mappers disagreed: the write path stored 'in-progress' while one read
-- path expected 'in_progress', so a contact moved to "In Progress" was
-- displayed as "New". The canonical database value is the hyphenated form
-- because that is what the write path has always produced, which means this
-- migration only has to repair rows written by the other spelling.
--
-- This is a value normalisation, not a schema change: no column is added,
-- dropped or retyped, and no row is deleted.

UPDATE contacts SET status = 'in-progress'
WHERE status IN ('in_progress', 'In Progress', 'In_Progress', 'IN_PROGRESS');

UPDATE contacts SET status = 'new'         WHERE status IN ('New', 'NEW');
UPDATE contacts SET status = 'contacted'   WHERE status IN ('Contacted', 'CONTACTED');
UPDATE contacts SET status = 'converted'   WHERE status IN ('Converted', 'CONVERTED');
UPDATE contacts SET status = 'closed'      WHERE status IN ('Closed', 'CLOSED');
