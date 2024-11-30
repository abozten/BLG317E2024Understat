import pandas as pd
import pymysql  # DB-API 2.0 compatible driver

# Database connection parameters
user = 'root'
password = 'blg317e2024'    
host = 'localhost'
port = 3306
database = 'Understat'

# Read the CSV file using pandas
df = pd.read_csv('Dataset/match_info.csv', sep=',')

# Handle NaN values by replacing them with None
df = df.where(pd.notnull(df), None)

# Convert data types to match MySQL schema
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

# Create the `match_infos` table with proper syntax
create_table_query = """
CREATE TABLE IF NOT EXISTS match_infos (
    fid INT PRIMARY KEY,
    match_id INT,
    h INT,
    a INT,
    date DATETIME,
    league_id INT,
    season INT,
    h_goals INT,
    a_goals INT,
    team_h VARCHAR(255),
    team_a VARCHAR(255),
    h_xg FLOAT,
    a_xg FLOAT,
    h_w FLOAT,
    h_d FLOAT,
    h_l FLOAT,
    league VARCHAR(255),
    h_shot INT,
    a_shot INT,
    h_shotOnTarget INT,
    a_shotOnTarget INT,
    h_deep INT,
    a_deep INT,
    a_ppda FLOAT,
    h_ppda FLOAT,
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
)
"""
cursor.execute(create_table_query)

# Adjust the `INSERT` statement
insert_query = """
INSERT INTO match_infos (
    fid, match_id, h, a, date, league_id, season, h_goals, a_goals, 
    team_h, team_a, h_xg, a_xg, h_w, h_d, h_l, league, 
    h_shot, a_shot, h_shotOnTarget, a_shotOnTarget, h_deep, a_deep, 
    a_ppda, h_ppda
) VALUES (
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
)
"""

# Iterate over the rows of the DataFrame and insert them into the database
for _, row in df.iterrows():
    # Prepare the tuple of values for each row
    data = (
        row['fid'], row['match_id'], row['h'], row['a'], row['date'], 
        row['league_id'], row['season'], row['h_goals'], row['a_goals'], 
        row['team_h'], row['team_a'], row['h_xg'], row['a_xg'], 
        row['h_w'], row['h_d'], row['h_l'], row['league'], 
        row['h_shot'], row['a_shot'], row['h_shotOnTarget'], row['a_shotOnTarget'], 
        row['h_deep'], row['a_deep'], row['a_ppda'], row['h_ppda']
    )
    try:
        cursor.execute(insert_query, data)
    except pymysql.IntegrityError as e:
        print(f"Failed to insert row {data}: {e}")

# Commit the transaction and close the connection
connection.commit()
cursor.close()
connection.close()
