const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();

const indexRouter = require("./routes/index");
const hostRouter = require("./routes/host")

// Serve static files from the "public" directory
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);

app.use("/", indexRouter);
app.use("/host", hostRouter)


app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port " + (process.env.PORT || 3000));
});
