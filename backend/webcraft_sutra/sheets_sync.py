import gspread
from google.oauth2.service_account import Credentials
import os
from django.conf import settings

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

def get_sheets_client():
    # First, try to load from a Base64 encoded environment variable (Best for Render/Heroku)
    base64_creds = os.environ.get('GOOGLE_CREDENTIALS_BASE64')
    if base64_creds:
        import base64
        import json
        try:
            decoded_bytes = base64.b64decode(base64_creds)
            creds_info = json.loads(decoded_bytes.decode('utf-8'))
            credentials = Credentials.from_service_account_info(
                creds_info, scopes=SCOPES
            )
            return gspread.authorize(credentials)
        except Exception as e:
            print(f"Failed to load Base64 credentials: {e}")
            return None

    # Fallback: Try to load from a physical file path
    service_account_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    if not service_account_path or not os.path.exists(service_account_path):
        return None
        
    credentials = Credentials.from_service_account_file(
        service_account_path, scopes=SCOPES
    )
    return gspread.authorize(credentials)

def sync_row_to_sheet(sheet_name, row_data, row_id):
    """
    Pushes a dictionary of row_data to the Google Sheet 'sheet_name'.
    If row_id is provided, it attempts to find and update.
    """
    client = get_sheets_client()
    if not client:
        print(f"--- MOCK SHEETS SYNC --- Would sync {row_data} to {sheet_name}")
        return
        
    try:
        sheet_id = os.environ.get('TARGET_SPREADSHEET_ID')
        spreadsheet = client.open_by_key(sheet_id)
        worksheet = spreadsheet.worksheet(sheet_name)
        
        # Simplified logic: just append for now
        worksheet.append_row(list(row_data.values()))
    except Exception as e:
        print(f"Error syncing to Google Sheets: {e}")
