<script>
  import { url, route, goto } from "@sveltech/routify"
  if ($route.leftover === 'index.html') {
    $goto("/")
  }
</script>

<style>
  h1 {
    text-align: center;
  }

  a {
    display: block;
    width: 100%;
    margin: 10px auto;
  }
</style>

{#if $route.leftover !== 'index.html'}
  <h1>Ups! Esa pagina no existe!</h1>
  <a href={$url('/')}>&larr; Go to home</a>
{/if}
