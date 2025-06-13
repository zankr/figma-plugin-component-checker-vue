<template>
  <div class="advanced-section">
    <h2>Advanced Tips</h2>
    <ul>
      <li>Kamu bisa melakukan filter berdasarkan nama komponen.</li>
      <li>Atur preferensi pengecekan di Settings → Advanced.</li>
      <li>Gunakan shortcut <code>Ctrl+Alt+C</code> untuk pengecekan cepat.</li>
    </ul>
  </div>
</template>

<script>
export default { name: 'AdvancedSection' }
</script>

<style scoped>
.advanced-section h2 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: #2c3e50;
}
.advanced-section ul {
  list-style: disc inside;
  margin-left: 0;
  line-height: 1.6;
}
.advanced-section li {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #34495e;
}
.advanced-section code {
  background: #f4f4f4;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: Menlo, monospace;
  font-size: 0.9rem;
}
</style>
