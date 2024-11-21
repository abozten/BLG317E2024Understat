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
    connection = None
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
            response.headers.add('Content-Type', 'application/json')
            return response

    except Exception as e:
        return jsonify({
            'error': f"Failed to fetch squad data: {str(e)}"
        }), 500
        
    finally:
        if connection:
            connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Run this API server on port 5001
