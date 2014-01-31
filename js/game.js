var canvas=document.getElementById("canvas");
var ctx=canvas.getContext("2d");

// Default vars
var spawnrate = 0.1
var cellSize = 8;
var gridSize = 300;
var updateInterval = 200;
var running = true;

var grid;
var rows; var cols;
var offsetWidth;
var offsetHeight;
var diffQueue = new Array();

function init() {
	param_spawnrate = $.getUrlVar("spawnrate")
	if(param_spawnrate) spawnrate = parseFloat(param_spawnrate);

	param_cellSize = $.getUrlVar("cellSize")
	if(param_cellSize) cellSize = parseFloat(param_cellSize);

	param_gridSize = $.getUrlVar("gridSize")
	if(param_gridSize) gridSize = parseFloat(param_gridSize);

	param_updateInterval = $.getUrlVar("updateInterval")
	if(param_updateInterval) updateInterval = parseFloat(param_updateInterval);

	param_undead = $.getUrlVar("undead")
	if(param_undead) rule_standard = rule_undead;

	generateGrid();

	// Pauses execution while not focused and resumes when focus returns
	$(window).blur(function(){ running = false });
	$(window).focus(function(){ running = true });
}

function generateGrid() {
	grid = new Array(gridSize);

	for (var i=0; i<gridSize; i++) {
		grid[i] = new Array(gridSize);
		for (var j=0; j<gridSize; j++) {
			grid[i][j] = Math.round(Math.random()-(spawnrate-0.5)) <= 0 ? true:false;
		}
	}
}

function main() {
	window.addEventListener('resize', resizeCanvas, false);

    resizeCanvas()

	setInterval(nextCycle, updateInterval);
}

function togglePause() {
	if (running) {
		running = false
		$("#togglePauseText").text("Play")
	} else {
		running = true
		$("#togglePauseText").text("Pause")
	}
	$("#togglePauseIcon").toggleClass("glyphicon-pause glyphicon-play")
}

function nextCycle(timestamp) {
	if (running) {
		grid = rule_standard(grid)
		window.requestAnimationFrame(drawDiff)
	}
}

function neighbors(row, col) {
	return grid[row-1][col-1] + grid[row-1][col] + grid[row-1][col+1] +
		   grid[row][col-1]   +                  + grid[row][col+1]   +
		   grid[row+1][col-1] + grid[row+1][col] + grid[row+1][col+1]
}

function rule_standard(grid) {
	newGrid = clone(grid)
	for (var i=1; i<gridSize-1; i++) {
		for (var j=1; j<gridSize-1; j++) {
			n = neighbors(i, j)
			if(newGrid[i][j]) {
				if (n < 2 || n > 3) {
					newGrid[i][j] = false;	
					diffQueue.push([i, j, false])
				}
			} else {
				if (n == 3) {
					newGrid[i][j] = true;
					diffQueue.push([i, j, true]);
				}
			}
		}
	}
	return newGrid
}

function rule_undead(grid) {
	// Does not care if a cell is alive or not
	newGrid = clone(grid)
	for (var i=1; i<gridSize-1; i++) {
		for (var j=1; j<gridSize-1; j++) {
			n = neighbors(i, j)
			if (n < 2) newGrid[i][j] = false;
			else if (n <= 3) newGrid[i][j] = true;
			else if (n > 3) newGrid[i][j] = false;
		}
	}
	return newGrid
}

function output(grid) {
	o = $("#output");
	o.html("");
	for (var row in grid) {
		o.append("[");
		for (var col in grid[row]) {
			if(grid[row][col] == false) {
				o.append("O");
			} else {
				o.append("X");
			}
		}
		o.append("]<br>");
	}
}

function draw() {
	clearCanvas()
	ctx.fillStyle="#FFFFFF";
	ctx.strokeStyle="#FFFFFF"

	for (var row in grid) {
		for (var col in grid[row]) {
			drawCell(row, col, grid[row][col])
		}
	}
}

function drawDiff() {
	ctx.fillStyle="#FFFFFF";
	ctx.strokeStyle="#FFFFFF"

	while(diffQueue.length > 0) {
		change = diffQueue.shift()
		drawCell(change[0], change[1], change[2])
	}
}

function drawCell(row, col, state) {
	if(state) {
		ctx.fillStyle="#FFFFFF";
	} else {
		ctx.fillStyle="#000000";
	}
	ctx.fillRect(offsetWidth+row*cellSize+1,  offsetHeight+col*cellSize+1,
	             cellSize-1,    cellSize-1)	
}

function clearCanvas() {
	rows = grid.length
	cols = grid[0].length

	calculateOffset();

	oldFill = ctx.fillStyle;
	ctx.fillStyle = "#222222";
	ctx.fillRect(offsetWidth, offsetHeight,
		         gridSize*cellSize, gridSize*cellSize);
	ctx.fillStyle = oldFill;

	ctx.strokeStyle="#FFFFFF"
	ctx.rect(offsetWidth, offsetHeight,
		     gridSize*cellSize+1, gridSize*cellSize+1);
	ctx.stroke();
}

function resizeCanvas() {
	//canvas.width = $("#canvas").width();
	//canvas.height = $("#canvas").height();
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;

	draw();
}

function calculateOffset() {
	//Uncomment +0.5 for effect on previously occupied space (Does not survive resize/redraw)
	offsetWidth = ~~((canvas.width-cellSize*cols)/2) //+0.5
	offsetHeight = ~~((canvas.height-cellSize*rows)/2) //+0.5

}

init()
main()