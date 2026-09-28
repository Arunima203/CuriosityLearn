import json
import os
from datetime import date

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from pywebpush import WebPushException, webpush

from ..database import SessionLocal
from ..models import CuriosityLocation, NotificationSubscription
from ..routers.curiosity import generate_daily_curiosity


scheduler = BackgroundScheduler(
    timezone="Asia/Kolkata"
)


def send_daily_curiosity_notifications(db):
    """Send today's Curiosity push to every active browser subscription."""

    private_key_path = os.getenv(
        "VAPID_PRIVATE_KEY_PATH",
        "private_key.pem",
    )
    vapid_email = os.getenv("VAPID_EMAIL")

    if not vapid_email:
        print(
            "[Curiosity Push] VAPID_EMAIL is not configured. "
            "Skipping push notifications."
        )
        return 0

    subscriptions = (
        db.query(NotificationSubscription)
        .all()
    )

    sent_count = 0
    removed_count = 0

    payload = json.dumps(
        {
            "title": "🌍 CuriosityLearn",
            "body": "আজকের Geography Mystery ready! 🔔",
        },
        ensure_ascii=False,
    )

    for subscription in subscriptions:
        subscription_info = {
            "endpoint": subscription.endpoint,
            "keys": {
                "p256dh": subscription.p256dh,
                "auth": subscription.auth,
            },
        }

        try:
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=private_key_path,
                vapid_claims={
                    "sub": vapid_email,
                },
                ttl=86400,
            )

            sent_count += 1

        except WebPushException as exc:
            status_code = exc.status_code

            print(
                "[Curiosity Push] Push failed for subscription",
                subscription.id,
                "status=",
                status_code,
            )

            # 404/410 means the push subscription is no longer valid.
            if status_code in (404, 410):
                db.delete(subscription)
                removed_count += 1

        except Exception as exc:
            print(
                "[Curiosity Push] Unexpected push error for subscription",
                subscription.id,
                ":",
                str(exc),
            )

    if removed_count:
        db.commit()

    print(
        "[Curiosity Push] Daily notification run:",
        f"sent={sent_count}, removed={removed_count}, "
        f"subscriptions={len(subscriptions)}",
    )

    return sent_count


def create_daily_curiosity():
    db = SessionLocal()

    try:
        today = date.today()

        locations = (
            db.query(CuriosityLocation)
            .all()
        )

        seen_locations = set()

        # Create a global question when nobody has location data.
        if not locations:
            generate_daily_curiosity(
                db=db,
                today=today,
                location=None,
            )
        else:
            for location in locations:
                key = (
                    location.city,
                    location.region,
                    location.country,
                )

                if key in seen_locations:
                    continue

                seen_locations.add(key)

                generate_daily_curiosity(
                    db=db,
                    today=today,
                    location=location,
                )

            # Always keep one global fallback question available.
            generate_daily_curiosity(
                db=db,
                today=today,
                location=None,
            )

        # Only after today's questions are ready, notify subscribers.
        send_daily_curiosity_notifications(db)

        print(
            f"[Curiosity Scheduler] Daily curiosity ready for {today}"
        )

    except Exception as exc:
        db.rollback()

        print(
            "[Curiosity Scheduler] Error:",
            str(exc),
        )

    finally:
        db.close()


def start_curiosity_scheduler():
    if scheduler.running:
        return

    # Prepare today's curiosity immediately when the backend starts.
    create_daily_curiosity()

    scheduler.add_job(
        create_daily_curiosity,
        CronTrigger(
            hour=9,
            minute=0,
            timezone="Asia/Kolkata",
        ),
        id="daily_curiosity",
        replace_existing=True,
    )

    scheduler.start()

    print(
        "[Curiosity Scheduler] Started - Daily at 09:00 Asia/Kolkata"
    )


def stop_curiosity_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)

        print(
            "[Curiosity Scheduler] Stopped"
        )
