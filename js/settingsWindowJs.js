window.addEventListener('DOMContentLoaded', () => {

    const settingsWindow = document.getElementById("settingsWindow"),
        electron = require("electron"),
        fs = require("fs"),
        path = require("path"),
        settingsPath = path.normalize(`${__dirname}/settings.json`),
        ipc = electron.ipcRenderer,
        loadTheme = () => {
            if (document.getElementById("themeSetting").checked == true) {
                writeSettings("theme", "dark");
                ipc.send('settingsUpdate');
            } else {
                writeSettings("theme", "light");
                ipc.send('settingsUpdate');
            }
            if (readSettings().theme == "dark") {
                document.documentElement.style.setProperty('--bg-color', '#2D2D30');
                document.documentElement.style.setProperty('--text-color', '#CCCCCC');
                document.documentElement.style.setProperty('--headbar-bg-color', 'rgba(50, 54, 57, 1)');
                document.documentElement.style.setProperty('--hover-color', 'rgba(255, 255, 255, 0.1)');
                document.documentElement.style.setProperty('--title-text-color', '#ADADAD');

            }
            if (readSettings().theme == "light") {
                document.documentElement.style.setProperty('--bg-color', 'white');
                document.documentElement.style.setProperty('--text-color', 'black');
                document.documentElement.style.setProperty('--headbar-bg-color', 'white');
                document.documentElement.style.setProperty('--hover-color', 'rgba(114, 114, 114, 0.1)');
                document.documentElement.style.setProperty('--title-text-color', 'black');
            }
        },

        readSettings = () => {
            let rawSettings = fs.readFileSync(settingsPath);
            settings = JSON.parse(rawSettings);
            return settings;
        },

        writeSettings = (name, value) => {
            let settings = readSettings(settingsPath);
            settings[name] = value;
            fs.writeFileSync(settingsPath, JSON.stringify(settings))
        },

        saveSettingChanges = (selectCssButton, start) => {
            if (start == "start") {
                document.getElementById("customCssSetting").checked = readSettings().customCSS;
            }
            if (start != "start") {
                writeSettings("customCSS", document.getElementById("customCssSetting").checked)
            }
            if (document.getElementById("customCssSetting").checked == true) {
                if (start != "start") {
                    writeSettings("cssURL", document.getElementById("customCssURL").value);
                }
                document.getElementById("customCssURL").value = readSettings().cssURL;
                if (selectCssButton == true) {
                    loadCSS();
                }
            } else {
                loadTheme();
                if (start != "start") {
                    writeSettings("customCSS", false);
                }
                document.getElementById("customCssSetting").checked = false;
                ipc.send('settingsUpdate');
            }

        },

        loadBorderColor = () => {
            let color = document.getElementById("borderColorSetting").value;
            document.documentElement.style.setProperty('--border-color', color);
            writeSettings("borderColor", color);
            ipc.send('settingsUpdate');
        },

        onEvent = (id, eventType, code) => {
            document.getElementById(id).addEventListener(eventType, (event) => {
                eval(code);
            });
        },
        loadCSS = (select) => {
            if (select) {

            } else { ipc.send('getFile') }
        },
        hover = (id, hover, color) => {
            try {
                switch (hover) {
                    case "true":
                        document.getElementById(id).style.background = color;
                        break
                    case "false":
                        document.getElementById(id).style.background = "transparent";
                        break
                }
            } catch {
                return 0
            }
        }

    if (readSettings().theme == "dark") {
        document.getElementById("themeSetting").checked = true;
    }
    document.documentElement.style.setProperty('--border-color', readSettings().borderColor);
    loadTheme();
    saveSettingChanges(false, "start");
    onEvent("min-btn", "click", `ipc.send('minimizeSettings'); `);
    onEvent("min-btn", "keydown", `if (event.code == "Enter") { ipc.send('minimizeSettings'); }`);
    onEvent("max-btn", "keydown", `if (event.code == "Enter") { ipc.send('maximizeSettings'); }`);
    onEvent("max-btn", "click", `ipc.send('maximizeSettings'); `);
    onEvent("settings-close-btn", "keydown", `if (event.code == "Enter") { ipc.send('closeSettings'); }`);
    onEvent("settings-close-btn", "click", `ipc.send('closeSettings'); `);
    onEvent("themeSetting", "change", `loadTheme()`);
    onEvent("borderColorSetting", "change", `loadBorderColor()`);
    onEvent("customCssButton", "click", `saveSettingChanges(true, "")`);
    onEvent("customCssURL", "change", `saveSettingChanges(false, "")`);
    onEvent("customCssSetting", "change", `saveSettingChanges(false, "")`);
    onEvent("title", "mouseover", "hover('title', 'true', 'radial-gradient(var(--border-color), transparent)')")
    onEvent("title", "mouseout", "hover('title','false')")

    ipc.on("selected-CSS", (e, path) => {
        document.getElementById("customCssURL").value = path;
    })

});