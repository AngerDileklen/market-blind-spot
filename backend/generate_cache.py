import os
from app import DEMO_TICKERS, run_full_analysis
from data import save_full_cache, fetch_stock_data, save_raw_cache

def main():
    print("Generating demo cache...")
    for ticker in DEMO_TICKERS:
        print(f"\nProcessing {ticker}...")
        try:
            # Save raw cache
            data = fetch_stock_data(ticker)
            if data and "error" not in data:
                save_raw_cache(ticker, data)
                
            # Run full analysis and save full cache
            result = run_full_analysis(ticker)
            if "error" in result:
                print(f"Error for {ticker}: {result['error']}")
            else:
                save_full_cache(ticker, result)
                print(f"Successfully cached {ticker}")
        except Exception as e:
            print(f"Failed for {ticker}: {str(e)}")
            
    print("\nDemo cache generation complete.")

if __name__ == "__main__":
    main()
