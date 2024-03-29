CREATE TABLE IF NOT EXISTS Characters (
    CharacterId TEXT,
    UserId TEXT,
    Name TEXT,
    Data TEXT
);

CREATE TABLE IF NOT EXISTS ServerCharacters (
    CharacterId TEXT,
    ServerId TEXT
);

CREATE TABLE IF NOT EXISTS AppVersions (
    VersionId TEXT
);

CREATE TABLE IF NOT EXISTS ServerSettings (
    ServerId TEXT,
    Data TEXT
);
