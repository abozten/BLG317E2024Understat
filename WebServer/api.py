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

@app.route('/match_info', methods=['GET'])
def get_match_info():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM match_info
                ORDER BY date DESC
                LIMIT 20
            """)
            match_info = cursor.fetchall()
        return jsonify(match_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/season', methods=['GET'])
def get_season_stats():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM season
                LIMIT 20
            """)
            season_stats = cursor.fetchall()
        return jsonify(season_stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/shots', methods=['GET'])
def get_shot_data():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM shot_data
                ORDER BY date DESC
                LIMIT 20
            """)
            shot_data = cursor.fetchall()
        return jsonify(shot_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Run this API server on port 5001
