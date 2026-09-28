import requests

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CuriosityLocation
from ..services.jwt import get_current_user_id, security


router = APIRouter(
    prefix="/curiosity",
    tags=["Curiosity"],
)


GEONAMES_USERNAME = "arunima_sen"


class CuriosityLocationRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


@router.post("/location")
def save_curiosity_location(
    data: CuriosityLocationRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(credentials)

    # -----------------------------------
    # Find city / region / country
    # -----------------------------------
    city = None
    region = None
    country = None

    try:
        response = requests.get(
            "http://api.geonames.org/findNearbyPlaceNameJSON",
            params={
                "lat": data.latitude,
                "lng": data.longitude,
                "username": GEONAMES_USERNAME,
            },
            timeout=10,
        )

        response.raise_for_status()

        geo_data = response.json()

        if geo_data.get("geonames"):
            place = geo_data["geonames"][0]

            city = place.get("name")
            region = place.get("adminName1")
            country = place.get("countryName")

    except requests.RequestException as e:
        print("GeoNames reverse lookup failed:", e)

    # -----------------------------------
    # Save / update user location
    # -----------------------------------
    location = (
        db.query(CuriosityLocation)
        .filter(CuriosityLocation.user_id == user_id)
        .first()
    )

    if location:
        location.latitude = data.latitude
        location.longitude = data.longitude
        location.city = city
        location.region = region
        location.country = country
    else:
        location = CuriosityLocation(
            user_id=user_id,
            latitude=data.latitude,
            longitude=data.longitude,
            city=city,
            region=region,
            country=country,
        )

        db.add(location)

    db.commit()
    db.refresh(location)

    return {
        "message": "Location saved successfully",
        "location_enabled": True,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "city": location.city,
        "region": location.region,
        "country": location.country,
    }


@router.get("/location")
def get_curiosity_location(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(credentials)

    location = (
        db.query(CuriosityLocation)
        .filter(CuriosityLocation.user_id == user_id)
        .first()
    )

    if not location:
        return {
            "location_enabled": False,
            "latitude": None,
            "longitude": None,
            "city": None,
            "region": None,
            "country": None,
        }

    return {
        "location_enabled": True,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "city": location.city,
        "region": location.region,
        "country": location.country,
    }