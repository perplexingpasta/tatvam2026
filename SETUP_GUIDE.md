# Setup Guide

## MERCH GOOGLE SHEETS SETUP:
1. Create a NEW Google Spreadsheet (separate from the registrations spreadsheet)
2. Name it "[FestName] 2026 — Merch Orders"
3. Rename Sheet1 to "MerchOrders"
4. Set row 1 headers exactly as:
   A: Order ID | B: Buyer Name | C: Buyer Email | D: Buyer Phone | E: Item Name | F: Custom Attributes | G: Unit Price | H: Total Order Amount | I: UTR Number | J: Payment Screenshot URL | K: Submitted At | L: Units in Order
5. Share the spreadsheet with the same Google service account email (GOOGLE_SERVICE_ACCOUNT_EMAIL) as Editor
6. Copy the spreadsheet ID from the URL and set it as GOOGLE_MERCH_SHEETS_SPREADSHEET_ID in .env.local and in Vercel environment variables
