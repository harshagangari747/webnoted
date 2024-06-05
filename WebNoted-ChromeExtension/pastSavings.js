document.addEventListener("DOMContentLoaded", handlePastSaving);

function handlePastSaving() {
  chrome.storage.local.get(["randomKey"], function (result) {
    var pastStorage = result.randomKey;
    var fragment = document.createElement("div");
    if (pastStorage) {
      console.log("progress: ", pastStorage);
      var paragraph = document.createElement("p");
      paragraph.textContent =
        "You have previous progress. Do you wish to download? If no, the progress will be lost";

      var downloadButton = document.createElement("button");
      downloadButton.textContent = "Download";

      var optionNoButton = document.createElement("button");
      optionNoButton.textContent = "Erase";

      fragment.appendChild(paragraph);
      fragment.appendChild(downloadButton);
      fragment.appendChild(optionNoButton);
      document.body.appendChild(fragment);
    } else {
      var k = document.createElement("div");
      k.textContent = "nothing";
      document.body.appendChild(k);
    }
  });
}
