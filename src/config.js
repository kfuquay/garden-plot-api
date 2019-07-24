module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
}

module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || "development",
    DB_URL:
      process.env.DATABASE_URL ||
      "postgresql://dunder:dunder@localhost/garden",
    JWT_SECRET: process.env.JWT_SECRET || "change-this-secret",
    JWT_EXPIRTY: process.env.JWT_EXPIRTY || "5h",
    // CLIENT_ORIGIN: "https://garden-plot.now.sh",
    CLIENT_ORIGIN: "http://localhost:3000"
  };
  