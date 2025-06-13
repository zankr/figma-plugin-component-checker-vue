<template>
  <div class="usage-section">
    <h2>Cara Pakai</h2>

    <section>
      <h3>1. Halaman Checker</h3>
      <ol>
        <li>
          Pilih tab <strong>Checker</strong> di sidebar (ikon centang).  
        </li>
        <li>
          Tunggu hingga model ML selesai dimuat (tombol “Check Components” menjadi aktif).
        </li>
        <li>
          Pastikan Anda sudah memilih satu <em>frame</em> di Figma, lalu klik tombol
          <strong>Check Components</strong>.
        </li>
        <li>
          Setelah proses selesai, Anda akan melihat:
          <ul>
            <li>Ringkasan jumlah total instance, valid, dan invalid.</li>
            <li>Daftar <em>instance</em> yang dianggap tidak sesuai (invalid), masing-masing dalam kartu:  
              <ul>
                <li><strong>Panel Kiri</strong>: preview screenshot instance, nama &amp; ID, tombol <em>Go to Component</em> untuk langsung menavigasi ke posisi instance di canvas.</li>
                <li><strong>Panel Kanan</strong>: hasil prediksi label &amp; confidence, lalu daftar varian dari Design System.</li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          Untuk mengganti instance yang invalid, klik salah satu varian pada daftar “Design System Component”.
          Plugin akan otomatis menggantikan instance di canvas dengan varian yang Anda pilih.
        </li>
      </ol>
    </section>

    <section>
      <h3>2. Halaman Component</h3>
      <ol>
        <li>
          Pilih tab <strong>Component</strong> di sidebar (ikon kotak).
        </li>
        <li>
          Plugin akan memuat daftar semua komponen yang ada di file Figma Anda (menampilkan thumbnail &amp; nama).
          Tunggu hingga indikator loading menghilang.
        </li>
        <li>
          Gunakan kotak <em>Search component</em> di atas untuk memfilter berdasarkan nama komponen.
        </li>
        <li>
          Jika file Anda punya banyak komponen, gulir ke bawah untuk memuat batch berikutnya (infinite scroll).
        </li>
        <li>
          Setelah menemukan komponen yang diinginkan, klik tombol <strong>Insert Component</strong> pada kartu komponen tersebut.
          Komponen akan disisipkan ke kanvas di posisi kursor saat ini.
        </li>
      </ol>
    </section>
  </div>
</template>

<script>
export default {
  name: 'UsageSection'
}
</script>

<style>
.usage-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.usage-section section {
  margin-bottom: 1.5rem;
}
.usage-section ol {
  margin-left: 1.25rem;
  line-height: 1.6;
}
.usage-section li {
  margin-bottom: 0.5rem;
}
.usage-section h3 {
  font-size: 1.25rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
</style>
