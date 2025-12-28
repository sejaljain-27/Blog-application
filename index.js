
import express from "express";
import bodyParser from "body-parser";
import session from "express-session";

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "blog-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Make user available in all EJS files
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.set("view engine", "ejs");

// In-memory storage
let posts = [];
let users = [];
let postId = 1;

/* ================= ROUTES ================= */

// Home
app.get("/", (req, res) => {
  res.render("index", { posts });
});

// ---------- AUTH ----------

// Signup page
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Signup logic
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.render("signup", { error: "User already exists" });
  }

  users.push({ username, password });
  req.session.user = { username };
  res.redirect("/");
});

// Login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Login logic
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.render("login", { error: "Invalid credentials" });
  }

  req.session.user = { username };
  res.redirect("/");
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// ---------- POSTS ----------

// New post page
app.get("/new", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("new");
});

// Create post
app.post("/new", (req, res) => {
  posts.push({
    id: postId++,
    title: req.body.title,
    content: req.body.content,
    author: req.session.user.username,
  });
  res.redirect("/");
});

// Edit post
app.get("/edit/:id", (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  res.render("edit", { post });
});

// Update post
app.post("/edit/:id", (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  post.title = req.body.title;
  post.content = req.body.content;
  res.redirect("/");
});

// Delete post
app.post("/delete/:id", (req, res) => {
  posts = posts.filter(p => p.id != req.params.id);
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
