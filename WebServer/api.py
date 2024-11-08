from flask import Flask, request, jsonify
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
    'cursorclass': DictCursor #Easier to work with dictionaries than tuples
}

def get_db_connection():
    return pymysql.connect(**db_config)

@app.route('/matches', methods=['POST'])
def create_match():
    data = request.json
    keys = ', '.join(data.keys())
    values = ', '.join(['%s'] * len(data))
    sql = f"INSERT INTO matches ({keys}) VALUES ({values})"
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(sql, tuple(data.values()))
        connection.commit()
        return jsonify({'message': 'Match created'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/matches', methods=['GET'])
def get_matches():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM matches") #Limit match fetching
            results = cursor.fetchall()
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/matches/<int:match_id>', methods=['GET'])
def get_match(match_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM matches WHERE match_id=%s", (match_id,))
            result = cursor.fetchone()
        if result:
            return jsonify(result), 200
        else:
            return jsonify({'message': 'Match not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/matches/<int:match_id>', methods=['PUT'])
def update_match(match_id):
    data = request.json
    set_clause = ', '.join([f"{key}=%s" for key in data.keys()])
    sql = f"UPDATE matches SET {set_clause} WHERE match_id=%s"
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(sql, tuple(data.values()) + (match_id,))
        connection.commit()
        return jsonify({'message': 'Match updated'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/matches/<int:match_id>', methods=['DELETE'])
def delete_match(match_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM matches WHERE match_id=%s", (match_id,))
        connection.commit()
        return jsonify({'message': 'Match deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

if __name__ == '__main__':
    app.run(debug=True)