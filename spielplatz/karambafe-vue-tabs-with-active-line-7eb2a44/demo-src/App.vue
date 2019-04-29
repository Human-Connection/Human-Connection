<template>
  <div class="container">
    <h1>Vue tabs with active line</h1>
    <h3>Default:</h3>
    <default />

    <h3>Disabled tab:</h3>
    <disabled />
  </div>
</template>

<script>
import Default from '../examples/Default.vue';
import Disabled from '../examples/Disabled.vue';

export default {
  components: {
    Default,
    Disabled,
  },
};
</script>

<style>
  body {
    margin: 0;
  }

  h1 {
    text-align: center;
  }

  h3 {
    align-self: flex-start;
  }

  .container {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;

    min-width: 320px;
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>

