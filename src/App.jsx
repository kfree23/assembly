import React from "react";
import './assembly.css';
import languages from './languages.js'
import { getFarewellText } from './utils.js';
import { randomWord } from "./utils.js";
import Confetti from 'react-confetti';
import clsx from "clsx";

export default function App() {

    // State
    const [currentWord, setCurrentWord] = React.useState(() => randomWord());
    const [guessedLetter, setGuessedLetter] = React.useState([]);

    // Derived values
    const numGuessesLeft = languages.length - 1
    const wrongGuessCount = guessedLetter.filter(letter => !currentWord.includes(letter)).length
    const isGameWon = Array.from(currentWord).every(letter => guessedLetter.includes(letter))
    const isGameLost = wrongGuessCount >= numGuessesLeft
    const isGameOver = isGameWon || isGameLost
    const lastGuessedLetter = guessedLetter[guessedLetter.length - 1]
    const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

    //Static values
    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    function handleLetter(letter) {
        setGuessedLetter(prevLetter =>
            prevLetter.includes(letter) ? prevLetter : [...prevLetter, letter])
    }

    function startNewGame() {
        setCurrentWord(randomWord())
        setGuessedLetter([])
    }

    const [windowSize, setWindowSize] = React.useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    React.useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const programmingLanguages = languages.map((language, index) => {
        return <div key={language.name}
            className={"language-card" + (wrongGuessCount > index ? " lost" : "")}
            style={{
                backgroundColor: language.backgroundColor,
                color: language.color
            }}
        >
            {language.name}
        </div>
    })

    const letterElements = Array.from(currentWord).map((letter, index) => {
        const shouldRevealLetter = isGameLost || guessedLetter.includes(letter)
        const letterClassName = clsx(
            isGameLost && !guessedLetter.includes(letter) && "missed-letter"
        )
        return <span key={index} className={letterClassName}>{shouldRevealLetter ? letter.toUpperCase() : ""}</span>
    })

    const alphabetElements = Array.from(alphabet).map((letter) => {

        const isGuessed = guessedLetter.includes(letter)
        const isCorrect = isGuessed && currentWord.includes(letter)
        const isWrong = isGuessed && !currentWord.includes(letter)
        const className = clsx({
            correct: isCorrect,
            wrong: isWrong
        })


        return <button key={letter} className={className}
            onClick={() => handleLetter(letter)}
            disabled={isGameOver}
            aria-disabled={guessedLetter.includes(letter)}
            aria-label={`Letter ${letter}`}
        >
            {letter.toUpperCase()}
        </button>
    })

    const gameStatusClass = clsx("game-status", {
        win: isGameWon,
        lost: isGameLost,
        farewell: !isGameOver && isLastGuessIncorrect
    })

    function renderGameStatus() {
        if (!isGameOver && isLastGuessIncorrect) {
            return <p className="farewell-message">{getFarewellText(languages[wrongGuessCount - 1].name)}</p>
        }

        if (isGameWon) {
            return <>
                <h2>You win!</h2>
                <p>Well done! 🎉</p>
            </>
        }
        if (isGameLost) {
            return <>
                <h2>Game over!</h2>
                <p>You lose! Better start learning Assembly 😭</p>
            </>
        }

        return null
    }

    return (
        <main>
            {isGameWon && <Confetti width={windowSize.width} height={windowSize.height} />}
            <header>
                <h1>Assembly: Endgame</h1>
                <p>Guess the word in under 8 attempts to keep the programming world safe from Assembly!</p>
            </header>

            <section
                aria-live="polite"
                role="status"
                className={gameStatusClass}
            >
                {renderGameStatus()}
            </section>

            <section>
                <div className="languages">
                    {programmingLanguages}
                </div>
            </section>

            <section className="word-style">
                {letterElements}
            </section>

            <section
                className="sr-only"
                aria-live="polite"
                role="status"
                >
                    <p>
                        {currentWord.includes(lastGuessedLetter) ? 
                            `Correct! The letter ${lastGuessedLetter} is in the word.` :
                            `Sorry, the ${lastGuessedLetter} is not in the word.`
                            }
                            You have {numGuessesLeft} attempts left
                    </p>
                    <p>Current word: {currentWord.split("").map(letter => 
                guessedLetter.includes(letter) ? letter + "." : "blank.")
                .join(" ")}</p>
            </section>

            <section className="keyboard">
                {alphabetElements}
            </section>
            {isGameOver && <button className="new-game" onClick={startNewGame}>New Game</button>}
        </main>
    )
}