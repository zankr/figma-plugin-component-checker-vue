<template>
  <div class="plugin-wrapper">
    <!-- SIDEBAR KIRI -->
    <aside class="sidebar">
      <ul class="sidebar-icons">
        <li :class="{ 'is-active': activeTab === 'search' }" @click="onSearch">
          <img src="../ui/assets/img-background-ds.png" alt="Search Icon" />
        </li>
        <li :class="{ 'is-active': activeTab === 'blocks' }" @click="onBlocks">
          <img src="../ui/assets/img-background-ds.png" alt="Blocks Icon" />
        </li>
        <li :class="{ 'is-active': activeTab === 'help' }" @click="onHelp">
          <img src="../ui/assets/img-background-ds.png" alt="Help Icon" />
        </li>
      </ul>
      <div class="sidebar-bottom">
        <button :class="{ 'is-active': activeTab === 'settings' }" @click="onSettings">
          <img src="../ui/assets/img-background-ds.png" alt="Settings Icon" />
        </button>
      </div>
    </aside>

    <!-- ISI UTAMA -->
    <div class="plugin-container">
      <!-- HEADER -->
      <div class="plugin-header">
        <div class="header-text">
          <h4 class="h4 bold">Design System Component Checker</h4>
          <p class="h7 text-light-dark">Select one frame before check component</p>
          <Button :disabled="!isModelReady" variant="primary" @click="onClickCheck">
            Check Components
          </Button>
        </div>
        <div class="header-illustration">
          <img src="../ui/assets/img-background-ds.png" alt="Illustration" />
        </div>
      </div>

      <!-- SUMMARY GRID -->
      <div class="summary-grid">
        <div class="summary-item">
          <p class="body text-light-dark">Total Component Checked</p>
          <p class="h5">{{ summary.total ?? 0 }}</p>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <p class="body text-light-dark">Valid Component</p>
          <p class="h5">{{ summary.valid ?? 0 }}</p>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <p class="body text-light-dark">Invalid Component</p>
          <p class="h5">{{ summary.invalid ?? 0 }}</p>
        </div>
      </div>

      <!-- INVALID INSTANCES -->
      <div v-for="(item, idx) in images" :key="idx"
        style="margin-top: 24px; border: 1px solid #eee; padding: 12px; border-radius: 4px;">
        <!-- Preview Gambar -->
        <p><strong>Instance:</strong> {{ item.name }} (ID: {{ item.id }})</p>
        <img :src="item.blobUrl" alt="Invalid Instance"
          style="max-width: 100%; border: 1px solid #ccc; display: block; margin-bottom: 8px;" />
  
        <!-- Hasil Prediksi -->
        <div v-if="item.predictedLabel">
          <p>
            <strong>Prediksi Label:</strong> {{ item.predictedLabel }} <br />
            <strong>Confidence:</strong> {{ (item.confidence * 100) }}%
          </p>
          <!-- Tombol untuk navigasi ke master component yang sesuai -->
          <div style="display: flex; flex-direction: row; gap: 12px; flex-wrap: wrap;">
            <Button variant="secondary" @click="goToComponent(item.predictedLabel, item.id)" style="padding: 6px 12px; font-size: 13px;">
            Go to Component
          </Button>
          <BButton variant="secondary" @click="fetchMasterPreview(item.predictedLabel, item.id)"
            style="padding: 6px 12px; font-size: 13px; margin-left: 8px;">
            Tampilkan Preview Master
          </BButton>
          </div>
        </div>
  
        <!-- Spinner / loading kecil saat inferensi -->
        <div v-else style="color: #999;">
          🕒 Inferring...
        </div>
  
        <!-- Jika user minta preview, tampilkan pilihan varian -->
        <div v-if="item.variants && item.variants.length" style="margin-top: 12px;">
          <p><strong>Pilih Varian Master untuk '{{ item.predictedLabel }}':</strong></p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <div v-for="(variant, j) in item.variants" :key="j"
              style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 100px;">
              <img :src="variant.previewUrl" alt="Preview" style="width: 100%; margin-bottom: 4px;" />
              <p style="font-size: 12px; margin: 4px 0;">{{ variant.name }}</p>
              <BButton variant="secondary" @click="insertVariant(variant.key, item.id)" style="padding: 4px 8px; font-size: 12px;">
                Pilih
              </BButton>
            </div>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="dataReceived && images.length === 0 && !noInvalid" style="margin-top: 16px;">
        Tidak ada gambar invalid untuk diprediksi.
      </div>
    </div>
  </div>
</template>

<script>
import * as tf from "@tensorflow/tfjs";
import Button from "../ui/components/Button.vue";
import { toRaw, reactive } from "vue";
// import Button from "../ui/components/Button.vue";


export default {
  name: "UI",
  components: { Button },
  data() {
    return {
      // ML
      model: null,
      classLabels: [],

      // UI state
      isModelReady: false,
      summary: { total: null, valid: null, invalid: null },
      images: [],
      noInvalid: false,
      dataReceived: false,
      activeTab: "search",
    };
  },
  methods: {
    async loadModel() {
        try {
          console.log("⏳ Mulai loading model...");
          await tf.ready();
          console.log("✅ tf.ready() selesai.");
  
          const modelUrl = "https://zankr.github.io/figma-ml-model/model.json";
          // Karena model.json-mu adalah LayersModel, pakai loadLayersModel:
          this.model = await tf.loadLayersModel(modelUrl);
          console.log("✅ LayersModel berhasil di-load:", modelUrl);
  
          // Fetch metadata jika perlu (misal file metadata.json)
          const metadataUrl = modelUrl.replace("model.json", "metadata.json");
          console.log("⏳ Mulai fetch metadata dari:", metadataUrl);
          const metadata = await fetch(metadataUrl).then((res) => res.json());
          console.log("✅ Metadata berhasil di-fetch:", metadata);
  
          if (metadata.labels) {
            this.classLabels = metadata.labels;
            console.log("✅ Daftar kelas (labels):", this.classLabels);
          } else {
            console.warn("⚠️ metadata.json tidak mengandung properti 'labels'.");
          }
  
          this.isModelReady = true;
          console.log("➡️ Model dan metadata sudah ter-load. isModelReady = true");
        } catch (err) {
          console.error("❌ Error saat load model/metadata:", err);
        }
      },

    onClickCheck() {
        if (!this.isModelReady) {
          console.warn("Model belum siap.");
          return;
        }
        // Reset state:
        this.images = [];
        this.summary = { total: null, valid: null, invalid: null };
        this.noInvalid = false;
        this.dataReceived = false;
  
        // Kirim pesan ke Controller untuk mulai proses check & export
        window.parent.postMessage({ pluginMessage: { type: "check-components" } }, "*");
      },

    handleSummary(msg) {
        this.dataReceived = true;
        if (msg.total !== undefined) {
          this.summary.total = msg.total;
          this.summary.valid = msg.valid;
          this.summary.invalid = msg.invalid;
          // Jika invalid === 0, kita tandai noInvalid
          this.noInvalid = msg.invalid === 0;
        }
      },

    async handleExportImage(msg) {
        // msg: { name, id, data: base64 PNG }
        const base64Data = msg.data;
        const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: "image/png" });
        const blobUrl = URL.createObjectURL(blob);
  
        // Buat objek baru untuk disimpan di images[]
        console.log(msg);
        const newItem = reactive({
          name: msg.name,
          id: msg.id,
          blobUrl,
          predictedLabel: null,
          confidence: null,
          variants: []
        });
        this.images.push(newItem);
  
        // Lakukan inferensi di belakang layar:
        const img = new Image();
        img.src = blobUrl;
        img.onload = async () => {
          // Convert gambar ke ImageData
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
  
          // Convert ImageData → tf.Tensor
          let tensorImage = tf.browser.fromPixels(imageData).toFloat();
          tensorImage = tf.image.resizeBilinear(tensorImage, [224, 224]);    // sesuaikan ukuran input model
          tensorImage = tensorImage.div(255.0).expandDims(0);                // normalisasi
          // Panggil model.predict
          const rawModel = toRaw(this.model);
          const predictionTensor = rawModel.predict(tensorImage);
          // Misal output model-mu satu-dim array probabilitas:
          const dataArray = await predictionTensor.data();
          // Temukan index dengan probabilitas tertinggi:
          const maxIndex = dataArray.indexOf(Math.max(...dataArray));
          const predictedLabel = this.classLabels[maxIndex] || `Index ${maxIndex}`;
          const confidence = dataArray[maxIndex];
  
          // Update item di this.images
          newItem.predictedLabel = predictedLabel;
          newItem.confidence = confidence;
          console.log(`🔹 Prediksi untuk ${newItem.name}:`, predictedLabel, confidence);
        };
      },

    goToComponent(predictedLabel, originalId) {
        // Kirim pesan ke Controller dengan tipe “go-to-component”
        window.parent.postMessage({
          pluginMessage: {
            type: "go-to-component",
            id: originalId
          }
        }, "*");
      },

    fetchMasterPreview(predictedLabel, originalId) {
        window.parent.postMessage({
          pluginMessage: {
            type: "fetch-master-preview",
            predictedLabel,
            originalId
          }
        }, "*");
    },

    handleMasterPreview(msg) {
        const { originalId, variants } = msg;
        // Cari item di this.images yang punya id = originalId, lalu set field variants
        const idx = this.images.findIndex(item => item.id === originalId);
        if (idx !== -1) {
          // Array variants: { name, key, preview: base64PNG }
          this.images[idx].variants = variants.map(v => ({
            name: v.name,
            key: v.key,
            previewUrl: "data:image/png;base64," + v.preview
          }));
          console.log(this.images[idx].variants);
        }
  
        console.log(this.images[idx]);
    },

    insertVariant(key, originalId) {
        window.parent.postMessage({
          pluginMessage: {
            type: "user-selected-variant",
            key,
            originalId
          }
        }, "*");
    }
  },
  mounted() {
    this.loadModel();

    // **gunakan arrow function**, biar `this` merujuk ke Vue instance
    window.addEventListener("message", (event) => {
        const msg = event.data.pluginMessage;
        console.log(event.data);
        if (!msg) return;
  
        switch (msg.type) {
          case "summary":
            this.handleSummary(msg);
            break;
          case "exportImage":
            this.handleExportImage(msg);
            break;
          case "noInvalidInstances":
            this.dataReceived = true;
            this.images = [];
            this.noInvalid = true;
            break;
          case "masterPreview":
            this.handleMasterPreview(msg);
            break;
          default:
            console.warn("Unknown message type di UI:", msg.type);
        }
      });
  },
};
</script>

<style scoped>
:root {
  --clr-primary: #02ae5b;
  --clr-secondary: #ffffff;
  --clr-gray-100: #f3f6f9;
  --clr-gray-300: #d1d5db;
  --clr-gray-600: #4b5563;
}

/* WRAPPER */
.plugin-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* SIDEBAR */
.sidebar {
  width: 64px;
  background: var(--clr-secondary);
  display: flex;
  box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.15);
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.sidebar-icons {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-icons li,
.sidebar-bottom button {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  background-color: var(--clr-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  padding: 0;
  transition: background-color 0.2s;
}

.sidebar img {
  width: 24px;
  height: 24px;
}

.sidebar-icons li.is-active,
.sidebar-bottom button.is-active {
  background-color: #08A94C;
}

/* MAIN CONTENT */
.plugin-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  gap: 16px;
}

/* HEADER */
.plugin-header {
  display: flex;
  justify-content: space-between;
  background: #F5F8FA;
  padding: 24px 16px;
  padding-right: 40px;
  height: 144px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-illustration img {
  max-width: 200px;
  height: auto;
}

/* SUMMARY GRID */
.summary-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  text-align: center;
}

.summary-divider {
  width: 1px;
  height: 40px;
  background: var(--clr-gray-300);
}

/* CARDS */
.card {
  background: var(--clr-secondary);
  border: 1px solid var(--clr-gray-300);
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
  background: var(--clr-gray-100);
  padding: 12px 16px;
  font-weight: 600;
}

.card-body {
  display: flex;
  padding: 16px;
}

.instance-preview img {
  max-width: 180px;
  border: 1px solid var(--clr-gray-300);
  border-radius: 4px;
}

.instance-info {
  margin-left: 24px;
  flex: 1;
}

.instance-info p {
  margin: 6px 0;
}

/* BUTTON GROUP */
.btn-group {
  margin-top: 12px;
  display: flex;
  gap: 12px;
}

.btn {
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 0.95rem;
  cursor: pointer;
}

.btn--primary {
  background: var(--clr-primary);
  color: var(--clr-secondary);
}

.btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--secondary {
  background: var(--clr-gray-100);
  color: var(--clr-gray-600);
}

/* VARIANTS */
.variants {
  margin-top: 12px;
  display: flex;
  gap: 12px;
}

.variant {
  text-align: center;
}

.variant img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border: 1px solid var(--clr-gray-300);
  border-radius: 4px;
}

.variant-name {
  margin: 4px 0;
  font-size: 0.85rem;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  color: var(--clr-gray-600);
  margin-top: 40px;
}
</style>
