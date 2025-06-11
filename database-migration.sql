
ALTER TABLE transfer_rumours ADD COLUMN to_team TEXT;

ALTER TABLE transfer_rumours RENAME COLUMN current_team TO from_team;

UPDATE transfer_rumours 
SET to_team = from_team, from_team = NULL 
WHERE direction = 'incoming';

ALTER TABLE transfer_rumours DROP COLUMN direction;
