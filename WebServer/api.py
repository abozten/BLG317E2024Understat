from flask import Flask, jsonify, request
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

@app.route('/seasons', methods=['GET'])    #Deniz'den aldım.
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

@app.route('/season/<team_name>', methods=['GET']) #Deniz'den aldım.
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

@app.route('/fut23', methods=['GET']) #Deniz'den aldım.
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

@app.route('/fut23/<team_name>', methods=['GET']) #Deniz'den aldım.
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
        
@app.route('/players', methods=['GET'])
def get_players():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM players
                LIMIT 20
            """)
            players = cursor.fetchall()
        return jsonify(players)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/matches', methods=['GET'])
def get_matches():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM matches
                ORDER BY datetime DESC
                LIMIT 20
            """)
            matches = cursor.fetchall()
        return jsonify(matches)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/team/<team_name>', methods=['GET']) 
def get_team(team_name):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM matches 
                WHERE h_title = %s OR a_title = %s
                ORDER BY datetime DESC
                LIMIT 10
            """, (team_name, team_name))
            team_matches = cursor.fetchall()
        return jsonify(team_matches)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()


@app.route('/team/<team_name>/squad', methods=['GET'])
def get_team_squad(team_name):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT DISTINCT
                    p.player_name as name,
                    f.Position as position, 
                    f.Rating as rating,
                    p.games,
                    p.goals,
                    p.assists
                FROM players p
                JOIN fut23 f ON p.player_name = f.Name
                WHERE p.team_title = %s
                    AND p.year = (SELECT MAX(year) FROM players)
                ORDER BY f.Rating DESC
            """, (team_name,))
            
            columns = [desc[0] for desc in cursor.description]
            squad = cursor.fetchall()
            
            players = [dict(zip(columns, player)) for player in squad]
            
            response = jsonify({
                'team': team_name,
                'squad_size': len(players),
                'players': players
            })
            response.headers['Content-Type'] = 'application/json'
            return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection:
            connection.close()
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Run this API server on port 5001
