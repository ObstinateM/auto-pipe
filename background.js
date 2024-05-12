let lastTabId = 0;
let tabIdWithPipOn = null;

browser.tabs.onActivated.addListener((activeInfo) => {
    if (tabIdWithPipOn === activeInfo.tabId) {
        browser.scripting.executeScript({
            target: { tabId: tabIdWithPipOn },
            func: exitPictureInPicture,
        });
        tabIdWithPipOn = null;
    }

    if (lastTabId && lastTabId !== activeInfo.tabId) {
        browser.scripting.executeScript(
            {
                target: { tabId: lastTabId },
                func: requestPictureInPicture,
                args: [lastTabId],
            },
            () => {
                if (browser.runtime.lastError) {
                    console.error(`Error injecting script: ${browser.runtime.lastError.message}`);
                }
            },
        );
    }

    lastTabId = activeInfo.tabId;
});

browser.tabs.onRemoved.addListener((tabId) => {
    if (tabId === lastTabId) {
        lastTabId = 0;
    }
});

browser.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.action === "setPipTabId") {
        tabIdWithPipOn = message.tabId;
    }
});

function exitPictureInPicture() {
    document.exitPictureInPicture();

    const videos = document.querySelectorAll("video");

    for (const video of videos) {
        // Easter Eggs: Pause and play to nothing
        video.pause();
        video.play();
        video.pause();
    }
}

async function requestPictureInPicture(tabId) {
    try {
        const videos = document.querySelectorAll("video");
        for (const video of videos) {
            if (!video.paused) {
                await video.requestPictureInPicture();
                browser.runtime.sendMessage({
                    action: "setPipTabId",
                    tabId: tabId,
                });
            }
        }
    } catch (error) {
        console.error("Failed to enter Picture in Picture", error);
    }
}
