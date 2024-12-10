import pandas as pd

# Load the CSV files
fut23 = pd.read_csv('fut23.csv')  # Replace with the correct path if needed
season = pd.read_csv('season.csv')  # Replace with the correct path if needed

# Extract unique teams from fut23 and season
fut23_teams = fut23[['team_id', 'Team']].drop_duplicates()
season_teams = season[['team_id', 'title']].drop_duplicates()

# Combine and remove duplicates
all_teams = pd.concat([fut23_teams.rename(columns={'Team': 'team_name'}), 
                       season_teams.rename(columns={'title': 'team_name'})]).drop_duplicates()

# Save to teams.csv
all_teams.to_csv('teams.csv', index=False)
