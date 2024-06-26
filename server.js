const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();

const indexRouter = require("./routes/index");
const hostRouter = require("./routes/host")
const playRouter = require("./routes/play.js")

// Serve static files from the "public" directory
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);

app.use("/", indexRouter);
app.use("/host", hostRouter)
app.use("/play", playRouter)


app.listen(process.env.PORT || 80, () => {
  console.log("Server is running on port " + (process.env.PORT || 80));
});
