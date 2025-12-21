-- Extend map_nodes to support tags and multiple resources
ALTER TABLE map_nodes
  ADD COLUMN tags TEXT DEFAULT NULL AFTER summary,
  ADD COLUMN resources TEXT DEFAULT NULL AFTER tags;

-- Existing rows: initialize empty JSON arrays if needed
UPDATE map_nodes SET tags = '[]' WHERE tags IS NULL;
UPDATE map_nodes SET resources = '[]' WHERE resources IS NULL;
