// server/index.js
import express from "express";
import dictionary from "dictionary-es";
import nspell from "nspell";

const PORT = process.env.PORT || 3001;
const app = express();

const spell = nspell(dictionary);

app.get("/indict/:word", (req, res) => {
  const word = req.params.word;
  res.status(200).json({
    word: word,
    indict: spell.correct(word)
  });
});

app.get("/wordoftheday", (req, res) => {
  res.status(200).json({
    word: "credo",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});