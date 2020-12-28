<template>
  <Scarab msg="Welcome to Scarab"/>
</template>

<script>
import Scarab from './components/Scarab.vue'

export default {
  name: 'App',
  components: {
    Scarab
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
