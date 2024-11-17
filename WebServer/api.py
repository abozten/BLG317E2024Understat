from flask import Flask, render_template, jsonify, request
import pymysql
from pymysql.cursors import DictCursor

app = Flask(__name__)

# Database connection parameters
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'blg317e2024',
    'database': 'Understat',
    'port': 3306,
    'cursorclass': DictCursor
}

def get_db_connection():
    return pymysql.connect(**db_config)

@app.route('/')
def home():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Fetch matches
            cursor.execute("""
                SELECT * FROM matches 
                ORDER BY date DESC 
                LIMIT 20
            """)
            matches = cursor.fetchall()
            
            # Fetch top players stats (assuming you have a players table)
            cursor.execute("""
                SELECT * FROM players 
                ORDER BY goals DESC 
                LIMIT 20
            """)
            players = cursor.fetchall()
            
        return render_template('index.html', 
                             matches=matches,
                             players=players)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/api/matches')
def get_matches():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM matches ORDER BY date DESC")
            results = cursor.fetchall()
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/api/match/<int:match_id>')
def get_match(match_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM matches WHERE match_id=%s", (match_id,))
            result = cursor.fetchone()
        if result:
            return jsonify(result), 200
        return jsonify({'message': 'Match not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/api/team/<team_name>')
def get_team_stats(team_name):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Get team's home matches
            cursor.execute("""
                SELECT * FROM matches 
                WHERE home_team = %s OR away_team = %s
                ORDER BY date DESC
            """, (team_name, team_name))
            matches = cursor.fetchall()
            
            # Calculate team statistics
            stats = {
                'name': team_name,
                'matches_played': len(matches),
                'goals_scored': 0,
                'goals_conceded': 0,
                'xG_for': 0,
                'xG_against': 0,
                'matches': matches
            }
            
            for match in matches:
                if match['home_team'] == team_name:
                    stats['goals_scored'] += match['home_goals']
                    stats['goals_conceded'] += match['away_goals']
                    stats['xG_for'] += match['home_xG']
                    stats['xG_against'] += match['away_xG']
                else:
                    stats['goals_scored'] += match['away_goals']
                    stats['goals_conceded'] += match['home_goals']
                    stats['xG_for'] += match['away_xG']
                    stats['xG_against'] += match['home_xG']
            
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

if __name__ == '__main__':
    app.run(debug=True)
