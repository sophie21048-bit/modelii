// ================================
// ПОИСК БОРДЮРОВ НА ФОТО
// Подключение модели Roboflow к сайту
// ================================

// ВАЖНО: вставьте сюда свои данные из Roboflow (инструкция в README).
const CURB_CONFIG = {
    // Идентификатор модели: скопируйте его на странице Models
    // (кнопка копирования рядом с Model URL), например: "workspace/curbs-qavhj-4-rfdetr..."
    MODEL_ID: "s-workspace-6oush/curbs-qavhj-4-rfdetr-small-t1",

    // Publishable Key из Roboflow: Settings -> API Keys
    API_KEY: "rf_A0B9nvbgXCeqfsLibxCZFsQ6MoZ2",

    // Адрес облачного API Roboflow (менять не нужно)
    ENDPOINT: "https://serverless.roboflow.com",

    // Максимальная ширина фото при отправке (px). Большие панорамы уменьшаются.
    MAX_WIDTH: 1600
};

(function () {
    const fileInput = document.getElementById("curbFile");
    const thresholdInput = document.getElementById("curbThreshold");
    const thresholdValue = document.getElementById("curbThresholdValue");
    const statusEl = document.getElementById("curbStatus");
    const canvas = document.getElementById("curbCanvas");

    if (!fileInput || !canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");

    let currentImage = null;   // уменьшенное изображение, которое отправляли в модель
    let predictions = [];      // ответ модели

    function setStatus(text) {
        statusEl.textContent = text;
    }

    function isConfigured() {
        return (
            CURB_CONFIG.MODEL_ID &&
            CURB_CONFIG.API_KEY &&
            !CURB_CONFIG.MODEL_ID.startsWith("ВСТАВЬТЕ") &&
            !CURB_CONFIG.API_KEY.startsWith("ВСТАВЬТЕ")
        );
    }

    // Читаем файл и уменьшаем его до MAX_WIDTH
    function loadImage(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();

            reader.onerror = function () {
                reject(new Error("Не удалось прочитать файл."));
            };

            reader.onload = function () {
                const img = new Image();

                img.onerror = function () {
                    reject(new Error("Не удалось открыть изображение."));
                };

                img.onload = function () {
                    const scale = Math.min(1, CURB_CONFIG.MAX_WIDTH / img.width);
                    const w = Math.round(img.width * scale);
                    const h = Math.round(img.height * scale);

                    canvas.width = w;
                    canvas.height = h;
                    ctx.drawImage(img, 0, 0, w, h);

                    resolve({ width: w, height: h });
                };

                img.src = reader.result;
            };

            reader.readAsDataURL(file);
        });
    }

    // Отправка изображения в модель
    async function detect() {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        const base64 = dataUrl.split(",")[1];

        const url =
            CURB_CONFIG.ENDPOINT + "/" + CURB_CONFIG.MODEL_ID +
            "?api_key=" + encodeURIComponent(CURB_CONFIG.API_KEY) +
            "&confidence=10";

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: base64
        });

        if (!response.ok) {
            let details = "";
            try { details = await response.text(); } catch (e) {}
            console.error("Ответ Roboflow:", response.status, details);
            throw new Error("Модель вернула ошибку " + response.status + ". Проверьте ID модели и ключ.");
        }

        const data = await response.json();
        return data.predictions || [];
    }

    // Отрисовка рамок поверх фото
    function draw() {
        if (!currentImage) {
            return;
        }

        ctx.putImageData(currentImage, 0, 0);

        const threshold = Number(thresholdInput.value) / 100;
        const visible = predictions.filter(function (p) {
            return p.confidence >= threshold;
        });

        const lineWidth = Math.max(2, Math.round(canvas.width / 400));
        const fontSize = Math.max(12, Math.round(canvas.width / 70));

        ctx.lineWidth = lineWidth;
        ctx.font = "600 " + fontSize + "px Manrope, system-ui, sans-serif";
        ctx.textBaseline = "top";

        visible.forEach(function (p) {
            const x = p.x - p.width / 2;
            const y = p.y - p.height / 2;

            ctx.strokeStyle = "#82505f";
            ctx.strokeRect(x, y, p.width, p.height);

            const label = "бордюр " + Math.round(p.confidence * 100) + "%";
            const textWidth = ctx.measureText(label).width;
            const pad = 4;

            ctx.fillStyle = "#82505f";
            ctx.fillRect(x, y, textWidth + pad * 2, fontSize + pad * 2);

            ctx.fillStyle = "#ffffff";
            ctx.fillText(label, x + pad, y + pad);
        });

        if (visible.length === 0) {
            setStatus("Бордюры не найдены при пороге " + thresholdInput.value + "%. Попробуйте снизить порог.");
        } else {
            setStatus("Найдено бордюров: " + visible.length + ". Предварительная оценка черновой модели.");
        }
    }

    fileInput.addEventListener("change", async function () {
        const file = fileInput.files && fileInput.files[0];

        if (!file) {
            return;
        }

        if (!isConfigured()) {
            setStatus("В файле curb-model.js не указаны ID модели и ключ Roboflow.");
            return;
        }

        try {
            setStatus("Загружаю фото...");
            const size = await loadImage(file);

            canvas.hidden = false;
            currentImage = ctx.getImageData(0, 0, size.width, size.height);
            predictions = [];

            setStatus("Модель ищет бордюры...");
            predictions = await detect();

            draw();
        } catch (error) {
            console.error(error);
            setStatus(error.message || "Не удалось обработать фото.");
        }
    });

    thresholdInput.addEventListener("input", function () {
        thresholdValue.textContent = thresholdInput.value + "%";
        draw();
    });
})();
