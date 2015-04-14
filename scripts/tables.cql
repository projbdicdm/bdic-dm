CREATE TABLE IF NOT EXISTS "BDI"."USER" (
	usr_login text,
	usr_password text,
	usr_token text,
	PRIMARY KEY (usr_login)
);

CREATE TABLE IF NOT EXISTS "BDI"."CLIENT" (
	cli_loc_id	int,
	cli_firstname	text,
	cli_middlename	text,
	cli_surname	text,
	cli_phones	List<text>,
	cli_cpf	text,
	cli_gender	text,
	cli_email	text,
	cli_birthdate	timestamp,
	cli_rg	text,
	cli_annualincome	decimal,
	usr_login	text,
	PRIMARY KEY (usr_login)
);

CREATE TABLE IF NOT EXISTS "BDI"."TRANSACTION" (
	tra_id	uuid,
	usr_login	text,
	car_id 	int, 
	loc_id 	int, 
	tra_date	timestamp,
	tra_value	decimal,
	tra_lat	float,
	tra_lon	float,
	tra_confirmationcode	text,
	tra_status	text,
	PRIMARY KEY (tra_id)
);

CREATE INDEX IF NOT EXISTS idx_tra_usr_login ON "BDI"."TRANSACTION" (usr_login);