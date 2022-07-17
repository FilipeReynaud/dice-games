export const SCREEN_WIDTH = window.innerWidth;
export const SCREEN_HEIGHT = window.innerHeight;
export const VIEW_ANGLE = 45;
export const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
export const NEAR = 0.01;
export const FAR = 20000;
export const colors = ["#85C88A", "#0078AA", "#EBD671", "#EB1D36", "#F15412"];
export const floorColor = "#C0A080";
export const NUMBER_OF_PLAYERS = 5;
export const MODES = {
	0: "Boring Dice",
	1: " Clairvoyance Dice",
	1: "Mathematician's Dice"
};
export const GAME_DESCRIPTIONS = {
	0: "You just have to predict if your throw will result in an odd or even number.",
	1: "You just have to predict another player's die number.",
	2: "You just have to predict the sum of the dice in one round."
};
export const GAME_CONFIGS = {
	0: "boring-mode",
	1: "clairvoyance-mode",
	2: "mathematician-mode"
};
export const GAME_WINNER_VAL = 600;
export const BETS = {
	0: {
		min: 10,
		max: 30
	},
	1: {
		min: 50,
		max: 70
	},
	2: {
		min: 100,
		max: 120
	}
};
export const REWARDS = {
	0: 1.5,
	1: 2,
	1: 3
};
