const express = require("express");
const cors = require("cors");
const signRoutes = require("./routes/sign.routes");
const authRoutes = require("./routes/auth.routes");
const progressRoutes = require("./routes/progress.routes");
const adminRoutes = require("./routes/admin.routes");
const usersRoutes = require("./routes/users.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/sign", signRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", usersRoutes);

module.exports = app;
