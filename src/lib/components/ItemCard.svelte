<script lang="ts">
  export let item: any;
</script>

<div class="item-card">
  <div class="title">{item?.data?.artist ?? item?.id}</div>
  <div class="meta">{item?.data?.date} — {item?.data?.venue}</div>
</div>

<style>
.item-card { border: 1px solid #eee; padding: 0.5rem; border-radius:4px }
.title { font-weight: 600 }
.meta { color: #666; font-size: 0.9rem }
</style>
