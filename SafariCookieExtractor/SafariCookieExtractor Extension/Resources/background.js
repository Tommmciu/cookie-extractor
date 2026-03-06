function showBadge(tabId, text, color) {
    browser.action.setBadgeText({ text: text, tabId: tabId });
    browser.action.setBadgeBackgroundColor({ color: color, tabId: tabId });
    setTimeout(() => { browser.action.setBadgeText({ text: "", tabId: tabId }); }, 2000);
}

browser.action.onClicked.addListener(async (tab) => {
    console.log("[CookieExtractor] clicked, tab:", tab.id, "url:", tab.url);

    if (!tab.url || !/^https?:\/\//.test(tab.url)) {
        console.log("[CookieExtractor] invalid URL, aborting");
        showBadge(tab.id, "✗", "#dc3545");
        return;
    }

    try {
        console.log("[CookieExtractor] calling cookies.getAll for:", tab.url);
        const cookies = await browser.cookies.getAll({ url: tab.url });
        console.log("[CookieExtractor] cookies count:", cookies.length, cookies);

        if (cookies.length === 0) {
            showBadge(tab.id, "0", "#6c757d");
            return;
        }

        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
        console.log("[CookieExtractor] formatted header length:", cookieHeader.length);

        // WebContent process is sandboxed from pasteboard; delegate write to native handler
        browser.runtime.sendNativeMessage(
            "net.jeniec.SafariCookieExtractor",
            { text: cookieHeader },
            (response) => {
                console.log("[CookieExtractor] native response:", response, "lastError:", browser.runtime.lastError);
                if (response && response.success) {
                    showBadge(tab.id, "✓", "#28a745");
                } else {
                    showBadge(tab.id, "✗", "#dc3545");
                }
            }
        );
    } catch (error) {
        console.log("[CookieExtractor] error:", error);
        showBadge(tab.id, "✗", "#dc3545");
    }
});
