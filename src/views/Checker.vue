<template>
  <div class="plugin-wrapper">
    <!-- SIDEBAR KIRI -->
    <aside class="sidebar">
      <ul class="sidebar-icons">
        <li class="tooltip-container" @click="goToChecker" :class="{ 'is-active': $route.path === '/checker' }">
          <img src="../ui/assets/icon-checker-active.png" alt="Checker" />
          <span class="tooltip-text">Component Checker</span>
        </li>

        <li class="tooltip-container" @click="goToComponentPage" :class="{ 'is-active': $route.path === '/component' }">
          <img src="../ui/assets/icon-component-default.png" alt="Component" />
          <span class="tooltip-text">Component Library</span>
        </li>

        <li class="tooltip-container" @click="goToHelp" :class="{ 'is-active': $route.path === '/help' }">
          <img src="../ui/assets/icon-help-default.png" alt="Help" />
          <span class="tooltip-text">Help</span>
        </li>
      </ul>

      <div class="sidebar-bottom">
        <button class="tooltip-container" @click="goToSettings" :class="{ 'is-active': $route.path === '/settings' }">
          <img src="../ui/assets/icon-settings-default.png" alt="Settings" />
          <span class="tooltip-text">Settings</span>
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
          <Button :disabled="!checker.isModelReady" variant="primary" @click="onClickCheck">
            {{ checker.isModelReady ? "Check Components" : "Loading Model..." }}
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
          <p class="h5">{{ checker.summary.total ?? 0 }}</p>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <p class="body text-light-dark">Valid Component</p>
          <p class="h5">{{ checker.summary.valid ?? 0 }}</p>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <p class="body text-light-dark">Invalid Component</p>
          <p class="h5">{{ checker.summary.invalid ?? 0 }}</p>
        </div>
      </div>

      <div class="container-instance">
        <div v-for="(item, idx) in checker.images" :key="idx" class="container">
          <div class="panel left">
            <h7 class="bold">{{ item.name }} (ID: {{ item.id }})</h7>
            <div class="img-container">
              <img :src="item.blobUrl" alt="Invalid Instance" class="responsive-img" />
            </div>
            <Button block="true" variant="primary" @click="goToComponent(item.predictedLabel, item.id)">
              Go to Component
            </Button>
          </div>

          <div class="panel right">
            <h7 class="bold">Summary</h7>
            <div class="summary-row" v-if="item.predictedLabel">
              <p class="body text-light-dark">Instance: {{ item.name }}</p>
              <p class="body text-light-dark">Prediksi Label: {{ item.predictedLabel }}</p>
              <p class="body text-light-dark">Confidence: {{ (item.confidence * 100).toFixed(2) }}%</p>
            </div>
            <hr class="divider" />
            <h7 class="bold">Design System Component</h7>
            <p class="body-small text-light-dark">
              Silakan pilih komponen di bawah ini dari Design System yang sesuai untuk menggantikan komponen yang tidak sesuai.
            </p>

            <div class="component-container">
              <div v-if="item.variants.length">
                <div v-for="(variant, j) in item.variants" :key="variant.key" class="component-item">
                  <img :src="variant.previewUrl" alt="Preview" class="thumb" />
                  <p class="body bold" style="display: block; width: 100%; margin: 0;">{{ variant.name }}</p>
                  <Button variant="secondary" @click="insertVariant(variant.key, item.id)">
                    Insert
                  </Button>
                </div>
              </div>
              <div v-else>
                <p>Memuat varian…</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="checker.dataReceived && checker.images.length === 0 && !checker.noInvalid" style="margin-top: 16px;">
          Tidak ada gambar invalid untuk diprediksi.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as tf from "@tensorflow/tfjs"
import { ref, reactive, toRaw, watch, onMounted, onBeforeUnmount } from "vue"
import Button from "../ui/components/Button.vue"
import { useCheckerStore } from "../code/checkerStore"
import { useConfigStore } from "../code/configStore"

export default {
  name: "Checker",
  components: { Button },

  setup() {
    const checker = useCheckerStore()
    const config = useConfigStore()

    const model = ref(null)
    const classLabels = ref([])
    const fileChanged = ref(false)
    const lastUsedKey = ref("")


    // ⏳ Load model awal
    const loadModel = async () => {
      try {
        await tf.ready()
        if (!config.cnnModelUrl) throw new Error("CNN Model URL belum di-set!")

        model.value = await tf.loadLayersModel(config.cnnModelUrl)
        const metadataUrl = config.cnnModelUrl.replace("model.json", "metadata.json")
        const metadata = await fetch(metadataUrl).then(res => res.json())

        classLabels.value = metadata.labels || []
        checker.setModelReady(true)
        console.log("✅ Model loaded:", metadata)
      } catch (err) {
        console.error("❌ Error saat load model:", err)
      }
    }

    // 👁️ Watch figmaFileKey dan reset jika berubah
    watch(() => config.figmaFileKey, (newKey, oldKey) => {
      if (newKey && newKey !== oldKey) {
        console.log("🔁 figmaFileKey changed:", oldKey, "→", newKey)

        checker.setImages([])
        checker.setSummary({ total: null, valid: null, invalid: null })
        checker.setFlags({ dataReceived: false, noInvalid: false })

        fileChanged.value = true
      }
    })

    // 🔘 Saat user klik Check
    const onClickCheck = () => {
      if (!checker.isModelReady) {
        console.warn("Model belum siap.")
        return
      }
      
      console.log("📤 Sending check-components for:", config.figmaFileKey)

      checker.setImages([])
      checker.setSummary({ total: null, valid: null, invalid: null })
      checker.setFlags({ dataReceived: false, noInvalid: false })
      fileChanged.value = false

      window.parent.postMessage({
        pluginMessage: {
          type: "check-components",
          figmaFileKey: config.figmaFileKey,
          cnnModelUrl: config.cnnModelUrl
        }
      }, "*")
    }

    const handleExportImage = async (msg) => {
      if (checker.images.some(item => item.id === msg.id)) return

      const blob = new Blob([Uint8Array.from(atob(msg.data), c => c.charCodeAt(0))], { type: "image/png" })
      const blobUrl = URL.createObjectURL(blob)

      const newItem = reactive({
        name: msg.name,
        id: msg.id,
        blobUrl,
        predictedLabel: null,
        confidence: null,
        variants: []
      })

      checker.addImage(newItem)

      const img = new Image()
      img.src = blobUrl
      img.onload = async () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0)

        let tensorImage = tf.browser.fromPixels(ctx.getImageData(0, 0, canvas.width, canvas.height)).toFloat()
        tensorImage = tf.image.resizeBilinear(tensorImage, [224, 224]).div(255.0).expandDims(0)

        const rawModel = toRaw(model.value)
        const predictionTensor = rawModel.predict(tensorImage)
        const dataArray = await predictionTensor.data()

        const maxIndex = dataArray.indexOf(Math.max(...dataArray))
        newItem.predictedLabel = classLabels.value[maxIndex] || `Index ${maxIndex}`
        newItem.confidence = dataArray[maxIndex]

        fetchMasterPreview(newItem.predictedLabel, newItem.id)
      }
    }

    const fetchMasterPreview = (predictedLabel, originalId) => {
      window.parent.postMessage({
        pluginMessage: {
          type: "fetch-master-preview",
          predictedLabel,
          originalId
        }
      }, "*")
    }

    const handleMasterPreview = (msg) => {
      const idx = checker.images.findIndex(item => item.id === msg.originalId)
      if (idx !== -1) {
        checker.images[idx].variants = msg.variants.map(v => ({
          name: v.name,
          key: v.key,
          previewUrl: "data:image/png;base64," + v.preview
        }))
      }
    }

    const insertVariant = (key, originalId) => {
      window.parent.postMessage({
        pluginMessage: {
          type: "user-selected-variant",
          key,
          originalId
        }
      }, "*")
    }

    const goToChecker = () => window.location.href = "#/checker"
    const goToHelp = () => window.location.href = "#/help"
    const goToSettings = () => window.location.href = "#/settings"
    const goToComponentPage = () => window.location.href = "#/component"
    const goToComponent = (predictedLabel, id) => {
      window.parent.postMessage({ pluginMessage: { type: "go-to-component", id } }, "*")
    }

    // 📨 Terima pesan dari plugin
    const handleMessage = (event) => {
      const msg = event.data.pluginMessage
      if (!msg) return

      switch (msg.type) {
        case "clearImages":
          checker.setImages([])
          break
        case "summary":
          checker.setFlags({ dataReceived: true, noInvalid: msg.invalid === 0 })
          checker.setSummary({
            total: msg.total,
            valid: msg.valid,
            invalid: msg.invalid
          })
          break
        case "noInvalidInstances":
          checker.setFlags({ dataReceived: true, noInvalid: true })
          checker.setImages([])
          break
        case "exportImage":
          handleExportImage(msg)
          break
        case "masterPreview":
          handleMasterPreview(msg)
          break
        case "components-loaded":
          console.log("✅ Fetched master components:", msg.components)
          break
      }
    }

    onMounted(() => {
      window.scrollTo(0, checker.scrollY)
      loadModel()
      window.addEventListener("message", handleMessage)

      lastUsedKey.value = config.figmaFileKey

      // Cek saat mount, apakah fileKey berubah sejak terakhir
      if (checker.lastUsedKey && checker.lastUsedKey !== config.figmaFileKey) {
        console.log("⚠️ figmaFileKey berbeda dari sebelumnya. Harus cek ulang.")
        fileChanged.value = true

        checker.setImages([])
        checker.setSummary({ total: null, valid: null, invalid: null })
        checker.setFlags({ dataReceived: false, noInvalid: false })
      }

      // Simpan key untuk next check
      checker.lastUsedKey = config.figmaFileKey
    })

    onBeforeUnmount(() => {
      window.removeEventListener("message", handleMessage)
      checker.setScrollY(window.scrollY)
    })

    return {
      checker,
      onClickCheck,
      insertVariant,
      goToComponent,
      goToChecker,
      goToHelp,
      goToSettings,
      goToComponentPage,
      fileChanged
    }
  }
}
</script>



<style scoped>

.tooltip-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tooltip-text {
  position: absolute;
  left: 48px; /* Jarak ke kanan dari ikon */
  top: 50%;
  transform: translateY(-50%);
  background-color: #333F47;
  color: #F5F5F5;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.tooltip-container:hover .tooltip-text {
  opacity: 1;
}

/* Arrow segitiga di kiri */
.tooltip-text::before {
  content: "";
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #2D2F36;
}



.img-container {
  
  display: flex;
  justify-content: center;
  align-items: center;
  height: 205px;
  background-color: #EEEEEE;
  border-radius: 10px;
  /* overflow: hidden; */
}

.responsive-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* kalau mau selalu tampil di tengah (block + margin) */
  display: block;
}

.container-instance {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  padding-top: 0px;
}

.container {
  display: flex;
  border: 1px solid #E8ECF5;
  border-radius: 10px;
  /* gap: 24px; */
  background: #ffffff;
  min-height: 325px;
  /* padding: 24px; */
}

/* panel common */
.panel {
  background: #ffffff;
  height: 325px;
  flex: 1;
  border: 1px solid #E8ECF5;
  border-radius: 10px;
  padding: 16px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}

.left {
  display: flex;
  height: 325px;
  width: 50%;
  /* height: fit-content; */
  flex-direction: column;
  gap: 16px;
  background-color: #F9F9F9;
  border-radius: 10px 0px 0px 10px;

}

.right {
  display: flex;
  width: 50%;
  height: 325px;
  flex-direction: column;
  background-color: #ffffff;
  gap: 8px;
  border-radius: 0px 10px 10px 0px;
}

.heading {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
}



/* Buttons */
.btn {
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.browse {
  background: #f3f4f6;
  color: #111827;
  padding: 10px 16px;
  margin-bottom: 16px;
}

.go {
  background: #16a34a;
  color: #ffffff;
  padding: 12px;
  width: 100%;
}

/* Summary */
.summary-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: space-between;
  width: 100%;
  
}

.label {
  color: #4b5563;
}

.value {
  font-weight: 600;
  color: #111827;
}

.divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0px 0;
}

/* Design System */
.subheading {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.instruction {
  margin: 0 0 16px;
  font-size: 14px;
  color: #6b7280;
}

.component-container {
  flex: 1;
  min-height: 72px;
  overflow-y: auto;

  /* Firefox */
  scrollbar-width: none;
  /* IE 10+ */
  -ms-overflow-style: none;
}

/* Chrome, Safari, Opera */
.component-container::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.component-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  height: 72px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 16px;
  margin-bottom: 8px;
  align-items: center;
}

.component-item:last-child {
  margin-bottom: 0;
}

.thumb {
  width: 52px;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* kalau mau selalu tampil di tengah (block + margin) */
  display: block;
}

.name {
  flex: 1;
  font-weight: 600;
  color: #111827;
}

.insert {
  background: #f3f4f6;
  color: #111827;
  padding: 8px 12px;
}


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
  overflow: visible;
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
