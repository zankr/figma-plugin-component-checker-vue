<template>
  <div>
    <h1>Figma Component Checker</h1>
    <button @click="checkComponents">Check Components</button>

    <div id="summary">
      <p>Total: <span>{{ summary.total }}</span></p>
      <p>Valid: <span>{{ summary.valid }}</span></p>
      <p>Invalid: <span>{{ summary.invalid }}</span></p>
    </div>

    <div id="image-container" ref="imageContainer"></div>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs';

export default {
  data() {
    return {
      model: null,
      classLabels: [],
      summary: { total: 0, valid: 0, invalid: 0 }
    }
  },
  mounted() {
    console.log("Vue component mounted"); // tambahkan log ini


    this.loadModel()

    window.onmessage = (event) => {
      const message = event.data.pluginMessage

      if (message.type === "clearImages") {
        this.$refs.imageContainer.innerHTML = ""
      }

      if (message.type === "summary") {
        this.summary = {
          total: message.total,
          valid: message.valid,
          invalid: message.invalid
        }
      }

      if (message.type === "exportImage") {
        this.renderImageCard(message)
      }

      if (message.type === "masterPreview") {
        this.renderMasterPreview(message)
      }
    }
  },
  methods: {
    async loadModel() {
      try {
        console.log("Loading model...");
        await tf.ready(); // ← WAJIB sebelum pakai tf
        const modelUrl = "https://zankr.github.io/figma-ml-model/model.json"
        this.model = await tf.loadLayersModel(modelUrl)
        console.log("Model loaded successfully.");

        const metadataUrl = modelUrl.replace("model.json", "metadata.json")
        const metadata = await fetch(metadataUrl).then(res => res.json())

        if (metadata.labels) {
          this.classLabels = metadata.labels
        }
      } catch (err) {
        console.error("Error loading model:", err)
        
      }
    },

    checkComponents() {
      parent.postMessage({ pluginMessage: { type: "check-components" } }, "*")
    },

    async predict(imageData, resultElement, imageCard, originalId) {
      if (!this.model) {
        resultElement.textContent = "CNN Model not loaded."
        return
      }

      const img = new Image()
      img.src = `data:image/png;base64,${imageData}`
      img.onload = async () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = 224
        canvas.height = 224
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, 224, 224)

        const tensor = tf.browser.fromPixels(canvas).toFloat().div(tf.scalar(255)).expandDims()
        const predictions = this.model.predict(tensor)
        const predictionArray = await predictions.data()
        const maxIndex = predictionArray.indexOf(Math.max(...predictionArray))
        const maxConfidence = predictionArray[maxIndex]
        const predictedLabel = this.classLabels.length > 0 ? this.classLabels[maxIndex] : `Class ${maxIndex}`

        resultElement.textContent = `Predicted: ${predictedLabel} (Confidence: ${maxConfidence.toFixed(4)})`

        imageCard.setAttribute("data-predicted-label", predictedLabel)
        imageCard.setAttribute("data-original-id", originalId)

        parent.postMessage({
          pluginMessage: {
            type: "fetch-master-preview",
            predictedLabel,
            originalId
          }
        }, "*")
      }
    },

    renderImageCard(message) {
      const container = this.$refs.imageContainer

      const imageCard = document.createElement("div")
      imageCard.className = "image-card"
      imageCard.setAttribute("data-original-id", message.id)

      const header = document.createElement("div")
      header.className = "image-card-header"

      const componentName = document.createElement("p")
      componentName.textContent = `Component: ${message.name}`
      header.appendChild(componentName)

      const gotoButton = document.createElement("button")
      gotoButton.textContent = "Go to Component"
      gotoButton.addEventListener("click", () => {
        parent.postMessage({ pluginMessage: { type: "go-to-component", id: message.id } }, "*")
      })
      header.appendChild(gotoButton)

      imageCard.appendChild(header)

      const img = document.createElement("img")
      img.src = `data:image/png;base64,${message.data}`
      imageCard.appendChild(img)

      const resultElement = document.createElement("p")
      resultElement.className = "cnn-result"
      resultElement.textContent = "Processing CNN prediction..."
      imageCard.appendChild(resultElement)

      const previewContainer = document.createElement("div")
      previewContainer.className = "master-preview"
      previewContainer.textContent = "Loading master preview..."
      imageCard.appendChild(previewContainer)

      container.appendChild(imageCard)

      this.predict(message.data, resultElement, imageCard, message.id)
    },

    renderMasterPreview(message) {
      const cards = this.$refs.imageContainer.querySelectorAll(".image-card")
      cards.forEach(card => {
        if (card.getAttribute("data-original-id") === message.originalId) {
          const previewElem = card.querySelector(".master-preview")
          previewElem.innerHTML = ""

          if (message.variants.length > 0) {
            const variantContainer = document.createElement("div")
            variantContainer.className = "variant-choice"

            message.variants.forEach(variant => {
              const variantCard = document.createElement("div")
              variantCard.className = "variant-card"

              const img = document.createElement("img")
              img.src = `data:image/png;base64,${variant.preview}`
              img.alt = variant.name

              const label = document.createElement("div")
              label.className = "variant-name"
              label.textContent = variant.name

              variantCard.appendChild(img)
              variantCard.appendChild(label)

              variantCard.addEventListener("click", () => {
                parent.postMessage({
                  pluginMessage: {
                    type: "user-selected-variant",
                    key: variant.key,
                    originalId: message.originalId
                  }
                }, "*")
              })

              variantContainer.appendChild(variantCard)
            })

            previewElem.appendChild(variantContainer)
          } else {
            previewElem.textContent = "Master preview not available."
          }
        }
      })
    }
  }
}
</script>


<style scoped>
body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f7;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
h1 {
  font-size: 24px;
  color: #007aff;
}
button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #007aff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}
button:hover {
  background-color: #005bb5;
}
#summary {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
}
#image-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  max-height: 400px;
}
.image-card {
  padding: 16px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}
.image-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.image-card img {
  max-width: 100%;
  border-radius: 4px;
  margin-top: 8px;
}
.cnn-result {
  margin-top: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #ff3b30;
}
.master-preview {
  margin-top: 10px;
  font-size: 14px;
  color: #007aff;
}

.variant-choice {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}
.variant-card {
  width: 48%;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border 0.3s;
}
.variant-card:hover {
  border: 2px solid #007aff;
}
.variant-card img {
  width: 100%;
  display: block;
}
.variant-name {
  text-align: center;
  font-size: 12px;
  margin: 4px 0;
}
</style>




<!-- <script lang="ts" setup>
import SampleComponent from "./components/sample-component.vue";
import ButtonOzan from "./components/button.vue"
</script>

<template>
  <div style="display: flex; flex-direction: horizontal; gap: 24px;">
    <ButtonOzan id="check-components">Primary</ButtonOzan>
    <ButtonOzan variant="secondary" id="check-components">Secondary</ButtonOzan>
  </div>

  <div>
    <h1 class="h1">Contoh Judul</h1>
    <p class="body">Ini adalah teks body style</p>

    <h1 class="h1">Indomie</h1>
  </div>
</template> -->

<!-- <style lang="css">
body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f7;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

h1 {
  font-size: 24px;
  color: #007aff;
}

button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #08A94C;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #005bb5;
}

#summary {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
}

#image-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  max-height: 400px;
}

.image-card {
  padding: 16px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.image-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-card img {
  max-width: 100%;
  border-radius: 4px;
  margin-top: 8px;
}

.cnn-result {
  margin-top: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #ff3b30;
}

.master-preview {
  margin-top: 10px;
  font-size: 14px;
  color: #007aff;
}

.variant-choice {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.variant-card {
  width: 48%;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border 0.3s;
}

.variant-card:hover {
  border: 2px solid #007aff;
}

.variant-card img {
  width: 100%;
  display: block;
}

.variant-name {
  text-align: center;
  font-size: 12px;
  margin: 4px 0;
}
</style> -->
