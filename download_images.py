import os
import requests
import pandas as pd

# ========================
# CONFIGURATION
# ========================

# Paste your Google Sheet CSV export link here 👇
SHEET_URL = "https://docs.google.com/spreadsheets/d/1tpJfvoC6dcOsQ9bGi-qLlZWRrwRaZvdlzOQLV5KMdDs/edit?usp=sharing"
# Output folder
BASE_DIR = "images"

# ========================
# MAIN SCRIPT
# ========================

# Load spreadsheet data
df = pd.read_csv(SHEET_URL)

# Expected columns: Name, Team, ImageURL
# You can rename here if your headers are different
df.columns = [c.strip().lower() for c in df.columns]  # normalize headers

for index, row in df.iterrows():
    name = row.get("name", f"person_{index}").strip().replace(" ", "_")
    team = row.get("team", "Unknown").strip().capitalize()
    url = row.get("image_url") or row.get("url")

    if not url or not url.startswith("http"):
        print(f"⚠️ Skipping {name}: invalid URL")
        continue

    # Create team folder if not exists
    folder_path = os.path.join(BASE_DIR, team)
    os.makedirs(folder_path, exist_ok=True)

    # Detect file extension
    ext = os.path.splitext(url.split("?")[0])[1]
    if ext.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".jpg"

    # File path
    file_path = os.path.join(folder_path, f"{name}{ext}")

    # Download image
    try:
        r = requests.get(url, stream=True)
        r.raise_for_status()
        with open(file_path, "wb") as f:
            for chunk in r.iter_content(1024):
                f.write(chunk)
        print(f"✅ Saved {file_path}")
    except Exception as e:
        print(f"❌ Failed {name}: {e}")

print("\n🎉 Done downloading all images!")
