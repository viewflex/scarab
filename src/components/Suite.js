// Suite.js

export default class Suite {

    constructor (name, config, state) {
        this.name = name;
        this.config = config;
        this.state = state;
        this.sequence = this.config.sequences.[this.name];
        this.stack = this.config.stack.slice(0);
        this.tally = this.stack.slice(0);
        this.total = this.sumArray(this.tally);
        this.invested = 0;
        this.allocate(this.total);
        this.profit = 0;
        this.next = this.nextBet();
        this.bet = null;
        this.placed = false;
        this.won = null;
        
    }

    wins(num) {
        return this.sequence.includes(num);
    }

    addToTally(num) {
        this.tally.push(num);
    }

    insertToTally(num) {
        this.tally.push(num);
        this.tally.sort((a,b) => a-b);
    }

    trimTally() {
        this.tally.shift();

        if (this.tally.length > 0) {
            this.tally.pop();
        }
    }

    nextBet() {
        if (this.tally.length === 1) {
            return this.tally[0];
        } else {
            return this.tally[0] + this.tally[this.tally.length - 1];
        }
    }

    allocate (num) {
        this.invested += num;
        return num;
    }

    update(num) {
        if (this.wins(num)) {
            this.won = true;

            if (this.bet > this.state.highestBetWon) {
                this.state.highestBetWon = this.bet;
            }

            this.addToTally(this.bet);

            if (this.sumArray(this.tally) > this.state.highestTotal) {
                this.state.highestTotal = this.sumArray(this.tally);
            }

            if (this.sumArray(this.tally) >= this.config.harvestOnWinning) {
                console.log('Harvest: ' + (this.sumArray(this.tally) - this.sumArray(this.stack)));

                let amount = (this.sumArray(this.tally) - this.sumArray(this.stack));
                this.state.harvestsTotal += amount;
                this.state.harvestsCount++;
                this.tally = this.stack.slice(0);
            }

        } else {
            this.won = false;

            if (this.bet > this.state.highestBetLost) {
                this.state.highestBetLost = this.bet;
            }

            this.trimTally();
            let diff = 0;
            switch (this.tally.length) {
                case 0:
                    this.tally = this.stack.slice(0);
                    this.allocate(this.sumArray(this.stack));
                    break;
                case 1:
                    diff = this.tally[0] - this.config.minBet;
                    if (diff < 0) {
                        this.tally[0] = this.config.minBet;
                        this.allocate(-diff);
                    }
                    break;
                default:
                    diff = (this.tally[0] + this.tally[this.tally.length - 1]) - this.config.minBet;
                    if (diff < 0) {
                        this.tally[this.tally.length - 1] += this.allocate(-diff);
                    }
            }

            // If playing with La Partage rule, losing on zero we get half the bet back.
            if (this.state.laPartageRule && num === 0) {

                let halfBet = this.bet/2;
                let remainder = halfBet % 1;

                console.log('La Partage rule applied, returning ' + halfBet.toString());

                if (remainder === 0) {
                    this.insertToTally(halfBet); // Insert the half-bet.
                } else {
                    this.state.harvestsTotal += remainder; // Put remainder aside in the harvest basket.
                    console.log('Harvesting remainder ' + remainder.toString());
                    this.insertToTally(halfBet - remainder); // Insert the evened half-bet.
                }

            }

        }

        this.total = this.sumArray(this.tally);
        this.profit = this.total - this.invested;
        this.next = this.nextBet();
        this.placed = false;
        if(this.maxBetReached === false) {
            this.maxBetReached = (this.next > this.config.maxBet);
        }
    }

    place() {
        this.bet = this.next;
        this.next = null;
        this.placed = true;
    }

    clear() {
        this.bet = null;
        this.won = null;
    }

    add(a, b) {
        return a + b;
    }

    sumArray(arr) {
        return arr.reduce(this.add);
    }
}