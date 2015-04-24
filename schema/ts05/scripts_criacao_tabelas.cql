/********** Criando BDIC-DM	**********/
CREATE KEYSPACE "BDICDM"
WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

USE "BDICDM";

CREATE TABLE user (
usr_login text,
usr_pwd text,
usr_token text,
PRIMARY KEY(usr_login));

CREATE TABLE pais (
pais_id int,
pais_nm text,
PRIMARY KEY(pais_id));

CREATE TABLE estado (
est_id int,
est_nm text,
est_ab text,
est_pais_cod int,
PRIMARY KEY(est_id));

CREATE TABLE cidade (
cid_id int,
cid_nm text,
cid_est_cod int,
PRIMARY KEY(cid_id));

CREATE TABLE localidadetipo (
lot_id int,
lot_ds text,
PRIMARY KEY(lot_id));

CREATE TABLE localidade (
loc_id int,
loc_end text,
loc_num text,
loc_cid_cod int,
loc_com text,
loc_cep text,
loc_lot_cod int,
PRIMARY KEY(loc_id));

CREATE TABLE cliente (
cli_id int,
cli_loc_cod int,
cli_first text,
cli_middle text,
cli_last text,
cli_cpf text,
cli_gender text,
cli_mail text,
cli_fones list<text>,
cli_dt_nasc timestamp,
cli_rg text,
cli_renda decimal,
cli_usr_login text,
PRIMARY KEY(cli_id));

CREATE TABLE cartao (
car_id int,
car_band text,
car_num text,
car_valid_mes text,
car_valid_ano text,
car_nm text,
car_cli_cod int,
PRIMARY KEY(car_id));

CREATE TABLE categoria (
cat_id int,
cat_nm text,
cat_ds text,
PRIMARY KEY(cat_id));

CREATE TABLE produto (
pro_id int,
pro_nm text,
pro_ds text,
pro_vl decimal,
pro_cat_cod int,
PRIMARY KEY(pro_id));

CREATE TABLE histpreco (
his_id int,
his_pro_cod int,
his_dt timestamp,
his_vl decimal,
PRIMARY KEY(his_id));

CREATE TABLE status (
sta_id int,
sta_ds text,
PRIMARY KEY(sta_id));

CREATE TABLE tipovenda (
tip_id int,
tip_ven text,
PRIMARY KEY(tip_id));

CREATE TABLE venda (
ven_id int,
ven_cli_cod int,
ven_dt timestamp,
ven_tip_cod int,
PRIMARY KEY(ven_id));

CREATE TABLE vendaproduto (
vpr_id int,
vpr_ven_cod int,
vpr_pro_cod int,
vpr_vl decimal,
vpr_qt int,
PRIMARY KEY(vpr_id));
CREATE INDEX ON VENDAPRODUTO (VPR_VEN_COD);

CREATE TABLE transacao (
tra_id int,
tra_usr_login text,
tra_car_cod int,
tra_loc_cod int,
tra_dt timestamp,
tra_vl decimal,
tra_lat decimal,
tra_long decimal,
tra_confcode text,
tra_sta_cod int,
PRIMARY KEY(tra_id));

