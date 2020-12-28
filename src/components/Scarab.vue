/<template>

    <div class="container">

        <div class="wrapper">

            <div class="box wheel-stats">
                <div class="nested">

                    <p class="row-label">Spins:</p>

                    <p class="row-total">{{ state.wheel.history.length }}</p>

                    <p class="row-label">Highest Total:</p>

                    <p class="row-total">{{ state.highestTotal }}</p>

                    <p class="row-label">Highest Bet Won:</p>

                    <p class="row-total">{{ state.highestBetWon }}</p>

                    <p class="row-label">Highest Bet Lost:</p>

                    <p class="row-total">{{ state.highestBetLost }}</p>

                    <p class="row-label">Harvested:</p>

                    <p class="row-total">{{ state.harvestsTotal }}</p>

                </div>
            </div>

            <div class="box wheel-display">
                <div class="wheel current-number" v-text="currentNumberDisplay"></div>
                <img alt="french roulette wheel" src="../assets/french-wheel-160.png">
            </div>

            <div class="box wheel-controls">
                <div class="nested">

                    <p class="row-label">Spins:</p>

                    <input v-model.number="state.croupierSpins" type="number">

                    <p class="row-label">Interval:</p>

                    <input v-model.number="state.croupierInterval" type="number">

                    <p class="row-label">Run:</p>

                    <div v-show="!state.croupierActive">
                        <button role="button" class="btn btn-default btn-lg" @click="run" key="run">Run</button>
                    </div>
                    <div v-show="state.croupierActive">
                        <button role="button" class="btn btn-default btn-lg" @click="stopCroupier" key="stop">Stop</button>
                    </div>

                </div>
            </div>

            <!--Left Side-->
            <div class="suite-sides labels">

                <div class="grid-content row-label">Suite:</div>

                <div class="grid-content row-label">Bet:</div>

                <div class="grid-content row-label">Total:</div>

                <div class="grid-content row-label">Invested:</div>

                <div class="grid-content row-label">Profit:</div>

                <div class="grid-content row-label">Next Bet:</div>

            </div>

            <ScarabSuite v-for="suite in state.suites" :key="suite.name" v-bind:suite="suite"></ScarabSuite>

            <!--Right Side-->
            <div class="suite-sides totals">

                <div class="grid-content row-total">&nbsp;</div>

                <div class="grid-content row-label">Aggregates:</div>

                <div class="grid-content row-total" v-text="state.aggregateTotal"></div>

                <div class="grid-content row-total" v-text="state.aggregateInvested"></div>

                <div class="grid-content row-total" :class="{ negative: (state.aggregateProfit < 0) }" v-text="state.aggregateProfit"></div>

                <div class="grid-content row-total">&nbsp;</div>


            </div>

        </div>

    </div>

</template>



<script>

    import { reactive, computed, onMounted } from "vue";
    import ScarabSuite from './ScarabSuite.vue';
    import Suite from "./Suite.js";

    export default {

        components: { ScarabSuite },

        props: {
            msg: String,
            config: {
                type: Object,
                default: function() {
                    return {
                        wheelType: 'French',
                        laPartageRule: true,
                        numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
                            , 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
                        sequences: {
                            red: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
                            black: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
                            even: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36],
                            odd: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35],
                            low: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
                            high: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
                        },
                        stack: [1, 2, 2, 3, 3, 4],
                        minBet: 5,
                        maxBet: 5000,
                        maxLoss: 20000,
                        maxWin: 20000,
                        harvestOnWinning: 5000
                    }
                }
            }
            
        },

        setup (props, context) {

            // -------------------- State:

            const state = reactive({
                phase: '',
                suites: [],
                wheel: {
                    numbers: props.config.numbers,
                    min: props.config.numbers[0],
                    max: props.config.numbers[(props.config.numbers.length - 1)],
                    current: null,
                    history: [],
                },
                laPartageRule: props.config.laPartageRule,
                croupierActive: false,
                croupierSpins: 10,
                croupierInterval: 2000,
                maxBetReached: false,
                maxLossReached: false,
                maxWinReached: false,

                aggregateTotal: 0,
                aggregateInvested: 0,
                aggregateProfit: 0,
                harvestsTotal: 0,
                harvestsCount: 0,
                highestBetWon: 0,
                highestBetLost: 0,
                highestTotal: 0
            });

            // -------------------- Computed:

            const currentNumberDisplay = computed(() => {
                switch (state.phase) {
                    case 'init':
                        return 'Click Run';
                        
                    case 'clear':
                        return 'Place your bets!';
                        
                    case 'place':
                        return 'Placing';
                        
                    case 'spin':
                        return 'Spinning';
                        
                    case 'update':
                        return state.wheel.current;
                        
                    default:
                        return state.phase;
                }
            });

            // -------------------- Lifecycle hooks:

            onMounted(() => {
                console.log(props.msg);
                console.log(context.attrs);
                console.log('Component mounted.');
                init();
                console.log('Suites initialized.');
                
            })

            // -------------------- Wheel functions:

            function getRandomIntInclusive(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            function random(min, max) {
                let pick = null;
                pick = getRandomIntInclusive(min, max) + 1;
                return pick < max ? pick : min;
            }

            function spin() {
                state.wheel.current = random(state.wheel.min, state.wheel.max);
                state.wheel.history.push(state.wheel.current);
                return state.wheel.current;
            }

            function clear() {
                state.wheel.current = null;
            }


            // -------------------- Croupier functions:

            function startCroupier() {
                state.croupierActive = true;
            }

            function stopCroupier() {
                state.croupierActive = false;
            }

            function getPhase() {
                return state.phase;
            }

            function setPhase(str) {
                return state.phase = str;
            }

            function clearLastBets() {
                console.log(setPhase('clear'));
                clear();
                state.suites.forEach(function(suite) {
                    suite.clear();
                });
            }

            function placeNewBets() {
                console.log(setPhase('place'));
                state.suites.forEach(function(suite) {
                    suite.place();
                });
            }

            function spinWheel() {
                console.log(setPhase('spin'));
                spin();
            }

            function updateSuitesAndAggregate() {
                console.log(setPhase('update'));
                updateSuites(state.wheel.current);
                updateAggregates();

                if(state.maxLossReached === false) {
                    state.maxLossReached = (state.aggregateProfit <= -(props.config.maxLoss));
                }

                if(state.maxWinReached === false) {
                    state.maxWinReached = (state.aggregateProfit >= props.config.maxWin);
                }
            }

            function updateSuites(num) {
                state.suites.forEach(function(suite) {
                    suite.update(num);
                });
            }

            function updateAggregates() {
                clearAggregates();
                state.suites.forEach(function(suite) {

                    state.aggregateTotal += suite.total;
                    state.aggregateInvested += suite.invested;
                    state.aggregateProfit += suite.profit;

                });
            }

            function clearAggregates () {
                state.aggregateTotal = 0;
                state.aggregateInvested = 0;
                state.aggregateProfit = 0;
            }

            function oneSpinAndUpdate() {

                setTimeout(function clearing() {

                    clearLastBets();

                    setTimeout(function placing() {

                        placeNewBets();

                        setTimeout(function spinning() {

                            spinWheel();

                            setTimeout(function updating() {

                                updateSuitesAndAggregate();

                            }, state.croupierInterval/6);

                        }, state.croupierInterval/6);

                    }, state.croupierInterval/6);

                }, state.croupierInterval/3);

            }

            function proceed() {
                return !(state.maxBetReached || state.maxLossReached || state.maxWinReached || !state.croupierActive);
            }

            function run() {

                let i = 0;
                let d = null;                
                startCroupier();
                console.log('Croupier activated.');
                console.log('Croupier interval: ' + state.croupierInterval.toString());
                console.log('Running run() in phase: ' + getPhase());

                let timer = setInterval(function() {

                    if ((i < state.croupierSpins) && proceed()) {
                        i++;
                        d = new Date();
                        console.log('oneSpinAndUpdate() ----- ' + i.toString() + ' @ '+ d.getSeconds() + '.' + d.getMilliseconds());
                        oneSpinAndUpdate();
                    } else {
                        stopCroupier();
                        clearInterval(timer);
                        console.log('Croupier de-activated.');
                    }

                }, state.croupierInterval);

            }

            // Run in onMounted to set up the suites and aggregate totals.
            function init() {
                console.log(setPhase('init'));
                state.suites.push(new Suite('red', props.config, state));
                state.suites.push(new Suite('black', props.config, state));
                state.suites.push(new Suite('even', props.config, state));
                state.suites.push(new Suite('odd', props.config, state));
                state.suites.push(new Suite('low', props.config, state));
                state.suites.push(new Suite('high', props.config, state));
                updateAggregates();
            }

            // -------------------- Publish:

            return {
                props,
                state,
                currentNumberDisplay,
                run,
                startCroupier,
                stopCroupier,
                init,
                context
            }

        } // end setup()

    }; // end export

    

</script>



<style>
    body {
        margin: 1px;
    }
    .wrapper {
        display: grid;
        grid-template-columns: repeat(8);
        grid-gap: 10px;
        background-color: #fff;
        color: #444;
        border: 1px solid #8c8c8c;
        padding: 10px;
        margin: 0;
    }

    .box {
        background-color: #bebeb3;
        color: #fff;
        border-radius: 5px;
        padding: 20px;
        font-size: 100%;

    }

    .wheel-stats {
        grid-column: 1 / 4;
        grid-row: 1;
    }

    .nested {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 5px;
        background-color: #d0dede;
        color: #7a7a7a;
    }

    .nested p {
        border: 1px solid #fff;
        padding: 5px;
        margin: 0;
    }

    .stats-labels {
        grid-column: 1 / 2;
        grid-row: 1;
    }

    .stats-totals {
        grid-column: 3;
        grid-row: 1;
    }

    .wheel-display {
        grid-column: 4 / 6;
        grid-row: 1;
    }

    .wheel {
        text-align: center;
    }

    .wheel-controls {
        grid-column: 6 / 9;
        grid-row: 1;
    }


    .suites {
        grid-column: 1 / 9;
        grid-row: 2;
        flex-direction: row
    }

    .suite-grid {
        width: 100px;
        background-color: #d0dede;
        color: #7a7a7a;
        border-radius: 5px;
        padding: 10px;
    }

    .suite-sides {
        width: 100px;
        background-color: #fff;
        color: black;
        border-radius: 5px;
        padding: 10px;
    }

    .labels {
        grid-column: 1;
        grid-row: 2;
    }
    .red {
        grid-column: 2;
        grid-row: 2;
    }
    .black {
        grid-column: 3;
        grid-row: 2;
    }
    .even {
        grid-column: 4;
        grid-row: 2;
    }
    .odd {
        grid-column: 5;
        grid-row: 2;
    }
    .low {
        grid-column: 6;
        grid-row: 2;
    }
    .high {
        grid-column: 7;
        grid-row: 2;
    }
    .totals {
        grid-column: 8;
        grid-row: 2;
    }


    .grid-content {
        width: 80px;
        background-color: #fff;
        color: black;
        border-radius: 5px;
        padding: 5px;
        padding-left: 10px;
        padding-right: 10px;
        margin-bottom: 10px;
    }

    .nopad {
        padding: 3px;
    }

    .negative {
        color: red;
    }

    .win {
        background-color: #b0f8b0;
    }

    .lose {
        background-color: #ffbdc2;
    }

    .row-label {
        color: darkgray;
        font-weight: bold;
    }

    .column-label {
        color: black;
        font-weight: bold;
        text-align: center;
    }

    .row-total {
        font-weight: bold;
    }

    .tally {
        width: 80px;
        background-color: #fcfcde;
        border-radius: 5px;
        padding: 5px;
        padding-left: 10px;
        padding-right: 10px;
        margin-bottom: 0px;
    }

    .tally > li {
        color: black;
        list-style-type: none;
    }

    .current-number {
        font-weight: bold;
        font-size: large;
    }

</style>
