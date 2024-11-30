import pandas as pd
import pymysql

# Database connection parameters
user = 'root'
password = 'blg317e2024'  # Use environment variables for security
host = 'localhost'
port = 3306
database = 'Understat'

# Read the CSV file
df = pd.read_csv('Dataset/shot_data.csv', sep=',')

# Handle NaN values by replacing them with None
df = df.where(pd.notnull(df), None)

# Convert data types to match MySQL schema
df['shot_id'] = df['shot_id'].astype('Int64')  # Nullable integer
df['minute'] = df['minute'].astype('Int64')
df['h_goals'] = df['h_goals'].astype('Int64')
df['a_goals'] = df['a_goals'].astype('Int64')
df['date'] = pd.to_datetime(df['date'])  # Ensure date format

# Establish a database connection
connection = pymysql.connect(
    host=host,
    user=user,
    password=password,
    database=database,
    port=port
)

cursor = connection.cursor()

# Create the `shots` table if it does not exist
create_shots_table_query = """
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
cursor.execute(create_shots_table_query)

# Create a temporary staging table
staging_table_query = """
CREATE TEMPORARY TABLE staging_shots (
    shot_id INT,
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
    lastAction VARCHAR(255)
)
"""
cursor.execute(staging_table_query)

# Insert DataFrame into staging table
staging_insert_query = """
INSERT INTO staging_shots (
    shot_id, minute, result, X, Y, xG, player, h_a, player_id, situation,
    season, shotType, match_id, h_team, a_team, h_goals, a_goals, date,
    player_assisted, lastAction
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""
data_to_insert = [tuple(row) for row in df.itertuples(index=False)]
cursor.executemany(staging_insert_query, data_to_insert)

# Insert valid rows from staging table to shots table
insert_valid_rows_query = """
INSERT INTO shots (
    shot_id, minute, result, X, Y, xG, player, h_a, player_id, situation,
    season, shotType, match_id, h_team, a_team, h_goals, a_goals, date,
    player_assisted, lastAction
)
SELECT 
    shot_id, minute, result, X, Y, xG, player, h_a, player_id, situation,
    season, shotType, match_id, h_team, a_team, h_goals, a_goals, date,
    player_assisted, lastAction
FROM staging_shots
WHERE 
    match_id IN (SELECT match_id FROM matches)
    AND player_id IN (SELECT player_id FROM players);
"""
cursor.execute(insert_valid_rows_query)

# Commit and close
connection.commit()
cursor.close()
connection.close()
