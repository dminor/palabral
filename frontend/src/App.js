import {useEffect, useRef, useState, React} from 'react';
import './App.css';

const Correct = 1;
const InWord = 2;
const NotInWord = 3;
const Guess = 4;

function Tile({ letter, rowState }) {
  let className;
  switch(rowState) {
    case Correct:
      className = "TileCorrect";
      break;
    case InWord:
      className = "TileInWord";
      break;
    case NotInWord:
      className = "TileNotInWord";
      break;
    case Guess:
      className = "Tile";
      break;
  }

  return <div className={ className }>{ letter }</div>;
}

function TileRow({ guesses, rowState }) {
  return <div className="TileRow">
    {[0, 1, 2, 3, 4].map((index) => (
      <Tile letter={ guesses[index] } rowState={ rowState[index] }/>
    ))}
  </div>;
}

function KeyboardButton({ letter, onClick, keyboardState }) {
  let letterState = keyboardState[letter] ?? Guess;
  let className;
  switch(letterState) {
    case Correct:
      className = "KeyboardButtonCorrect";
      break;
    case InWord:
      className = "KeyboardButtonInWord";
      break;
    case NotInWord:
      className = "KeyboardButtonNotInWord";
      break;
    case Guess:
      className = "KeyboardButton";
      break;
  }

  return <div className={ className } id={ letter } onClick={ onClick }>{ letter }</div>;
}

function App() {
  const [guesses, setGuesses] = useState(Array(6).fill(""));
  const [rowState, setRowState] = useState([
    Array(5).fill(Guess),
    Array(5).fill(Guess),
    Array(5).fill(Guess),
    Array(5).fill(Guess),
    Array(5).fill(Guess),
    Array(5).fill(Guess)
  ]);
  const [keyboardState, setKeyboardState] = useState({});
  let currentRow = useRef(0);

  const [word, setWord] = useState("");
  useEffect(() => {
    const req = new Request("/wordoftheday/");
    fetch(req)
      .then((res) => res.json())
      .then((result) => {
        setWord(result.word);
      });
  }, []);

  function handleClick(ev) {
    const current = currentRow.current;
    if (ev.target.id === "⌫") {
      const updatedGuesses = guesses.slice();
      if (updatedGuesses[current].length > 0) {
        updatedGuesses[current] = updatedGuesses[current].substring(0, updatedGuesses[current].length - 1);
        setGuesses(updatedGuesses);
      }
    } else if (ev.target.id === "↵") {
      const guess = guesses[current];
      if (guess.length === word.length) {
        const req = new Request(encodeURI("/indict/" + guess));
        fetch(req)
          .then((res) => res.json())
          .then((result) => {
            if (result.indict) {
              const updatedRow = rowState.slice();
              const updatedKeyboard = {...keyboardState};
              for (let i = 0; i < word.length; ++i) {
                let letter = word[i];
                if (guess[i] === letter) {
                  updatedRow[current][i] = Correct;
                  updatedKeyboard[letter] = Correct;
                } else if (word.indexOf(guess[i]) !== -1) {
                  updatedRow[current][i] = InWord;
                  if (updatedKeyboard[guess[i]] !== Correct) {
                    updatedKeyboard[guess[i]] = InWord;
                  }
                } else {
                  updatedRow[current][i] = NotInWord;
                  if (updatedKeyboard[guess[i]] !== Correct && updatedKeyboard[guess[i]] !== InWord) {
                    updatedKeyboard[guess[i]] = NotInWord;
                  }
                }
              }
              setKeyboardState(updatedKeyboard);
              setRowState(updatedRow);
              if (guess === word) {
                const messages = document.getElementById("messages");
                messages.textContent = "Has vencido!!";
              } else if (current < 5) {
                currentRow.current += 1;
              } else {
                const messages = document.getElementById("messages");
                messages.textContent = "Has perdido :(";
              }
            } else {
              const updatedGuesses = guesses.slice();
              updatedGuesses[current] = "";
              setGuesses(updatedGuesses);
              const messages = document.getElementById("messages");
              messages.textContent = "La palabra no está en el diccionario...";
              messages.style.visibilty = "visible";
              setTimeout(() => {
                messages.textContent = "";
              }, 1500);
            }
        });
      }
    } else if (guesses[current].length < 5) {
      const updatedGuesses = guesses.slice();
      updatedGuesses[current] += ev.target.id;
      setGuesses(updatedGuesses);
    }
  };

  return (
      <div className="Main">
        <div className="Header">Palabral</div>
        <div id="messages" className="Messages"/>
        <div className="Game">
          <div className="Tiles">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TileRow guesses={guesses[index]} rowState={ rowState[index] }/>
            ))}
          </div>
        </div>
        <div className="Keyboard">
          <div className="KeyboardRow">
            {["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((letter) => (
              <KeyboardButton letter={ letter } onClick={ handleClick } keyboardState={ keyboardState }/>
            ))}
          </div>
          <div className="KeyboardRow">
            {["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ"].map((letter) => (
              <KeyboardButton letter={ letter } onClick={ handleClick } keyboardState={ keyboardState }/>
            ))}
          </div>
          <div className="KeyboardRow">
            {["↵", "z", "x", "c", "v", "b", "n", "m", "⌫"].map((letter) => (
              <KeyboardButton letter={ letter } onClick={ handleClick } keyboardState={ keyboardState }/>
            ))}
          </div>
        </div>
      </div>
  );
}

export default App;
