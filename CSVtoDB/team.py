import pandas as pd
import pymysql

# Database connection parameters. Will fix to use .env file.
user = 'root'
password = 'blg317e2024'    
host = 'localhost'
port = 3306
database = 'Understat'

# Read the CSV files using pandas
fut23_df = pd.read_csv('Dataset/teams.csv', sep=',')

# Establish a database connection
connection = pymysql.connect(
    host=host,
    user=user,
    password=password,
    database=database,
    port=port
)

cursor = connection.cursor()


# Create teams table if it doesn't exist
create_fut23_table_query = """
CREATE TABLE IF NOT EXISTS teams (
    team_name VARCHAR(255) UNIQUE,
    team_id INT,
    PRIMARY KEY (team_id)
    )
"""
cursor.execute(create_fut23_table_query)


# Insert data into teams table
# Insert data into teams table
insert_query = """
INSERT INTO teams (team_name, team_id)
VALUES (%s, %s)
ON DUPLICATE KEY UPDATE
team_name = VALUES(team_name)
"""

for index, row in fut23_df.iterrows():
    cursor.execute(insert_query, (row['team_name'], row['team_id']))

# Commit the transaction and close the connection
connection.commit()
cursor.close()
connection.close()