/**
 * Created by Vince Oveson on 1/19/14.
 *
 * This program is a stripped-down version of the classic
 * Microsoft game Minesweeper.
 */


// These are global variables used throughout the program
var rows = 10;
var cols = 10;
var numbers = new Array();
var range = new Array();
var bombs = new Array();
var flagged = new Array();
var adjMatrix = new Array();
var numBombs = 10;
var unMarked = 10;
var coveredCount = 100;
var dead = false;
var inGame = false;
var seconds = 0;
var counter = setInterval(timer, 1000);

/**
 * Startup Function -- sets up the game and ties the buttons
 * to the appropriate functions.
 */
$(function()
{
    for (var i = 0; i < (rows * cols); i++)
        range[i] = i;
    bombs = generateBombs(range, numBombs);
    buildGameboard();
    buildAdjacencyMatrix();
    buildNumArray();
    $('input[class="cBomb"]').click(bombClicked);
    $('input[class="cSafe"]').click(safeClicked);
    $('input[id="Reset"]').click(resetClicked);
});

/**
 * Creates an array with the locations of the 10 bombs.
 */
function generateBombs(array, count)
{
    for (var i = array.length-1; i > 1; i--)
    {
        var r = Math.floor(Math.random()*i);
        var t = array[i];
        array[i] = array[r];
        array[r] = t;
    }

    return array.slice(0, count);
}

/**
 * Creates the table which represents the game board.
 */
function buildGameboard()
{
    var html = "<table cellpadding=\"0\" cellspacing=\"0\">";
    html += "<tr><th></th><td colspan = \"2\">Mines To Flag:</td><th></th>";
    html += "<th colspan=\"2\">Mine Sweeper</th>";
    html += "<th></th><td colspan = \"2\">Time Elapsed:</td><th></th></tr>"
    html += "<tr><td></td><td colspan=\"2\" class=\"dashboard\"><span id=\"Counter\"></span></td><td></td>";
    html += "<td class=\"reset\" colspan=\"2\">";
    html += "<input type=\"image\" id=\"Reset\"";
    html += "src=\"images/smileFace.png\"/></td><td></td>";
    html += "<td colspan=\"2\" class=\"dashboard\"><span id=\"Clock\"></span>";
    html += "</td><td></td></tr>";
    html += "<tr><td id=\"divider\" colspan=\"10\"></td></tr>";

    var index = 0;

    for (var r = 0; r < rows; r++)
    {
        html += "<tr>";
        for (var c = 0; c < cols; c++)
        {
            if (bombs.indexOf(index) != -1)
                html += "<td class=\"covered\"><input id=\"" + index + "\" class=\"cBomb\" height=\"44\" width=\"44\" type=\"image\"";
            else
                html += "<td class=\"covered\"><input id=\"" + index + "\" class=\"cSafe\" height=\"44\" width=\"44\" type=\"image\"";

            html += "src=\"images/covered.png\"/></td>";
            index++;
        }
        html += "</tr>";
    }

    html += "</table>";
    $(".gameboard").append(html);
}

/**
 * This function builds a 2D array to keep track of which cells
 * are adjacent to which other cells.
 */
function buildAdjacencyMatrix()
{
    // First do the corners
    adjMatrix[0] = [1, 10, 11];
    adjMatrix[9] = [8, 18, 19];
    adjMatrix[90] = [80, 81, 91];
    adjMatrix[99] = [98, 88, 89];

    // Next do the top edge
    for (var i = 1; i < 9; i++)
        adjMatrix[i] = [(i-1), (i+1), (i+9), (i+10), (i+11)];

    // Next do the left edge
    for (var i = 10; i < 81; i++)
    {
        adjMatrix[i] = [(i-10),(i-9),(i+1),(i+10),(i+11)];
        i += 9;
    }

    // Next do the right edge
    for (var i = 19; i < 90; i++)
    {
        adjMatrix[i] = [(i-10),(i-11),(i-1),(i+9),(i+10)];
        i += 9;
    }

    // Next do the bottom edge
    for (var i = 91; i < 99; i++)
        adjMatrix[i] = [(i-1),(i+1),(i-11),(i-10),(i-9)];

    // Now do the rest
    for (var i = 11; i < 89; i++)
    {
        adjMatrix[i] = [(i-11),(i-10),(i-9),(i-1),(i+1),(i+9),(i+10),(i+11)];
        if (i%10 == 8)
            i += 2;
    }
}

/**
 * This function puts the source links for the number images
 * into an array that can be used to populate squares with the
 * appropriate image during gameplay.
 */
function buildNumArray()
{
    numbers[0] = "images/zero.png";
    numbers[1] = "images/one.png";
    numbers[2] = "images/two.png";
    numbers[3] = "images/three.png";
    numbers[4] = "images/four.png";
    numbers[5] = "images/five.png";
    numbers[6] = "images/six.png";
    numbers[7] = "images/seven.png";
    numbers[8] = "images/eight.png";
}

/**
 * This function will be called when a bomb is clicked.
 * This action will end the game.
 */
function bombClicked()
{
    // Uncover this mine and turn the background red
    this.src ="images/triggerBomb.png";
    this.classList.remove("cBomb");
    this.parentNode.classList.remove("covered");
    this.parentNode.classList.add("triggerBomb");
    this.disabled = true;

    // Find the rest of the mines and uncover them
    var mines = $('input[class="cBomb"]');
    for (var i = 0; i < mines.length; i++)
    {
        mines[i].parentNode.classList.remove("covered");
        mines[i].parentNode.classList.add("uncovered");
        mines[i].src = "images/bomb.png";
    }
    dead = true;
    gameOver();
}

/**
 * This function will be called when a safe cell is clicked.  It sends the
 * clicked cell to the cascade function.
 */
function safeClicked()
{
    if (!inGame)
    {
        inGame = true;
    }

    cascade(this);
    if (coveredCount == 10)
        gameOver();
}

/**
 * This function counts the number of mines adjacent to a cell that was
 * clicked.  If the count is zero, the method checks the adjacent cells.
 * Otherwise, the count is displayed in the cell.
 */
function cascade(clicked)
{
    var cellsToCheck = new Array();
    cellsToCheck.unshift(clicked);
    while(cellsToCheck.length != 0)
    {
        var cell = cellsToCheck.pop();

        // Uncover and disable the cell
        cell.height = "48";
        cell.width = "49";
        cell.parentNode.classList.remove("covered");
        cell.parentNode.classList.add("uncovered");
        cell.disabled = true;

        var bombCount = countBombs(adjMatrix[cell.id]);
        if (bombCount == 0)
        {
            cell.src = "images/zero.png";
            coveredCount--;

            // Add the cell's neighbors to the queue
            var neighbors = getNeighbors(adjMatrix[cell.id], cellsToCheck);
            for (var i = 0; i < neighbors.length; i++)
            {
                cellsToCheck.unshift(neighbors[i]);
            }
        }
        else
        {
            coveredCount--;
            cell.src = numbers[bombCount];
        }
    }
}

/**
 * This function takes an array of cells and returns the number of bombs
 * in that array.
 */
function countBombs(cells)
{
    var count = 0;
    for (var i = 0; i < cells.length; i++)
    {
        var bomb = bombs.indexOf(cells[i]);
        if (bomb != -1)
            count++;
    }
    return count;
}

/**
 * Gets neighbors
 */
function getNeighbors(IDS, cellQueue)
{
    var toReturn = new Array();

    for (var i = 0; i < IDS.length; i++)
    {
        var cellToCheck = $("#"+IDS[i]);
        cellToCheck = cellToCheck[0];
        if (cellToCheck.parentNode.className !="uncovered" && cellQueue.indexOf(cellToCheck) == -1)
            toReturn.push(cellToCheck);
    }

    return toReturn;
}

/**
 * This function refreshes the page, effectively setting up a new game.
 */
function resetClicked()
{
    location.reload(true);
}

/**
 * This function intercepts the right-click event and disables the
 * context menu.  It also checks if the element that was right-clicked
 * was a cell in the game board, and if so it calls the method to flag
 * the cell.
 */
document.oncontextmenu =
    function(e)
    {
        if(!e)
        {
            e = event;
            e.target = e.srcElement;
        }
        if (!e.preventDefault)
            e.returnValue = false;
        else
            e.preventDefault();

        if (e.target.nodeName.toLowerCase() == 'input')
        {
            markCell(e);
        }
        return false;
    };

/**
 * This function places a flag on the cell which was right-clicked.  The
 * counter for remaining un-marked bombs is decremented.  If the clicked
 * cell already has a flag, this function removes it and increments the
 * counter for remaining un-marked bombs.
 */
function markCell(cell)
{
    if (!inGame)
        inGame = true;

    var ID = cell.target.id;
    var i = flagged.indexOf(ID);

    if (cell.target.id != "Reset" && !cell.target.disabled)
    {
        // If the cell is not already flagged, flag it.
        if (i == -1)
        {
            if (unMarked > 0)
            {
                flagged.push(ID);
                cell.target.src = "images/flag.png";
                unMarked--;
            }
            else
                alert('You have already flagged 10 cells!');
        }
        // Otherwise, un-flag it
        else
        {
            flagged.splice(i, 1);
            cell.target.src = "images/covered.png";
            unMarked++;
        }
        var leftToMark = $("#Counter");
        leftToMark[0].textContent = unMarked;
    }
}

/**
 * This function updates the timer every second while the game is in
 * progress.
 */
function timer()
{
    if (inGame)
    {
        var leftToMark = $("#Counter");
        leftToMark[0].textContent = unMarked;

        seconds++;
        if (seconds >= 999)
        {
            clearInterval(counter);
            return;
        }

        var clock = $("#Clock");
        clock[0].textContent = seconds;
    }
}

/**
 * This function is called when the game ends.  The game will
 * end when either the player wins (the only squares left covered are
 * mines), or loses (clicks a square covering a mine).
 */
function gameOver()
{
    inGame = false;
    var button = $('input[id="Reset"]');
    button = button[0];

    // Assign the appropriate face icon to the reset button
    if(dead)
        button.src = "images/deadFace.png";
    else
        button.src = "images/winFace.png";

    // Disable all of the remaining buttons
    var covered = $('input[class="cSafe"]');
    for (var i = 0; i < covered.length; i++)
    {
        covered[i].disabled = true;
    }
    covered = $('input[class="cBomb"]');
    for (var i = 0; i < covered.length; i++)
    {
        covered[i].disabled = true;
    }
}
