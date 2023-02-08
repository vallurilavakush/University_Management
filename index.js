const express = require("express");
var api = require("./Api");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
const PORT = process.env.PORT || 4040;

app.set("view engine", "ejs");
app.listen(PORT, () => console.log(`server on port ${PORT}`));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/views", express.static(path.join(__dirname, "views")));
app.use(cache);

function cache(request, response, next) {
  response.header(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate"
  );
  response.header("Expires", "-1");
  response.header("Pragma", "no-cache");
  next();
}

function auth(request, response, next) {
  if (request.session.loggedin) {
    next();
  } else {
    response.redirect("/");
  }
}

function noauth(request, response, next) {
  if (!request.session.loggedin) {
    next();
  } else {
    response.redirect("/Dashboard");
  }
}

app.get("/", noauth, function (request, response) {
  response.render("login");
});

app.post("/auth", function (request, response) {
  api.auth(request, response);
});

app.post("/register", function (request, response) {
  api.register(request, response);
});

app.get("/registration", function (request, response) {
  response.render("register");
});

app.get("/Dashboard", auth, function (request, response) {
  if (api.user.loginType == "Student") {
    api.Dashboard(request, response);
  } else {
    response.redirect("/FDashboard");
  }
});

app.get("/logout", auth, function (request, response) {
  request.session.loggedin = false;
  response.redirect("/");
});

app.get("/Profile", auth, function (request, response) {
  api.profile(request, response);
});

app.get("/Internship", auth, function (request, response) {
  api.Internship(request, response);
});

app.get("/LoanDetails", auth, function (request, response) {
  api.LoanDetails(request, response);
});

app.get("/Queries", auth, function (request, response) {
  api.Queries(request, response);
});

app.post("/AddQuestion", auth, function (request, response) {
  api.AddQuestion(request, response);
});

app.post("/AddAnswer", auth, function (request, response) {
  api.AddAnswer(request, response);
});

app.get("/FDashboard", auth, function (request, response) {
  api.FDashboard(request, response);
});
