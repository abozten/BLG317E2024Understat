import pandas as pd
import pymysql
import numpy as np

# Database connection parameters
user = 'root'
password = 'blg317e2024'
host = 'localhost'
port = 3306
database = 'Understat2'

# Read the CSV files using pandas
fut23_df = pd.read_csv('Dataset/fut23_cleaned.csv', sep=',', skipinitialspace=True)

# Replace NaN values with None (which MySQL can handle)
fut23_df = fut23_df.where(pd.notnull(fut23_df), None)

# Print column names to verify
print("DataFrame columns:", list(fut23_df.columns))

# Establish a database connection
connection = pymysql.connect(
    host=host,
    user=user,
    password=password,
    database=database,
    port=port
)

cursor = connection.cursor()

# Drop the table if it exists to recreate it
drop_table_query = "DROP TABLE IF EXISTS fut23"      
cursor.execute(drop_table_query)

# Create fut23 table 
create_fut23_table_query = """
CREATE TABLE fut23 (
    `Name` VARCHAR(255),
    `player_id` INT,
    `Team` VARCHAR(255),
    `team_id` INT,
    `Country` VARCHAR(255),
    `League` VARCHAR(255),
    `Rating` INT,
    `Position` VARCHAR(10),
    `Other_Positions` VARCHAR(50),
    `Run_type` VARCHAR(50),
    `Price` VARCHAR(50),
    `Skill` INT,
    `Weak_foot` INT,
    `Attack_rate` VARCHAR(10),
    `Defense_rate` VARCHAR(10),
    `Pace` INT,
    `Shoot` INT,
    `Pass` INT,
    `Drible` INT,
    `Defense` INT,
    `Physical` INT,
    `Body_type` VARCHAR(50),
    `Height_cm` INT,
    `Weight` INT,
    `Popularity` INT,
    `Base_Stats` INT,
    `In_Game_Stats` INT,
    PRIMARY KEY (`player_id`),
    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    FOREIGN KEY (Team) REFERENCES teams(team_name)
)
"""
cursor.execute(create_fut23_table_query)

# Insert data into fut23 table
insert_fut23_query = """
INSERT INTO fut23 (
    `Name`, `player_id`, `Team`, `team_id`, `Country`, `League`, `Rating`, 
    `Position`, `Other_Positions`, `Run_type`, `Price`, `Skill`, 
    `Weak_foot`, `Attack_rate`, `Defense_rate`, `Pace`, `Shoot`, `Pass`, 
    `Drible`, `Defense`, `Physical`, `Body_type`, `Height_cm`, `Weight`, 
    `Popularity`, `Base_Stats`, `In_Game_Stats`
) VALUES (
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
)
"""

# Data preprocessing
fut23_df['player_id'] = fut23_df['player_id'].astype('Int64')
fut23_df['team_id'] = fut23_df['team_id'].astype('Int64')
fut23_df['Height_cm'] = fut23_df['Height_cm'].astype('Int64')
fut23_df['Weight'] = fut23_df['Weight'].astype('Int64')
fut23_df = fut23_df.where(pd.notnull(fut23_df), None)

# Insert rows
for _, row in fut23_df.iterrows():
    try:
        cursor.execute(insert_fut23_query, (
            row['Name'], row['player_id'], row['Team'], row['team_id'], 
            row['Country'], row['League'], row['Rating'], row['Position'], 
            row['Other_Positions'], row['Run_type'], row['Price'], row['Skill'], 
            row['Weak_foot'], row['Attack_rate'], row['Defense_rate'], 
            row['Pace'], row['Shoot'], row['Pass'], row['Drible'], 
            row['Defense'], row['Physical'], row['Body_type'], row['Height_cm'], 
            row['Weight'], row['Popularity'], row['Base_Stats'], row['In_Game_Stats']
        ))
    except Exception as e:
        print(f"Error inserting row: {row}")
        print(f"Error details: {e}")
        continue  # Log error but keep inserting other rows


# Commit the transaction and close the connection
connection.commit()
cursor.close()
connection.close()

print("Data insertion completed successfully!")