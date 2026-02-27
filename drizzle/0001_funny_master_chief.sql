CREATE TABLE `agentMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`loopNumber` int NOT NULL,
	`strategyUsed` varchar(255) NOT NULL,
	`transactionsExecuted` int DEFAULT 0,
	`profitLoss` decimal(24,8),
	`gasUsed` decimal(24,8),
	`executionTime` int,
	`successRate` decimal(5,2),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agentMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`type` enum('paul','ralph') NOT NULL,
	`strategy` varchar(255) NOT NULL,
	`status` enum('running','paused','stopped','error') DEFAULT 'stopped',
	`publicKey` varchar(88) NOT NULL,
	`balance` decimal(24,8),
	`totalEarned` decimal(24,8) DEFAULT '0',
	`totalLost` decimal(24,8) DEFAULT '0',
	`winRate` decimal(5,2) DEFAULT '0',
	`lastLoopAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event` varchar(255) NOT NULL,
	`severity` enum('INFO','WARNING','ERROR','CRITICAL') DEFAULT 'INFO',
	`actor` varchar(88),
	`details` json,
	`s3Key` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `botSwarms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`swarmId` varchar(88) NOT NULL,
	`commander` varchar(88) NOT NULL,
	`botCount` int DEFAULT 5,
	`status` enum('active','paused','dormant') DEFAULT 'active',
	`totalMinted` decimal(24,8) DEFAULT '0',
	`totalLiquidity` decimal(24,8) DEFAULT '0',
	`lastExpansion` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `botSwarms_id` PRIMARY KEY(`id`),
	CONSTRAINT `botSwarms_swarmId_unique` UNIQUE(`swarmId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`type` enum('info','warning','error','success') DEFAULT 'info',
	`relatedProgram` varchar(88),
	`relatedVault` varchar(88),
	`relatedAgent` varchar(64),
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolioHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`totalValue` decimal(24,8),
	`totalYield` decimal(24,8),
	`vaultPositions` json,
	`agentBalances` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portfolioHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `programUpgrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` varchar(88) NOT NULL,
	`fromVersion` varchar(64) NOT NULL,
	`toVersion` varchar(64) NOT NULL,
	`transactionSignature` varchar(128),
	`status` enum('proposed','approved','deployed','failed') DEFAULT 'proposed',
	`reason` text,
	`deployedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `programUpgrades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` varchar(88) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`owner` varchar(88) NOT NULL,
	`currentVersion` varchar(64),
	`latestVersion` varchar(64),
	`bytecodeHash` varchar(128),
	`status` enum('active','inactive','deprecated','needs_upgrade') DEFAULT 'active',
	`isVerified` boolean DEFAULT false,
	`lastScanned` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `programs_id` PRIMARY KEY(`id`),
	CONSTRAINT `programs_programId_unique` UNIQUE(`programId`)
);
--> statement-breakpoint
CREATE TABLE `swarmBots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`swarmId` varchar(88) NOT NULL,
	`botIndex` int NOT NULL,
	`botAddress` varchar(88) NOT NULL,
	`role` varchar(64) NOT NULL,
	`status` enum('active','idle','error') DEFAULT 'idle',
	`lastAction` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `swarmBots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`signature` varchar(128) NOT NULL,
	`type` varchar(64) NOT NULL,
	`initiator` varchar(88),
	`relatedProgram` varchar(88),
	`relatedVault` varchar(88),
	`relatedAgent` varchar(64),
	`amount` decimal(24,8),
	`fee` decimal(24,8),
	`status` enum('pending','confirmed','failed') DEFAULT 'pending',
	`blockTime` bigint,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_signature_unique` UNIQUE(`signature`)
);
--> statement-breakpoint
CREATE TABLE `vaults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vaultId` varchar(88) NOT NULL,
	`owner` varchar(88) NOT NULL,
	`vaultType` enum('earn','borrow') NOT NULL,
	`collateralMint` varchar(88),
	`collateralAmount` decimal(24,8),
	`debtMint` varchar(88),
	`debtAmount` decimal(24,8),
	`ltv` decimal(5,2),
	`healthRatio` decimal(10,4),
	`status` enum('active','liquidated','closed') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vaults_id` PRIMARY KEY(`id`),
	CONSTRAINT `vaults_vaultId_unique` UNIQUE(`vaultId`)
);
