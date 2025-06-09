// Menampilkan UI dengan ukuran 800x600
figma.showUI(__html__, { width: 800, height: 600 });

// Variabel global untuk menyimpan data master component (detail: key dan nama)
let masterComponents = [];

// Fungsi untuk mengambil dan menyimpan data master component dari Figma
async function fetchMasterComponents() {
  const FIGMA_ACCESS_TOKEN = "figd_dqS-9HS38jaKupAx9-t-LC4j2znS9a0m7icKdX_P";
  const FIGMA_FILE_KEY = "HIHSBFb6tatYWQYl2LudlV";
  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/components`;

  if (masterComponents.length === 0) {
    try {
      const response = await fetch(url, {
        headers: { "X-Figma-Token": FIGMA_ACCESS_TOKEN }
      });
      if (!response.ok) throw new Error("Failed to fetch components");
      const data = await response.json();
      const components = Object.values(data.meta.components);
      masterComponents = components.map(component => ({
        key: component.key,
        name: component.name
      }));
      console.log("Fetched master components:", masterComponents);
    } catch (error) {
      console.error("Error fetching components:", error);
      figma.notify("Error fetching components. Check console for details.");
    }
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

function isPlainTextOnly(node) {
  // Kalau bukan FRAME atau GROUP, langsung false
  if (node.type !== "FRAME" && node.type !== "GROUP") return false;

  // Recursive check semua descendant
  function checkChildren(nodes) {
    for (const child of nodes) {
      if (child.type === "TEXT") {
        continue; // OK
      } else if (child.type === "FRAME" || child.type === "GROUP") {
        if (!checkChildren(child.children)) {
          return false; // Kalau child group/frame isinya bukan text, gagal
        }
      } else {
        return false; // Ada node lain selain TEXT / FRAME / GROUP
      }
    }
    return true;
  }

  return checkChildren(node.children);
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

// console.log(`Checking node: ${node.name}`);
// for (const child of node.children) {
//   console.log(`Child node: ${child.name} - Type: ${child.type}`);
// }


// Fungsi untuk mengirim data gambar ke UI
function sendToUi(name, id, imageData, predictedLabel = "", confidence = "") {
  const base64Data = figma.base64Encode(imageData);
  figma.ui.postMessage({ 
    type: "exportImage", 
    name, 
    id, 
    data: base64Data, 
    predictedLabel, 
    confidence 
  });
}

// Fungsi pencarian master component berdasarkan label prediksi
function findMasterComponentByLabel(predictedLabel) {
  const lowerLabel = predictedLabel.toLowerCase();
  let result = masterComponents.find(component => 
    component.name.toLowerCase() === lowerLabel
  );
  if (!result) {
    result = masterComponents.find(component => 
      component.name.toLowerCase().includes(lowerLabel)
    );
  }
  return result;
}

// Fungsi tambahan: mencari semua kemungkinan varian master component berdasarkan label
function findMasterComponentsByLabel(predictedLabel) {
  const lowerLabel = predictedLabel.toLowerCase();
  return masterComponents.filter(component => 
    component.name.toLowerCase().includes(lowerLabel)
  );
}

// Fungsi untuk mengimpor master component dan menghasilkan preview gambarnya
async function generateMasterPreview(predictedLabel) {
  await fetchMasterComponents();
  const compInfo = findMasterComponentByLabel(predictedLabel);
  if (!compInfo) {
    figma.notify(`Master component dengan nama '${predictedLabel}' tidak ditemukan.`);
    return null;
  }
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
    instance.remove();
    return base64Data;
  } catch (error) {
    console.error("Error generating master preview:", error);
    return null;
  }
}

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
  if (msg.type === "check-components") {
    const selection = figma.currentPage.selection;
    if (selection.length !== 1 || selection[0].type !== "FRAME") {
      figma.notify("Please select one frame.");
      return;
    }
    const frame = selection[0];
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
    try {
      const { key, originalId } = msg;
      const masterComponent = await figma.importComponentByKeyAsync(key);
      const instance = masterComponent.createInstance();

      const selection = figma.currentPage.selection;
      let targetFrame = null;

      if (selection.length === 1 && selection[0].type === "FRAME") {
        targetFrame = selection[0];
      }

      if (targetFrame) {
        targetFrame.appendChild(instance);
        instance.x = targetFrame.width / 2 - instance.width / 2;
        instance.y = targetFrame.height / 2 - instance.height / 2;
        figma.currentPage.selection = [instance];
        figma.viewport.scrollAndZoomIntoView([instance]);
        figma.notify("Component inserted into selected frame and ready to drag!");
      } else {
        figma.currentPage.appendChild(instance);
        instance.x = 100;
        instance.y = 100;
        figma.currentPage.selection = [instance];
        figma.viewport.scrollAndZoomIntoView([instance]);
        figma.notify("Component inserted into page and ready to drag!");
      }
    } catch (error) {
      console.error("Error inserting selected variant:", error);
      figma.notify("Error inserting component.");
    }
  }
};


// test