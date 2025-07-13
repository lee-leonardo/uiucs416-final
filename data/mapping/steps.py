import pandas as pd

def generateStep1(df):
  s1 = df.copy(True)

  # filter to be less than 1800
  s1 = s1[s1['Year Published'] < 1800]

  # filter out 0 (this is data that is incomplete for year)
  s1 = s1[s1['Year Published'] != 0]

  # bin to be grouped
  s1 = s1.sort_values('Year Published')

  bins = pd.IntervalIndex.from_breaks([-3500, 0, 500, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800], closed="left")
  s1['Bin'] = pd.cut(s1['Year Published'], bins=bins)

  return s1[[
    'Name',
    'Bin',
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
  # pd.IntervalIndex.from_breaks([-3500, 0, 500, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800])

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
  s3 = s3[s3['Year Published'] != 0] # still omit for this statistical graph

  s3 = s3.sort_values('Year Published')

  # pd.interval_range
  # pd.union(pd.interval_range(1800, 1900, interval=10))

  return s3


