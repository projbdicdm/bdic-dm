--ESTE SCRIPT CRIA PRODUTOS PARA TESTES NO PORTAL
--Este arquivo é temporário e será enviado ao time 5 para se integrar na versão definitiva
--
--Conecte ao MySQL do projeto depois cole este script para popular a tabela de produtos

------------------------------
--BANCO DE PRODUTOS - DROP E CRIACAO

DROP TABLE `BDICDM`.`produto`;

CREATE TABLE `produto` (
  `pro_id` int(11) NOT NULL,
  `pro_nm` char(200) NOT NULL,
  `pro_ds` varchar(1000) NOT NULL,
  `pro_vl` decimal(9,2) NOT NULL,
  `pro_cat_cod` int(11) DEFAULT NULL,
  `pro_img` char(150) DEFAULT NULL,
  PRIMARY KEY (`pro_id`),
  KEY `FK_pro_cat_cod` (`pro_cat_cod`),
  CONSTRAINT `FK_pro_cat_cod` FOREIGN KEY (`pro_cat_cod`) REFERENCES `categoria` (`cat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


------------------------------
--BANCO DE PRODUTOS - POPULANDO DADOS

DELETE FROM BDICDM.produto WHERE pro_id > 0;

INSERT INTO `BDICDM`.`produto`
(`pro_id`,`pro_img`,`pro_nm`,`pro_vl`,`pro_ds`)
VALUES
(1,"img/121460290G1.jpg","Ultrabook ASUS S46CB Intel Core i7 6GB 1TB (2GB Memória Dedicada) 24GB SSD Tela LED 14",2599.00,"O Ultrabook S46CB é ultrafino, leve e ainda conta com DVD-RW para oferecer grande experiência multimídia com jogos, filmes e outros conteúdos. Tem uma poderosa configuração para oferecer excelente desempenho tanto em produtividade quanto em momentos de diversão.");

INSERT INTO `BDICDM`.`produto`
(`pro_id`,`pro_img`,`pro_nm`,`pro_vl`,`pro_ds`)
VALUES
(2,"img/120000574G1.jpg","Tablet Samsung Galaxy Tab S T805M 16GB Wi-fi + 4G Tela Super AMOLED 10.5' Android 4.4 Processador Octa-Core",1889.20,"A Samsung, provando mais uma vez que inovação não tem limites, apresenta o novo Galaxy Tab S. Uma experiência visual rica em cores e detalhes que vão além do digital, tornando imagens e filmes muito mais realistas. Uma imersão completa em 10,5 em polegadas.");

INSERT INTO `BDICDM`.`produto`
(`pro_id`,`pro_img`,`pro_nm`,`pro_vl`,`pro_ds`)
VALUES
(3,"img/122107498G1.jpg","Monitor LED 27' Samsung S27D590CS Tela Curva",1779.00,"Leve sua experiência de entretenimento a um patamar totalmente novo!O raio e a profundidade da curva do Monitor LED 27'' Samsung S27D590CS criam um campo de visão mais amplo e fazem a tela parecer maior e mais envolvente do que uma tela plana do mesmo tamanho. E como as bordas da tela estão fisicamente mais perto, correspondendo às curvas naturais de seus olhos, você tem a distância visual uniforme em toda a tela.");

------------------------------
--BANCO DE PRODUTOS - LISTA PRODUTOS

SELECT * FROM BDICDM.produto;

------------------------------
--BANCO DE PRODUTOS - LISTA PRODUTOS COM NOMES ESPERADOS PELA API

SELECT pro_id as id, pro_img as imagem, pro_nm as descricao, pro_vl as valor, pro_ds as observacao FROM BDICDM.produto;

------------------------------
--BANCO DE PRODUTOS - LISTA DETALHES DO PRODUTO

SELECT pro_id as id, pro_img as imagem, pro_nm as descricao, pro_vl as valor, pro_ds as observacao FROM BDICDM.produto WHERE pro_id = 1;