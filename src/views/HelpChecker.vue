<template>
  <div class="doc">
    <!-- Judul dengan ikon -->
    <div class="doc-header">
      <span class="doc-icon">🎯</span>
      <h2 class="doc-title">  Cara Menggunakan Component Checker</h2>
    </div>

    <!-- Paragraf pengantar -->
    <!-- <p class="paragraph" style="margin-bottom: 16px; margin-top: 0px; ">
      File Key adalah bagian penting dari URL file Figma yang digunakan untuk mengidentifikasi file Anda.  
      Plugin ini memerlukan File Key untuk dapat mengakses component pada design system Anda.
    </p> -->


    <!-- Daftar langkah -->
    <ol class="steps">
      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;">Setelah halaman Checker terbuka, tunggu beberapa detik hingga tombol Check Components aktif (berwarna hijau), menandakan model dan metadata selesai dimuat.</p>
      </li>

      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;" >
          Kembali ke kanvas Figma, pilih satu frame yang ingin Anda periksa.
        </p>
        <img
          src="../ui/assets/help-checker/img-no2.png"
          alt="Tombol Share di Figma"
          class="steps-img"
          style="width: 423px; height: 330px;"
        />
      </li>

      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;">
          Kembali ke halaman Checker, klik tombol Check Components untuk memulai proses pengecekan.
        </p>
        <img
          src="../ui/assets/help-checker/img-no3.png"
          alt="Copy link di Figma"
          class="steps-img"
          style="width: 424px; height: 86px;"
        />
      </li>

      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 4px;">Jika ada instance invalid, tiap instance akan muncul dalam satu kartu dengan dua panel</p>
        <p class="paragraph" style="margin: 0px;">
          1. Panel kiri (nama, preview, tombol Go to Component)
        </p>
        <img
          src="../ui/assets/help-checker/img-no4-1.png"
          alt="Copy link di Figma"
          class="steps-img"
          style="width: 268px; height: 250px;"
        />
        <p class="paragraph" style="margin-top: 4px;">
          2. Panel kanan (ringkasan prediksi dan daftar varian + tombol Insert)
        </p>
        <img
          src="../ui/assets/help-checker/img-no4-2.png"
          alt="Copy link di Figma"
          class="steps-img"
          style="width: 268px; height: 250px;"
        />
      </li>

      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;">
          Untuk memasukan komponen yang sudah valid, pilih frame-nya di canvas, kemudian klik Insert pada Component yang muncul.
        </p>
        <img
          src="../ui/assets/help-checker/img-no5.png"
          alt="Copy link di Figma"
          class="steps-img"
          style="width: 316px; height: 72px;"
        />
      </li>
    </ol>
  </div>
</template>

<script>
export default {
  name: 'HelpChecker'
}
</script>

<style scoped>

.doc {
  /* color: #333; */
  display: flex;
  flex-direction: column;
  padding: 0px;
  gap: 16px;
}
.doc-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.doc-icon {
  font-size: 24px;
  margin-right: 8px;
}
.doc-title {
  font-size: 20px;
  margin: 0;
}
.doc-intro {
  margin-bottom: 32px;
  line-height: 1.6;
}


.steps {
  counter-reset: step;
  list-style: none;
  padding: 0;
  margin: 0;
}

.steps-item {
  counter-increment: step;
  min-height: 24px;
  position: relative;
  padding-left: 48px;
  margin-bottom: 16px;
}

.steps-item::before {
  content: counter(step);
  position: absolute;
  left: 0; top: 0;
  width: 24px; height: 24px;
  background-color: #08A94C;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font: inherit;
}



.steps-img {
  margin-top: 8px;
  max-width: 100%;
  /* border: 1px solid #ddd; */
  border-radius: 10px;
}

.code-block {
  background-color: #2E3440;
  color: #87DBAB;
  padding: 12px 16px;
  border-radius: 10px;
  font-family: 'SFMono-Regular', monospace;
  white-space: pre-wrap;
  margin-top: 8px;
}
</style>
