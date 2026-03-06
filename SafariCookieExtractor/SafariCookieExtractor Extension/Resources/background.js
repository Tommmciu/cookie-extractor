browser.action.onClicked.addListener(async (tab) => {
    try {
        const cookies = await browser.cookies.getAll({ url: tab.url });
        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

        await navigator.clipboard.writeText(cookieHeader);

        await browser.action.setBadgeText({ text: "✓", tabId: tab.id });
        await browser.action.setBadgeBackgroundColor({ color: "#28a745", tabId: tab.id });

        setTimeout(async () => {
            await browser.action.setBadgeText({ text: "", tabId: tab.id });
        }, 2000);
    } catch (error) {
        await browser.action.setBadgeText({ text: "✗", tabId: tab.id });
        await browser.action.setBadgeBackgroundColor({ color: "#dc3545", tabId: tab.id });

        setTimeout(async () => {
            await browser.action.setBadgeText({ text: "", tabId: tab.id });
        }, 2000);
    }
});
