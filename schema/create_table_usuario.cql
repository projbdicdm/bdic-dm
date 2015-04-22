CREATE TABLE IF NOT EXISTS "BDI".usuarios (
	login text,
	password text,
	usr_token text,
	PRIMARY KEY (( login, password ))
);