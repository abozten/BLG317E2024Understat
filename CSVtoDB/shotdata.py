import pandas as pd
import pymysql #mDB-API 2.0 compatible driver

# Database connection parameters
user = 'root'
password = 'blg317e2024'    #DONT
host = 'localhost'
port = 3306
database = 'Understat'

# Read the CSV file using pandas
df = pd.read_csv('shot_data.csv', sep=';')

# Establish a database connection
connection = pymysql.connect(
    host=host,
    user=user,
    password=password,
    database=database,
    port=port
)

cursor = connection.cursor()

# Create table if it doesn't exist FIXME: Foreign keys missing
create_table_query = """
CREATE TABLE IF NOT EXISTS shots (
    shot_id INT PRIMARY KEY,
    minute INT,
    result VARCHAR(255),
    X FLOAT,
    Y FLOAT,
    xG FLOAT,
    player VARCHAR(255),
    h_a CHAR(1),
    player_id INT,
    situation VARCHAR(255),
    season INT,
    shotType VARCHAR(255),
    match_id INT,
    h_team VARCHAR(255),
    a_team VARCHAR(255),
    h_goals INT,
    a_goals INT,
    date DATETIME,
    player_assisted VARCHAR(255),
    lastAction VARCHAR(255),
    FOREIGN KEY (match_id) REFERENCES matches(match_id),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
)
"""
#Probabilities in dataset need fixing

cursor.execute(create_table_query)

insert_query = """
INSERT INTO shots (shot_id, minute, result, X, Y, xG, player, h_a, player_id, situation, season, shotType, match_id, h_team, a_team, h_goals, a_goals, date, player_assisted, lastAction)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

# Insert each row
for _, row in df.iterrows():
    cursor.execute(insert_query, tuple(row))

# Commit the transaction and close the connection
connection.commit()
cursor.close()
connection.close()
