browser.action.onClicked.addListener(async (tab) => {
    if (!tab.url || !/^https?:\/\//.test(tab.url)) {
        await browser.action.setBadgeText({ text: "✗", tabId: tab.id });
        await browser.action.setBadgeBackgroundColor({ color: "#dc3545", tabId: tab.id });
        setTimeout(async () => {
            await browser.action.setBadgeText({ text: "", tabId: tab.id });
        }, 2000);
        return;
    }

    try {
        const cookies = await browser.cookies.getAll({ url: tab.url });

        if (cookies.length === 0) {
            await browser.action.setBadgeText({ text: "0", tabId: tab.id });
            await browser.action.setBadgeBackgroundColor({ color: "#6c757d", tabId: tab.id });
            setTimeout(async () => {
                await browser.action.setBadgeText({ text: "", tabId: tab.id });
            }, 2000);
            return;
        }

        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

        // executeScript propagates the returned Promise — clipboard rejection is caught below
        await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: (text) => navigator.clipboard.writeText(text),
            args: [cookieHeader]
        });

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
