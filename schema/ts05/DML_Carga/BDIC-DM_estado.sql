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
-- Table structure for table `estado`
--

DROP TABLE IF EXISTS `estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estado` (
  `est_id` int(11) NOT NULL,
  `est_nm` char(35) NOT NULL,
  `est_ab` char(2) NOT NULL,
  `est_pais_cod` int(11) DEFAULT NULL,
  PRIMARY KEY (`est_id`),
  KEY `FK_est_pais_cod` (`est_pais_cod`),
  CONSTRAINT `FK_est_pais_cod` FOREIGN KEY (`est_pais_cod`) REFERENCES `pais` (`pais_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado`
--

LOCK TABLES `estado` WRITE;
/*!40000 ALTER TABLE `estado` DISABLE KEYS */;
INSERT INTO `estado` VALUES (1,'Acre','AC',36),(2,'Alagoas','AL',36),(3,'Amapá','AP',36),(4,'Amazonas','AM',36),(5,'Bahia','BA',36),(6,'Ceará','CE',36),(7,'Distrito Federal','DF',36),(8,'Espírito Santo','ES',36),(9,'Goiás','GO',36),(10,'Maranhão','MA',36),(11,'Mato Grosso','MT',36),(12,'Mato Grosso do Sul','MS',36),(13,'Minas Gerais','MG',36),(14,'Pará','PA',36),(15,'Paraíba','PB',36),(16,'Paraná','PR',36),(17,'Pernambuco','PE',36),(18,'Piauí','PI',36),(19,'Rio de Janeiro','RJ',36),(20,'Rio Grande do Norte','RN',36),(21,'Rio Grande do Sul','RS',36),(22,'Rondônia','RO',36),(23,'Roraima','RR',36),(24,'Santa Catarina','SC',36),(25,'São Paulo','SP',36),(26,'Sergipe','SE',36),(27,'Tocantins','TO',36);
/*!40000 ALTER TABLE `estado` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-06-09 23:30:35
