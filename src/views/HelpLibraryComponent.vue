<template>
  <div class="doc">
    <!-- Judul dengan ikon -->
    <div class="doc-header">
      <span class="doc-icon">📥</span>
      <h2 class="doc-title">  Cara Insert Component dari Library Design System</h2>
    </div>

    <!-- Paragraf pengantar -->
    <!-- <p class="paragraph" style="margin-bottom: 16px; margin-top: 0px; ">
      File Key adalah bagian penting dari URL file Figma yang digunakan untuk mengidentifikasi file Anda.  
      Plugin ini memerlukan File Key untuk dapat mengakses component pada design system Anda.
    </p> -->


    <!-- Daftar langkah -->
    <ol class="steps">
      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;">Setelah halaman Component Library terbuka, plugin akan menampilkan semua component yang berada didalam design system.</p>
      </li>

      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;" >
          Untuk memasukan component, pilih satu frame yang ingin Anda gunakan untuk memasukan component.  
        </p>
        <img
          src="../ui/assets/help-library-component/img-no2.png"
          alt="Tombol Share di Figma"
          class="steps-img"
          style="width: 298px; height: 298px;"
        />
      </li>

      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;">
          Kembali ke halaman Component Library, klik tombol Insert Component untuk memasukan component.
        </p>
        <img
          src="../ui/assets/help-library-component/img-no3.png"
          alt="Copy link di Figma"
          class="steps-img"
          style="width: 256px; height: 307px;"
        />
      </li>

      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;">Component akan langsung ter-insert kedalam frame yang dipilih sebelumnya.</p>

        <img
          src="../ui/assets/help-library-component/img-no4.png"
          alt="Copy link di Figma"
          class="steps-img"
          style="width: 268px; height: 268px;"
        />
      </li>

      
    </ol>
  </div>
</template>

<script>
export default {
  name: 'HelpComponentLibrary'
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
