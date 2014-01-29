GameOfLife
==========

Just another Game of Life clone

This project is brought to you by:
> Math, some afternoons you should probably have studied it instead of coding

##Usage
Just open http://erikbjare.github.io/GameOfLife/ in your favorite browser, preferably one with a blazing fast JavaScript engine like Chrome's V8 or Firefox's SpiderMonkey.

###Parameters
`spawnrate`: Specifies the probability of a cell being alive upon initialization (decimal in range 0.0-1.0)   
`gridSize`: Number of cells horizontally and vertically   
`cellSize`: Height and width of each cell in pixels   
`updateInterval`: How many milliseconds to wait before the grid will attempt to update   
`undead`: A special mode where dead cells act just like alive cells (i.e., can just come alive without proper reproduction requirement of 3 exactly neighbors)   

###Example parameters
 - [I'M CHARGING MY...](http://erikbjare.github.io/GameOfLife/index.html?spawnrate=1&gridSize=90&cellSize=8&undead=1&updateInterval=100)
 - [Zooming out from the sun](http://erikbjare.github.io/GameOfLife/index.html?spawnrate=1&gridSize=100&cellSize=5&updateInterval=100)
 - [Speedfreak](http://erikbjare.github.io/GameOfLife/index.html?spawnrate=0.5&gridSize=50&cellSize=10&updateInterval=25)