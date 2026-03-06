function showBadge(tabId, text, color) {
    browser.action.setBadgeText({ text: text, tabId: tabId });
    browser.action.setBadgeBackgroundColor({ color: color, tabId: tabId });
    setTimeout(() => { browser.action.setBadgeText({ text: "", tabId: tabId }); }, 2000);
}

browser.action.onClicked.addListener(async (tab) => {
    if (!tab.url || !/^https?:\/\//.test(tab.url)) {
        showBadge(tab.id, "✗", "#dc3545");
        return;
    }

    try {
        await browser.permissions.request({ origins: ["<all_urls>"] });

        // Safari uses multiple cookie stores; find the one for this tab
        const stores = await browser.cookies.getAllCookieStores();
        const tabStore = stores.find(s => s.tabIds.includes(tab.id));
        const storeId = tabStore?.id;
        console.log("[CookieExtractor] storeId:", storeId);

        const cookies = await browser.cookies.getAll({ url: tab.url, storeId });
        console.log("[CookieExtractor] cookies count:", cookies.length);

        if (cookies.length === 0) {
            showBadge(tab.id, "0", "#6c757d");
            return;
        }

        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
        console.log("[CookieExtractor] injecting clipboard script, length:", cookieHeader.length);

        // Use execCommand('copy') via injected script — avoids pboard XPC sandbox restriction
        const results = await browser.scripting.executeScript({
            target: { tabId: tab.id },
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
        showBadge(tab.id, success ? "✓" : "✗", success ? "#28a745" : "#dc3545");
    } catch (error) {
        console.log("[CookieExtractor] caught error:", error?.message, error);
        showBadge(tab.id, "✗", "#dc3545");
    }
});
