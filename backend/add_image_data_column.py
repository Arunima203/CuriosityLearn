"""
Run this once to add the image_data column to geography_contents table.
Usage: python add_image_data_column.py
"""
import os
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set")

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Add image_data column if it doesn't exist
    try:
        conn.execute(text(
            "ALTER TABLE geography_contents ADD COLUMN image_data TEXT;"
        ))
        conn.commit()
        print("✅ image_data column added successfully")
    except Exception as e:
        if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
            print("ℹ️  image_data column already exists — skipping")
        else:
            print(f"❌ Error: {e}")
