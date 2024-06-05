console.log("webnoted activated!");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("received message: ", request);
  if (request.msg) {
    if (request.msg.message === "blob")
      chrome.runtime.sendMessage({
        urlFunction: window.URL.createObjectURL.toString(),
      });
  }
  if (request.userCommand) {
    let selectedText = window.getSelection().toString();
    console.log(selectedText);
    if (selectedText) {
      //chrome.storage.local.set({"key":selectedText},()=>{console.log('set storage')})
      chrome.runtime.sendMessage({ text: selectedText });
    } else {
      alert("No text highlighted");
    }
  }
});

function menuItemClicked(info, tab) {
  console.log("Context menu item clicked!", info, tab);
  chrome.runtime.sendMessage({
    action: "contextMenuItemClicked",
    info: info,
    tab: tab,
  });
}
