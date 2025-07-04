# Загрузчик видео (ytDownload)

Это веб-приложение для загрузки видео, аудио, описаний, заголовков, тегов и превью с YouTube (и других поддерживаемых сайтов) с помощью `yt-dlp`. Интерфейс предлагает кнопки для различных типов загрузки, а также прогресс-бар для отслеживания процесса. Все файлы для каждого видео сохраняются в отдельной папке, названной по ID видео.

## Возможности
- Загрузка полных видео (видео + аудио) в лучшем качестве (например, `Название_видео_video.mp4`).
- Загрузка только видео (без аудио, например, `Название_видео_video.mp4`).
- Загрузка только аудио в формате MP3 (например, `Название_видео_audio.mp3`).
- Загрузка описания видео в текстовом файле (например, `Название_видео_description.txt`).
- Загрузка заголовка видео в текстовом файле (например, `Название_видео_title.txt`).
- Загрузка тегов видео в текстовом файле (например, `Название_видео_tags.txt`).
- Загрузка превью видео (например, `Название_видео_thumbnail.jpg`).
- Загрузка всех элементов сразу (видео, описание, заголовок, теги, превью) одной кнопкой.
- Прогресс-бар, показывающий процесс загрузки в реальном времени.
- Все файлы для одного видео сохраняются в отдельной папке (например, `downloads/hEksVS3Jx90/`).
- Простой веб-интерфейс для ввода URL и запуска загрузки.

## Требования
Для работы приложения необходимо установить:
- [Node.js](https://nodejs.org/) (версия 18 или выше).
- [Python](https://www.python.org/downloads/) (версия 3.8 или выше).
- [Homebrew](https://brew.sh/) (для macOS, опционально, для установки зависимостей).
- Git (для клонирования репозитория).

## Установка

### 1. Клонирование репозитория
Склонируйте репозиторий на свой компьютер с помощью Git:
```bash
git clone https://github.com/NikulinProfi/ytDownload.git
cd ytDownload
```

### 2. Установка зависимостей Node.js
Установите необходимые пакеты Node.js (`express` и `ws` для поддержки WebSocket):
```bash
npm install
```

### 3. Установка зависимостей Python
Установите `yt-dlp`, инструмент для загрузки видео:
```bash
pip3 install -U yt-dlp
```

### 4. Установка FFmpeg
FFmpeg нужен для объединения видео и аудио или конвертации в MP3. Установите его с помощью Homebrew (на macOS) или менеджера пакетов:
```bash
# На macOS
brew install ffmpeg

# На Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# На Windows (с Chocolatey)
choco install ffmpeg
```

Проверьте установку:
```bash
node --version
python3 --version
yt-dlp --version
ffmpeg --version
```

### 5. Создание папки для загрузок
Создайте папку `downloads` в корне проекта для хранения файлов:
```bash
mkdir downloads
```

## Запуск приложения
1. Запустите сервер:
   ```bash
   node server.js
   ```
   Сервер будет работать на `http://localhost:3000`.

2. Откройте браузер и перейдите по адресу `http://localhost:3000`.

3. Используйте веб-интерфейс:
   - Введите URL видео с YouTube (например, `https://www.youtube.com/watch?v=hEksVS3Jx90`).
   - Нажмите одну из кнопок:
     - "Download Full Video" — загрузить полное видео.
     - "Download Video Only" — загрузить только видео (без аудио).
     - "Download Audio Only" — загрузить только аудио в MP3.
     - "Download Description" — загрузить описание видео.
     - "Download Title" — загрузить заголовок видео.
     - "Download Tags" — загрузить теги видео.
     - "Download Thumbnail" — загрузить превью.
     - "Download All" — загрузить все элементы сразу (видео, описание, заголовок, теги, превью).
   - Следите за прогресс-баром, чтобы отслеживать процесс загрузки (для описания, заголовка и тегов прогресс имитируется из-за их быстрого выполнения).
   - После завершения появятся ссылки на скачанные файлы. Нажмите на них, чтобы сохранить файлы на компьютер.

Все файлы сохраняются в папке `downloads` в подпапке, названной по ID видео (например, `downloads/hEksVS3Jx90/`).

## Решение проблем
- **Ошибки WebSocket**: Убедитесь, что соединение `ws://localhost:3000` не заблокировано вашим брандмауэром или браузером.
- **Ошибки yt-dlp**: Обновите `yt-dlp` командой `pip3 install -U yt-dlp`, если возникают проблемы с определенными URL.
- **FFmpeg не найден**: Проверьте, что FFmpeg установлен и доступен в PATH (`ffmpeg -version`).
- **Файлы не загружаются**: Убедитесь, что папка `downloads` и ее подпапки имеют права на запись (`chmod -R 777 downloads`).
- **Слишком длинные имена файлов**: Имена файлов очищаются автоматически, чтобы избежать ошибок. Если проблемы сохраняются, используйте последнюю версию `server.js`.

## Структура проекта
- `index.html`: Веб-интерфейс с полем ввода, кнопками и прогресс-баром.
- `server.js`: Сервер на Node.js, обрабатывающий запросы на загрузку и обновления WebSocket.
- `package.json`: Зависимости и скрипты Node.js.
- `requirements.txt`: Зависимости Python (`yt-dlp`).
- `downloads/`: Папка, содержащая подпапки для каждого видео (например, `downloads/hEksVS3Jx90/` для файлов видео, описания, заголовка, тегов и превью).

## Вклад в проект
Присылайте свои замечания или запросы на включение изменений в [репозиторий на GitHub](https://github.com/NikulinProfi/ytDownload).

## Лицензия
Проект распространяется под лицензией MIT.