from flask import Flask, jsonify, request
import pymysql
from pymysql.cursors import DictCursor

app = Flask(__name__)

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

@app.route('/seasons', methods=['GET'])
def get_seasons():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT seasonentryid, team_id, title, year, xG, xGA, npxG, npxGA, scored, missed, wins, draws, loses, pts
                FROM season
                LIMIT 20
            """)
            seasons = cursor.fetchall()
        return jsonify(seasons)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/season/<team_name>', methods=['GET'])
def get_season_team_performance(team_name):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT seasonentryid, title, year, xG, xGA, scored, missed, pts, result, date
                FROM season
                WHERE title = %s
                ORDER BY date DESC
                LIMIT 10
            """, (team_name,))
            team_performance = cursor.fetchall()
        return jsonify(team_performance)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/fut23', methods=['GET'])
def get_fut23_players():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT Name, Team, Country, League, Rating, Position, Price, Skill, Weak_foot, Pace, Shoot, Pass, Drible, Defense, Physical
                FROM fut23
                LIMIT 20
            """)
            players = cursor.fetchall()
        return jsonify(players)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/fut23/<team_name>', methods=['GET'])
def get_team_fut23_players(team_name):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT Name, Rating, Position, Pace, Shoot, Pass, Drible, Defense, Physical
                FROM fut23
                WHERE Team = %s
                ORDER BY Rating DESC
                LIMIT 10
            """, (team_name,))
            team_players = cursor.fetchall()
        return jsonify({
            'team': team_name,
            'squad_size': len(team_players),
            'players': team_players
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5001)
