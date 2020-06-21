require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const MOVIES = require("./movies-data-small.json");

const app = express();
const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "dev";

app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  // move to the next middleware
  next();
});

/* API CALL ??? */

app.get("/movie", (req, res) => {
  let movies = [...MOVIES];

  if (req.query.genre) {
    movies = movies.filter((movie) => movie.genre.includes(req.query.genre));
  }

  if (req.query.country) {
    movies = movies.filter((movie) =>
      movie.country.includes(req.query.country)
    );
  }

  if (req.query.avg_vote) {
    movies = movies.filter(
      (movie) => Number(movie.avg_vote) >= Number(req.query.avg_vote)
    );
  }

  res.json(movies);
});

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "Server Error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
