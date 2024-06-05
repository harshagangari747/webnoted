console.log("webnoted!");
let currentCommand = "";
let savedText = { time: Date.now() * 60 * 60 * 1, data: [] };
let tabId = undefined;

chrome.action.onClicked.addListener(() => {
  let pastReport = chrome.storage.local.get(["randomKey"]);
  if (pastReport.randomKey) {
  }
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      var activeTab = tabs[0].id;
      console.log("id:", activeTab, "url:", activeTab.url);
      chrome.scripting.executeScript({
        target: { tabId: activeTab },
        files: ["content.js"],
      });
    }
  });
});

chrome.commands.onCommand.addListener((command) => {
  currentCommand = command;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      tabId = tabs[0].id;
      console.log(tabId, tabs[0].url);
      chrome.tabs.sendMessage(tabId, {
        userCommand: true,
      });
    }
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("message heard:",request)
  if (request.text === "clear") {
    chrome.storage.local.remove(["randomKey"]);
    console.log(chrome.storage.local.get(["randomKey"]));
  } else if (request.urlFunction) {
    var objURLFunc = eval("(" + request.urlFunction + ")");
    console.log("objurl func: ", typeof objURLFunc);
  } else if (currentCommand === "simpleLine" || currentCommand === "heading") {
    savedText["data"] = [
      ...savedText["data"],
      { command: currentCommand, text: request.text },
    ];
  }
  console.log("bg.js", request.text);
  chrome.storage.local.set({ randomKey: savedText });
  chrome.storage.local.get(["randomKey"], (result) => {
    console.log("Stored data:", result);
  });
});

chrome.contextMenus.create({
  id: "donwload context menu",
  title: "WebNoted: Download Report",
  contexts: ["all"],
});

chrome.contextMenus.onClicked.addListener(downloadReportClicked);

 function downloadReportClicked() {
  chrome.storage.local.get(["randomKey"], function (result) {
    console.log("result", result.randomKey);
    fetch("https://localhost:44334/GetPdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.randomKey),
    })
      .then((response) => {
        const base = response;
        console.log("base64",atob(base.body));
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => {
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });
        console.log("blob==", blob);
        
         handlePdfDownloadResponse(arrayBuffer);
      })
      .catch((error) => {
        console.error("Error making web request:", error);
      });
  });
}

//====Make file available for download==/
async function handlePdfDownloadResponse(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  console.log("unit8 array: ", uint8Array);
  const blob = new Blob([uint8Array], { type: "application/pdf" });
  console.log("blob: ", blob);
  const blobUrl = await getBlobURL(blob);
  console.log("blob url " + blobUrl);
  chrome.downloads.download({
    url: blobUrl,
    filename: "pqr.pdf",
  });
}

//====Get BLOB URL===
async function getBlobURL(blob) {
  const url = chrome.runtime.getURL("offscreen.html");
  try {
    console.log("creating document");
    await chrome.offscreen.createDocument({
      url,
      reasons: ["BLOBS"],
      justification: "Need URL of blob",
    });
  } catch (err) {
    console.error(err.message);
  }
  const client = (await clients.matchAll({ includedUncontrolled: true })).find(
    (c) => c.url === url
  );
  console.log(client);
  const mc = new MessageChannel();
  client.postMessage(blob, [mc.port2]);
  const result = await new Promise((cb) => (mc.port1.onmessage = cb));
  console.log(result.data);
  return result.data;
}
