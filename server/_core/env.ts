export const ENV = {
  // Core Manus
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  ownerName: process.env.OWNER_NAME ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  viteForgeApiUrl: process.env.VITE_FRONTEND_FORGE_API_URL ?? "",
  viteForgeApiKey: process.env.VITE_FRONTEND_FORGE_API_KEY ?? "",

  // Solana & Blockchain
  heliusApiKey: process.env.HELIUS_API_KEY ?? "",
  alchemyApiKey: process.env.ALCHEMY_API_KEY ?? "",
  solanaRpcUrl: process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com",

  // Wallet & Keys
  deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY ?? "",
  treasuryPubkey: process.env.TREASURY_PUBKEY ?? "",
  paulPrivateKey: process.env.PAUL_PRIVATE_KEY ?? "",
  ralphPrivateKey: process.env.RALPH_PRIVATE_KEY ?? "",

  // Jupiter Lend
  jupiterLendEarnProgram: process.env.JUPITER_LEND_EARN_PROGRAM ?? "",
  jupiterLendBorrowProgram: process.env.JUPITER_LEND_BORROW_PROGRAM ?? "",

  // Supabase Backend
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? "",

  // S3 Storage
  s3BucketName: process.env.S3_BUCKET_NAME ?? "",
  s3Region: process.env.S3_REGION ?? "",

  // Notifications (Optional)
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  emailServiceKey: process.env.EMAIL_SERVICE_KEY ?? "",

  // Alibaba Cloud
  alibabaDashscopeApiKey: process.env.ALIBABA_DASHSCOPE_API_KEY ?? "",
  alibabaAccessKeyId: process.env.ALIBABA_ACCESS_KEY_ID ?? "",
  alibabaAccessKeySecret: process.env.ALIBABA_ACCESS_KEY_SECRET ?? "",
};
