import pandas as pd

def process_csv(file_path):
    df = pd.read_csv(
        file_path, 
        sep=';',
        skipinitialspace=True,
        dtype=str  
    ).apply(lambda x: x.str.strip() if isinstance(x, pd.Series) and x.dtype == "object" else x)
    
    df.columns = df.columns.str.strip()
    
    df = df.drop('autoincrement', axis=1)#Not needed
    
    prob_columns = ['xG_h', 'xG_a', 'forecast_w', 'forecast_d', 'forecast_l']
    
    def normalize_probability(value):#fixing dataset probabilities
        if pd.isna(value):
            return value
        value = float(str(value).strip())
        if value > 1:
            return float(f"0.{str(value).replace('.', '')}")
        return value
    
    for col in prob_columns:
        df[col] = df[col].apply(normalize_probability)
    
    numeric_columns = ['match_id', 'isResult', 'h_id', 'a_id', 'goals_h', 'goals_a']
    for col in numeric_columns:
        df[col] = pd.to_numeric(df[col], errors='ignore')
    
    return df


try:
    processed_df = process_csv('MATCH_DATA.csv')
    
    # Save 
    processed_df.to_csv('MATCH_DATA_processed.csv', sep=';', index=False)
    
    print("\nDone'")
    
except FileNotFoundError:
    print("Error: MATCH_DATA.csv not found.")
except Exception as e:
    print(f"An error occurred: {str(e)}")