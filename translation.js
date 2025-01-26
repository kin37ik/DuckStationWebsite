"use strict";

window.addEventListener("DOMContentLoaded", () => {
    const blocks = document.querySelectorAll("[data-block]");
    const langList = document
        .getElementById("lang-switcher")
        .querySelector("ul");
    const currentLang = localStorage.getItem("lang") || "en";
    let cachedData = null;

    function getData(callback) {
        if (cachedData) {
            callback(cachedData);
            return;
        }
        fetch("translation.json")
            .then((response) => {
                if (!response.ok) throw new Error("JSON Download error");
                return response.json();
            })
            .then((data) => {
                cachedData = data;
                callback(data);
            })
            .catch((error) => console.error("Fetch error:", error));
    }

    function initLangList() {
        const langElements = [];
        getData(({ languages }) => {
            for (let key in languages) {
                let clazz = "dropdown-item";
                if (key === currentLang) {
                    clazz += " active";
                }
                langElements.push(
                    `<li><button data-lang="${key}" class="${clazz}">${languages[key]}</button></li>`
                );
            }
            langList.innerHTML = langElements.join("");

            langList.querySelectorAll("button").forEach((item) => {
                item.addEventListener("click", () => {
                    changeLang(item.dataset.lang);
                });
            });
        });
    }

    function setLang(lang) {
        langList.querySelectorAll("button").forEach((item) => {
            if (item.dataset.lang === lang) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
    }

    function translate(lang, data) {
        blocks.forEach((block) => {
            const blockKey = block.dataset.block;
            const blockData = data?.[blockKey];

            if (!blockData) {
                console.warn(`Block "${blockKey}" not found in JSON`);
                return;
            }

            block.querySelectorAll("[data-text]").forEach((element) => {
                const textKey = element.dataset.text;
                const textValue = blockData[textKey]?.[lang];
                if (textValue) {
                    element.innerText = textValue;
                } else {
                    console.warn(
                        `Translate for "${textKey}" in block "${blockKey}" is not found`
                    );
                }
            });
        });
    }

    function changeLang(lang) {
        getData((data) => {
            localStorage.setItem("lang", lang);
            translate(lang, data.elements);
            setLang(lang);
        });
    }

    initLangList();
    changeLang(currentLang);
});
