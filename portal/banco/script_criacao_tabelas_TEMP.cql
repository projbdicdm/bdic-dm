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

DROP TABLE "USER";

CREATE TABLE "USER" (
usr_login text,
usr_name text,
usr_password text,
usr_token text,
usr_type text,
PRIMARY KEY(usr_login));

------------------------------
--CRIACAO DOS BANCOS CASSANDRA

INSERT INTO "USER" ( usr_login, usr_name, usr_password, usr_type )
VALUES ( 'admin@email.com.br', 'Usuário Administrador', '123456', 'admin' );

INSERT INTO "USER" ( usr_login, usr_name, usr_password, usr_type )
VALUES ( 'adtf@email.com.br', 'Usuário AdTF', '123456', 'adtf' );

INSERT INTO "USER" ( usr_login, usr_name, usr_password, usr_type )
VALUES ('cliente@email.com.br', 'Usuário Cliente', '123456', 'client' );

------------------------------
--SELECIONAR USUARIOS
SELECT * FROM "USER";

------------------------------
--QUERY DE LOGIN
--SELECT "usr_password" FROM "USER" WHERE "usr_login" = 'admin';