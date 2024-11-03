import pandas as pd
import pymysql #mDB-API 2.0 compatible driver

# Database connection parameters
user = 'root'
password = 'blg317e2024'    #DONT
host = 'localhost'
port = 3306
database = 'Understat'

# Read the CSV file using pandas
df = pd.read_csv('match_info.csv', sep=';')

# Establish a database connection
connection = pymysql.connect(
    host=host,
    user=user,
    password=password,
    database=database,
    port=port
)

cursor = connection.cursor()


create_table_query = """
CREATE TABLE IF NOT EXISTS match_infos (
    fid INT PRIMARY KEY
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

    FOREIGN KEY (match_id) REFERENCES matches
)
"""
#Probabilities in dataset need fixing

cursor.execute(create_table_query)

insert_query = """
INSERT INTO match_infos (fid INT PRIMARY KEY
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
    h_ppda FLOAT,)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

# Insert each row
for _, row in df.iterrows():
    cursor.execute(insert_query, tuple(row))

# Commit the transaction and close the connection
connection.commit()
cursor.close()
connection.close()
