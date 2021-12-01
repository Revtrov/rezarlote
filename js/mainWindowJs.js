const { document, console } = require("globalthis/implementation");

window.addEventListener('DOMContentLoaded', () => {

    const electron = require("electron"),
        ipc = electron.ipcRenderer,
        fs = require("fs"),
        path = require("path"),
        settingsPath = path.normalize(`${__dirname}/settings.json`),
        settingsBtn = "settings-btn",
        init = () => {

            const readSettings = () => {
                    let rawSettings = fs.readFileSync(settingsPath);
                    settings = JSON.parse(rawSettings);
                    return settings;
                },

                onEvent = (id, eventType, code) => {
                    document.getElementById(id).addEventListener(eventType, (event) => {
                        eval(code);
                    });
                },

                writeSettings = (name, value) => {
                    let settings = readSettings(settingsPath);
                    settings[name] = value;
                    fs.writeFileSync(settingsPath, JSON.stringify(settings))
                },

                loadTheme = () => {
                    if (readSettings().theme == "dark") {
                        document.documentElement.style.setProperty('--bg-color', '#2D2D30');
                        document.documentElement.style.setProperty('--text-color', '#CCCCCC');
                        document.documentElement.style.setProperty('--headbar-bg-color', 'rgba(50, 54, 57, 1)');
                        document.documentElement.style.setProperty('--hover-color', 'rgba(255, 255, 255, 0.1)');
                    }
                    if (readSettings().theme == "light") {
                        document.documentElement.style.setProperty('--bg-color', 'white');
                        document.documentElement.style.setProperty('--text-color', 'black');
                        document.documentElement.style.setProperty('--headbar-bg-color', 'white');
                        document.documentElement.style.setProperty('--hover-color', 'rgba(114, 114, 114, 0.1)');
                    }
                },
                loadCSS = (path) => {
                    writeSettings("cssURL", path[0]);
                    let css = document.createElement("link");
                    css.setAttribute("id", "addedCSS");
                    document.body.appendChild(css);
                    css = document.getElementById("addedCSS");
                    css.rel = "stylesheet";
                    css.href = readSettings().cssURL;
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
            loadTheme();
            document.documentElement.style.setProperty('--border-color', readSettings().borderColor);
            onEvent("min-btn", "click", `ipc.send('minimize'); `);
            onEvent("min-btn", "keydown", `if (event.code == "Enter") { ipc.send('minimize'); }`);
            onEvent("max-btn", "keydown", `if (event.code == "Enter") { ipc.send('maximize'); }`);
            onEvent("max-btn", "click", `ipc.send('maximize'); `);
            onEvent("close-btn", "keydown", `if (event.code == "Enter") { ipc.send('close'); }`);
            onEvent("close-btn", "click", `ipc.send('close'); `);
            onEvent(settingsBtn, "keydown", `if (event.code == "Enter") { ipc.send('openSettings');}`);
            onEvent(settingsBtn, "click", `ipc.send('openSettings');`);
            onEvent("title", "mouseover", "hover('title', 'true', 'radial-gradient(var(--border-color), transparent, transparent)')")
            onEvent("title", "mouseout", "hover('title','false')")
            ipc.on('settingsUpdate', function(e) {
                console.log("asdasd")
                document.documentElement.style.setProperty('--border-color', readSettings().borderColor);
                loadTheme();
            });
            ipc.on('selected-CSS', function(e, path) {
                loadCSS(path[0]);
            });
        }

    document.onreadystatechange = () => {
        if (document.readyState == "complete") {
            init();
        }
    };
})