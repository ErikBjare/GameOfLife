var canvas=document.getElementById("canvas");
var ctx=canvas.getContext("2d");

// Default vars
var spawnrate = 0.1
var cellSize = 8;
var gridSize = 300;
var updateInterval = 200;
var running = true;
var paused = false;

var grid;
var rows; var cols;
var offsetWidth;
var offsetHeight;
var diffQueue = [];
var mousedown = false;

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

	generateGrid(true);
    resizeCanvas();

	// Pauses execution while not focused and resumes when focus returns
	$(window).blur(function(){ running = false });
	$(window).focus(function(){ running = true });

    // Keymappings
    var canvasSel = $("#canvas")
    canvasSel[0].oncontextmenu = function() {return false;}
    canvasSel.mousedown(function(e) {mousedown = e; canvasOnMouse(e)})
    canvasSel.mouseup(function(e) {mousedown = false});
    canvasSel.mousemove(canvasOnMouse);
    canvasSel.bind('mousewheel', function(e){
        if(e.originalEvent.wheelDelta /120 > 0) cellSize += 1
        else if(cellSize > 2) cellSize -= 1
        resizeCanvas();
    });
    $(window).keydown(function(e){ if(e.keyCode == 32) togglePause() });

    window.addEventListener('resize', resizeCanvas, false);
}

function load(newGrid) {
    gridSize = newGrid.length
    grid = newGrid
    draw()
}

function save() {
    var output = "["
    for (i in grid) {
        output += "["
        for (j in grid) {
            output += grid[i][j] ? "1,":"0,";
        }
        output += "],"
    }
    output += "]"
    console.log(output)
}


function generateGrid(noDraw) {
	grid = new Array(gridSize);
	for (var i=0; i<gridSize; i++) {
		grid[i] = new Array(gridSize);
		for (var j=0; j<gridSize; j++) {
			grid[i][j] = Math.round(Math.random()-(spawnrate-0.5)) <= 0;
		}
	}
    if (!noDraw) draw();
}

function clearGrid(noDraw) {
    grid = new Array(gridSize);

    for (var i=0; i<gridSize; i++) {
        grid[i] = new Array(gridSize);
        for (var j=0; j<gridSize; j++) {
            grid[i][j] = false;
        }
    }
    if (!noDraw) draw();
}

function main() {
	setInterval(nextCycle, updateInterval);
}

function togglePause() {
    text = $("#togglePauseText")
    icon = $("#togglePauseIcon")
	if (!paused) {
		paused = true
		text.text("Play")
        icon.removeClass("glyphicon-pause")
        icon.addClass("glyphicon-play")
	} else {
		paused = false
		text.text("Pause")
        icon.removeClass("glyphicon-play")
        icon.addClass("glyphicon-pause")
	}
}

function nextCycle(timestamp) {
	if (running && !paused) {
		rule_standard(grid)
		window.requestAnimationFrame(drawDiff)
	}
}

function neighbors(row, col) {
	return grid[row-1][col-1] + grid[row-1][col] + grid[row-1][col+1] +
		   grid[row][col-1]   +                  + grid[row][col+1]   +
		   grid[row+1][col-1] + grid[row+1][col] + grid[row+1][col+1]
}

function rule_standard(grid) {
	var newState
	for (var i=1; i<gridSize-1; i++) {
		for (var j=1; j<gridSize-1; j++) {
            newState = null
			n = neighbors(i, j)
			if(grid[i][j]) {
                if(n < 2 || n > 3) newState = false;
            } else if (n == 3) newState = true;

            if (newState != null) diffQueue.push([i, j, newState]);
		}
	}
}

function rule_undead(grid) {
    var newState
	for (var i=1; i<gridSize-1; i++) {
		for (var j=1; j<gridSize-1; j++) {
            newState = null
			n = neighbors(i, j)
			if (n < 2) newState = false;
			else if (n <= 3) newState = true;
			else if (n > 3) newState = false;

            if (newState != null) diffQueue.push([i, j, newState]);
		}
	}
}

function draw() {
	clearCanvas()
	for (var row in grid) {
		for (var col in grid[row]) {
			drawCell(row, col, grid[row][col])
		}
	}
}

function drawDiff() {
	while(diffQueue.length > 0) {
		change = diffQueue.shift()
        grid[change[0]][ change[1]] = change[2]
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
	rows = grid.length;
	cols = grid[0].length;

	calculateOffset();

	oldFill = ctx.fillStyle;
	ctx.fillStyle = "#222222";
	ctx.fillRect(offsetWidth, offsetHeight,
		         gridSize*cellSize, gridSize*cellSize);
	ctx.fillStyle = oldFill;

	ctx.strokeStyle = "#FFFFFF";
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

function canvasOnMouse(e) {
    if(!mousedown) {
        return
    }
    var pos = getCursorPosition(e);
    var state = (e.button == 0)

    cellCol = Math.floor((pos[0] - offsetWidth)/cellSize)
    cellRow = Math.floor((pos[1] - offsetHeight)/cellSize)
    if (0 <= cellCol && cellCol < gridSize &&
        0 <= cellRow && cellRow < gridSize ) {
        if (grid[cellCol][cellRow] != state) {
            diffQueue.push([cellCol, cellRow, !grid[cellCol][cellRow]])
            drawDiff()
        }
    }
}

function getCursorPosition(e) {
    var x; var y;
    if (e.pageX || e.pageY) {
        x = e.pageX;
        y = e.pageY;
    }
    else {
        x = e.clientX;
        y = e.clientY;
    }
    return [x, y]
}

init()
main()
