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
-- Table structure for table `confirmed_bookings`
--

DROP TABLE IF EXISTS `confirmed_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `confirmed_bookings` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phoneNumber` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `companyName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferredContactMethod` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferredContactTime` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferredStartDate` date NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `status` enum('confirmed','active','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'confirmed',
  `amount_paid` int NOT NULL,
  `payment_date` timestamp NOT NULL,
  `warehouse_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `booking_metadata` json DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_number` (`booking_number`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_owner_id` (`owner_id`),
  KEY `idx_payment_id` (`payment_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `confirmed_bookings_booking_number` (`booking_number`),
  KEY `confirmed_bookings_warehouse_id` (`warehouse_id`),
  KEY `confirmed_bookings_owner_id` (`owner_id`),
  KEY `confirmed_bookings_payment_id` (`payment_id`),
  KEY `confirmed_bookings_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `confirmed_bookings`
--

LOCK TABLES `confirmed_bookings` WRITE;
/*!40000 ALTER TABLE `confirmed_bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `confirmed_bookings` ENABLE KEYS */;
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
