// Menampilkan UI dengan ukuran 800x600
figma.showUI(__html__, { width: 800, height: 600 });

let FIGMA_FILE_KEY = '';
let CNN_MODEL_URL  = '';
const FIGMA_ACCESS_TOKEN = "figd_dqS-9HS38jaKupAx9-t-LC4j2znS9a0m7icKdX_P";
let lastFetchedKey = '';

// 1.a) State lazy‐load untuk Component Page
let metaComponents   = [];
let isFullyLoaded    = false;
const batchSize      = 20;


// Fetch satu batch metadata + thumbnail
async function fetchComponentsBatch(start = 0) {
  if (metaComponents.length === 0 || FIGMA_FILE_KEY !== lastFetchedKey) {
    lastFetchedKey = FIGMA_FILE_KEY;
    const res = await fetch(
      `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/components`,
      { headers: { 'X-Figma-Token': FIGMA_ACCESS_TOKEN } }
    );
    if (!res.ok) throw new Error('Failed to fetch components metadata');
    const data = await res.json();
    metaComponents = Object.values(data.meta.components);
  }

  const total = metaComponents.length;
  const end   = Math.min(start + batchSize, total);
  const batch = metaComponents.slice(start, end);
  if (end >= total) isFullyLoaded = true;

  const ids    = batch.map(c => c.node_id).join(',');
  const imgRes = await fetch(
    `https://api.figma.com/v1/images/${FIGMA_FILE_KEY}?ids=${ids}&format=png`,
    { headers: { 'X-Figma-Token': FIGMA_ACCESS_TOKEN } }
  );
  if (!imgRes.ok) throw new Error('Failed to fetch component images');
  const imgData = await imgRes.json();

  return batch.map(c => ({
    key:           c.key,
    // jika dia varian, ambil nama set; kalau bukan, pakai nama asli
    name:          c.containing_frame?.containingComponentSet?.name || c.name,
    thumbnail_url: imgData.images[c.node_id] || ''
  }));
}


// Master components untuk Checker
let masterComponents = [];

async function fetchMasterComponents() {
  // 1) Jangan fetch ulang kalau sudah ada
  if (masterComponents.length) return;

  // 2) Panggil endpoint /components, bukan /component_sets
  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/components`;

  try {
    const response = await fetch(url, {
      headers: { "X-Figma-Token": FIGMA_ACCESS_TOKEN }
    });
    if (!response.ok) throw new Error("Failed to fetch components");

    const data = await response.json();

    // 3) Map tiap komponen: kalau ada containing_frame.containingComponentSet
    masterComponents = Object.values(data.meta.components).map(c => {
      // optional chaining agar safe kalau beberapa field tidak ada
      const setName = c.containing_frame
        ?.containingComponentSet
        ?.name;
      return {
        key:  c.key,
        name: setName || c.name
      };
    });

    console.log("Fetched master components:", masterComponents);
    figma.ui.postMessage({ type: 'result', components: masterComponents });

  } catch (err) {
    console.error("Error fetching master components:", err);
    figma.notify("Error fetching master components. See console.");
  }
}




// Fungsi untuk memeriksa instance di dalam frame secara rekursif
async function checkInstancesInFrame(frame) {
  const result = {
    total: 0,
    valid: 0,
    invalid: 0,
    invalidInstances: []
  };

  const instances = frame.children.filter(
    (node) => node.type === "INSTANCE" && node.visible
  );

  for (const instance of instances) {
    result.total++;
    try {
      const mainComponent = await instance.getMainComponentAsync();
      if (mainComponent) {
        const isValid = masterComponents.some(component => component.key === mainComponent.key);
        if (isValid) {
          result.valid++;
        } else {
          console.log(`Instance mismatch: ${instance.name}`);
          result.invalid++;
          result.invalidInstances.push(instance);
        }
      } else {
        console.log(`Instance tanpa main component: ${instance.name}`);
        result.invalid++;
        result.invalidInstances.push(instance);
      }
    } catch (error) {
      console.error(`Error processing instance ${instance.name}:`, error);
    }
  }

  for (const child of frame.children) {
    if (child.type === "FRAME" && child.visible) {
      const childResult = await checkInstancesInFrame(child);
      result.total += childResult.total;
      result.valid += childResult.valid;
      result.invalid += childResult.invalid;
      result.invalidInstances.push(...childResult.invalidInstances);
    }
  }
  return result;
}



async function exportNodeAsPng(node) {
  try {
    // Hitung ukuran node
    const nodeWidth = node.width;
    const nodeHeight = node.height;
    const maxDimension = Math.max(nodeWidth, nodeHeight);

    // Tentukan scale dinamis berdasarkan ukuran node
    let scale = 2; // Default
    if (maxDimension < 100) {
      scale = 4;
    } else if (maxDimension < 300) {
      scale = 3;
    } else {
      scale = 2;
    }

    console.log(`Exporting node ${node.name} with scale ${scale}x`);

    const imageData = await node.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: scale }
    });

    sendToUi(node.name, node.id, imageData);
  } catch (error) {
    console.error(`Error exporting node ${node.name}:`, error);
    figma.notify(`Failed to export ${node.name}.`);
  }
}

// Fungsi untuk mengirim data gambar ke UI
function sendToUi(name, id, imageData, predictedLabel = "") {
  const base64Data = figma.base64Encode(imageData);
  figma.ui.postMessage({ 
    type: "exportImage", 
    name, 
    id, 
    data: base64Data, 
    predictedLabel, 
     
  });
}

// Fungsi pencarian master component berdasarkan label prediksi
// function findMasterComponentByLabel(predictedLabel) {
//   const lowerLabel = predictedLabel.toLowerCase();
//   let result = masterComponents.find(component => 
//     component.name.toLowerCase() === lowerLabel
//   );
//   if (!result) {
//     result = masterComponents.find(component => 
//       component.name.toLowerCase().includes(lowerLabel)
//     );
//   }
//   return result;
// }

// Fungsi tambahan: mencari semua kemungkinan varian master component berdasarkan label
function findMasterComponentsByLabel(predictedLabel) {
  const lowerLabel = predictedLabel.toLowerCase();
  return masterComponents.filter(component => 
    component.name.toLowerCase().includes(lowerLabel)
  );
}

// Fungsi untuk mengimpor master component dan menghasilkan preview gambarnya
// async function generateMasterPreview(predictedLabel) {
//   await fetchMasterComponents();
//   const compInfo = findMasterComponentByLabel(predictedLabel);
//   if (!compInfo) {
//     figma.notify(`Master component dengan nama '${predictedLabel}' tidak ditemukan.`);
//     return null;
//   }
//   try {
//     const masterComponent = await figma.importComponentByKeyAsync(compInfo.key);
//     const instance = masterComponent.createInstance();
//     instance.x = -1000;
//     instance.y = -1000;
//     figma.currentPage.appendChild(instance);
//     const imageData = await instance.exportAsync({
//       format: "PNG",
//       constraint: { type: "SCALE", value: 2 }
//     });
//     const base64Data = figma.base64Encode(imageData);
//     instance.remove();
//     return base64Data;
//   } catch (error) {
//     console.error("Error generating master preview:", error);
//     return null;
//   }
// }

// Fungsi tambahan untuk generate semua varian preview
async function generateMasterPreviews(predictedLabel) {
  await fetchMasterComponents();
  const possibleComponents = findMasterComponentsByLabel(predictedLabel);
  const previews = [];
  for (const compInfo of possibleComponents) {
    try {
      const masterComponent = await figma.importComponentByKeyAsync(compInfo.key);
      const instance = masterComponent.createInstance();
      instance.x = -1000;
      instance.y = -1000;
      figma.currentPage.appendChild(instance);
      const imageData = await instance.exportAsync({
        format: "PNG",
        constraint: { type: "SCALE", value: 2 }
      });
      const base64Data = figma.base64Encode(imageData);
      previews.push({
        name: compInfo.name,
        key: compInfo.key,
        preview: base64Data
      });
      instance.remove();
    } catch (error) {
      console.error(`Error generating preview for ${compInfo.name}:`, error);
    }
  }
  return previews;
}

// Handler untuk pesan dari UI
figma.ui.onmessage = async (msg) => {
  // — save-config: simpan ke global + clientStorage + notify UI
  if (msg.type === 'save-config') {
  FIGMA_FILE_KEY = msg.figmaFileKey;
  CNN_MODEL_URL  = msg.cnnModelUrl;
  // await figma.clientStorage.setAsync('plugin-config', {
  //   figmaFileKey: FIGMA_FILE_KEY,
  //   cnnModelUrl:  CNN_MODEL_URL,
  // });
  
  // kirim pesan ke UI
  figma.ui.postMessage({
    type: 'config-saved',
    figmaFileKey: FIGMA_FILE_KEY,
    cnnModelUrl:  CNN_MODEL_URL
  });
  

  return;
  }


  // — load-config: kirim config untuk prefill form di Settings
  if (msg.type === 'load-config') {
    figma.ui.postMessage({
      type: 'load-config',
      figmaFileKey: FIGMA_FILE_KEY,
      cnnModelUrl:  CNN_MODEL_URL
    });
    return;
  }

  // — load-components: initial atau setelah ganti key
  if (msg.type === 'load-components') {
    // ambil key yang dikirim UI
    const newKey = msg.figmaFileKey;
    // jika berubah, reset cache & update global
    if (newKey && newKey !== FIGMA_FILE_KEY) {
      FIGMA_FILE_KEY   = newKey;
      metaComponents   = [];
      isFullyLoaded    = false;
      masterComponents = [];
    }
    try {
      const comps = await fetchComponentsBatch(0);
      figma.ui.postMessage({
        type: 'components-loaded',
        components: comps,
        isFullyLoaded
      });
    } catch (err) {
      figma.ui.postMessage({ type: 'load-failed', message: err.message });
    }
    return;
  }

  // — load-more-components: pagination
  if (msg.type === 'load-more-components') {
    try {
      const comps = await fetchComponentsBatch(msg.currentLength);
      figma.ui.postMessage({
        type: 'components-loaded',
        components: comps,
        isFullyLoaded
      });
    } catch (err) {
      figma.ui.postMessage({ type: 'load-failed', message: err.message });
    }
    return;
  }

  // ❶ Load list komponen
  if (msg.type === 'load-master-components') {
    await fetchMasterComponents();  // sudah pakai FIGMA_ACCESS_TOKEN
    // kirim nama & key ke UI
    figma.ui.postMessage({
      type: 'master-components',
      components: masterComponents   // [{ name, key }, …]
    });
  }

  // ❷ Generate preview per komponen
  if (msg.type === 'fetch-component-preview') {
    const { key } = msg;
    try {
      // import & export instance jadi PNG
      const master = await figma.importComponentByKeyAsync(key);
      const inst   = master.createInstance();
      inst.x = -9999; inst.y = -9999;
      figma.currentPage.appendChild(inst);
      const img = await inst.exportAsync({ format:'PNG', constraint:{ type:'SCALE', value:2 }});
      const b64 = figma.base64Encode(img);
      inst.remove();
      // kirim balik ke UI
      figma.ui.postMessage({
        type: 'component-preview',
        key,
        preview: b64
      });
    } catch (e) {
      console.error('Preview error', e);
    }
  }

  // if (msg.type === 'save-config') {
  //   FIGMA_FILE_KEY = msg.figmaFileKey
  //   CNN_MODEL_URL  = msg.cnnModelUrl
  //   await figma.clientStorage.setAsync('plugin-config', {
  //     figmaFileKey: FIGMA_FILE_KEY,
  //     cnnModelUrl:   CNN_MODEL_URL
  //   })
  //   // notify UI supaya bisa trigger reload (opsional)
  //   figma.ui.postMessage({
  //     type: 'config-saved',
  //     figmaFileKey: FIGMA_FILE_KEY
  //   })
  //   return
  // }

  if (msg.type === "check-components") {
    const newKey = msg.figmaFileKey;

    // ✅ Update FIGMA_FILE_KEY jika berbeda
    if (FIGMA_FILE_KEY !== lastFetchedKey) {
      lastFetchedKey = FIGMA_FILE_KEY;
      // lastFetchedKey = '';              // ✅ Reset ini
      metaComponents = [];
      masterComponents = [];
      isFullyLoaded = false;
      console.log("🔁 FIGMA_FILE_KEY updated:", FIGMA_FILE_KEY);
    }

    const selection = figma.currentPage.selection;
    if (selection.length !== 1 || selection[0].type !== "FRAME") {
      figma.notify("Please select one frame.");
      return;
    }

    const frame = selection[0];

    // ✅ Fetch master components dengan key yang sudah diupdate
    await fetchMasterComponents();

    if (masterComponents.length === 0) {
      figma.notify("Master components not available.");
      return;
    }

    const result = await checkInstancesInFrame(frame);

    figma.ui.postMessage({ type: "clearImages" });
    figma.ui.postMessage({
      type: "summary",
      total: result.total,
      valid: result.valid,
      invalid: result.invalid,
    });

    if (result.invalidInstances.length > 0) {
      figma.notify(`${result.invalid} invalid instances found. Exporting images.`);

      for (const instance of result.invalidInstances) {
        await exportNodeAsPng(instance);
      }
    } else {
      figma.notify("All instances are valid. No images exported.");
    }
  }


  if (msg.type === "go-to-component") {
    try {
      const node = await figma.getNodeByIdAsync(msg.id);
      if (node) {
        figma.viewport.scrollAndZoomIntoView([node]);
        figma.currentPage.selection = [node];
      } else {
        figma.notify("Component not found!");
      }
    } catch (error) {
      console.error("Error fetching node by ID:", error);
      figma.notify("Error locating component. Check console for details.");
    }
  }

  if (msg.type === "fetch-master-preview") {
    const { predictedLabel, originalId } = msg;
    const previews = await generateMasterPreviews(predictedLabel);

    if (!previews || previews.length === 0) {
      const previewImage = await generateMasterPreview(predictedLabel);
      figma.ui.postMessage({ 
        type: "masterPreview", 
        originalId, 
        predictedLabel, 
        variants: previewImage ? [{ name: predictedLabel, key: "", preview: previewImage }] : [] 
      });
    } else {
      figma.ui.postMessage({ 
        type: "masterPreview", 
        originalId, 
        predictedLabel, 
        variants: previews 
      });
    }
  }

  if (msg.type === "user-selected-variant") {
    const { key, originalId } = msg;

    // Cek dulu apakah user sudah memilih frame
    const selection = figma.currentPage.selection;
    const targetFrame = (selection.length === 1 && selection[0].type === "FRAME")
      ? selection[0]
      : null;
    if (!targetFrame) {
      figma.notify("Please select one frame");
      return;
    }

    try {
      // Import component master & buat instance
      const masterComponent = await figma.importComponentByKeyAsync(key);
      const instance = masterComponent.createInstance();

      // Append ke frame terpilih
      targetFrame.appendChild(instance);
      // Posisikan di tengah
      instance.x = targetFrame.width / 2 - instance.width / 2;
      instance.y = targetFrame.height / 2 - instance.height / 2;

      // Pilih dan scroll ke instance
      figma.currentPage.selection = [instance];
      figma.viewport.scrollAndZoomIntoView([instance]);

      figma.notify("Component inserted into selected frame and ready to drag!");
    } catch (error) {
      console.error("Error inserting selected variant:", error);
      figma.notify("Error inserting component.");
    }
  }

  if (msg.type === 'insert-component') {
    // 1) Cek seleksi: harus tepat 1 frame
    const sel = figma.currentPage.selection;
    if (sel.length !== 1 || sel[0].type !== 'FRAME') {
      figma.notify('Select one frame');
      return;
    }
    const frame = sel[0];

    try {
      // 2) Import component dari key
      const master = await figma.importComponentByKeyAsync(msg.key);
      // 3) Buat instance
      const instance = master.createInstance();
      // 4) Masukkan ke dalam frame
      frame.appendChild(instance);
      // 5) Atur posisi (misal pojok kiri atas)
      instance.x = 0;
      instance.y = 0;
      // 6) Scroll dan pilih instance
      figma.currentPage.selection = [instance];
      figma.viewport.scrollAndZoomIntoView([instance]);
    } catch (err) {
      console.error('Insert component failed', err);
      figma.notify('Error inserting component.');
    }
    return;
  }
};



