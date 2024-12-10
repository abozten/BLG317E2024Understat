import pandas as pd

# Load the CSV files
fut23 = pd.read_csv('fut23.csv')  # Replace with the correct path if needed
season = pd.read_csv('season.csv')  # Replace with the correct path if needed

# Step 1: Create a mapping of team_id to team title (ensure unique pairs)
team_mapping = season[['team_id', 'title']].drop_duplicates()

# Step 2: Update the Team column in fut23.csv
fut23_updated = fut23.merge(team_mapping, on='team_id', how='left')
fut23_updated['Team'] = fut23_updated['title']
fut23_updated = fut23_updated.drop(columns=['title'])

# Step 3: Filter season.csv to keep only relevant team_ids
season_filtered = season[season['team_id'].isin(fut23['team_id'])]

# Step 4: Save the updated files
fut23_updated.to_csv('fut23_updated.csv', index=False)  # Updated fut23 file
season_filtered.to_csv('season_filtered.csv', index=False)  # Filtered season file
