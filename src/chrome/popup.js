document.getElementById("copyButton").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({ action: "copyCookies", tabId: tab.id }, (response) => {
        const statusEl = document.getElementById("status");
        if (response && response.success) {
            statusEl.textContent = "✓ Cookies copied to clipboard!";
            statusEl.className = "status success";
        } else {
            statusEl.textContent = "✗ Failed to copy cookies";
            statusEl.className = "status error";
        }
    });
});
