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
  #Read      
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
        @app.route('/players/<int:player_id>', methods=['GET'])
        def get_player(player_id):
            try:
                connection = get_db_connection()
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT * FROM players 
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
#Create
        @app.route('/players', methods=['POST']) 
        def create_player():
            try:
                data = request.get_json()
                connection = get_db_connection()#Not fully implemented
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO players (player_id, player_name, games, time, goals, assists, 
                                           position, team_title, year)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (data['player_id'], data['player_name'], data.get('games', 0),
                         data.get('time', 0), data.get('goals', 0), data.get('assists', 0),
                         data.get('position'), data.get('team_title'), data.get('year')))
                    connection.commit()
                return jsonify({'message': 'Player created successfully'}), 201
            except Exception as e:
                return jsonify({'error': str(e)}), 400
            finally:
                connection.close()
#Update
        @app.route('/players/<int:player_id>', methods=['PUT'])
        def update_player(player_id):
            try:
                data = request.get_json()
                connection = get_db_connection()
                with connection.cursor() as cursor:#Not fully implemented
                    cursor.execute("""
                        UPDATE players 
                        SET games = %s, time = %s, goals = %s, assists = %s
                        WHERE player_id = %s
                    """, (data.get('games'), data.get('time'), 
                         data.get('goals'), data.get('assists'), player_id))
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

@app.route('/matches', methods=['POST'])
def create_match():
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO matches (team1, team2, score1, score2, datetime)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *
            """, (data['team1'], data['team2'], data['score1'], data['score2'], data['datetime']))
            match = cursor.fetchone()
            connection.commit()
        return jsonify(match), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/matches/<int:id>', methods=['PUT'])
def update_match(id):
    try:
        data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE matches 
                SET team1 = %s, team2 = %s, score1 = %s, score2 = %s, datetime = %s
                WHERE id = %s
                RETURNING *
            """, (data['team1'], data['team2'], data['score1'], data['score2'], data['datetime'], id))
            match = cursor.fetchone()
            connection.commit()
        return jsonify(match)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        connection.close()

@app.route('/matches/<int:id>', methods=['DELETE'])
def delete_match(id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute('DELETE FROM matches WHERE id = %s RETURNING id', (id,))
            match = cursor.fetchone()
            connection.commit()
            if match is None:
                return jsonify({'error': 'Match not found'}), 404
        return jsonify({'message': f'Match {id} deleted successfully'})
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
            
            # Return just the players array directly
            return jsonify([dict(zip(columns, player)) for player in squad])
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection:
            connection.close()


from flask import request

# Create team
@app.route('/team', methods=['POST'])
def create_team():
    try:
        team_data = request.get_json()
        required_fields = ['team_name', 'country', 'league']
        
        if not all(field in team_data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO teams (team_name, country, league)
                VALUES (%s, %s, %s)
                RETURNING team_name
            """, (team_data['team_name'], team_data['country'], team_data['league']))
            new_team = cursor.fetchone()
            connection.commit()
            
        return jsonify({'message': 'Team created', 'team': new_team}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# Update team
@app.route('/team/<team_name>', methods=['PUT'])
def update_team(team_name):
    try:
        team_data = request.get_json()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE teams 
                SET country = %s, league = %s
                WHERE team_name = %s
                RETURNING team_name
            """, (team_data.get('country'), team_data.get('league'), team_name))
            updated_team = cursor.fetchone()
            connection.commit()
            
        if not updated_team:
            return jsonify({'error': 'Team not found'}), 404
            
        return jsonify({'message': 'Team updated', 'team': updated_team})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# Delete team
@app.route('/team/<team_name>', methods=['DELETE'])
def delete_team(team_name):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                DELETE FROM teams
                WHERE team_name = %s
                RETURNING team_name
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

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Run this API server on port 5001
