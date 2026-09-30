import subprocess
import time
import json
import urllib.request
import base64
import os
import sys

# Directory to save artifacts
artifact_dir = r"C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92"
os.makedirs(artifact_dir, exist_ok=True)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_profile = r"C:\Users\nguye\AppData\Local\Temp\chrome_game_test_profile"

cmd = [
    chrome_path,
    "--remote-debugging-port=9222",
    "--headless=new",
    "--window-size=540,960",
    "--disable-gpu",
    "--no-sandbox",
    f"--user-data-dir={temp_profile}",
    "http://localhost:8080/"
]

print("Launching Chrome...")
proc = subprocess.Popen(cmd)
time.sleep(3)

# We use simple WebSocket via a helper or standard socket/urllib
# Since Python standard library does not have a builtin WebSocket client in older versions,
# let's use Node.js to connect to WS since Node 22+ has native WebSocket!
proc_node = subprocess.run(["node", "scratch/run_cdp.mjs"], cwd=r"H:\GOOGLE DRIVER\GAME", capture_output=True, text=True)
print("Node output:")
print(proc_node.stdout)
if proc_node.stderr:
    print("Node error:", proc_node.stderr)

proc.terminate()
