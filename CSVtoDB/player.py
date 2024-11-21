import pandas as pd
import pymysql #mDB-API 2.0 compatible driver

# Database connection parameters. Will fix to use .env file.
user = 'root'
password = 'blg317e2024'    #DONT
host = 'localhost'
port = 3306
database = 'Understat'

# Read the CSV file using pandas
df = pd.read_csv('Dataset/player.csv', sep=',')

# Establish a database connection
connection = pymysql.connect(
    host=host,
    user=user,
    password=password,
    database=database,
    port=port
)

cursor = connection.cursor()
# Create table if it doesn't exist 
create_table_query = """
CREATE TABLE IF NOT EXISTS players (
    season_player_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT,
    player_name VARCHAR(255),
    games INT,
    time INT,
    goals INT,
    xG FLOAT,
    assists INT,
    xA FLOAT,
    shots INT,
    key_passes INT,
    yellow_cards INT,
    red_cards INT,
    position VARCHAR(255),
    team_title VARCHAR(255),
    npg INT,
    npxG FLOAT,
    xGChain FLOAT,
    xGBuildup FLOAT,
    year INT
)
"""

cursor.execute(create_table_query)

insert_query = """
INSERT INTO players (player_id, player_name, games, time, goals, xG, assists, xA, shots, key_passes, yellow_cards, red_cards, position, team_title, npg, npxG, xGChain, xGBuildup, year)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

# Insert each row except autoincremented season_player_id
for _, row in df.iterrows():
    cursor.execute(insert_query, (
        row['player_id'], row['player_name'], row['games'], row['time'], row['goals'], row['xG'], row['assists'], row['xA'], row['shots'], row['key_passes'], row['yellow_cards'], row['red_cards'], row['position'], row['team_title'], row['npg'], row['npxG'], row['xGChain'], row['xGBuildup'], row['year']
    ))

# Commit the transaction and close the connection
connection.commit()
cursor.close()
connection.close()
