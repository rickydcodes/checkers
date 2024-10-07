const playingArea = document.querySelector("#playingArea");
const startButton = document.querySelector("#startButton");
const winParagraph = document.querySelector("#winParagraph");
const rows = document.querySelectorAll(".row");

const redSetup = [[0, 7], [2, 7], [4, 7], [6, 7], [0, 5], [2, 5], [4, 5], [6, 5], [1, 6], [3, 6], [5, 6], [7, 6]];
const blackSetup = [[1, 0], [3, 0], [5, 0], [7, 0], [0, 1], [2, 1], [4, 1], [6, 1], [1, 2], [3, 2], [5, 2], [7, 2]];

const kingSquares = redSetup.slice(0, 4).concat(blackSetup.slice(0, 4));

let redPieces = 12;
let blackPieces = 12;
let gameOver = true;
let turn = "red";
let canJump = false;
let canDoubleJump = false;
let possibilitiesShown = false;

startButton.addEventListener("click", startGame);

function startGame() {
    if (gameOver) {
        gameOver = false;
        winParagraph.innerHTML = "";
        redPieces = 12;
        blackPieces = 12;
        turn = "red";
        canJump = false;
        canDoubleJump = false;

        resetBoard();
        loadBoard();
    }
}

function resetBoard() {
    let squares = document.querySelectorAll(".square");
    for (let square of squares) {
        square.classList = "square";
    }
}

function loadBoard() {
    for (let pos of redSetup) {
        let piece = rows[pos[1]].children[pos[0]];
        piece.classList.add("red");
        piece.addEventListener("click", togglePossibilities);
    }
    for (let pos of blackSetup) {
        let piece = rows[pos[1]].children[pos[0]];
        piece.classList.add("black");
        piece.addEventListener("click", togglePossibilities);
    }
}

function changeTurn() {
    turn = turn == "red" ? "black" : "red";
    checkWin();
}

function cantMove() {
    let squares = document.querySelectorAll(`.${turn}`);
    for (let square of squares) {
        let possibilities = getPossibilities(square);
        if (possibilities.length) {
            return false;
        }
    }
    return true;
}

function checkWin() {
    let playerCantMove = cantMove();
    if (turn == "red" && (redPieces == 0 || playerCantMove)) {
        gameOver = true;
        winParagraph.innerHTML = `Black wins!`;
    } else if (turn == "black" && (blackPieces == 0 || playerCantMove)) {
        gameOver = true;
        winParagraph.innerHTML = `Red wins!`;
    }
}

function getRelativeSquare(square, x, y) {
    let parentX = parseInt(square.dataset.x);
    let parentY = parseInt(square.parentElement.dataset.y);
    let relX = parentX + x;
    let relY = parentY + y;
    if (relX >= 0 && relX <= 7 && relY >= 0 && relY <= 7) {
        let square = rows[relY].children[relX];
        return {
            square: square,
            color: getColorFromSquare(square)
        };
    } else {
        return null;
    }
}

function getColorFromSquare(square) {
    let color = null;
    if (square.classList.contains("black")) return "black";
    if (square.classList.contains("red")) return "red";
}

function getPossibilities(square) {
    let color = getColorFromSquare(square);
    let king = square.classList.contains("king");
    let possibilities = [];

    let topLeft = getRelativeSquare(square, -1, -1);
    let topRight = getRelativeSquare(square, 1, -1);
    let bottomLeft = getRelativeSquare(square, -1, 1);
    let bottomRight = getRelativeSquare(square, 1, 1);

    if ((king && color == "black") || color == "red") {
        if (topLeft != null) {
            if (topLeft.color == null) {
                possibilities.push(topLeft);
            } else if (topLeft.color != color) {
                let popSquare = getRelativeSquare(square, -2, -2);
                if (popSquare != null) {
                    if (popSquare.color == null) possibilities.push([popSquare, topLeft]);
                }
            }
        }
        if (topRight != null) {
            if (topRight.color == null) {
                possibilities.push(topRight);
            } else if (topRight.color != color) {
                let popSquare = getRelativeSquare(square, 2, -2);
                if (popSquare != null) {
                    if (popSquare.color == null) possibilities.push([popSquare, topRight])
                }
            }
        }
    }

    if ((king && color == "red") || color == "black") {
        if (bottomLeft != null) {
            if (bottomLeft.color == null) {
                possibilities.push(bottomLeft);
            } else if (bottomLeft.color != color) {
                let popSquare = getRelativeSquare(square, -2, 2);
                if (popSquare != null) {
                    if (popSquare.color == null) possibilities.push([popSquare, bottomLeft]);
                }
            }
        }
        if (bottomRight != null) {
            if (bottomRight.color == null) {
                possibilities.push(bottomRight);
            } else if (bottomRight.color != color) {
                let popSquare = getRelativeSquare(square, 2, 2);
                if (popSquare != null) {
                    if (popSquare.color == null) possibilities.push([popSquare, bottomRight])
                }
            }
        }
    }

    return possibilities;
}

function showPossibilities(square, ps) {
    removePossibilities();
    let possibilities = ps || getPossibilities(square);
    if (possibilities.length == 0) return null;

    for (let p of possibilities) {
        if (p.keys == undefined) {
            p.square.classList.add("possibility");
            p.square.addEventListener("click", possibilityClicked.bind(p.square, false, square));
        } else {
            p[0].square.classList.add("possibility");
            p[0].square.addEventListener("click", possibilityClicked.bind(p[0].square, true, square, p[1]));
        }
    }
}

function removePossibilities() {
    document.querySelectorAll(".possibility").forEach(item => {
        item.classList.remove("possibility");
        removeEventListeners(item);
    });
}

function removeEventListeners(element) {
    let old = element.cloneNode(true);
    element.parentElement.replaceChild(old, element);
    return old;
}

function togglePossibilities() {
    if (getColorFromSquare(this) == turn && !canDoubleJump) {
        let possibilities = document.querySelectorAll(".possibility");
        if (possibilities.length) {
            removePossibilities();
        } else {
            let possibilities = getPossibilities(this);
            showPossibilities(this, canJump ? possibilities.filter(item => item[1] != undefined) : possibilities);
        }
    }
}

function possibilityClicked(pop, square, inBetween) {
    if (!pop) {
        this.newSquare = moveTo.bind(this, square)();
    } else {
        this.newSquare = moveTo.bind(this, square)();

        if (inBetween.color == "red") {
            redPieces--;
        }
        if (inBetween.color == "black") {
            blackPieces--;
        }

        inBetween.square.classList = "square";
        removeEventListeners(inBetween.square);

        let ps = getPossibilities(this.newSquare).filter(item => item[1] != undefined);
        if (ps.length) {
            canDoubleJump = true;
            showPossibilities(this.newSquare, ps);
            return;
        }
    }

    canDoubleJump = false;
    changeTurn();
    checkForJumps();
}

function checkForJumps() {
    let pieces = document.querySelectorAll(`.${turn}`);
    for (let piece of pieces) {
        let ps = getPossibilities(piece);
        for (let p of ps) {
            if (p[1] != undefined) {
                canJump = true;
                return;
            }
        }
    }
    canJump = false;
}

function isKing(square) {
    let x = parseInt(square.dataset.x);
    let y = parseInt(square.parentElement.dataset.y);

    for (let ks of kingSquares) {
        if (x == ks[0] && y == ks[1]) {
            return true;
        }
    }
    return false;
}

function moveTo(square) {
    this.classList = square.classList;
    square.classList = "square";

    removePossibilities();

    removeEventListeners(square);
    let newSquare = removeEventListeners(this);

    newSquare.addEventListener("click", togglePossibilities);

    if (isKing(newSquare)) {
        newSquare.classList.add("king");
    }
    return newSquare;
}