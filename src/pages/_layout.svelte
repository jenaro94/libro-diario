<script>
  import { writable } from 'svelte/store';
  import Transition from "../components/Transition.svelte"
  const width = writable();
</script>

<div bind:offsetWidth={$width}>
  <slot decorator={Transition} scoped={{ width }} />
</div>

