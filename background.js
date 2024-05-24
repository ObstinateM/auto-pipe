let lastTabId = 0;
let tabIdWithPipOn = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
    if (tabIdWithPipOn === activeInfo.tabId) {
        chrome.scripting.executeScript({
            target: { tabId: tabIdWithPipOn },
            func: exitPictureInPicture,
        });
        tabIdWithPipOn = null;
    }

    if (lastTabId && lastTabId !== activeInfo.tabId) {
        chrome.scripting.executeScript(
            {
                target: { tabId: lastTabId },
                func: requestPictureInPicture,
                args: [lastTabId],
            },
            () => {
                if (chrome.runtime.lastError) {
                    console.error(`Error injecting script: ${chrome.runtime.lastError.message}`);
                }
            },
        );
    }

    lastTabId = activeInfo.tabId;
});

chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === lastTabId) {
        lastTabId = 0;
    }
});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.action === "setPipTabId") {
        tabIdWithPipOn = message.tabId;
    }
});

function exitPictureInPicture() {
    chrome.storage.sync.get(["pauseOnBack", "enabled"], (result) => {
        if (!result.enabled) return;
        document.exitPictureInPicture();

        if (result.pauseOnBack) {
            const videos = document.querySelectorAll("video");

            for (const video of videos) {
                video.pause();
            }
        }
    });
}

function requestPictureInPicture(tabId) {
    chrome.storage.sync.get(["pauseOnBack", "enabled"], async (result) => {
        if (!result.enabled) return;

        try {
            const videos = document.querySelectorAll("video");
            for (const video of videos) {
                if (!video.paused) {
                    await video.requestPictureInPicture();
                    chrome.runtime.sendMessage({
                        action: "setPipTabId",
                        tabId: tabId,
                    });
                }
            }
        } catch (error) {
            console.error("Failed to enter Picture in Picture", error);
        }
    });
}
