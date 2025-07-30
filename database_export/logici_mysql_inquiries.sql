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
-- Table structure for table `inquiries`
--

DROP TABLE IF EXISTS `inquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inquiries` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `inquiry_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `preferred_contact_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_contact_time` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attachment_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consent` tinyint(1) NOT NULL DEFAULT '0',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `industry_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `industry_other` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `space_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_preference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lease_duration` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_start_date` datetime DEFAULT NULL,
  `current_system` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wms_other` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `flexibility_requirements` text COLLATE utf8mb4_unicode_ci,
  `fulfillment_services` text COLLATE utf8mb4_unicode_ci,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `allocation_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unallocated',
  `allocated_to` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allocated_at` datetime DEFAULT NULL,
  `allocated_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invalidation_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `inquiry_type_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `type_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inquiries_email` (`email`),
  KEY `inquiries_phone_number` (`phone_number`),
  KEY `inquiries_inquiry_type` (`inquiry_type`),
  KEY `inquiries_status` (`status`),
  KEY `inquiries_allocation_status` (`allocation_status`),
  KEY `inquiries_allocated_to` (`allocated_to`),
  KEY `allocated_by` (`allocated_by`),
  KEY `inquiry_type_id` (`inquiry_type_id`),
  KEY `type_id` (`type_id`),
  CONSTRAINT `inquiries_ibfk_5` FOREIGN KEY (`allocated_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inquiries_ibfk_6` FOREIGN KEY (`allocated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inquiries_ibfk_7` FOREIGN KEY (`inquiry_type_id`) REFERENCES `inquiry_types` (`id`),
  CONSTRAINT `inquiries_ibfk_8` FOREIGN KEY (`type_id`) REFERENCES `inquiry_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inquiries_chk_1` CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inquiries`
--

LOCK TABLES `inquiries` WRITE;
/*!40000 ALTER TABLE `inquiries` DISABLE KEYS */;
INSERT INTO `inquiries` VALUES ('443c8165-2ceb-4f74-905f-a6a55362e593','sfb','sdb@gmail.com','7878787878','zdbv','Warehouse Availability Inquiry','aev','sedadf','adg','/uploads/inquiries/1751554818664-83571520.tsx',1,'in_progress','Health & Pharmaceuticals','','Cold Storage','sdgv','1-3 months','2025-07-07 00:00:00',NULL,'',NULL,NULL,'[]','[]',NULL,'allocated','8147ad47-d847-4dd8-a16e-afd272d44dec','2025-07-09 03:57:05','4248df28-75d4-47a9-8c21-f95a496f64d2',NULL,NULL,'2025-07-03 15:00:18','2025-07-09 03:57:22',NULL);
/*!40000 ALTER TABLE `inquiries` ENABLE KEYS */;
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
