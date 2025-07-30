CREATE DATABASE  IF NOT EXISTS `logici_mysql` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `logici_mysql`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: logici_mysql
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `warehouse_analytics`
--

DROP TABLE IF EXISTS `warehouse_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouse_analytics` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouse_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `views` int DEFAULT '0',
  `unique_visitors` int DEFAULT '0',
  `visitor_ips` text COLLATE utf8mb4_unicode_ci,
  `inquiries` int DEFAULT '0',
  `bookings` int DEFAULT '0',
  `conversion_rate` float DEFAULT '0',
  `bounce_rate` float DEFAULT '0',
  `average_time_spent` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `warehouse_analytics_warehouse_id_date` (`warehouse_id`,`date`),
  KEY `warehouse_analytics_warehouse_id` (`warehouse_id`),
  KEY `warehouse_analytics_date` (`date`),
  CONSTRAINT `warehouse_analytics_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_analytics`
--

LOCK TABLES `warehouse_analytics` WRITE;
/*!40000 ALTER TABLE `warehouse_analytics` DISABLE KEYS */;
INSERT INTO `warehouse_analytics` VALUES ('005719cb-b480-4892-a094-02633f000fa1','3adfe6ae-7160-4420-8147-799918890813','2025-07-15',13,13,'[]',0,0,0,0,0,'2025-07-15 01:57:49','2025-07-15 06:21:51'),('4fe2b1cc-9a3f-42e5-bdaf-6cbc22c79da6','898cb940-64e9-4531-a893-66b12c357678','2025-07-05',3,3,'[]',0,0,0,0,0,'2025-07-05 13:42:26','2025-07-05 13:42:26'),('fdd2cc91-4344-4d19-bab1-ab81a89991bd','3adfe6ae-7160-4420-8147-799918890813','2025-07-05',32,32,'[]',0,0,0,0,0,'2025-07-05 13:12:21','2025-07-05 13:52:35');
/*!40000 ALTER TABLE `warehouse_analytics` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-17  7:37:17
