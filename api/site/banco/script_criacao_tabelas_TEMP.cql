--ESTE SCRIPT CRIA USUARIOS PARA TESTES NO PORTAL
--Este arquivo é temporário e será enviado ao time 5 para se integrar na versão definitiva
--
--Siga o tutorial de instalação do Cassandra para o Windows:
--https://docs.google.com/document/d/1eu_DxAqp1-oXQGyBL9CWrrGuwJLbqljMCwsJ8gDNts0/edit?usp=drive_web
--
--Depois abra o DataStax DevCenter e cole este script

------------------------------
--BANCO DE USUARIOS - DROP E CRIACAO

USE "BDICDM";

DROP TABLE user;

CREATE TABLE user (
usr_login text,
usr_name text,
usr_pwd text,
usr_token text,
usr_type text,
PRIMARY KEY(usr_login));

------------------------------
--CRIACAO DOS BANCOS CASSANDRA

INSERT INTO user ( usr_login, usr_name, usr_pwd, usr_type )
VALUES ( 'admin@email.com.br', 'Usuário Administrador', '123456', 'admin' );

INSERT INTO user ( usr_login, usr_name, usr_pwd, usr_type )
VALUES ('cliente@email.com.br', 'Usuário Cliente', '123456', 'client' );

------------------------------
--SELECIONAR USUARIOS
SELECT * FROM "user";

------------------------------
--QUERY DE LOGIN
--SELECT "usr_pwd" FROM "user" WHERE "usr_login" = 'admin';