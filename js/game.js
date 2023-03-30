'use strict'

var gBoard
var isHint

var gLIVE = 3
var gHintsCount = 3
var gSafeClick = 3
var isFirstClick = true

const MINE_IMG = '<img src="img/mine.png">'

var gLevel = {
    SIZE: 4,
    MINES: 2,
    NAME: 'beginner'
}

var gGame
var firstI
var firstJ
var gFirstRuc

function onInit() {
    stopTimer()
    resetGameData()
    closeModal()
    gBoard = emptyBoard()
    renderBoard(gBoard)
    updateHints()
    updateSafeClick
    updateLives()
    preventDefault()
    renderBestScore()

}

function resetGameData() {
    firstI = 0
    firstJ = 0
    gFirstRuc = 0
    isFirstClick = true
    gHintsCount = 3
    gLIVE = 3
    gSafeClick = 3
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
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
    if (isFirstClick) {
        isFirstClick = false
        startTimer()
        firstI = i
        firstJ = j
        gBoard = buildBoard()
    }

    if (gBoard[i][j].isShown) return // to not count isShown again

    if (isHint && gHintsCount > 0) {
        openNeg(i, j)
        setTimeout(closeNeg, 1000, i, j)
        gHintsCount--
        updateHints()

    } else {
        gGame.shownCount++
        gBoard[i][j].isShown = true
    }
    if (!gBoard[i][j].isMine) { // equal to 0 
        expandShown(i, j)
    } else if (gBoard[i][j].isMine) {
        gLIVE--
        updateLives()
    }
    renderCell(i, j)
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
    updateFlags()
    checkGameOver()
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
    var isVictory
    if (!gLIVE) {
        isVictory = false
        gameOver(isVictory)
    } else {
        if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2 && gGame.shownCount > gGame.markedCount) {
            isVictory = true
            gameOver(isVictory)
        }

    }

}

function gameOver(isVictory) {
    stopTimer()
    gGame.isOn = false
    var msg = isVictory ? 'You Won!!!' : 'Game Over'
    var elBtnSmiley = document.querySelector('.smiley-btn')
    elBtnSmiley.innerHTML = isVictory ? '😎' : '🤯'
    openModal(msg)
    if (isVictory) updateBestScore()

}

function updateBestScore() {
    var finishTime = Date.now() - gStartTime
    var currScoreTime = localStorage.getItem(gLevel.NAME)
    if (!currScoreTime || finishTime < currScoreTime) {
        localStorage.setItem(gLevel.NAME, finishTime)
        renderBestScore()
    }
}

function renderBestScore() {
    const bestScore = localStorage.getItem(gLevel.NAME)
    var minutes = Math.floor(bestScore / (1000 * 60));
    var seconds = Math.floor((bestScore % (1000 * 60)) / 1000);
    document.querySelector('h3 .best-score').innerText =
        formatTime(minutes) +
        ':' +
        formatTime(seconds)
}

function updateLives() {
    const elLive = document.querySelector('.lives span ')
    elLive.innerHTML = gLIVE
}

function updateHints() {
    const elHint = document.querySelector('h2 .num-of-hints')
    elHint.innerHTML = gHintsCount
}
function updateSafeClick() {
    const elSafeClick = document.querySelector('.num-of-safeclick')
    elSafeClick.innerHTML = gSafeClick
}


function openNeg(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked && !isHint) {
                gBoard[i][j].isShown = true
                gGame.shownCount++
            }
            renderCell(i, j)
        }
    }
}

function closeNeg(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            deleteRenderCell(i, j)
        }
    }
}


function hints(elHint) {
    if (isFirstClick) return
    if (gHintsCount <= 0) {
        elHint.classList.remove('use-hint')
        isHint = false
        return
    }
    if (!isHint) {
        elHint.classList.add('use-hint')
        isHint = true
    } else {
        elHint.classList.remove('use-hint')
        isHint = false

    }
}

function safeClick() {
    if (!gSafeClick) return
    if (isFirstClick) return
    const safeCell = findRandomSafeCell()
    const elSafeCell = document.querySelector(`.cell-${safeCell.i}-${safeCell.j}`)
    elSafeCell.classList.add('safe-click')
    gSafeClick--
    updateSafeClick()
    setTimeout(hideSafeClick, 2000, elSafeCell)
}

function hideSafeClick(elSafeCell) {
    elSafeCell.classList.remove('safe-click')
}


function findRandomSafeCell() {
    var safeCells = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = gBoard[i][j]
            if (!cell.isMine && !cell.isShown) safeCells.push({ i, j })
        }
    }
    const randIdx = getRandomInt(0, safeCells.length)
    return safeCells[randIdx]
}


// function megaHint(rowIdxStart, rowIdxEnd, colIdxStart, colIdxEnd) {
//     for (var i = rowIdxStart; i <= rowIdxEnd; i++) {
//         for (var j = colIdxStart; j <= colIdxEnd; j++) {
//             gBoard[i][j].isShown = true
//             renderCell(i,j)
//             setTimeout(deleteRenderCell,2000,i, j)
//             gBoard[i][j].isShown = false
//         }
//     }
// }

function updateFlags() {
    const elFlag = document.querySelector('.counter-flags span')
    elFlag.innerText = gGame.markedCount
}

function numOfEmptyNeg(rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            if (gBoard[i][j].minesAroundCount === 0) {
                count++
            }
        }
    }
    return count
}

function expandShown(rowIdx, colIdx) {
    const currCell = gBoard[rowIdx][colIdx];
    if (currCell.minesAroundCount > 0) {
        renderCell(rowIdx, colIdx)
        return
    }
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked && !isHint) {
                gBoard[i][j].isShown = true
                gGame.shownCount++
                expandShown(i, j);
            }

            renderCell(i, j)
        }
    }
}