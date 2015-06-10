-- phpMyAdmin SQL Dump
-- version 4.4.7
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 22, 2015 at 06:16 AM
-- Server version: 5.6.24
-- PHP Version: 5.5.9-1ubuntu4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `bdicdm`
--
CREATE DATABASE IF NOT EXISTS `bdicdm` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `bdicdm`;

-- --------------------------------------------------------

--
-- Table structure for table `cartao`
--

CREATE TABLE `cartao` (
  `car_id` int(11) NOT NULL,
  `car_band` char(35) NOT NULL,
  `car_num` char(16) NOT NULL,
  `car_valid_mes` char(2) NOT NULL,
  `car_valid_ano` char(4) NOT NULL,
  `car_nm` char(35) NOT NULL,
  `car_cli_cod` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `categoria`
--

CREATE TABLE `categoria` (
  `cat_id` int(11) NOT NULL,
  `cat_nm` char(35) NOT NULL,
  `cat_ds` char(35) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `cidade`
--

CREATE TABLE `cidade` (
  `cid_id` int(11) NOT NULL,
  `cid_nm` char(35) NOT NULL,
  `cid_est_cod` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `cliente`
--

CREATE TABLE `cliente` (
  `cli_id` int(11) NOT NULL,
  `cli_loc_cod` int(11) DEFAULT NULL,
  `cli_first` char(35) NOT NULL,
  `cli_middle` char(35) DEFAULT NULL,
  `cli_last` char(35) NOT NULL,
  `cli_cpf` char(11) NOT NULL,
  `cli_gender` enum('M','F') NOT NULL,
  `cli_mail` char(50) NOT NULL,
  `cli_dt_nasc` date NOT NULL,
  `cli_rg` char(11) NOT NULL,
  `cli_renda` decimal(9,2) NOT NULL,
  `cli_usr_login` char(35) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `estado`
--

CREATE TABLE `estado` (
  `est_id` int(11) NOT NULL,
  `est_nm` char(35) NOT NULL,
  `est_ab` char(2) NOT NULL,
  `est_pais_cod` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `fone`
--

CREATE TABLE `fone` (
  `fon_id` int(11) NOT NULL DEFAULT '0',
  `fon_cli_cod` int(11) DEFAULT NULL,
  `fon_num` char(12) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `histpreco`
--

CREATE TABLE `histpreco` (
  `his_id` int(11) NOT NULL,
  `his_pro_cod` int(11) DEFAULT NULL,
  `his_dt` datetime DEFAULT NULL,
  `his_vl` decimal(9,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `localidade`
--

CREATE TABLE `localidade` (
  `loc_id` int(11) NOT NULL,
  `loc_end` char(50) NOT NULL,
  `loc_num` char(10) NOT NULL,
  `loc_cid_cod` int(11) DEFAULT NULL,
  `loc_com` char(35) DEFAULT NULL,
  `loc_cep` char(8) NOT NULL,
  `loc_lot_cod` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `localidadetipo`
--

CREATE TABLE `localidadetipo` (
  `lot_id` int(11) NOT NULL,
  `lot_ds` char(35) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `pais`
--

CREATE TABLE `pais` (
  `pais_id` int(11) NOT NULL,
  `pais_nm` char(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `produto`
--

CREATE TABLE `produto` (
  `pro_id` int(11) NOT NULL,
  `pro_nm` char(120) NOT NULL,
  `pro_ds` char(35) DEFAULT NULL,
  `pro_vl` decimal(9,2) NOT NULL,
  `pro_cat_cod` int(11) DEFAULT NULL,
  `pro_img` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `status`
--

CREATE TABLE `status` (
  `sta_id` int(11) NOT NULL,
  `sta_ds` char(35) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tipovenda`
--

CREATE TABLE `tipovenda` (
  `tip_id` int(11) NOT NULL,
  `tip_ven` char(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `usr_login` char(35) NOT NULL,
  `usr_pwd` char(8) NOT NULL,
  `usr_token` char(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `venda`
--

CREATE TABLE `venda` (
  `ven_id` int(11) NOT NULL,
  `ven_cli_cod` int(11) DEFAULT NULL,
  `ven_dt` datetime NOT NULL,
  `ven_tip_cod` int(11) DEFAULT NULL,
  `ven_car_cod` int(11) DEFAULT NULL,
  `ven_tra_cod` char(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `vendaproduto`
--

CREATE TABLE `vendaproduto` (
  `vpr_id` int(11) NOT NULL,
  `vpr_ven_cod` int(11) DEFAULT NULL,
  `vpr_pro_cod` int(11) DEFAULT NULL,
  `vpr_vl` decimal(9,2) NOT NULL,
  `vpr_qt` char(35) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cartao`
--
ALTER TABLE `cartao`
  ADD PRIMARY KEY (`car_id`),
  ADD KEY `FK_car_cli_cod` (`car_cli_cod`);

--
-- Indexes for table `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`cat_id`);

--
-- Indexes for table `cidade`
--
ALTER TABLE `cidade`
  ADD PRIMARY KEY (`cid_id`),
  ADD KEY `FK_cid_est_cod` (`cid_est_cod`);

--
-- Indexes for table `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`cli_id`),
  ADD KEY `FK_cli_usr_login` (`cli_usr_login`),
  ADD KEY `FK_cli_loc_cod` (`cli_loc_cod`);

--
-- Indexes for table `estado`
--
ALTER TABLE `estado`
  ADD PRIMARY KEY (`est_id`),
  ADD KEY `FK_est_pais_cod` (`est_pais_cod`);

--
-- Indexes for table `fone`
--
ALTER TABLE `fone`
  ADD PRIMARY KEY (`fon_id`),
  ADD KEY `FK_fone_cli_cod` (`fon_cli_cod`);

--
-- Indexes for table `histpreco`
--
ALTER TABLE `histpreco`
  ADD PRIMARY KEY (`his_id`),
  ADD KEY `FK_his_pro_cod` (`his_pro_cod`);

--
-- Indexes for table `localidade`
--
ALTER TABLE `localidade`
  ADD PRIMARY KEY (`loc_id`),
  ADD KEY `FK_loc_cid_cod` (`loc_cid_cod`),
  ADD KEY `FK_loc_lot_cod` (`loc_lot_cod`);

--
-- Indexes for table `localidadetipo`
--
ALTER TABLE `localidadetipo`
  ADD PRIMARY KEY (`lot_id`);

--
-- Indexes for table `pais`
--
ALTER TABLE `pais`
  ADD PRIMARY KEY (`pais_id`);

--
-- Indexes for table `produto`
--
ALTER TABLE `produto`
  ADD PRIMARY KEY (`pro_id`),
  ADD KEY `FK_pro_cat_cod` (`pro_cat_cod`);

--
-- Indexes for table `status`
--
ALTER TABLE `status`
  ADD PRIMARY KEY (`sta_id`);

--
-- Indexes for table `tipovenda`
--
ALTER TABLE `tipovenda`
  ADD PRIMARY KEY (`tip_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`usr_login`);

--
-- Indexes for table `venda`
--
ALTER TABLE `venda`
  ADD PRIMARY KEY (`ven_id`),
  ADD KEY `FK_ven_cli_cod` (`ven_cli_cod`),
  ADD KEY `FK_ven_tip_cod` (`ven_tip_cod`),
  ADD KEY `FK_ven_car_cod` (`ven_car_cod`);

--
-- Indexes for table `vendaproduto`
--
ALTER TABLE `vendaproduto`
  ADD PRIMARY KEY (`vpr_id`),
  ADD KEY `FK_vpr_pro_cod` (`vpr_pro_cod`),
  ADD KEY `FK_vpr_ven_cod` (`vpr_ven_cod`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cartao`
--
ALTER TABLE `cartao`
  MODIFY `car_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `cliente`
--
ALTER TABLE `cliente`
  MODIFY `cli_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `histpreco`
--
ALTER TABLE `histpreco`
  MODIFY `his_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `status`
--
ALTER TABLE `status`
  MODIFY `sta_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `cartao`
--
ALTER TABLE `cartao`
  ADD CONSTRAINT `FK_car_cli_cod` FOREIGN KEY (`car_cli_cod`) REFERENCES `cliente` (`cli_id`);

--
-- Constraints for table `cidade`
--
ALTER TABLE `cidade`
  ADD CONSTRAINT `FK_cid_est_cod` FOREIGN KEY (`cid_est_cod`) REFERENCES `estado` (`est_id`);

--
-- Constraints for table `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `FK_cli_loc_cod` FOREIGN KEY (`cli_loc_cod`) REFERENCES `localidade` (`loc_id`),
  ADD CONSTRAINT `FK_cli_usr_login` FOREIGN KEY (`cli_usr_login`) REFERENCES `user` (`usr_login`);

--
-- Constraints for table `estado`
--
ALTER TABLE `estado`
  ADD CONSTRAINT `FK_est_pais_cod` FOREIGN KEY (`est_pais_cod`) REFERENCES `pais` (`pais_id`);

--
-- Constraints for table `fone`
--
ALTER TABLE `fone`
  ADD CONSTRAINT `FK_fone_cli_cod` FOREIGN KEY (`fon_cli_cod`) REFERENCES `cliente` (`cli_id`);

--
-- Constraints for table `histpreco`
--
ALTER TABLE `histpreco`
  ADD CONSTRAINT `FK_his_pro_cod` FOREIGN KEY (`his_pro_cod`) REFERENCES `produto` (`pro_id`);

--
-- Constraints for table `localidade`
--
ALTER TABLE `localidade`
  ADD CONSTRAINT `FK_loc_cid_cod` FOREIGN KEY (`loc_cid_cod`) REFERENCES `cidade` (`cid_id`),
  ADD CONSTRAINT `FK_loc_lot_cod` FOREIGN KEY (`loc_lot_cod`) REFERENCES `localidadetipo` (`lot_id`);

--
-- Constraints for table `produto`
--
ALTER TABLE `produto`
  ADD CONSTRAINT `FK_pro_cat_cod` FOREIGN KEY (`pro_cat_cod`) REFERENCES `categoria` (`cat_id`);

--
-- Constraints for table `venda`
--
ALTER TABLE `venda`
  ADD CONSTRAINT `FK_ven_car_cod` FOREIGN KEY (`ven_car_cod`) REFERENCES `cartao` (`car_id`),
  ADD CONSTRAINT `FK_ven_cli_cod` FOREIGN KEY (`ven_cli_cod`) REFERENCES `cliente` (`cli_id`),
  ADD CONSTRAINT `FK_ven_tip_cod` FOREIGN KEY (`ven_tip_cod`) REFERENCES `tipovenda` (`tip_id`);

--
-- Constraints for table `vendaproduto`
--
ALTER TABLE `vendaproduto`
  ADD CONSTRAINT `FK_vpr_pro_cod` FOREIGN KEY (`vpr_pro_cod`) REFERENCES `produto` (`pro_id`),
  ADD CONSTRAINT `FK_vpr_ven_cod` FOREIGN KEY (`vpr_ven_cod`) REFERENCES `venda` (`ven_id`);
