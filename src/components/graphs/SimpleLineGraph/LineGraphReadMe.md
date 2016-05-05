

###Data format:
```
[
  { // this is one line
    key:'Oranges'
    color: '#00f' // Optional
    values:[
      {
        key: 0 // x value name
        values: {x: 0, y: 27}
      },
      ...
    ]
  },
  ...
]
```

###Usage
```
<LineGraph data={simpleLineChartData} uniq='myGraph2' />
```

data - pass data to graph
uniq - string to make dom Id unique


 