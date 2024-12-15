from flask import Flask, jsonify, request, session
import pymysql
from pymysql.cursors import DictCursor
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from flask_session import Session  # Add flask-session for session management

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Replace with your frontend URL
# Configure session
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = 'supersecretkey'
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True if using HTTPS
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
#EMRE


#ALİ



#ARDA
    #Players
  #Read       
@app.route('/players', methods=['GET'])
def get_players():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT season_player_id, player_id, player_name, games, time, goals, xG, 
                       assists, xA, shots, key_passes, yellow_cards, red_cards, position, 
                       team_title, npg, npxG, xGChain, xGBuildup, year 
                FROM players
                LIMIT 20
            """)
            players = cursor.fetchall()
        return jsonify(players)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/players/<int:player_id>', methods=['GET'])
def get_player(player_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT season_player_id, player_id, player_name, games, time, goals, xG, 
                       assists, xA, shots, key_passes, yellow_cards, red_cards, position, 
                       team_title, npg, npxG, xGChain, xGBuildup, year 
                FROM players 
                WHERE player_id = %s
            """, (player_id,))
            player = cursor.fetchone()
            if player is None:
                return jsonify({'error': 'Player not found'}), 404
            return jsonify(player)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/players', methods=['POST'])
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

@app.route('/players/<int:player_id>', methods=['PUT'])
def update_player(player_id):
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE players 
                SET games = %s, time = %s, goals = %s, xG = %s, assists = %s, xA = %s,
                    shots = %s, key_passes = %s, yellow_cards = %s, red_cards = %s,
                    npg = %s, npxG = %s, xGChain = %s, xGBuildup = %s
                WHERE player_id = %s
            """, (data.get('games'), data.get('time'), data.get('goals'), 
                 data.get('xG'), data.get('assists'), data.get('xA'),
                 data.get('shots'), data.get('key_passes'), data.get('yellow_cards'),
                 data.get('red_cards'), data.get('npg'), data.get('npxG'),
                 data.get('xGChain'), data.get('xGBuildup'), player_id))
            connection.commit()
            if cursor.rowcount == 0:
                return jsonify({'error': 'Player not found'}), 404
        return jsonify({'message': 'Player updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/players/<int:player_id>', methods=['DELETE'])
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

@app.route('/matches', methods=['POST'])
def create_match():
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO matches (
                    match_id, isResult, datetime, h_id, h_title, h_short_title,
                    a_id, a_title, a_short_title, goals_h, goals_a,
                    xG_h, xG_a, forecast_w, forecast_d, forecast_l
                )
                VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                RETURNING *
            """, (
                data['match_id'], data['isResult'], data['datetime'],
                data['h_id'], data['h_title'], data['h_short_title'],
                data['a_id'], data['a_title'], data['a_short_title'],
                data['goals_h'], data['goals_a'], data['xG_h'], data['xG_a'],
                data['forecast_w'], data['forecast_d'], data['forecast_l']
            ))
            match = cursor.fetchone()
            connection.commit()
        return jsonify(match), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/matches/<int:match_id>', methods=['PUT'])
def update_match(match_id):
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
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
                RETURNING *
            """, (
                data.get('isResult'),
                data.get('datetime'),
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
            match = cursor.fetchone()
            if match is None:
                return jsonify({'error': 'Match not found'}), 404
            connection.commit()
        return jsonify(match)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/matches/<int:match_id>', methods=['DELETE'])
def delete_match(match_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute('DELETE FROM matches WHERE match_id = %s RETURNING match_id', (match_id,))
            match = cursor.fetchone()
            connection.commit()
            if match is None:
                return jsonify({'error': 'Match not found'}), 404
        return jsonify({'message': f'Match {match_id} deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()
    #Teams

@app.route('/teams', methods=['GET'])

def get_teams():

    try:

        connection = get_db_connection()

        with connection.cursor() as cursor:

            cursor.execute("""

                SELECT DISTINCT h_title as team_name, h_id as team_id

                FROM matches

                UNION

                SELECT DISTINCT a_title as team_name, a_id as team_id

                FROM matches

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
            return jsonify([dict(zip(columns, player)) for player in squad])
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection:
            connection.close()

@app.route('/team', methods=['POST'])
def create_team():
    try:
        team_data = request.get_json()
        if not team_data.get('team_name') or not team_data.get('team_id'):
            return jsonify({'error': 'team_name and team_id are required'}), 400
            
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO teams (team_name, team_id)
                VALUES (%s, %s)
                RETURNING team_id, team_name
            """, (team_data['team_name'], team_data['team_id']))
            new_team = cursor.fetchone()
            connection.commit()
            
        return jsonify({'message': 'Team created', 'team': new_team}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

@app.route('/team/<team_name>', methods=['PUT'])#TODO : Add error handling if unique columns are not unique
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
                RETURNING team_id, team_name
            """, (team_data['team_id'], team_name))
            updated_team = cursor.fetchone()
            connection.commit()
            
        if not updated_team:
            return jsonify({'error': 'Team not found'}), 404
            
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
            cursor.execute("""
                DELETE FROM teams
                WHERE team_name = %s
                RETURNING team_id, team_name
            """, (team_name,))
            deleted_team = cursor.fetchone()
            connection.commit()
            
        if not deleted_team:
            return jsonify({'error': 'Team not found'}), 404
            
        return jsonify({'message': 'Team deleted', 'team': deleted_team})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()



@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # TODO: Implement a real login mechanism
        if email == 'ozten22@itu.edu.tr' and password == '123456':
            session['user'] = email
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'email': email,
                    'name': 'Test User'
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/validate-session', methods=['GET'])
def validate_session():
    if 'user' in session:
        return jsonify({'status': 'valid'})
    else:
                return jsonify({'status': 'valid'})  #Needs fixing
#return jsonify({'status': 'invalid'}), 401
    
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Run this API server on port 5001



