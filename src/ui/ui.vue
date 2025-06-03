<template>
  <div style="font-family: sans-serif; padding: 16px; max-width: 760px; margin: auto;">
    <h1>Figma Component Checker</h1>
 
    <!-- Tombol Check Components: disable kalau model belum siap -->
    <button :disabled="!isModelReady" @click="onClickCheck"
      style="padding: 8px 16px; font-size: 14px; margin-bottom: 12px;">
      {{ isModelReady ? "Check Components" : "Loading Model..." }}
    </button>
 
    <!-- Status loading -->
    <div v-if="!isModelReady" style="color: #999; margin-top: 8px;">
      ⚠️ Model sedang di-load, mohon tunggu...
    </div>
    <div v-else style="color: #4CAF50; margin-top: 8px;">
      ✅ Model sudah siap digunakan.
    </div>
 
    <!-- Ringkasan total/valid/invalid (setelah summary datang) -->
    <div v-if="summary.total !== null" style="margin-top: 16px;">
      <p><strong>Ringkasan Pemeriksaan:</strong></p>
      <ul>
        <li>Total Instances: {{ summary.total }}</li>
        <li>Valid: {{ summary.valid }}</li>
        <li>Invalid: {{ summary.invalid }}</li>
      </ul>
    </div>
 
    <!-- Jika tidak ada invalid instances, tampilkan ini -->
    <div v-if="noInvalid" style="margin-top: 8px; color: #4CAF50;">
      🎉 Semua instance valid, tidak ada yang perlu dicek.
    </div>
 
    <!-- Container untuk menampilkan setiap gambar + hasil prediksi -->
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
        <button @click="goToComponent(item.predictedLabel, item.id)" style="padding: 6px 12px; font-size: 13px;">
          Go to Master Component
        </button>
        <button @click="fetchMasterPreview(item.predictedLabel, item.id)"
          style="padding: 6px 12px; font-size: 13px; margin-left: 8px;">
          Tampilkan Preview Master
        </button>
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
            <button @click="insertVariant(variant.key, item.id)" style="padding: 4px 8px; font-size: 12px;">
              Pilih
            </button>
          </div>
        </div>
      </div>
    </div>
 
    <!-- Jika tidak ada images sama sekali dan setelah summary datang -->
    <div v-if="dataReceived && images.length === 0 && !noInvalid" style="margin-top: 16px;">
      Tidak ada gambar invalid untuk diprediksi.
    </div>
  </div>
</template>
 
<script>
import * as tf from "@tensorflow/tfjs";
import { toRaw, reactive } from "vue";
 
export default {
  name: "UI",
  data() {
    return {
      model: null,
      classLabels: [],       // jika model mengembalikan label string, simpan di sini
      isModelReady: false,
      summary: { total: null, valid: null, invalid: null },
      images: [],            // setiap item: { name, id, blobUrl, predictedLabel, confidence, variants: [] }
      noInvalid: false,      // tanda kalau tidak ada invalid instances
      dataReceived: false    // tanda kalau kita sudah mendapat setidaknya satu ringkasan
    };
  },
  methods: {
    // 1. Load model + metadata (labels) segera setelah mounted
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
 
    // 2. Saat tombol diklik → kirim pesan ke Controller
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
 
    // 3. Tangani hasil exportImage (satu-per-satu)
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
 
    // 4. Handler untuk summary
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
 
    // 5. Jika user klik “Go to Master Component”
    goToComponent(predictedLabel, originalId) {
      // Kirim pesan ke Controller dengan tipe “go-to-component”
      window.parent.postMessage({
        pluginMessage: {
          type: "go-to-component",
          id: originalId
        }
      }, "*");
    },
 
    // 6. Jika user klik “Tampilkan Preview Master”
    fetchMasterPreview(predictedLabel, originalId) {
      window.parent.postMessage({
        pluginMessage: {
          type: "fetch-master-preview",
          predictedLabel,
          originalId
        }
      }, "*");
    },
 
    // 7. Tapi Controller mengirim balik “masterPreview” dengan array variants
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
 
    // 8. Jika user memilih salah satu varian, kirim pesan ke Controller supaya disisipkan ke canvas
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
    // 1. Load Model segera
    this.loadModel();
 
    // 2. Pasang listener pesan dari Controller
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
  }
};
</script>
 
<style>
/* Tambahkan style jika perlu */
</style>
 
 