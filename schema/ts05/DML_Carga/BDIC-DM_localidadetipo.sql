CREATE DATABASE  IF NOT EXISTS `BDIC-DM` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_general_ci */;
USE `BDIC-DM`;
-- MySQL dump 10.13  Distrib 5.5.43, for debian-linux-gnu (i686)
--
-- Host: orion2412.startdedicated.net    Database: BDIC-DM
-- ------------------------------------------------------
-- Server version	5.5.41-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `localidadetipo`
--

DROP TABLE IF EXISTS `localidadetipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `localidadetipo` (
  `lot_id` int(11) NOT NULL,
  `lot_ds` char(35) NOT NULL,
  PRIMARY KEY (`lot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `localidadetipo`
--

LOCK TABLES `localidadetipo` WRITE;
/*!40000 ALTER TABLE `localidadetipo` DISABLE KEYS */;
INSERT INTO `localidadetipo` VALUES (1,'Aeroporto'),(2,'Alameda'),(3,'Área'),(4,'Avenida'),(5,'Campo'),(6,'Chácara'),(7,'Colônia'),(8,'Condomínio'),(9,'Conjunto'),(10,'Distrito'),(11,'Esplanada'),(12,'Estação'),(13,'Estrada'),(14,'Favela'),(15,'Fazenda'),(16,'Feira'),(17,'Jardim'),(18,'Ladeira'),(19,'Lago'),(20,'Lagoa'),(21,'Largo'),(22,'Loteamento'),(23,'Morro'),(24,'Núcleo'),(25,'Parque'),(26,'Passarela'),(27,'Pátio'),(28,'Praça'),(29,'Quadra'),(30,'Recanto'),(31,'Residencial'),(32,'Rodovia'),(33,'Rua'),(34,'Setor'),(35,'Sítio'),(36,'Travessa'),(37,'Trecho'),(38,'Trevo'),(39,'Vale'),(40,'Vereda'),(41,'Via'),(42,'Viaduto'),(43,'Viela'),(44,'Vila'),(45,'Outros');
/*!40000 ALTER TABLE `localidadetipo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-06-09 23:30:56
