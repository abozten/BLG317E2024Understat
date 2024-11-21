from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__)

API_URL = "http://127.0.0.1:5001"  # URL of the API server

@app.route('/')
def index():  
    try:
        # Send GET requests to the API
        players_response = requests.get(f"{API_URL}/players")
        matches_response = requests.get(f"{API_URL}/matches")
        match_info_response = requests.get(f"{API_URL}/match_info")
        season_response = requests.get(f"{API_URL}/season")
        shots_response = requests.get(f"{API_URL}/shots")
        
        # Check if the responses were successful
        if players_response.status_code == 200:
            players = players_response.json()
        else:
            players = []

        if matches_response.status_code == 200:
            matches = matches_response.json()
        else:
            matches = []

        if match_info_response.status_code == 200:
            match_info = match_info_response.json()
        else:
            match_info = []

        if season_response.status_code == 200:
            season_stats = season_response.json()
        else:
            season_stats = []

        if shots_response.status_code == 200:
            shot_data = shots_response.json()
        else:
            shot_data = []

        return render_template('index.html', 
                               players=players,
                               matches=matches,
                               match_info=match_info,
                               season_stats=season_stats,
                               shot_data=shot_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/team/<team_name>')
def team(team_name):
    try:
        # Get team-specific data from API
        team_response = requests.get(f"{API_URL}/team/{team_name}")
        if team_response.status_code == 200:
            team_data = team_response.json()
        else:
            team_data = {}
        return render_template('team.html', team=team_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)  # This runs the client-side server on port 5000
