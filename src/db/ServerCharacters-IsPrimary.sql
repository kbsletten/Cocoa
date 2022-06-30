ALTER TABLE ServerCharacters
ADD COLUMN IsPrimary INTEGER;

INSERT INTO AppVersions (VersionId) VALUES ("ServerCharacters-IsPrimary");
