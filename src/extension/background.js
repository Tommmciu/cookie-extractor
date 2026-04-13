function showBadge(tabId, text, color) {
    chrome.action.setBadgeText({ text: text, tabId: tabId });
    chrome.action.setBadgeBackgroundColor({ color: color, tabId: tabId });
    setTimeout(() => { chrome.action.setBadgeText({ text: "", tabId: tabId }); }, 2000);
}

async function extractAndCopyCookies(tabId, url) {
    if (!url || !/^https?:\/\//.test(url)) {
        showBadge(tabId, "✗", "#dc3545");
        return false;
    }

    try {
        // Extract cookies for the URL - chrome.cookies.getAll handles multiple stores automatically
        const cookies = await chrome.cookies.getAll({ url: url });
        console.log("[CookieExtractor] cookies count:", cookies.length);

        if (cookies.length === 0) {
            showBadge(tabId, "0", "#6c757d");
            return false;
        }

        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
        console.log("[CookieExtractor] injecting clipboard script, length:", cookieHeader.length);

        // Use execCommand('copy') via injected script
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (text) => {
                const el = document.createElement("textarea");
                el.value = text;
                el.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
                document.body.appendChild(el);
                el.focus();
                el.select();
                const ok = document.execCommand("copy");
                document.body.removeChild(el);
                return ok;
            },
            args: [cookieHeader]
        });

        console.log("[CookieExtractor] execCommand result:", results);
        const success = results?.[0]?.result === true;
        showBadge(tabId, success ? "✓" : "✗", success ? "#28a745" : "#dc3545");
        return success;
    } catch (error) {
        console.log("[CookieExtractor] caught error:", error?.message, error);
        showBadge(tabId, "✗", "#dc3545");
        return false;
    }
}

// Chrome: Handle clicks from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "copyCookies") {
        chrome.tabs.get(message.tabId, async (tab) => {
            const success = await extractAndCopyCookies(tab.id, tab.url);
            sendResponse({ success: success });
        });
        return true; // Keep channel open for async response
    }
});

// Safari: Handle direct toolbar clicks (if Safari still uses onClicked)
// Check if this is Safari and has onClicked support
if (chrome.action && chrome.action.onClicked) {
    chrome.action.onClicked.addListener(async (tab) => {
        await extractAndCopyCookies(tab.id, tab.url);
    });
}
