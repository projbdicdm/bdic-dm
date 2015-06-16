DROP DATABASE IF EXISTS BDICDM;
CREATE DATABASE IF NOT EXISTS BDICDM;
USE BDICDM;

-- Criação da tabela "user"
CREATE TABLE user
(
	usr_login	CHAR(35)	PRIMARY KEY,
	usr_pwd		CHAR(08)	NOT NULL,
	usr_token	CHAR(06)	NOT NULL
);

-- Criação da tabela "País"
CREATE TABLE pais
(
	pais_id		INT				PRIMARY KEY,
	pais_nm		CHAR(40)		NOT NULL
);

-- Criação da tabela "Estado"
CREATE TABLE estado
(
	est_id			INT				PRIMARY KEY,
	est_nm			CHAR(35)		NOT NULL,
	est_ab			CHAR(02)		NOT NULL,
	est_pais_cod	INT,
	CONSTRAINT FK_est_pais_cod FOREIGN KEY (est_pais_cod)
		REFERENCES pais (pais_id)
);

-- Criação da tabela "Cidade"
CREATE TABLE cidade
(
	cid_id			INT				PRIMARY KEY,
	cid_nm			CHAR(35)		NOT NULL,
	cid_est_cod		INT,
	CONSTRAINT FK_cid_est_cod FOREIGN KEY (cid_est_cod)
		REFERENCES estado (est_id)
);

-- Criação da tabela "Tipo da Localidade"
CREATE TABLE localidadetipo
(
	lot_id		INT			PRIMARY KEY,
	lot_ds		CHAR(35)	NOT NULL
);

-- Criação da tabela "Localidade"
CREATE TABLE localidade
(
	loc_id				INT			PRIMARY KEY,
	loc_end				CHAR(50)	NOT NULL,
	loc_num				CHAR(10)	NOT NULL,
	loc_cid_cod			INT,
	loc_com				CHAR(35),
	loc_cep				CHAR(08)	NOT NULL,
	loc_lot_cod			INT,
	CONSTRAINT FK_loc_cid_cod FOREIGN KEY (loc_cid_cod)
		REFERENCES cidade (cid_id),
	CONSTRAINT FK_loc_lot_cod FOREIGN KEY (loc_lot_cod)
		REFERENCES localidadetipo (lot_id)
);

-- Criação da tabela "Cliente"
CREATE TABLE cliente
(
	cli_id				INT				AUTO_INCREMENT		PRIMARY KEY,
	cli_loc_cod			INT,
	cli_first			CHAR(35)		NOT NULL,
	cli_middle			CHAR(35),
	cli_last			CHAR(35)		NOT NULL,
	cli_cpf				CHAR(11)		NOT NULL,
	cli_gender			ENUM ('M','F')	NOT NULL,
	cli_mail			CHAR(50)		NOT NULL,
	cli_dt_nasc			DATE			NOT NULL,
	cli_rg				CHAR(11)		NOT NULL,
	cli_renda			DEC(9,2)		NOT NULL,
	cli_usr_login		CHAR(35),
	CONSTRAINT FK_cli_usr_login FOREIGN KEY (cli_usr_login)
		REFERENCES user (usr_login),
	CONSTRAINT FK_cli_loc_cod FOREIGN KEY (cli_loc_cod)
		REFERENCES localidade (loc_id)
);

-- Criação da tabela "Telefone"
CREATE TABLE fone
(
	fon_id			INT		PRIMARY KEY,
	fon_cli_cod		INT,
	fon_num			CHAR(12),
	CONSTRAINT FK_fone_cli_cod FOREIGN KEY (fon_cli_cod)
		REFERENCES cliente (cli_id)
);

-- Criação da tabela "Cartão"
CREATE TABLE cartao
(
	car_id				INT			AUTO_INCREMENT	PRIMARY KEY,
	car_band			CHAR(35)	NOT NULL,
	car_num				CHAR(16)	NOT NULL,
	car_valid_mes		CHAR(02)	NOT NULL,
	car_valid_ano		CHAR(04)	NOT NULL,
	car_nm				CHAR(35)	NOT NULL,
	car_cli_cod			INT,
	CONSTRAINT FK_car_cli_cod FOREIGN KEY (car_cli_cod)
		REFERENCES cliente (cli_id)
);

-- Criação da tabela "Categoria"
CREATE TABLE categoria
(
	cat_id		INT			PRIMARY KEY,
	cat_nm		CHAR(35)	NOT NULL,
	cat_ds		CHAR(35)	NULL
);

-- Criação da tabela "Produto"
CREATE TABLE produto
(
	pro_id			INT			AUTO_INCREMENT		PRIMARY KEY,
	pro_nm			CHAR(35)	NOT NULL,
	pro_ds			CHAR(35)	NULL,
	pro_vl			DEC(9,2)	NOT NULL,
	pro_cat_cod		INT,
	pro_img			VARCHAR(150),
	CONSTRAINT FK_pro_cat_cod FOREIGN KEY (pro_cat_cod)
		REFERENCES categoria (cat_id)
);

-- Criação da tabela "Histórico de Preço"
CREATE TABLE histpreco
(
	his_id		INT			AUTO_INCREMENT		PRIMARY KEY,
	his_pro_cod	INT,
	his_dt		DATETIME,
	his_vl		DEC(9,2),
	CONSTRAINT FK_his_pro_cod FOREIGN KEY (his_pro_cod)
		REFERENCES produto (pro_id)
);

-- Criação da tabela "Status"
CREATE TABLE status
(
	sta_id		INT				AUTO_INCREMENT		PRIMARY KEY,
	sta_ds		CHAR(35)		NOT NULL
);

-- Criação da tabela "Tipo de Venda"
CREATE TABLE tipovenda
(
	tip_id			INT			PRIMARY KEY,
	tip_ven			CHAR(10)	NOT NULL
);

-- Criação da tabela "Venda"
CREATE TABLE venda
(
	ven_id		INT			PRIMARY KEY,
	ven_cli_cod	INT,
	ven_dt		DATETIME	NOT NULL,
	ven_tip_cod	INT,
	ven_car_cod INT,
	ven_tra_cod char(50) DEFAULT NULL,
	CONSTRAINT FK_ven_cli_cod FOREIGN KEY (ven_cli_cod)
		REFERENCES cliente (cli_id),
	CONSTRAINT FK_ven_tip_cod FOREIGN KEY (ven_tip_cod)
		REFERENCES tipovenda (tip_id),
	CONSTRAINT FK_ven_car_cod FOREIGN KEY (ven_car_cod)
		REFERENCES cartao (car_id)
);

-- Criação da tabela "Venda"
CREATE TABLE vendaproduto
(
	vpr_id			INT			PRIMARY KEY,
	vpr_ven_cod		INT,
	vpr_pro_cod		INT,
	vpr_vl			DEC(9,2)	NOT NULL,
	vpr_qt			CHAR(35)	NOT NULL,
	CONSTRAINT FK_vpr_pro_cod FOREIGN KEY (vpr_pro_cod)
		REFERENCES produto (pro_id),
	CONSTRAINT FK_vpr_ven_cod FOREIGN KEY (vpr_ven_cod)
		REFERENCES venda (ven_id)
);
