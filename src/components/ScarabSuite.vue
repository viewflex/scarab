<template>

    <div class="suite-grid" :class="suite.name">

        <div class="grid-content column-label" :class="[
            { win: (suite.won == true) },
            { lose: (suite.won == false) }
        ]">{{ capitalize(suite.name) }}</div>

        <div class="grid-content">{{ suite.bet || '&nbsp;' }}</div>

        <div class="grid-content">{{ suite.total }}</div>

        <div class="grid-content">{{ suite.invested }}</div>

        <div class="grid-content" :class="{ negative: (suite.profit < 0) }">{{ suite.profit }}</div>

        <div class="grid-content" >{{ suite.next || '&nbsp;' }}</div>

        <ul class="tally">
            <li v-for="(number, index) in suite.tally" :key="index">{{ number }}</li>
        </ul>

    </div>

</template>

<script>

    export default {

        props: ['suite'],

        methods: {

            capitalize: function (str) {
                return str.charAt(0).toUpperCase() + str.slice(1)
            },

        }

    };

</script>
