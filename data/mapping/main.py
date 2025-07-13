import sys
import io
import pandas as pd
import steps

def main():
    df = pd.read_csv('../BGG_Data_Set_original.csv')

    s1 = steps.generateStep1(df)
    s1.to_csv('../step_1.csv', index=False)

    s2 = steps.generateStep2(df)
    s2.to_csv('../step_2.csv', index=False)

    # s3 = steps.generateStep3(df)
    # s3.to_csv('../step_3.csv', index=False)


if __name__ == "__main__":
    main()
