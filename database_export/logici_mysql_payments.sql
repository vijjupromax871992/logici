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
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razorpay_order_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razorpay_payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpay_signature` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` int NOT NULL DEFAULT '100000',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `status` enum('created','attempted','paid','failed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'created',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_response` json DEFAULT NULL,
  `failure_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `booking_details` json NOT NULL,
  `receipt` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `razorpay_order_id` (`razorpay_order_id`),
  UNIQUE KEY `receipt` (`receipt`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_razorpay_payment_id` (`razorpay_payment_id`),
  KEY `payments_razorpay_order_id` (`razorpay_order_id`),
  KEY `payments_razorpay_payment_id` (`razorpay_payment_id`),
  KEY `payments_status` (`status`),
  KEY `payments_warehouse_id` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES ('01020e7c-14f5-4976-a6c8-8c4add34714a','order_QtAc4cV1R7BTOl',NULL,NULL,100000,'INR','created',NULL,NULL,NULL,'3adfe6ae-7160-4420-8147-799918890813',NULL,'Vijayshankar','vijayshankar871992@gmail.com','9967990037','{\"email\": \"vijayshankar871992@gmail.com\", \"message\": \"dvzxgfbcnhvmbj,n.\", \"fullName\": \"Vijayshankar\", \"companyName\": \"Logic - I\", \"phoneNumber\": \"9967990037\", \"warehouse_city\": \"Mumbai\", \"warehouse_name\": \"Adani Storage Solutions\", \"warehouse_address\": \"Bandra Kurla Complex, Mumbai\", \"preferredStartDate\": \"2025-07-23\", \"preferredContactTime\": \"9 AM - 6 PM\", \"preferredContactMethod\": \"Email\"}','booking_1752544734711_0npvumktl','2025-07-15 01:58:54','2025-07-15 01:58:54'),('2d590231-daee-40ad-b4a2-423a0317e677','order_Qt9zr5waZssYUa',NULL,NULL,100000,'INR','created',NULL,NULL,NULL,'e5e7ae56-9ad2-4de6-a1d6-3f5c135e8874',NULL,'Vijayshankar','vijayshankar871992@gmail.com','9967990037','{\"email\": \"vijayshankar871992@gmail.com\", \"message\": \"cdvzx sae gsaeg\", \"fullName\": \"Vijayshankar\", \"companyName\": \"Logic - I\", \"phoneNumber\": \"9967990037\", \"warehouse_city\": \"Kalyan-Dombivli\", \"warehouse_name\": \"12,Venkatesh chhaya CHS Ltd,Dr. Rajendra Prasad Road,Ramnagar.\", \"warehouse_address\": \"12,Venkatesh chhaya CHS Ltd,Dr. Rajendra Prasad Road,Ramnagar.\\r\\nNear shiv mandir,opposite to girnar shop,Dombivli East.\", \"preferredStartDate\": \"2025-07-24\", \"preferredContactTime\": \"9 AM - 6 PM\", \"preferredContactMethod\": \"Email\"}','booking_1752542563261_k94tbrlh7','2025-07-15 01:22:44','2025-07-15 01:22:44'),('65d00c72-a8e8-447d-a0a4-ae88c0807671','order_QtAPjpGM4gZOXw',NULL,NULL,100000,'INR','created',NULL,NULL,NULL,'e5e7ae56-9ad2-4de6-a1d6-3f5c135e8874',NULL,'Vijayshankar','vijayshankar871992@gmail.com','9967990037','{\"email\": \"vijayshankar871992@gmail.com\", \"message\": \"SZ X\", \"fullName\": \"Vijayshankar\", \"companyName\": \"Logic - I\", \"phoneNumber\": \"9967990037\", \"warehouse_city\": \"Kalyan-Dombivli\", \"warehouse_name\": \"12,Venkatesh chhaya CHS Ltd,Dr. Rajendra Prasad Road,Ramnagar.\", \"warehouse_address\": \"12,Venkatesh chhaya CHS Ltd,Dr. Rajendra Prasad Road,Ramnagar.\\r\\nNear shiv mandir,opposite to girnar shop,Dombivli East.\", \"preferredStartDate\": \"2025-07-24\", \"preferredContactTime\": \"9 AM - 6 PM\", \"preferredContactMethod\": \"Email\"}','booking_1752544033354_g1up0qepb','2025-07-15 01:47:14','2025-07-15 01:47:14'),('7365a56a-a43c-4fd1-8a56-fd177b84eecb','order_QtEn80mWHrnUzh',NULL,NULL,100000,'INR','created',NULL,NULL,NULL,'3adfe6ae-7160-4420-8147-799918890813',NULL,'Vijayshankar','vijayshankar871992@gmail.com','9967990037','{\"email\": \"vijayshankar871992@gmail.com\", \"message\": \"New try at 11:34am\", \"fullName\": \"Vijayshankar\", \"companyName\": \"Logic - I\", \"phoneNumber\": \"9967990037\", \"warehouse_city\": \"Mumbai\", \"warehouse_name\": \"Adani Storage Solutions\", \"warehouse_address\": \"Bandra Kurla Complex, Mumbai\", \"preferredStartDate\": \"2025-07-31\", \"preferredContactTime\": \"9 AM - 6 PM\", \"preferredContactMethod\": \"Email\"}','booking_1752559447941_mn1nim7yo','2025-07-15 06:04:09','2025-07-15 06:04:09'),('7a1c0ad0-48b1-4e49-a0d8-5240ae2ffb71','order_QtAbIDVb3vbaV1',NULL,NULL,100000,'INR','created',NULL,NULL,NULL,'3adfe6ae-7160-4420-8147-799918890813',NULL,'Vijayshankar','vijayshankar871992@gmail.com','9967990037','{\"email\": \"vijayshankar871992@gmail.com\", \"message\": \"dvzxgfbcnhvmbj,n.\", \"fullName\": \"Vijayshankar\", \"companyName\": \"Logic - I\", \"phoneNumber\": \"9967990037\", \"warehouse_city\": \"Mumbai\", \"warehouse_name\": \"Adani Storage Solutions\", \"warehouse_address\": \"Bandra Kurla Complex, Mumbai\", \"preferredStartDate\": \"2025-07-23\", \"preferredContactTime\": \"9 AM - 6 PM\", \"preferredContactMethod\": \"Email\"}','booking_1752544690340_ybmk9i14q','2025-07-15 01:58:10','2025-07-15 01:58:10'),('8d3845f4-83db-473c-8bc2-9045b37bebd8','order_QtBAU4nrCbDibg',NULL,NULL,100000,'INR','created',NULL,NULL,NULL,'3adfe6ae-7160-4420-8147-799918890813',NULL,'Vijayshankar','vijayshankar871992@gmail.com','9967990037','{\"email\": \"vijayshankar871992@gmail.com\", \"message\": \"new try at 8:01 am\", \"fullName\": \"Vijayshankar\", \"companyName\": \"Logic - I\", \"phoneNumber\": \"9967990037\", \"warehouse_city\": \"Mumbai\", \"warehouse_name\": \"Adani Storage Solutions\", \"warehouse_address\": \"Bandra Kurla Complex, Mumbai\", \"preferredStartDate\": \"2025-07-31\", \"preferredContactTime\": \"9 AM - 6 PM\", \"preferredContactMethod\": \"Email\"}','booking_1752546688470_8rv05fis8','2025-07-15 02:31:29','2025-07-15 02:31:29'),('9c48aed1-abab-4bdd-87f4-21690b4be8ed','order_QtF6ANF9ki1bMv',NULL,NULL,100000,'INR','created',NULL,NULL,NULL,'3adfe6ae-7160-4420-8147-799918890813',NULL,'Vijayshankar','vijayshankar871992@gmail.com','9967990037','{\"email\": \"vijayshankar871992@gmail.com\", \"message\": \"dd\", \"fullName\": \"Vijayshankar\", \"companyName\": \"Vijay G\", \"phoneNumber\": \"9967990037\", \"warehouse_city\": \"Mumbai\", \"warehouse_name\": \"Adani Storage Solutions\", \"warehouse_address\": \"Bandra Kurla Complex, Mumbai\", \"preferredStartDate\": \"2025-07-15\", \"preferredContactTime\": \"9 AM - 6 PM\", \"preferredContactMethod\": \"Email\"}','booking_1752560529549_jkr473nt7','2025-07-15 06:22:10','2025-07-15 06:22:10'),('d764a578-66c4-4a5b-a233-cb138d35bd61','order_QtEtpma7W74Yqx',NULL,NULL,100000,'INR','created',NULL,NULL,NULL,'e5e7ae56-9ad2-4de6-a1d6-3f5c135e8874',NULL,'Vijayshankar','vijayshankar871992@gmail.com','9967990037','{\"email\": \"vijayshankar871992@gmail.com\", \"message\": \"New try at 11:40\", \"fullName\": \"Vijayshankar\", \"companyName\": \"Vijay G\", \"phoneNumber\": \"9967990037\", \"warehouse_city\": \"Kalyan-Dombivli\", \"warehouse_name\": \"12,Venkatesh chhaya CHS Ltd,Dr. Rajendra Prasad Road,Ramnagar.\", \"warehouse_address\": \"12,Venkatesh chhaya CHS Ltd,Dr. Rajendra Prasad Road,Ramnagar.\\r\\nNear shiv mandir,opposite to girnar shop,Dombivli East.\", \"preferredStartDate\": \"2025-07-31\", \"preferredContactTime\": \"9 AM - 6 PM\", \"preferredContactMethod\": \"Email\"}','booking_1752559829842_j0y8x1vvl','2025-07-15 06:10:30','2025-07-15 06:10:30'),('e0e260fb-2e13-4f87-bade-c964572ab9dd','order_QtAQ721GBpbY0b',NULL,NULL,100000,'INR','created',NULL,NULL,NULL,'e5e7ae56-9ad2-4de6-a1d6-3f5c135e8874',NULL,'Vijayshankar','vijayshankar871992@gmail.com','9967990037','{\"email\": \"vijayshankar871992@gmail.com\", \"message\": \"SZ X\", \"fullName\": \"Vijayshankar\", \"companyName\": \"Logic - I\", \"phoneNumber\": \"9967990037\", \"warehouse_city\": \"Kalyan-Dombivli\", \"warehouse_name\": \"12,Venkatesh chhaya CHS Ltd,Dr. Rajendra Prasad Road,Ramnagar.\", \"warehouse_address\": \"12,Venkatesh chhaya CHS Ltd,Dr. Rajendra Prasad Road,Ramnagar.\\r\\nNear shiv mandir,opposite to girnar shop,Dombivli East.\", \"preferredStartDate\": \"2025-07-24\", \"preferredContactTime\": \"9 AM - 6 PM\", \"preferredContactMethod\": \"Email\"}','booking_1752544055302_37s617w36','2025-07-15 01:47:35','2025-07-15 01:47:35');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
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
