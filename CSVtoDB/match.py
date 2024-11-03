import pandas as pd
import pymysql #mDB-API 2.0 compatible driver

# Database connection parameters
user = 'root'
password = 'blg317e2024'    #DONT
host = 'localhost'
port = 3306
database = 'Understat'

# Read the CSV file using pandas
df = pd.read_csv('MATCH_DATA_processed.csv', sep=';')

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
    forecast_l FLOAT
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
