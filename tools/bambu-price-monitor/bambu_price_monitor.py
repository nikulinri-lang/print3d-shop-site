import hashlib
import html
import json
import logging
import os
import sqlite3
import time
from dataclasses import dataclass
from typing import Iterable

import requests
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]
THRESHOLD = float(os.getenv("PRICE_THRESHOLD", "800"))
INTERVAL = int(os.getenv("CHECK_INTERVAL_MINUTES", "30")) * 60
QUERY = os.getenv("SEARCH_QUERY", "Bambu Lab filament")
DB_PATH = os.getenv("STATE_DB", "prices.sqlite3")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

@dataclass(frozen=True)
class Item:
    source: str
    title: str
    price: float
    url: str
    key: str


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE IF NOT EXISTS seen (item_key TEXT PRIMARY KEY, price REAL NOT NULL)")
    conn.commit()
    return conn


def wb_items() -> Iterable[Item]:
    endpoint = "https://search.wb.ru/exactmatch/ru/common/v4/search"
    params = {"query": QUERY, "resultset": "catalog", "limit": 100, "dest": "-1257786"}
    r = requests.get(endpoint, params=params, timeout=25, headers={"User-Agent": "Mozilla/5.0"})
    r.raise_for_status()
    data = r.json()
    for raw in data.get("data", {}).get("products", []):
        price = raw.get("salePriceU")
        if price is None:
            continue
        price = price / 100
        nm_id = raw.get("id")
        yield Item("Wildberries", raw.get("name", "Bambu Lab filament"), price,
                   f"https://www.wildberries.ru/catalog/{nm_id}/detail.aspx", f"wb:{nm_id}")


def ozon_items() -> Iterable[Item]:
    # Ozon intentionally remains isolated because its public search API is unstable
    # and may require browser automation or an approved seller API.
    logging.warning("Ozon source is not enabled in this HTTP-only build")
    return []


def send(text: str) -> None:
    endpoint = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    r = requests.post(endpoint, json={"chat_id": CHAT_ID, "text": text, "parse_mode": "HTML"}, timeout=20)
    r.raise_for_status()


def fingerprint(item: Item) -> str:
    return hashlib.sha256(item.key.encode()).hexdigest()


def check_once() -> None:
    items = []
    for loader in (wb_items, ozon_items):
        try:
            items.extend(loader())
        except Exception:
            logging.exception("Marketplace check failed: %s", loader.__name__)

    conn = db()
    try:
        for item in items:
            if item.price >= THRESHOLD:
                continue
            key = fingerprint(item)
            old = conn.execute("SELECT price FROM seen WHERE item_key = ?", (key,)).fetchone()
            if old is not None and abs(old[0] - item.price) < 0.01:
                continue
            text = (f"<b>Найдена цена ниже {THRESHOLD:.0f} ₽</b>\n"
                    f"<b>{html.escape(item.title)}</b>\n"
                    f"{item.price:,.0f} ₽ · {html.escape(item.source)}\n"
                    f"<a href=\"{html.escape(item.url, quote=True)}\">Открыть товар</a>")
            send(text)
            conn.execute("INSERT INTO seen(item_key, price) VALUES(?, ?) "
                         "ON CONFLICT(item_key) DO UPDATE SET price=excluded.price", (key, item.price))
            conn.commit()
    finally:
        conn.close()


def main() -> None:
    logging.info("Bambu monitor started: threshold=%s, interval=%ss, query=%s", THRESHOLD, INTERVAL, QUERY)
    while True:
        try:
            check_once()
        except Exception:
            logging.exception("Unexpected check failure")
        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()
