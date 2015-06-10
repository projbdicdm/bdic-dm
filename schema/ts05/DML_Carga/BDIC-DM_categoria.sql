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
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categoria` (
  `cat_id` int(11) NOT NULL,
  `cat_nm` char(35) NOT NULL,
  `cat_ds` char(35) DEFAULT NULL,
  PRIMARY KEY (`cat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Alimentos e Bebidas',NULL),(2,'Arte e Antiguidades',NULL),(3,'Artigos Religiosos',NULL),(4,'Assinaturas e Revistas',NULL),(5,'Automóveis e VeÃ­culos',NULL),(6,'Bebês e Cia',NULL),(7,'Blu-Ray',NULL),(8,'Brinquedos e Games',NULL),(9,'Casa e Decoração',NULL),(10,'CDs',NULL),(11,'Colecionáveis',NULL),(12,'Construção e Ferramentas',NULL),(13,'Cosméicos e Perfumaria',NULL),(14,'Discos de Vinil',NULL),(15,'DVDs',NULL),(16,'e-books',NULL),(17,'Eletrodomésticos',NULL),(18,'Eletrôicos',NULL),(19,'Esporte e Lazer',NULL),(20,'Fitas K7 Gravadas',NULL),(21,'Flores, Cestas e Presentes',NULL),(22,'Fotografia',NULL),(23,'HD-DVD',NULL),(24,'Imóveis',NULL),(25,'Indússtria, Comércio e Negócios',NULL),(26,'Informática',NULL),(27,'Instrumentos Musicais',NULL),(28,'Joalheria',NULL),(29,'LD',NULL),(30,'Livros',NULL),(31,'MD',NULL),(32,'Moda e Acessórios',NULL),(33,'Natal',NULL),(34,'Papelaria e Escritório',NULL),(35,'Páscoa',NULL),(36,'Pet Shop',NULL),(37,'Salão',NULL),(38,'Sex Shop',NULL),(39,'Telefonia',NULL),(40,'Turismo',NULL),(41,'VHS',NULL);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-06-09 23:29:48
