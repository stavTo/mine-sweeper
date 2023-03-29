'use strict'

var gBoard
var isVictory

var gLIVE = 3
var gHint = 3
var checkFirstClick = 0
const MINE_IMG = '<img src="img/mine.jpg">'
const FLAG_IMG = '<img src="img/flag.png">'

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame
var firstI
var firstJ


function onInit() {
    gLIVE = 3
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    checkFirstClick = 0
    firstI = 0
    firstJ = 0

    closeModal()
    gBoard = emptyBoard()
    renderBoard(gBoard)
    updateLives()
    preventDefault()

}


function buildBoard() {
    setMinesRandom()
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, i, j)
        }
    }
    return gBoard
}

function emptyBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
   return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cellClass = getClassName({ i, j }) + ' '
            strHTML += `<td class="cell ${cellClass}" onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this,${i},${j})">
            </td>` //maybe also event


        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}


function setMinesNegsCount(board, rowIdx, colIdx) {
    var minesNegsCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) minesNegsCount++
        }
    }
    return minesNegsCount


}

function onCellClicked(elCell, i, j) {
    if (gBoard[i][j].isMarked) return
    checkFirstClick++
    if (checkFirstClick === 1) {
        firstI = i
        firstJ = j
        gBoard = buildBoard()
        gBoard[i][j].isShown = true
        gGame.shownCount++
        elCell.classList.add('shown')
        renderCell(i, j)
    }
    if (gBoard[i][j].isShown) return // to not count isShown again
    gBoard[i][j].isShown = true
    elCell.classList.add('shown')
    gGame.shownCount++
    if (gBoard[i][j].minesAroundCount===0) { // equal to 0 
        expandShown( i, j)
    }
    if (gBoard[i][j].isMine) {
        elCell.innerHTML = MINE_IMG
        gLIVE--
        updateLives()
    } else renderCell(i, j)

    checkGameOver()


}


function onCellMarked(elCell, i, j) {
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
    } else {
        gBoard[i][j].isMarked = true
        gGame.markedCount++

    }
    elCell.classList.toggle('flag')
}

function preventDefault() {
    const elTable = document.querySelector('.board')
    elTable.addEventListener("contextmenu", (e) => { e.preventDefault() })
}


function setMinesRandom() {
    var count = gLevel.MINES
    while (count !== 0) {
        var randomI = getRandomInt(0, gLevel.SIZE)
        var randomJ = getRandomInt(0, gLevel.SIZE)
        if (randomI === firstI && randomJ === firstJ) continue
        if (gBoard[randomI][randomJ].isMine) continue
        if (gBoard[randomI][randomJ].isShown) continue
        gBoard[randomI][randomJ].isMine = true
        count--
    }
}


function checkGameOver() {
    if (!gLIVE) {
        isVictory = false
        gameOver()
    }
    else if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {
        isVictory = true
        gameOver()
    }
}

function gameOver() {
    gGame.isOn = false
    var msg = isVictory ? 'You Won!!!' : 'Game Over'
    var elBtnSmiley = document.querySelector('.smiley-btn')
    elBtnSmiley.innerHTML = isVictory ? '😎' : '🤯'
    openModal(msg)
}

function updateLives() {
    const elLive = document.querySelector('h2 span')
    elLive.innerHTML = gLIVE
    checkGameOver()
}

// function expandShown(rowIdx, colIdx) {
//     for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//         if (i < 0 || i >= gBoard.length) continue
//         for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//             if (i === rowIdx && j === colIdx) continue
//             if (j < 0 || j >= gBoard[0].length) continue
//             renderCell(i,j)  
//         }
//     }  
// }