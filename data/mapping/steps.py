import pandas as pd

def generateStep1(df):
  s1 = df.copy(True)

  # filter to be less than 1800
  s1 = s1[s1['Year Published'] < 1800]

  # filter out 0 (this is data that is incomplete for year)
  s1 = s1[s1['Year Published'] != 0]

  # bin to be grouped
  s1 = s1.sort_values('Year Published')

  # s1['bin'] = pd.cut(s1['Year Pubished'], bins=[])#, labels=[])

  return s1[[
    'Name',
    'Year Published',
    'Users Rated', # treat as modern players played
    'Owned Users',
    'Complexity Average',
    'Mechanics'
    ]
  ]

def generateStep2(df):
  s2 = df.copy(True)
  # modify here

  # filter out 0 (this is data that is incomplete for year)
  s2 = s2[s2['Year Published'] < 2000]
  s2 = s2[s2['Year Published'] != 0]

  # bin to be grouped
  s2 = s2.sort_values('Year Published')

  # s2['bin'] = pd.cut(s2['Year Pubished'], bins=[])#, labels=[])

  return s2[[
    'Name',
    'Year Published',
    'Users Rated', # treat as modern players played
    'Owned Users',
    'Complexity Average',
    'Mechanics'
    ]
  ]

def generateStep3(df):
  print("bye")

  s3 = df.copy(True)

  # modify here
  s3 = s3[s3['Year Published'] < 2021]

  return s3
