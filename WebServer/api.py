from flask import Flask, jsonify, request, session
from datetime import datetime
import pymysql
from pymysql.cursors import DictCursor
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from flask_session import Session  # Add flask-session for session management
app = Flask(__name__)#An issue with chrome and cookies, so we need to set the session cookie to secure and samesite=None.
CORS(app, 
     resources={r"/*": {
         "origins": ["https://127.0.0.1:3000", "http://127.0.0.1:3000"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "expose_headers": ["Content-Range", "X-Content-Range"],
         "supports_credentials": True
     }})
# Configure session
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = 'supersecretkey'
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
Session(app)

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
#DENİZ
#SEASONS
@app.route('/seasons', methods=['GET'])
def get_seasons():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search', '')
        offset = (page - 1) * limit

        connection = get_db_connection()
        with connection.cursor() as cursor:
            query = """
                SELECT seasonentryid, team_id, year, xG, xGA, npxG, npxGA, scored, missed, wins, draws, loses, pts
                FROM season
                 WHERE team_id LIKE %s
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (f'%{search}%', limit, offset))
            seasons = cursor.fetchall()
        return jsonify(seasons)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
            connection.close()

@app.route('/season/<int:season_id>', methods=['PUT'])
def update_season(season_id):
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE season SET team_id=%s, year=%s, xG=%s, xGA=%s, npxG=%s, npxGA=%s, scored=%s, missed=%s, wins=%s, draws=%s, loses=%s, pts=%s
                WHERE seasonentryid=%s
                """,
                (data.get('team_id'), data.get('year'), data.get('xG'), data.get('xGA'), data.get('npxG'), data.get('npxGA'),
                 data.get('scored'), data.get('missed'), data.get('wins'), data.get('draws'), data.get('loses'), data.get('pts'), season_id)
            )
            connection.commit()
            cursor.execute("""
                SELECT seasonentryid, team_id, year, xG, xGA, npxG, npxGA, scored, missed, wins, draws, loses, pts
                FROM season
                WHERE seasonentryid = %s
            """, (season_id,))
            updated_season = cursor.fetchone()
        return jsonify(updated_season)
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
                INSERT INTO season (team_id, year, xG, xGA, npxG, npxGA, scored, missed, wins, draws, loses, pts)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (data.get('team_id'), data.get('year'), data.get('xG'), data.get('xGA'), data.get('npxG'), data.get('npxGA'),
                 data.get('scored'), data.get('missed'), data.get('wins'), data.get('draws'), data.get('loses'), data.get('pts'))
            )
            connection.commit()
            cursor.execute("""
                SELECT seasonentryid, team_id, year, xG, xGA, npxG, npxGA, scored, missed, wins, draws, loses, pts
                FROM season
                WHERE seasonentryid = LAST_INSERT_ID()
            """)
            new_season = cursor.fetchone()
        return jsonify(new_season), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

@app.route('/season/<int:season_id>', methods=['DELETE'])
def delete_season(season_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM season WHERE seasonentryid=%s", (season_id,))
            connection.commit()
            if cursor.rowcount == 0:
                return jsonify({'error': 'Season not found'}), 404
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

@app.route('/fut23', methods=['GET'])
def get_fut23_players():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search', '')
        offset = (page - 1) * limit

        connection = get_db_connection()
        with connection.cursor() as cursor:
             query = """
                SELECT `Name`,player_id,Team,team_id,Country,League,Rating,Position,Other_Positions,Run_type,Price,Skill,Weak_foot,Attack_rate,Defense_rate,Pace,Shoot,Pass,Drible,Defense,Physical,Body_type,Height_cm,Weight,Popularity,Base_Stats,In_Game_Stats
                FROM fut23
                WHERE `Name` LIKE %s
                LIMIT %s OFFSET %s
            """
             cursor.execute(query, (f'%{search}%', limit, offset))
             players = cursor.fetchall()
        return jsonify(players)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
            connection.close()

@app.route('/futplayer/<int:player_id>', methods=['GET'])
def get_fut_player(player_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT `Name`,player_id,Team,team_id,Country,League,Rating,Position,Other_Positions,Run_type,Price,Skill,Weak_foot,Attack_rate,Defense_rate,Pace,Shoot,Pass,Drible,Defense,Physical,Body_type,Height_cm,Weight,Popularity,Base_Stats,In_Game_Stats
                FROM fut23
                WHERE player_id = %s
            """, (player_id,))
            fut_player = cursor.fetchone()
            if fut_player is None:
                return jsonify({'error': 'Player not found in fut23'}), 404
        return jsonify(fut_player)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
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

@app.route('/fut23', methods=['POST'])#Deniz'den aldım.
def create_fut23():
     try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                 INSERT INTO fut23 (Name, player_id, Team, team_id, Country, League, Rating, Position, Other_Positions, Run_type, Price, Skill, Weak_foot, Attack_rate, Defense_rate, Pace, Shoot, Pass, Drible, Defense, Physical, Body_type, Height_cm, Weight, Popularity, Base_Stats, In_Game_Stats)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (data.get('Name'), data.get('player_id'), data.get('Team'), data.get('team_id'), data.get('Country'), data.get('League'), data.get('Rating'), data.get('Position'),
                 data.get('Other_Positions'), data.get('Run_type'), data.get('Price'), data.get('Skill'), data.get('Weak_foot'), data.get('Attack_rate'),
                 data.get('Defense_rate'), data.get('Pace'), data.get('Shoot'), data.get('Pass'), data.get('Drible'), data.get('Defense'), data.get('Physical'), data.get('Body_type'),
                 data.get('Height_cm'), data.get('Weight'), data.get('Popularity'), data.get('Base_Stats'), data.get('In_Game_Stats'))
            )
            connection.commit()
        return jsonify({'message': 'FUT23 player created successfully'}), 201
     except Exception as e:
        return jsonify({'error': str(e)}), 400
     finally:
        if 'connection' in locals() and connection.open:
            connection.close()

@app.route('/futplayer/<int:player_id>', methods=['PUT'])#Deniz'den aldım.
def update_fut23(player_id):
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE fut23 SET Name=%s, Team=%s, team_id=%s, Country=%s, League=%s, Rating=%s, Position=%s, Other_Positions=%s, Run_type=%s, Price=%s, Skill=%s, Weak_foot=%s, Attack_rate=%s, Defense_rate=%s, Pace=%s, Shoot=%s, Pass=%s, Drible=%s, Defense=%s, Physical=%s, Body_type=%s, Height_cm=%s, Weight=%s, Popularity=%s, Base_Stats=%s, In_Game_Stats=%s
                WHERE player_id=%s
                """,
                (data.get('Name'), data.get('Team'), data.get('team_id'), data.get('Country'), data.get('League'), data.get('Rating'), data.get('Position'), data.get('Other_Positions'),
                 data.get('Run_type'), data.get('Price'), data.get('Skill'), data.get('Weak_foot'), data.get('Attack_rate'), data.get('Defense_rate'), data.get('Pace'),
                 data.get('Shoot'), data.get('Pass'), data.get('Drible'), data.get('Defense'), data.get('Physical'), data.get('Body_type'),
                 data.get('Height_cm'), data.get('Weight'), data.get('Popularity'), data.get('Base_Stats'), data.get('In_Game_Stats'), player_id)
            )
            connection.commit()
            cursor.execute("""
               SELECT `Name`,player_id,Team,team_id,Country,League,Rating,Position,Other_Positions,Run_type,Price,Skill,Weak_foot,Attack_rate,Defense_rate,Pace,Shoot,Pass,Drible,Defense,Physical,Body_type,Height_cm,Weight,Popularity,Base_Stats,In_Game_Stats
               FROM fut23
               WHERE player_id = %s
            """, (player_id,))
            updated_player = cursor.fetchone()
        return jsonify(updated_player)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

@app.route('/futplayer/<int:player_id>', methods=['DELETE'])#Deniz'den aldım.
def delete_fut23(player_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM fut23 WHERE player_id=%s", (player_id,))
            connection.commit()
        return jsonify({'message': 'FUT23 player deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

# Advanced query to fetch player statistics summary
@app.route('/fut23-summary', methods=['GET'])#Deniz'den aldım.
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
@app.route('/team-performance', methods=['GET'])#Deniz'den aldım.
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

# SHOTS CRUD OPERATIONS
@app.route('/shots', methods=['GET'])
def get_shots():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search', '')
        offset = (page - 1) * limit

        connection = get_db_connection()
        with connection.cursor() as cursor:
            query = """
                SELECT shot_id, match_id, player_id, minute, X as x, Y as y, xG as xg, result, situation, shotType, player_assisted
                FROM shots
                 WHERE shot_id LIKE %s
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (f'%{search}%', limit, offset))
            shots = cursor.fetchall()
        return jsonify(shots)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
            connection.close()


@app.route('/shot/<int:shot_id>', methods=['GET'])
def get_shot(shot_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT shot_id, match_id, player_id, minute, X as x, Y as y, xG as xg, result, situation, shotType, player_assisted
                FROM shots
                WHERE shot_id = %s
            """, (shot_id,))
            shot = cursor.fetchone()
            if shot is None:
                return jsonify({'error': 'Shot not found'}), 404
        return jsonify(shot)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
            connection.close()


@app.route('/shots', methods=['POST'])
def create_shot():
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO shots (shot_id, match_id, player_id, minute, X, Y, xG, result, situation, shotType, player_assisted)
                VALUES (%s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (data.get('shot_id'), data.get('match_id'), data.get('player_id'), data.get('minute'),
                  data.get('x'), data.get('y'), data.get('xg'), data.get('result'),
                  data.get('situation'), data.get('shotType'), data.get('player_assisted')))
            connection.commit()
            cursor.execute("""
                SELECT shot_id, match_id, player_id, minute, X as x, Y as y, xG as xg, result, situation, shotType, player_assisted
                FROM shots
                WHERE shot_id = %s
            """, (data.get('shot_id'),))
            new_shot = cursor.fetchone()
        return jsonify(new_shot), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
            connection.close()

@app.route('/shot/<int:shot_id>', methods=['PUT'])
def update_shot(shot_id):
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE shots
                SET match_id = %s, player_id = %s, minute = %s, X = %s, Y = %s, xG = %s,
                    result = %s, situation = %s, shotType = %s, player_assisted = %s
                WHERE shot_id = %s
            """, (data.get('match_id'), data.get('player_id'), data.get('minute'), data.get('x'),
                  data.get('y'), data.get('xg'), data.get('result'), data.get('situation'),
                  data.get('shotType'), data.get('player_assisted'), shot_id))
            connection.commit()
            if cursor.rowcount == 0:
                return jsonify({'error': 'Shot not found'}), 404
            # Fetch and return the updated shot data
            cursor.execute("""
                SELECT shot_id, match_id, player_id, minute, X as x, Y as y, xG as xg, result, situation, shotType, player_assisted
                FROM shots
                WHERE shot_id = %s
            """, (shot_id,))
            updated_shot = cursor.fetchone()
        return jsonify(updated_shot)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
            connection.close()

@app.route('/shot/<int:shot_id>', methods=['DELETE'])
def delete_shot(shot_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM shots WHERE shot_id = %s", (shot_id,))
            connection.commit()
            if cursor.rowcount == 0:
                return jsonify({'error': 'Shot not found'}), 404
        return jsonify({'message': 'Shot deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
           connection.close()

#ALİ
   #Match_Info
@app.route('/match_infos', methods=['GET'])
def get_match_infos(): #wont be necessary
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM match_infos
                LIMIT 20
            """)
            matches = cursor.fetchall()
        return jsonify(matches)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/match_infos/<int:match_id>', methods=['GET'])
def get_match_info(match_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM match_infos 
                WHERE match_id = %s
            """, (match_id,))
            match = cursor.fetchone()
            if match is None:
                return jsonify({'error': 'Match info not found'}), 404
        return jsonify(match)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/match_infos', methods=['POST'])
def create_match_info():
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO match_infos (fid, match_id, h, a, date, league_id, season, h_goals, a_goals, 
                    team_h, team_a, h_xg, a_xg, h_w, h_d, h_l, league, h_shot, a_shot, h_shotOnTarget, 
                    a_shotOnTarget, h_deep, a_deep, a_ppda, h_ppda)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (data['fid'], data['match_id'], data['h'], data['a'], data['date'], data['league_id'],
                 data['season'], data['h_goals'], data['a_goals'], data['team_h'], data['team_a'],
                 data['h_xg'], data['a_xg'], data['h_w'], data['h_d'], data['h_l'], data['league'],
                 data['h_shot'], data['a_shot'], data['h_shotOnTarget'], data['a_shotOnTarget'],
                 data['h_deep'], data['a_deep'], data['a_ppda'], data['h_ppda'])
            )
            connection.commit()
        return jsonify({'message': 'Match info created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/match_infos/<int:match_id>', methods=['PUT'])
def update_match_info(match_id):
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE match_infos
                SET h = %s, a = %s, date = %s, league_id = %s, season = %s, h_goals = %s, a_goals = %s, 
                    team_h = %s, team_a = %s, h_xg = %s, a_xg = %s, h_w = %s, h_d = %s, h_l = %s, league = %s, 
                    h_shot = %s, a_shot = %s, h_shotOnTarget = %s, a_shotOnTarget = %s, h_deep = %s, a_deep = %s, 
                    a_ppda = %s, h_ppda = %s
                WHERE match_id = %s
                """,
                (data['h'], data['a'], data['date'], data['league_id'], data['season'], data['h_goals'],
                 data['a_goals'], data['team_h'], data['team_a'], data['h_xg'], data['a_xg'], data['h_w'],
                 data['h_d'], data['h_l'], data['league'], data['h_shot'], data['a_shot'], data['h_shotOnTarget'],
                 data['a_shotOnTarget'], data['h_deep'], data['a_deep'], data['a_ppda'], data['h_ppda'], match_id)
            )
            connection.commit()
            if cursor.rowcount == 0:
                return jsonify({'error': 'Match info not found'}), 404
        return jsonify({'message': 'Match info updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/match_infos/<int:match_id>', methods=['DELETE'])
def delete_match_info(match_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM match_infos WHERE match_id = %s", (match_id,))
            connection.commit()
            if cursor.rowcount == 0:
                return jsonify({'error': 'Match info not found'}), 404
        return jsonify({'message': 'Match info deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()


#ARDA
    #Players
  #Read       
# Update the get_players route to handle pagination and search
@app.route('/players', methods=['GET'])
def get_players():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search', '')
        offset = (page - 1) * limit
        
        connection = get_db_connection()
        with connection.cursor() as cursor:
            query = """
                SELECT season_player_id, player_id, player_name, games, time, goals, xG, 
                       assists, xA, shots, key_passes, yellow_cards, red_cards, position, 
                       team_title, npg, npxG, xGChain, xGBuildup, year 
                FROM players
                WHERE player_name LIKE %s
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (f'%{search}%', limit, offset))
            players = cursor.fetchall()
        return jsonify(players)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

        
@app.route('/player/<id>', methods=['GET'])
def get_player(id):
    connection = None
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            query = """
                SELECT season_player_id, player_id, player_name, games, time, goals, xG, 
                       assists, xA, shots, key_passes, yellow_cards, red_cards, position, 
                       team_title, npg, npxG, xGChain, xGBuildup, year 
                FROM players
                WHERE player_id = %s
            """
            # Attempt to convert to integer, if it's not a number, it will be treated as a string
            if isinstance(id, str) and id.isdigit():
                cursor.execute(query, (int(id),))
            else:
                cursor.execute(query, (id,))

            player = cursor.fetchone()
            if player is None:
                return jsonify({'error': 'Player not found'}), 404
        return jsonify(player)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
            connection.close()

@app.route('/addplayer', methods=['POST'])
def create_player():
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO players (player_id, player_name, games, time, goals, xG, 
                                   assists, xA, shots, key_passes, yellow_cards, red_cards,
                                   position, team_title, npg, npxG, xGChain, xGBuildup, year)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (data['player_id'], data['player_name'], data.get('games', 0), 
                 data.get('time', 0), data.get('goals', 0), data.get('xG', 0),
                 data.get('assists', 0), data.get('xA', 0), data.get('shots', 0),
                 data.get('key_passes', 0), data.get('yellow_cards', 0), 
                 data.get('red_cards', 0), data.get('position'), data.get('team_title'),
                 data.get('npg', 0), data.get('npxG', 0), data.get('xGChain', 0),
                 data.get('xGBuildup', 0), data.get('year')))
            connection.commit()
        return jsonify({'message': 'Player created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/player/<int:player_id>', methods=['PUT'])
def update_player(player_id):
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE players 
                SET player_name = %s, games = %s, time = %s, goals = %s, xG = %s, assists = %s, xA = %s,
                    shots = %s, key_passes = %s, yellow_cards = %s, red_cards = %s, position = %s,
                    team_title = %s, npg = %s, npxG = %s, xGChain = %s, xGBuildup = %s, year = %s
                WHERE player_id = %s
            """, (data.get('player_name'), data.get('games'), data.get('time'), data.get('goals'), 
                 data.get('xG'), data.get('assists'), data.get('xA'),
                 data.get('shots'), data.get('key_passes'), data.get('yellow_cards'),
                 data.get('red_cards'), data.get('position'), data.get('team_title'),
                 data.get('npg'), data.get('npxG'), data.get('xGChain'), 
                 data.get('xGBuildup'), data.get('year'), player_id))
            connection.commit()
            if cursor.rowcount == 0:
                return jsonify({'error': 'Player not found'}), 404
            
            # Fetch and return the updated player data
            cursor.execute("""
                SELECT * FROM players WHERE player_id = %s
            """, (player_id,))
            updated_player = cursor.fetchone()
        return jsonify(updated_player)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/players/search', methods=['GET'])
def get_players_search():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        offset = (page - 1) * limit

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        with connection.cursor() as cursor:

            query = """
                SELECT season_player_id, player_id, player_name, games, time, goals, xG,
                       assists, xA, shots, key_passes, yellow_cards, red_cards, position,
                       team_title, npg, npxG, xGChain, xGBuildup, year
                FROM players
                WHERE 1=1
            """
            conditions = []
            params = []

            for key, value in request.args.items():
                if key == 'team':
                    teams = value.split(',')
                    placeholders = ', '.join(['%s'] * len(teams))
                    conditions.append(f"team_title IN ({placeholders})")
                    params.extend(teams)
                elif key == 'position':
                    positions = value.split(',')
                    placeholders = ', '.join(['%s'] * len(positions))
                    conditions.append(f"position IN ({placeholders})")
                    params.extend(positions)
                elif key.endswith('_min'):
                    column = key[:-4]
                    try:
                        conditions.append(f"{column} >= %s")
                        params.append(float(value)) #ensure that values are numbers
                    except ValueError:
                        return jsonify({'error': f"Invalid value for {key}"}), 400

                elif key.endswith('_max'):
                   column = key[:-4]
                   try:
                       conditions.append(f"{column} <= %s")
                       params.append(float(value)) #ensure that values are numbers
                   except ValueError:
                       return jsonify({'error': f"Invalid value for {key}"}), 400

            if conditions:
                query += " AND " + " AND ".join(conditions)

            query += " LIMIT %s OFFSET %s"
            params.append(limit)
            params.append(offset)


            cursor.execute(query, params)
            players = cursor.fetchall()

        return jsonify(players)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
            connection.close()           
@app.route('/player/<int:player_id>', methods=['DELETE'])
def delete_player(player_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM players WHERE player_id = %s", (player_id,))
            connection.commit()
            if cursor.rowcount == 0:
                return jsonify({'error': 'Player not found'}), 404
        return jsonify({'message': 'Player deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

#Matches
    
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

@app.route('/matchesdate', methods=['GET'])
def get_matches_by_date():
    try:
        start_date = request.args.get('start')
        end_date = request.args.get('end')
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM matches 
                WHERE datetime BETWEEN %s AND %s
                ORDER BY datetime DESC
            """, (start_date, end_date))
            matches = cursor.fetchall()
        return jsonify(matches)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/matches/<int:id>', methods=['GET'])
def get_match(id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM matches 
                WHERE match_id = %s
            """, (id,))
            match = cursor.fetchone()
            if match is None:
                return jsonify({'error': 'Match not found'}), 404
        return jsonify(match)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()


@app.route('/matches/search', methods=['GET'])
def get_matches_search():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search', '')
        start_date = request.args.get('start_date', '')
        end_date = request.args.get('end_date', '')
        offset = (page - 1) * limit
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        with connection.cursor() as cursor:
           if search and start_date and end_date:
                cursor.execute(
                    """
                    SELECT * FROM matches
                    WHERE (h_title LIKE %s OR a_title LIKE %s)
                    AND datetime BETWEEN %s AND %s
                    ORDER BY datetime DESC
                    LIMIT %s OFFSET %s
                    """,
                    (f'%{search}%', f'%{search}%', f'{start_date} 00:00:00', f'{end_date} 23:59:59', limit, offset),
                )
           elif search:
                cursor.execute(
                    """
                    SELECT * FROM matches
                    WHERE h_title LIKE %s OR a_title LIKE %s
                    ORDER BY datetime DESC
                    LIMIT %s OFFSET %s
                    """,
                    (f'%{search}%', f'%{search}%', limit, offset),
                )
           elif start_date and end_date:
                cursor.execute(
                    """
                    SELECT * FROM matches
                    WHERE datetime BETWEEN %s AND %s
                    ORDER BY datetime DESC
                    LIMIT %s OFFSET %s
                    """,
                    (f'{start_date} 00:00:00', f'{end_date} 23:59:59', limit, offset),
                )
           else:
                cursor.execute(
                    """
                    SELECT * FROM matches
                    ORDER BY datetime DESC
                    LIMIT %s OFFSET %s
                    """,
                     (limit, offset),
                )
           matches = [dict(row) for row in cursor.fetchall()]
        return jsonify(matches if matches else [])
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
            connection.close()

@app.route('/matches', methods=['POST'])
def create_match():
    connection = None  # Initialize connection outside the try block
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            datetime_str = data['datetime']
            datetime_obj = datetime.fromisoformat(datetime_str)

            cursor.execute("""
                INSERT INTO matches (
                    match_id, isResult, datetime, h_id, h_title, h_short_title,
                    a_id, a_title, a_short_title, goals_h, goals_a,
                    xG_h, xG_a, forecast_w, forecast_d, forecast_l
                )
                VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
            """, (
                data['match_id'], data['isResult'], datetime_obj,
                data['h_id'], data['h_title'], data['h_short_title'],
                data['a_id'], data['a_title'], data['a_short_title'],
                data['goals_h'], data['goals_a'], data['xG_h'], data['xG_a'],
                data['forecast_w'], data['forecast_d'], data['forecast_l']
            ))
            connection.commit()
            cursor.execute("SELECT * from matches WHERE match_id = %s", (data['match_id'],))
            result = cursor.fetchone()
            match = dict(result) if result else None  # Check if result is not None
        return jsonify(match), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
            connection.close()

@app.route('/matches/<int:match_id>', methods=['PUT'])
def update_match(match_id):
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
           datetime_str = data['datetime']
           datetime_obj = datetime.fromisoformat(datetime_str)  # Convert the datetime
           cursor.execute("""
                UPDATE matches 
                SET isResult = %s, 
                    datetime = %s,
                    h_id = %s,
                    h_title = %s,
                    h_short_title = %s,
                    a_id = %s,
                    a_title = %s,
                    a_short_title = %s,
                    goals_h = %s,
                    goals_a = %s,
                    xG_h = %s,
                    xG_a = %s,
                    forecast_w = %s,
                    forecast_d = %s,
                    forecast_l = %s
                WHERE match_id = %s
            """, (
                data.get('isResult'),
                datetime_obj, # pass it after format
                data.get('h_id'),
                data.get('h_title'),
                data.get('h_short_title'),
                data.get('a_id'),
                data.get('a_title'),
                data.get('a_short_title'),
                data.get('goals_h'),
                data.get('goals_a'),
                data.get('xG_h'),
                data.get('xG_a'),
                data.get('forecast_w'),
                data.get('forecast_d'),
                data.get('forecast_l'),
                match_id
            ))
           connection.commit()
           cursor.execute("SELECT * from matches WHERE match_id = %s", (match_id,))
           result = cursor.fetchone()
           match = dict(result) if result else None
           if match is None:
             return jsonify({'error': 'Match not found'}), 404

        return jsonify(match)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
            connection.close()


@app.route('/matches/<int:match_id>', methods=['DELETE'])
def delete_match(match_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute('DELETE FROM matches WHERE match_id = %s', (match_id,))
            connection.commit()
            if cursor.rowcount == 0:
                 return jsonify({'error': 'Match not found'}), 404
        return jsonify({'message': f'Match {match_id} deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
       if connection:
            connection.close()    #Teams

@app.route('/teams', methods=['GET'])
def get_teams():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT team_name, team_id 
                FROM teams
                ORDER BY team_name
            """)
            teams = cursor.fetchall()
        return jsonify(teams)
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
                 SELECT
                    p.player_id as player_id,
                    p.player_name as name,
                    f.Position as position, 
                    f.Rating as rating,
                    p.games,
                    p.goals,
                    p.assists
                FROM players p
                LEFT JOIN fut23 f ON p.player_name = f.Name
                WHERE p.team_title = %s
                    AND p.year = (SELECT MAX(year) FROM players)
                ORDER BY f.Rating DESC
            """, (team_name,))
            squad = cursor.fetchall()

            #Filter the players that don't have a record in fut23
            filtered_squad = [player for player in squad if player['position'] is not None]
            return jsonify(filtered_squad)
    except Exception as e:
         return jsonify({'error': str(e)}), 500
    finally:
        if connection:
             connection.close()

            #Team table
@app.route('/addteam', methods=['POST'])#This works but returns an error 0?
def create_team():
    try:
        team_data = request.get_json()
        if not team_data.get('team_name') or not team_data.get('team_id'):
            return jsonify({'error': 'team_name and team_id are required'}), 400
        
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO teams (team_name, team_id)
                    VALUES (%s, %s)
                """, (team_data['team_name'], team_data['team_id']))
                connection.commit()
                cursor.execute("""
                    SELECT team_id, team_name FROM teams
                    WHERE team_name = %s AND team_id = %s
                """, (team_data['team_name'], team_data['team_id']))
                new_team = cursor.fetchone()
        
        return jsonify({'message': 'Team created', 'team': {'team_id': new_team[0], 'team_name': new_team[1]}}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/team/<team_name>', methods=['PUT'])
def update_team(team_name):
    try:
        team_data = request.get_json()
        if 'team_id' not in team_data:
            return jsonify({'error': 'team_id is required'}), 400

        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE teams 
                SET team_id = %s
                WHERE team_name = %s
            """, (team_data['team_id'], team_name))
            
            if cursor.rowcount == 0:
                return jsonify({'error': 'Team not found'}), 404
            
            # Fetch updated team data
            cursor.execute("""
                SELECT team_id, team_name 
                FROM teams 
                WHERE team_name = %s
            """, (team_name,))
            updated_team = cursor.fetchone()
            connection.commit()
            
        return jsonify({'message': 'Team updated', 'team': updated_team})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

@app.route('/team/<team_name>', methods=['DELETE'])
def delete_team(team_name):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM teams WHERE team_name = %s", (team_name,))
            if cursor.rowcount == 0:
                return jsonify({'error': 'Team not found'}), 404
            connection.commit()
        return jsonify({'message': f'Team {team_name} deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()
@app.route('/teams/standings', methods=['GET'])
def get_team_standings():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                 SELECT
                    RANK() OVER (ORDER BY SUM(CASE WHEN h_title = teams.team_name THEN goals_h ELSE goals_a END) DESC) AS ranking,
                     teams.team_name AS Team,
                     COUNT(matches.match_id) AS M,
                     SUM(CASE WHEN (h_title = teams.team_name AND goals_h > goals_a) OR (a_title= teams.team_name AND goals_a > goals_h) THEN 1 ELSE 0 END) AS W,
                     SUM(CASE WHEN goals_h = goals_a THEN 1 ELSE 0 END) AS D,
                     SUM(CASE WHEN (h_title = teams.team_name AND goals_h < goals_a) OR (a_title= teams.team_name AND goals_a < goals_h) THEN 1 ELSE 0 END) AS L,
                      SUM(CASE WHEN h_title = teams.team_name THEN goals_h ELSE goals_a END) AS G,
                      SUM(CASE WHEN h_title = teams.team_name THEN goals_a ELSE goals_h END) AS GA,
                     SUM(CASE
                        WHEN (h_title = teams.team_name AND goals_h > goals_a) OR (a_title= teams.team_name AND goals_a > goals_h) THEN 3
                        WHEN goals_h = goals_a THEN 1
                         ELSE 0
                     END) AS PTS
                    FROM teams
                     LEFT JOIN matches ON h_title = teams.team_name OR a_title = teams.team_name
                   GROUP BY teams.team_name
                   ORDER BY PTS DESC
            """)
            teams = cursor.fetchall()
        return jsonify(teams)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        if connection:
            connection.close()
#Authentication

# Hardcoded credentials
ADMIN_CREDENTIALS = {
    'email': 'ozten22@itu.edu.tr',
    'password': '123456',
    'name': 'Admin'
}

@app.route('/login', methods=['POST'])
def login():
    app.logger.debug("Login attempt")
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        if email == ADMIN_CREDENTIALS['email'] and password == ADMIN_CREDENTIALS['password']:
            session['user'] = {
                'email': ADMIN_CREDENTIALS['email'],
                'name': ADMIN_CREDENTIALS['name'],
                'authenticated': True
            }
            app.logger.debug(f"Session created: {session.get('user')}") 
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'email': ADMIN_CREDENTIALS['email'],
                    'name': ADMIN_CREDENTIALS['name']
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        app.logger.error(f"Error during login: {e}")
        return jsonify({'error': str(e)}), 500
@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/validate-session', methods=['GET'])
def validate_session():
    # Bypass authentication for now - return valid session
    return jsonify({
        'status': 'valid',
        'user': {
            'email': ADMIN_CREDENTIALS['email'],
            'name': ADMIN_CREDENTIALS['name']
        }
    })

    # Real implementation commented out for now
    """
    if session.get('user', {}).get('authenticated'):
        return jsonify({
            'status': 'valid', 
            'user': {
                'email': session['user']['email'],
                'name': session['user']['name']
            }
        })
    return jsonify({'status': 'invalid'}), 401
    """

if __name__ == '__main__':
    app.run(debug=True, port=5001, ssl_context=('cert.pem', 'key.pem'))#May need to add localhost:5001 and 127.0.0.1:5001 to the browser's exception list for the SSL certificate to work



