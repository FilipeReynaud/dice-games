import * as vars from "./variables";
import { randomDiceThrow } from "../../index";

export default class Game {
	constructor() {
		this.scores = Array.from({ length: vars.NUMBER_OF_PLAYERS }, () => 100);
		this.mode = 0;
		this.bet = vars.BETS[this.mode].min;
		this.playerNr = 2;
		this.dieNr = 1;
		this.oddEvenMode = 0;

		this.addPlayerColors();
		this.placeEventListeners();
		this.updateScoreBoard();
		this.changeMode(this.mode);
		this.updateBet(0);
		this.updateGameConfigs();
	}

	addPlayerColors() {
		vars.colors.forEach((color, id) => {
			let el = document.getElementById(`player-${id + 1}-legend`);
			el.style.backgroundColor = color;
		});
	}

	placeEventListeners() {
		// Listen to changes regarding the game modes
		for (let i = 0; i < 3; i++) {
			const gameMode = document.getElementById(`game-btn-${i + 1}`);
			gameMode.addEventListener("click", (event) => {
				this.changeMode(i);
			});
		}

		// Listen for changes about the bet
		const decreaseBetBtn = document.getElementById("decrease-bet");
		decreaseBetBtn.addEventListener("click", (event) => {
			this.updateBet(-5);
		});
		const increaseBetBtn = document.getElementById("increase-bet");
		increaseBetBtn.addEventListener("click", (event) => {
			this.updateBet(5);
		});

		// Listen for changes about game configurations
		const decreasePlayerNr = document.getElementById("decrease-player-nr");
		decreasePlayerNr.addEventListener("click", (event) => {
			this.updatePlayerNr(-1);
		});
		const increasePlayerNr = document.getElementById("increase-player-nr");
		increasePlayerNr.addEventListener("click", (event) => {
			this.updatePlayerNr(1);
		});
		for (let i = 0; i < 2; i++) {
			const gameMode = document.getElementById(`odd-even-btn-${i + 1}`);
			gameMode.addEventListener("click", (event) => {
				this.oddEvenMode = i;
			});
		}

		const decreaseDieNr = document.getElementById("decrease-die-nr");
		decreaseDieNr.addEventListener("click", (event) => {
			this.updateDieNr(-1);
		});
		const increaseDieNr = document.getElementById("increase-die-nr");
		increaseDieNr.addEventListener("click", (event) => {
			this.updateDieNr(1);
		});

		const decreaseSum = document.getElementById("decrease-sum");
		decreaseSum.addEventListener("click", (event) => {
			this.updateSum(-1);
		});
		const increaseSum = document.getElementById("increase-sum");
		increaseSum.addEventListener("click", (event) => {
			this.updateSum(1);
		});

		const playBtn = document.getElementById("play-button");
		playBtn.addEventListener("click", (event) => {
			this.play();
		});

		const placeBetBtn = document.getElementById("place-bet-btn");
		placeBetBtn.addEventListener("click", (event) => {
			if (placeBetBtn.innerHTML === "Reload to play again") {
				location.reload();
			}
		});
	}

	updateScoreBoard() {
		this.scores.forEach((score, player) => {
			this.updateHtmlText(
				`player-${player + 1}-score`,
				score ? score : "OUT"
			);
		});
	}

	changeMode(newMode) {
		this.mode = newMode;

		let instructionEl = document.getElementById("game-instructions");
		instructionEl.innerText = vars.GAME_DESCRIPTIONS[this.mode];

		this.updateBet(0, true);
		this.updateGameConfigs();
		this.updatePlayerNr(0, true);
		this.updateDieNr(0, true);
		this.updateSum(0, true);
	}

	updateBet(parcel, reset) {
		const minBet = vars.BETS[this.mode].min;
		const maxBet = vars.BETS[this.mode].max;

		if (reset) {
			this.updateHtmlText(
				"min-max-bet-span",
				`Min: ${minBet} | Max: ${maxBet}`
			);
			this.updateHtmlText("bet", minBet);
			this.bet = minBet;
		} else {
			const temporaryBet = this.bet + parcel;
			if (
				minBet <= temporaryBet &&
				temporaryBet <= maxBet &&
				temporaryBet <= this.scores[0]
			) {
				this.updateHtmlText("bet", temporaryBet);
				this.bet = temporaryBet;
			}
		}
	}

	updateGameConfigs() {
		Object.keys(vars.GAME_CONFIGS).forEach((key, index) => {
			let gameModeConfig = document.getElementById(
				vars.GAME_CONFIGS[key]
			);
			if (gameModeConfig) {
				if (index === this.mode) {
					gameModeConfig.style.position = "relative";
					gameModeConfig.style.zIndex = "unset";
				} else {
					gameModeConfig.style.position = "absolute";
					gameModeConfig.style.zIndex = -9999;
				}
			}
		});
	}

	updatePlayerNr(parcel, reset) {
		const minPlayer = 2;
		const maxPlayer = 5;

		if (reset) {
			this.updateHtmlText("player-number", minPlayer);
			this.playerNr = minPlayer;
		} else {
			const temporaryPlayerNr = this.playerNr + parcel;
			if (
				minPlayer <= temporaryPlayerNr &&
				temporaryPlayerNr <= maxPlayer
			) {
				this.updateHtmlText("player-number", temporaryPlayerNr);
				this.playerNr = temporaryPlayerNr;
			}
		}
	}

	updateDieNr(parcel, reset) {
		const minDieNr = 1;
		const maxDieNr = 6;

		if (reset) {
			this.updateHtmlText("die-number", minDieNr);
			this.dieNr = minDieNr;
		} else {
			const temporaryDieNr = this.dieNr + parcel;
			if (minDieNr <= temporaryDieNr && temporaryDieNr <= maxDieNr) {
				this.updateHtmlText("die-number", temporaryDieNr);
				this.dieNr = temporaryDieNr;
			}
		}
	}

	updateSum(parcel, reset) {
		const minSum = vars.NUMBER_OF_PLAYERS;
		const maxSum = 6 * vars.NUMBER_OF_PLAYERS;

		if (reset) {
			this.updateHtmlText("sum", minSum);
			this.sum = minSum;
		} else {
			const temporarySum = this.sum + parcel;
			if (minSum <= temporarySum && temporarySum <= maxSum) {
				this.updateHtmlText("sum", temporarySum);
				this.sum = temporarySum;
			}
		}
	}

	updateHtmlText(el, text) {
		let htmlEl = document.getElementById(el);
		htmlEl.innerText = text;
	}

	playOneRound() {
		const minBet = vars.BETS[this.mode].min;
		const plays = [];

		if (this.mode === 0) {
			// Play is going to be the remainder in modulus operation
			plays.push({ play: this.oddEvenMode === 0 ? 1 : 0, bet: this.bet });

			// Randomize NPC plays (always bet minBet)
			for (let i = 1; i < vars.NUMBER_OF_PLAYERS; i++) {
				const currentMoney = this.scores[i];
				if (currentMoney - minBet >= 0) {
					plays.push({
						play: Math.floor(Math.random() * 2),
						bet: minBet,
					});
				} else {
					plays.push({
						play: null,
						bet: null,
					});
				}
			}
		} else if (this.mode === 1) {
			plays.push({
				player: this.playerNr,
				bet: this.bet,
				guess: this.dieNr,
			});

			// Randomize NPC plays (always bet minBet)
			for (let i = 1; i < vars.NUMBER_OF_PLAYERS; i++) {
				const currentMoney = this.scores[i];
				if (currentMoney - minBet >= 0) {
					plays.push({
						player: i - 1, // choose the previous player
						bet: minBet,
						guess: Math.floor(Math.random() * 6) + 1,
					});
				} else {
					plays.push({
						player: null,
						bet: null,
						guess: null,
					});
				}
			}
		} else if (this.mode === 2) {
			plays.push({ sum: this.sum, bet: this.bet });

			// Randomize NPC plays (always bet minBet)
			for (let i = 1; i < vars.NUMBER_OF_PLAYERS; i++) {
				const currentMoney = this.scores[i];
				if (currentMoney - minBet >= 0) {
					let min = vars.NUMBER_OF_PLAYERS;
					let max = 6 * vars.NUMBER_OF_PLAYERS;
					plays.push({
						sum: Math.floor(Math.random() * (max - min + 1)) + min,
						bet: minBet,
					});
				} else {
					plays.push({
						sum: null,
						bet: null,
					});
				}
			}
		} else {
			throw new Error(
				"Unknown game mode. Cannot perform game computations"
			);
		}

		return plays;
	}

	updateBoard(plays, diceValues) {
		let sumOfRound = 0;
		diceValues.forEach((die) => (sumOfRound += die));

		diceValues.forEach((die, idx) => {
			let wonRound = false;
			if (this.mode === 0) {
				wonRound = plays[idx].play === die.value % 2;
			} else if (this.mode === 1) {
				wonRound = plays[idx].guess === diceValues[plays[idx].play];
			} else if (this.mode === 2) {
				wonRound = plays[idx].sum === sumOfRound;
			}

			if (wonRound) {
				this.scores[idx] += plays[idx].bet * vars.REWARDS[this.mode];
			} else {
				if (plays[idx].bet) {
					this.scores[idx] -= plays[idx].bet;
				} else {
					this.scores[idx] = null;
				}
			}
		});

		this.updateScoreBoard();
	}

	updateModes() {
		Object.keys(vars.BETS).forEach((bet) => {
			let btn = document.getElementById(`game-btn-${parseInt(bet) + 1}`);
			btn.disabled = this.scores[0] < vars.BETS[bet].min;
		});
	}

	playerHasAvailableGameModes() {
		let nrAvGames = 3;
		for (const bet in vars.BETS) {
			if (this.scores[0] < vars.BETS[bet].min) {
				nrAvGames--;
			}
		}

		return nrAvGames > 0;
	}

	checkWinner() {
		// There may be more than one winner...
		const winners = [];

		if (!this.scores[0] || !this.playerHasAvailableGameModes()) {
			return [true, winners];
		}

		this.scores.forEach((score, idx) => {
			if (score >= vars.GAME_WINNER_VAL) {
				winners.push(idx + 1);
			}
		});

		return [false, winners];
	}

	play() {
		// Hide place bet button
		let placeBetBtn = document.getElementById("board-interactor-div");
		placeBetBtn.style.zIndex = -999;

		const plays = this.playOneRound();
		const diceValues = randomDiceThrow();
		this.updateBoard(plays, diceValues);
		this.updateModes();
		const [gameOver, winners] = this.checkWinner();

		if (gameOver) {
			this.updateHtmlText("status", "Game Over");
			this.updateHtmlText("place-bet-btn", "Reload to play again");
		} else {
			if (winners.length) {
				// TODO: check number of winners and if the player won
				this.updateHtmlText("status", "We have a winner!");
				this.updateHtmlText("place-bet-btn", "Reload to play again");
			} else {
				this.updateHtmlText("place-bet-btn", "Place your bet");
			}
		}
		// Show place bet button
		setTimeout(() => (placeBetBtn.style.zIndex = 100), 1500);
	}
}
