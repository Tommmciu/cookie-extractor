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

        const cookies = await browser.cookies.getAll({ url: tab.url, storeId });

        if (cookies.length === 0) {
            showBadge(tab.id, "0", "#6c757d");
            return;
        }

        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

        // WebContent process is sandboxed from pasteboard; delegate write to native handler
        browser.runtime.sendNativeMessage(
            "net.jeniec.SafariCookieExtractor",
            { text: cookieHeader },
            (response) => {
                if (response && response.success) {
                    showBadge(tab.id, "✓", "#28a745");
                } else {
                    showBadge(tab.id, "✗", "#dc3545");
                }
            }
        );
    } catch (error) {
        showBadge(tab.id, "✗", "#dc3545");
    }
});
