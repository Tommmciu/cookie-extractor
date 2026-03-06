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
        // Request host permissions if not yet granted — triggers Safari's native permission dialog
        const granted = await browser.permissions.request({ origins: ["<all_urls>"] });
        console.log("[CookieExtractor] permissions granted:", granted);

        const cookies = await browser.cookies.getAll({ url: tab.url });
        console.log("[CookieExtractor] cookies count (by url):", cookies.length);

        const allCookies = await browser.cookies.getAll({});
        console.log("[CookieExtractor] cookies count (no filter):", allCookies.length);

        const stores = await browser.cookies.getAllCookieStores();
        console.log("[CookieExtractor] cookie stores:", JSON.stringify(stores));

        const origin = new URL(tab.url).hostname;
        const byDomain = await browser.cookies.getAll({ domain: origin });
        console.log("[CookieExtractor] cookies count (by domain '" + origin + "'):", byDomain.length);

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
