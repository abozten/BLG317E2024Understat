from flask import Flask, jsonify, request
from pymysql.cursors import DictCursor
import pymysql

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
    try:
        return pymysql.connect(**db_config)
    except pymysql.MySQLError as e:
        raise RuntimeError(f"Database connection failed: {e}")

# CRUD for "season" table
@app.route('/seasons', methods=['GET'])
def get_seasons():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM season")
            seasons = cursor.fetchall()
        return jsonify(seasons)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

@app.route('/seasons', methods=['POST'])
def create_season():
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO season (team_id, year, h_a, xG, xGA, npxG, npxGA, deep, deep_allowed, scored, missed, xpts, result, date, wins, draws, loses, pts, npxGD, ppda_att, ppda_def, ppda_allowed_att, ppda_allowed_def)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (data.get('team_id'), data.get('year'), data.get('h_a'), data.get('xG'), data.get('xGA'), data.get('npxG'), data.get('npxGA'), data.get('deep'), data.get('deep_allowed'),
                 data.get('scored'), data.get('missed'), data.get('xpts'), data.get('result'), data.get('date'), data.get('wins'), data.get('draws'), data.get('loses'), data.get('pts'),
                 data.get('npxGD'), data.get('ppda_att'), data.get('ppda_def'), data.get('ppda_allowed_att'), data.get('ppda_allowed_def'))
            )
            connection.commit()
        return jsonify({'message': 'Season created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

@app.route('/seasons/<int:season_id>', methods=['PUT'])
def update_season(season_id):
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE season SET team_id=%s, year=%s, h_a=%s, xG=%s, xGA=%s, npxG=%s, npxGA=%s, deep=%s, deep_allowed=%s, scored=%s, missed=%s, xpts=%s, result=%s, date=%s, wins=%s, draws=%s, loses=%s, pts=%s, npxGD=%s, ppda_att=%s, ppda_def=%s, ppda_allowed_att=%s, ppda_allowed_def=%s
                WHERE seasonentryid=%s
                """,
                (data.get('team_id'), data.get('year'), data.get('h_a'), data.get('xG'), data.get('xGA'), data.get('npxG'), data.get('npxGA'), data.get('deep'), data.get('deep_allowed'),
                 data.get('scored'), data.get('missed'), data.get('xpts'), data.get('result'), data.get('date'), data.get('wins'), data.get('draws'), data.get('loses'), data.get('pts'),
                 data.get('npxGD'), data.get('ppda_att'), data.get('ppda_def'), data.get('ppda_allowed_att'), data.get('ppda_allowed_def'), season_id)
            )
            connection.commit()
        return jsonify({'message': 'Season updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

@app.route('/seasons/<int:season_id>', methods=['DELETE'])
def delete_season(season_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM season WHERE seasonentryid=%s", (season_id,))
            connection.commit()
        return jsonify({'message': 'Season deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# Advanced query to fetch season summary with grouping and conditions
@app.route('/season-summary', methods=['GET'])
def get_season_summary():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT team_id, year, COUNT(*) AS total_matches,
                       SUM(scored) AS total_scored, SUM(missed) AS total_missed,
                       AVG(xG) AS avg_xG, AVG(xGA) AS avg_xGA
                FROM season
                GROUP BY team_id, year
                HAVING COUNT(*) > 5
                ORDER BY year DESC, team_id ASC
                """
            )
            summary = cursor.fetchall()
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# CRUD for "fut23" table
@app.route('/fut23', methods=['GET'])
def get_fut23():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM fut23")
            players = cursor.fetchall()
        return jsonify(players)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

@app.route('/fut23', methods=['POST'])
def create_fut23():
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO fut23 (Name, Team, Country, League, Rating, Rare, Version_color, Position, Other_Positions, Version, Run_type, Price, Skill, Weak_foot, Attack_rate, Defense_rate, Pace, Shoot, Pass, Drible, Defense, Physical, Body_type, Height_cm, Weight_kg, Popularity, Base_Stats, In_Game_Stats, Game_version, Updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (data.get('Name'), data.get('Team'), data.get('Country'), data.get('League'), data.get('Rating'), data.get('Rare'), data.get('Version_color'), data.get('Position'),
                 data.get('Other_Positions'), data.get('Version'), data.get('Run_type'), data.get('Price'), data.get('Skill'), data.get('Weak_foot'), data.get('Attack_rate'),
                 data.get('Defense_rate'), data.get('Pace'), data.get('Shoot'), data.get('Pass'), data.get('Drible'), data.get('Defense'), data.get('Physical'), data.get('Body_type'),
                 data.get('Height_cm'), data.get('Weight_kg'), data.get('Popularity'), data.get('Base_Stats'), data.get('In_Game_Stats'), data.get('Game_version'), data.get('Updated_at'))
            )
            connection.commit()
        return jsonify({'message': 'FUT23 player created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

@app.route('/fut23/<string:name>', methods=['PUT'])
def update_fut23(name):
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE fut23 SET Team=%s, Country=%s, League=%s, Rating=%s, Rare=%s, Version_color=%s, Position=%s, Other_Positions=%s, Version=%s, Run_type=%s, Price=%s, Skill=%s, Weak_foot=%s, Attack_rate=%s, Defense_rate=%s, Pace=%s, Shoot=%s, Pass=%s, Drible=%s, Defense=%s, Physical=%s, Body_type=%s, Height_cm=%s, Weight_kg=%s, Popularity=%s, Base_Stats=%s, In_Game_Stats=%s, Game_version=%s, Updated_at=%s
                WHERE Name=%s
                """,
                (data.get('Team'), data.get('Country'), data.get('League'), data.get('Rating'), data.get('Rare'), data.get('Version_color'), data.get('Position'), data.get('Other_Positions'),
                 data.get('Version'), data.get('Run_type'), data.get('Price'), data.get('Skill'), data.get('Weak_foot'), data.get('Attack_rate'), data.get('Defense_rate'), data.get('Pace'),
                 data.get('Shoot'), data.get('Pass'), data.get('Drible'), data.get('Defense'), data.get('Physical'), data.get('Body_type'), data.get('Height_cm'), data.get('Weight_kg'),
                 data.get('Popularity'), data.get('Base_Stats'), data.get('In_Game_Stats'), data.get('Game_version'), data.get('Updated_at'), name)
            )
            connection.commit()
        return jsonify({'message': 'FUT23 player updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

@app.route('/fut23/<string:name>', methods=['DELETE'])
def delete_fut23(name):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM fut23 WHERE Name=%s", (name,))
            connection.commit()
        return jsonify({'message': 'FUT23 player deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# Advanced query to fetch player statistics summary
@app.route('/fut23-summary', methods=['GET'])
def get_fut23_summary():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT Team, AVG(Rating) AS avg_rating, COUNT(*) AS total_players,
                       MAX(Price) AS max_price, MIN(Price) AS min_price
                FROM fut23
                WHERE Rating > 80
                GROUP BY Team
                HAVING COUNT(*) > 3
                ORDER BY avg_rating DESC, total_players DESC
                """
            )
            summary = cursor.fetchall()
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# Advanced query combining season and fut23 tables
@app.route('/team-performance', methods=['GET'])
def get_team_performance():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT s.team_id, s.year, f.Team, COUNT(*) AS total_matches,
                       AVG(s.xG) AS avg_team_xG, AVG(f.Rating) AS avg_player_rating
                FROM season s
                JOIN fut23 f ON s.team_id = f.Team
                WHERE s.year = 2023
                GROUP BY s.team_id, s.year, f.Team
                ORDER BY avg_team_xG DESC, avg_player_rating DESC
                """
            )
            performance = cursor.fetchall()
        return jsonify(performance)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

if __name__ == '__main__':
    app.run(debug=True)
