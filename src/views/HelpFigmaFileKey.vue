<template>
  <div class="doc">
    <!-- Judul dengan ikon -->
    <div class="doc-header">
      <span class="doc-icon">🔑</span>
      <h2 class="doc-title">Cara Menemukan Figma File Key</h2>
    </div>

    <!-- Paragraf pengantar -->
    <p class="paragraph" style="margin-bottom: 16px; margin-top: 0px; ">
      File Key adalah bagian penting dari URL file Figma yang digunakan untuk mengidentifikasi file Anda.  
      Plugin ini memerlukan File Key untuk dapat mengakses component pada design system Anda.
    </p>


    <!-- Daftar langkah -->
    <ol class="steps">
      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;">Buka file Figma yang ingin Anda gunakan.</p>
      </li>

      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;" >
          Klik ikon <strong>Share</strong> di kanan atas <span class="dashicon">🔗</span>.
        </p>
        <img
          src="../ui/assets/help-file-key/img-no2.png"
          alt="Tombol Share di Figma"
          class="steps-img"
          style="width: 338px; height: 338px;"
        />
      </li>

      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;">
          Di jendela pop-up yang muncul, klik tombol <strong>Copy link</strong>.
        </p>
        <img
          src="../ui/assets/help-file-key/img-no3.png"
          alt="Copy link di Figma"
          class="steps-img"
          style="width: 340px; height: 150px;"
        />
      </li>

      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;">Link yang Anda dapatkan akan terlihat seperti ini:</p>
        <pre class="code-block">
https://www.figma.com/file/abcdefghi12345678/Nama-File-Anda</pre>
      </li>

      <li class="steps-item body bold">
        <p class="paragraph" style="margin: 0px;">
          File Key adalah bagian yang berada setelah <code>/file/</code> dan sebelum nama file.
          Dari contoh di atas, File Key-nya adalah:
        </p>
        <pre class="code-block">abcdefghi12345678</pre>
      </li>
    </ol>
  </div>
</template>

<script>
export default {
  name: 'HelpFigmaFileKey'
}
</script>

<style scoped>

.doc {
  /* color: #333; */
  padding: 0px;
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
