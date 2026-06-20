<script lang="ts">
  export let item: any;
</script>

<div class="item-card">
  <div class="title">{item?.data?.artist ?? item?.id}</div>
  <div class="meta">{item?.data?.date} — {item?.data?.venue}</div>
</div>

<style>
:global(.item-card) { border: none }
/* local overrides kept minimal; base styles live in theme.css */
</style>
