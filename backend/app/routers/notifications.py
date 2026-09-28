import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

from pywebpush import webpush, WebPushException

from ..database import get_db
from ..models import NotificationSubscription
from ..services.jwt import get_current_user_id, security


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


class PushKeys(BaseModel):
    p256dh: str
    auth: str


class PushSubscriptionRequest(BaseModel):
    endpoint: str
    keys: PushKeys


@router.get("/vapid-public-key")
def get_vapid_public_key():
    public_key = os.getenv("VAPID_PUBLIC_KEY")

    if not public_key:
        raise HTTPException(
            status_code=500,
            detail="VAPID public key is not configured",
        )

    return {
        "public_key": public_key,
    }


@router.post("/subscribe")
def save_push_subscription(
    data: PushSubscriptionRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(credentials)

    subscription = (
        db.query(NotificationSubscription)
        .filter(
            NotificationSubscription.endpoint == data.endpoint
        )
        .first()
    )

    if subscription:
        subscription.user_id = user_id
        subscription.p256dh = data.keys.p256dh
        subscription.auth = data.keys.auth

    else:
        subscription = NotificationSubscription(
            user_id=user_id,
            endpoint=data.endpoint,
            p256dh=data.keys.p256dh,
            auth=data.keys.auth,
        )

        db.add(subscription)

    db.commit()
    db.refresh(subscription)

    return {
        "message": "Push subscription saved successfully",
        "subscription_id": subscription.id,
    }


@router.post("/test")
def send_test_notification(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(credentials)

    subscription = (
        db.query(NotificationSubscription)
        .filter(
            NotificationSubscription.user_id == user_id
        )
        .order_by(
            NotificationSubscription.updated_at.desc()
        )
        .first()
    )

    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="No push subscription found",
        )

    configured_key_path = os.getenv(
        "VAPID_PRIVATE_KEY_PATH",
        "private_key.pem",
    )

    private_key_path = Path(configured_key_path)

    # Resolve a relative key path from the backend project root.
    # notifications.py is inside backend/app/routers/.
    if not private_key_path.is_absolute():
        private_key_path = (
            Path(__file__).resolve().parents[2]
            / private_key_path
        )

    if not private_key_path.is_file():
        raise HTTPException(
            status_code=500,
            detail=(
                "VAPID private key file not found: "
                f"{private_key_path}"
            ),
        )

    vapid_email = os.getenv("VAPID_EMAIL")

    if not vapid_email:
        raise HTTPException(
            status_code=500,
            detail="VAPID email is not configured",
        )

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
            data=(
                '{"title":"🌍 CuriosityLearn",'
                '"body":"Your Geography Curiosity is ready!"}'
            ),
            vapid_private_key=str(private_key_path),
            vapid_claims={
                "sub": vapid_email,
            },
        )

    except WebPushException as exc:
        print("Web push error:", exc)

        raise HTTPException(
            status_code=500,
            detail="Push notification failed",
        )

    return {
        "message": "Test notification sent successfully",
    }
