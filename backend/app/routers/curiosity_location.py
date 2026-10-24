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

KOLKATA_NEIGHBORHOODS = {
    "kolkata", "calcutta", "beliaghata", "beleghata", "salt lake", "saltlake",
    "bidhannagar", "bidhan nagar", "howrah", "alipore", "dum dum", "dumdum",
    "jadavpur", "behala", "tollygunge", "new town", "newtown", "rajarhat",
    "ballygunge", "sealdah", "kasba", "garia", "barasat", "shyambazar"
}


def resolve_location_from_coords(lat: float, lon: float) -> tuple[str | None, str | None, str | None]:
    city = None
    region = None
    country = None

    # 1. Try OpenStreetMap Nominatim reverse geocoding (fast & accurate for India/Bengal)
    try:
        headers = {"User-Agent": "CuriosityLearnApp/1.0"}
        r = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"lat": lat, "lon": lon, "format": "json"},
            headers=headers,
            timeout=4,
        )
        if r.status_code == 200:
            addr = r.json().get("address", {})
            city = addr.get("city") or addr.get("town") or addr.get("suburb") or addr.get("residential") or addr.get("county")
            region = addr.get("state") or addr.get("province")
            country = addr.get("country")
    except Exception as e:
        print("Nominatim reverse lookup error:", e)

    # 2. Try GeoNames if city or region missing
    if not (city and region and country):
        try:
            response = requests.get(
                "http://api.geonames.org/findNearbyPlaceNameJSON",
                params={
                    "lat": lat,
                    "lng": lon,
                    "username": GEONAMES_USERNAME,
                },
                timeout=4,
            )
            if response.status_code == 200:
                geo_data = response.json()
                if geo_data.get("geonames"):
                    place = geo_data["geonames"][0]
                    city = city or place.get("name")
                    region = region or place.get("adminName1")
                    country = country or place.get("countryName")
        except Exception as e:
            print("GeoNames reverse lookup error:", e)

    # 3. Coordinate-based bounding box fallbacks
    # Kolkata Metropolitan Area: lat 22.30 to 22.80, lon 88.15 to 88.60
    if 22.30 <= lat <= 22.80 and 88.15 <= lon <= 88.60:
        city = city or "Kolkata"
        region = region or "West Bengal"
        country = country or "India"
    # West Bengal: lat 21.40 to 27.50, lon 85.60 to 89.95
    elif 21.40 <= lat <= 27.50 and 85.60 <= lon <= 89.95:
        region = region or "West Bengal"
        country = country or "India"
    # India: lat 6.5 to 37.5, lon 68.0 to 97.5
    elif 6.5 <= lat <= 37.5 and 68.0 <= lon <= 97.5:
        country = country or "India"

    # Normalize Kolkata neighborhoods to city="Kolkata"
    if city and city.strip().lower() in KOLKATA_NEIGHBORHOODS:
        city = "Kolkata"

    return city, region, country


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

    city, region, country = resolve_location_from_coords(data.latitude, data.longitude)

    # Save / update user location
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
