import subprocess
#Creates tables and inserts values.
scripts = [
    "team.py",
    "season.py",
    "player.py",
    "matchdata.py",
    "fut23.py",
    "shotdata.py",
    "matchinfo.py",
]

for script in scripts:
    print(f"Running {script}...")
    subprocess.run(["python3.11", script], check=True)
