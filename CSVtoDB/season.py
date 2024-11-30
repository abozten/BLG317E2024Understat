import pandas as pd
import pymysql

# Database connection parameters. Will fix to use .env file.
user = 'root'
password = 'blg317e2024'    
host = 'localhost'
port = 3306
database = 'Understat'

# Read the CSV files using pandas
season_df = pd.read_csv('Dataset/season.csv', sep=',')

# Establish a database connection
connection = pymysql.connect(
    host=host,
    user=user,
    password=password,
    database=database,
    port=port
)

cursor = connection.cursor()

# Create season table if it doesn't exist
create_season_table_query = """
CREATE TABLE IF NOT EXISTS season (
    seasonentryid INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT,
    year INT,
    h_a CHAR(1),
    xG FLOAT,
    xGA FLOAT,
    npxG FLOAT,
    npxGA FLOAT,
    deep INT,
    deep_allowed INT,
    scored INT,
    missed INT,
    xpts FLOAT,
    result VARCHAR(255),
    date DATETIME,
    wins INT,
    draws INT,
    loses INT,
    pts INT,
    npxGD FLOAT,
    ppda_att INT,
    ppda_def INT,
    ppda_allowed_att INT,
    ppda_allowed_def INT,
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
)
"""
cursor.execute(create_season_table_query)
# Insert data into season table
insert_season_query = """
INSERT INTO season (team_id, year, h_a, xG, xGA, npxG, npxGA, deep, deep_allowed, scored, missed, xpts, result, date, wins, draws, loses, pts, npxGD, ppda_att, ppda_def, ppda_allowed_att, ppda_allowed_def)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""
for _, row in season_df.iterrows():
    cursor.execute(insert_season_query, (
        row['team_id'], row['year'], row['h_a'], row['xG'], row['xGA'], row['npxG'], row['npxGA'], row['deep'], row['deep_allowed'], row['scored'], row['missed'], row['xpts'], row['result'], row['date'], row['wins'], row['draws'], row['loses'], row['pts'], row['npxGD'], row['ppda.att'], row['ppda.def'], row['ppda_allowed.att'], row['ppda_allowed.def']
    ))


# Commit the transaction and close the connection
connection.commit()
cursor.close()
connection.close()