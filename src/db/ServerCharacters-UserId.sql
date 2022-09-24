ALTER TABLE ServerCharacters
ADD COLUMN UserId TEXT;

UPDATE ServerCharacters
SET UserId = (
    SELECT UserId
    FROM Characters
    WHERE CharacterId = ServerCharacters.CharacterId
);

ALTER TABLE Characters DROP COLUMN UserId;
