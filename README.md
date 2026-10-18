# Доступный маршрут + модель поиска бордюров

## Файлы
- index.html — страница (добавлен один новый раздел «Поиск бордюров на фото»)
- styles.css — стили (новые стили дописаны в самом конце)
- script.js — без изменений
- curb-model.js — НОВЫЙ файл, подключение модели Roboflow

## Куда вставить данные модели
Откройте curb-model.js и замените в самом начале:
- MODEL_ID — ID модели из Roboflow (Models -> кнопка копирования рядом с Model URL)
- API_KEY — Publishable Key (Roboflow: Settings -> API Keys)

Пример:
    MODEL_ID: "s-workspace-6oush/curbs-qavhj-4-rfdetr-small",
    API_KEY: "rf_xxxxxxxxxxxx",

Оставьте кавычки, не оставляйте пробелов. Если после запуска ошибка 404 или 403,
проверьте, что ID скопирован целиком (на странице он может быть обрезан многоточием).

## Как выложить на GitHub
1. github.com -> «+» -> New repository. Имя, например, dostupny-marshrut. Public. Create repository.
2. В новом репозитории: «uploading an existing file» (или Add file -> Upload files).
3. Загрузите все 5 файлов (index.html, styles.css, script.js, curb-model.js, README.md).
   Имена должны быть именно такими, без (1) и (5).
4. Внизу нажмите Commit changes.
5. Settings -> Pages -> Source: Deploy from a branch -> Branch: main, папка / (root) -> Save.
6. Через 1-2 минуты сайт откроется по адресу https://ВАШ-ЛОГИН.github.io/dostupny-marshrut/

## Если что-то изменили в файле
Откройте файл в репозитории -> значок карандаша -> правка -> Commit changes.
