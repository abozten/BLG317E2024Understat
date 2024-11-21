import pandas as pd

def process_csv(file_path):
    df = pd.read_csv(
        file_path, 
        sep=',',
        skipinitialspace=True,
        dtype=str  
    ).apply(lambda x: x.str.strip() if isinstance(x, pd.Series) and x.dtype == "object" else x)
    
    df.columns = df.columns.str.strip()
    return df

try:
    processed_df = process_csv('season.csv')
    
    # Save 
    processed_df.to_csv('season_processed.csv', sep=',', index=False)
    
    print("\nDone")
    
except FileNotFoundError:
    print("Error: season.csv not found.")
except Exception as e:
    print(f"An error occurred: {e}")