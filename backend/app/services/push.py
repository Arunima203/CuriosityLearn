"""
Shared push notification helper.
Used by curiosity_scheduler and learning_content router.
"""
import json
import os
from pathlib import Path

from pywebpush import WebPushException, webpush

from ..database import SessionLocal
from ..models import NotificationSubscription


def _resolve_private_key() -> str | None:
    raw = os.getenv("VAPID_PRIVATE_KEY_PATH", "private_key.pem")
    p = Path(raw)
    if p.is_absolute() and p.is_file():
        return str(p)
    # Try relative to backend/ directory (2 parents up from services/)
    resolved = Path(__file__).resolve().parents[1] / raw
    if resolved.is_file():
        return str(resolved)
    # Try cwd
    cwd_path = Path.cwd() / raw
    if cwd_path.is_file():
        return str(cwd_path)
    # Return raw — webpush will handle the path itself
    return raw


def send_push_to_all_students(title: str, body: str, db=None) -> int:
    """
    Send a push notification to all subscribed users.
    If db is None, opens its own session.
    Returns the number of successfully sent notifications.
    """
    vapid_email = os.getenv("VAPID_EMAIL")
    if not vapid_email:
        return 0

    private_key = _resolve_private_key()
    if not private_key:
        return 0

    payload = json.dumps({"title": title, "body": body}, ensure_ascii=False)

    own_session = db is None
    if own_session:
        db = SessionLocal()

    try:
        subscriptions = db.query(NotificationSubscription).all()
        sent = 0
        to_delete = []

        for sub in subscriptions:
            try:
                webpush(
                    subscription_info={
                        "endpoint": sub.endpoint,
                        "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                    },
                    data=payload,
                    vapid_private_key=private_key,
                    vapid_claims={"sub": vapid_email},
                    ttl=86400,
                )
                sent += 1
            except WebPushException as exc:
                if getattr(exc, "status_code", None) in (404, 410):
                    to_delete.append(sub)
            except Exception:
                pass

        for sub in to_delete:
            db.delete(sub)
        if to_delete:
            db.commit()

        return sent
    finally:
        if own_session:
            db.close()
