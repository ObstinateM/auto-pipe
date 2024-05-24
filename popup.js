document.addEventListener("DOMContentLoaded", () => {
    const pauseOnBack = document.getElementById("pauseOnBack");
    const enabled = document.getElementById("enabled");

    chrome.storage.sync.get(["pauseOnBack", "enabled"], (result) => {
        pauseOnBack.checked = result.pauseOnBack || false;
        enabled.checked = result.enabled || false;
    });

    pauseOnBack.addEventListener("click", () => {
        const isEnabled = pauseOnBack.checked;
        chrome.storage.sync.set({ pauseOnBack: isEnabled }, () => {
            console.log("Settings saved");
        });
    });

    enabled.addEventListener("click", () => {
        const isEnabled = pauseOnBack.checked;
        chrome.storage.sync.set({ enabled: isEnabled }, () => {
            console.log("Settings saved");
        });
    });
});
