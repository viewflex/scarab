# Scarab

Configurable simulation of a progressive betting system for roulette, written in Vue.js.


## Overview

This application is designed to provide a configurable automated visualization of certain progressive betting strategies in the game of roulette. There are a number of well-known systems; this application illustrates a differential system in which the six even chance suites of numbers (red, black, even, odd, high, low) are played simultaneously, with the amount wagered on each determined by the results of the previous spin and the current "tally" for that suite.

The goal of this system is to lose as slowly as possible, staying at the table long enough to hit a trend in one or more of the suites. Ideally, we want to be at a table with a low minimum bet (default 5) and a high maximum bet (default 5000).

![start](start.png)

Each suite starts its tally with a fresh "stack" of betting amounts, by default [1, 2, 2, 3, 3, 4] - the first and last numbers combine to determine the next bet to be placed. Upon a winning spin, that number is added to the end of the tally, and for a loss, those first and last numbers in the tally are removed. When a tally is empty it is refreshed with a new stack. If only one number remains and it's below the minimum bet, the difference is automatically allocated. The game keeps track of the amount invested in each suite, and also provides aggregate statistics.

Configuration includes a threshold for "harvesting" a suite's total winnings above a given amount, putting that sum aside and taking it out of play.

You may also configure the thresholds for stopping play upon hitting a maximum positive or negative aggregate profit, or a maximum bet amount for a suite. Using these configuration variables allows modification and fine-tuning of the betting strategy, supporting flexible experimentation.

By default, the French La Partage rule is applied for zero, which returns to the player half of the bet. Any fractional parts of the half-bets returned are placed aside in the harvest basket, so only whole numbers are inserted back into the tallies. La Partage decreases the house edge with a French wheel by half; these are the best odds to be found in roulette.


## Project Setup

After downloading the repository, navigate to that directory and install dependencies.

```
npm install
```

### Serve with Compile and Hot-Reload for Development
```
npm run serve
```

### Compile and Minifies for Production
```
npm run build
```

### Lint and Fixes Files
```
npm run lint
```

### Customize Vue CLI Configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## Usage

Configure the number of spins (default 10) and the interval between spins (expressed in milliseconds, default 2000). Click Run to start the simulation.

