# Bambu Lab Price Monitor

Telegram-бот для мониторинга цен на филамент Bambu Lab на Wildberries и Ozon.

## Настройки

- Порог уведомления: `800` рублей.
- Интервал проверки: `30` минут.
- Повторные уведомления отключены: бот сообщает только о новых товарах или изменении цены.
- Секреты хранятся в `.env`, а не в репозитории.

## Запуск

```bash
cd tools/bambu-price-monitor
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# заполните TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID
python bambu_price_monitor.py
```

Для постоянной работы используйте systemd или supervisor. Ozon может потребовать настройку браузерного режима, если поисковая выдача блокирует обычные HTTP-запросы.

## Важно

Источники маркетплейсов могут менять структуру ответов и применять защиту от автоматических запросов. Бот логирует ошибки и продолжает работу со следующим источником.
