#!/bin/bash
#Don't forget to make the file executable by running chmod +x mac-run-servers.sh 
# Specify Python 3.11
PYTHON_CMD="python3.11"

# Check if python3.11 is installed
if ! command -v $PYTHON_CMD &> /dev/null
then
    echo "Python 3.11 is not installed. Please install Python 3.11."
    exit 1
fi

# Create a virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install required packages
$PYTHON_CMD -m pip install flask pymysql requests

# Open two terminal windows and run the servers
osascript <<EOF
tell application "Terminal"
    do script "cd \"$(pwd)\" && source venv/bin/activate && $PYTHON_CMD api.py"
end tell

tell application "Terminal"
    do script "cd \"$(pwd)/understat-app\" && npm run dev"
end tell
EOF