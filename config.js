module.exports = {
  TOKEN: process.env.TOKEN || "",
  language: "en",
  ownerID: [""],
  mongodbUri: process.env.MONGO_URI || "",
  spotifyClientId: "d92baed9605a45a39ed7c2a2d960b1c1",
  spotifyClientSecret: "e9b29f6739de4315bc03b6d8a8e93b03",
  setupFilePath: "./commands/setup.json",
  commandsDir: "./commands",
  embedColor: "#3ab4ca",
  activityName: "YouTube Music",
  activityType: "LISTENING", // Available activity types : LISTENING , PLAYING
  SupportServer: "https://discord.gg/xQF9f9yUEM",
  embedTimeout: 5,
  showProgressBar: false, // Show progress bar in track embed
  showVisualizer: false, // Show visualizer on music card (disabled for low-memory optimization)
  generateSongCard: true, // custom song card image, if false uses thumbnail
  // Performance optimizations for low-memory environments (512MB RAM)
  lowMemoryMode: true, // Enable optimizations for low-memory hosting
  errorLog: "",
  nodes: [
    {
      name: "Jirayu-Thailand (Priority)",
      host: "lavalink.jirayu.net",
      port: 443,
      password: "youshallnotpass",
      secure: true,
    },
    {
      name: "MilloHost-Indonesia",
      host: "lava-v4.millohost.my.id",
      port: 443,
      password: "https://discord.gg/mjS5J2K3ep",
      secure: true,
    },
    {
      name: "Serenetia-V4",
      host: "lavalinkv4.serenetia.com",
      port: 443,
      password: "https://seretia.link/discord",
      secure: true,
    },
    {
      name: "Trinium-Global",
      host: "lavalink-v4.triniumhost.com",
      port: 443,
      password: "free",
      secure: true,
    },
  ],
};
