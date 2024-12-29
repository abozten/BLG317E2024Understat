import pandas as pd
import pymysql #mDB-API 2.0 compatible driver

# Database connection parameters.Use .env file to store these parameters.
user = 'root'
password = 'blg317e2024'    
host = 'localhost'
port = 3306
database = 'Understat2'

# Read the CSV file using pandas
df = pd.read_csv('Dataset/match_data_cleaned.csv', sep=',')

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
CREATE TABLE IF NOT EXISTS matches (
    match_id INT PRIMARY KEY,
    isResult BOOLEAN,
    datetime DATETIME,
    h_id INT,
    h_title VARCHAR(255),
    h_short_title VARCHAR(255),
    a_id INT,
    a_title VARCHAR(255),
    a_short_title VARCHAR(255),
    goals_h INT,
    goals_a INT,
    xG_h FLOAT,
    xG_a FLOAT,
    forecast_w FLOAT,
    forecast_d FLOAT,
    forecast_l FLOAT,
    FOREIGN KEY (h_id) REFERENCES teams(team_id),
    FOREIGN KEY (a_id) REFERENCES teams(team_id),
    FOREIGN KEY (h_title) REFERENCES teams(team_name),
    FOREIGN KEY (a_title) REFERENCES teams(team_name)
    )
"""
#Probabilities in dataset need fixing

cursor.execute(create_table_query)

insert_query = """
INSERT INTO matches (match_id, isResult, datetime, h_id, h_title, h_short_title, a_id, a_title, a_short_title, goals_h, goals_a, xG_h, xG_a, forecast_w, forecast_d, forecast_l)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

# Insert each row
for _, row in df.iterrows():
    cursor.execute(insert_query, tuple(row))

# Commit the transaction and close the connection
connection.commit()
cursor.close()
connection.close()
