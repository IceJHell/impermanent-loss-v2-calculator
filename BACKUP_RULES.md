# BACKUP_RULES

## Когда делать бэкап

Перед изменением важных файлов делать копию в `backups/`.

Формат имени:

```text
YYYY-MM-DD_HH-MM__имя_файла.backup
```

Пример:

```text
2026-05-15_18-30__main.py.backup
```

## Делать бэкап перед изменением

- `main.py`
- `app.py`
- `config.py`
- `update.ps1`
- `update.bat`
- `package.json`
- `requirements.txt`
- `pyproject.toml`
- `railway.toml`
- `README.md`
- `PROJECT_CONTEXT.md`
- `AI_RULES.md`
- важных JSON/CSV/баз данных

## Не делать бэкап

- `.env`
- `*.session`
- `__pycache__/`
- `.venv/`
- `node_modules/`
- `logs/`
- временных файлов
- больших архивов
- файлов с секретами

## Если файл содержит секреты

Не копировать его в `backups/`. Сначала обсудить безопасный способ изменения с пользователем.
