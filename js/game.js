'use strict'

var gBoard
var isHint

var gLIVE = 3
var gHintsCount = 3
var gSafeClick = 3
var gMegaHint = false
var isFirstClick = true
var gRowIdxStart
var gColIdxStart
var gRowIdxEnd
var gColIdxEnd
var gMegaHintCount
var isManually = false

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
    gMegaHintCount = 1
    gRowIdxStart = -1
    gColIdxStart = -1
    gRowIdxEnd = 0
    gColIdxEnd = 0
    isManually = false
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
}


function buildBoard() {
    if (!isManually) setMinesRandom()
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
            strHTML += `<td data-i=${i} data-j=${j} class="cell ${cellClass}" onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this,${i},${j})">
            </td>`
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
    if (!gGame.isOn) return
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isShown) return // to not count isShown again


    if (isFirstClick && isManually && gLevel.MINES > 0) {
        gBoard[i][j].isMine = true
        renderCell(i, j)
        gLevel.MINES--
        if (!gLevel.MINES) {
            setTimeout(closeAllMinesManuallyMode, 1000)
            gBoard = buildBoard()
        }
        return
    }
    if (isFirstClick) {
        isFirstClick = false
        startTimer()
        firstI = i
        firstJ = j
        gBoard = buildBoard()
    }
    if (gMegaHint) {
        if (gRowIdxStart === -1) {
            gRowIdxStart = +elCell.dataset.i
            gColIdxStart = +elCell.dataset.j
            return
        } else {
            gRowIdxEnd = +elCell.dataset.i
            gColIdxEnd = +elCell.dataset.j
        }
        megaHint(gRowIdxStart, gRowIdxEnd, gColIdxStart, gColIdxEnd)
        const elMegaHint = document.querySelector('.mega-click-btn-on')
        gMegaHint = false
        megaHintBtn(elMegaHint)
        gMegaHintCount = 0
        return
    }
    if (isHint && gHintsCount > 0) {
        openNeg(i, j)
        setTimeout(closeNeg, 1000, i, j)
        gHintsCount--
        updateHints()
        !isHint
        const elHint = document.querySelector('.hint-btn')
        hints(elHint)
    } else {
        gGame.shownCount++
        gBoard[i][j].isShown = true
    }
    if (!gBoard[i][j].isMine) {
        expandShown(i, j)
    } else if (gBoard[i][j].isMine) {
        gLIVE--
        updateLives()
    }
    renderCell(i, j)
    checkGameOver()
}

function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return
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
    } else if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2 && gGame.shownCount > gGame.markedCount) {
        isVictory = true
        gameOver(isVictory)
    }
}

function gameOver(isVictory) {
    stopTimer()
    gGame.isOn = false
    var msg = isVictory ? 'You Won!!!' : 'Game Over'
    var elBtnSmiley = document.querySelector('.smiley-btn')
    elBtnSmiley.innerHTML = isVictory ? '😎' : '🤯'
    openAllMinesGameOver()
    openModal(msg)
    if (isVictory) updateBestScore()

}

function openAllMinesGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.isMine) {
                renderCell(i, j)
            }
        }
    }
}

function closeAllMinesManuallyMode() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.isMine) {
                deleteRenderCell(i, j)
            }
        }
    }
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
    var minutes = Math.floor(bestScore / (1000 * 60))
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
    const elHint = document.querySelector('.num-of-hints')
    elHint.innerHTML = gHintsCount
}
function updateSafeClick() {
    const elSafeClick = document.querySelector('.num-of-safeclick')
    elSafeClick.innerHTML = gSafeClick
}
function updateFlags() {
    const elFlag = document.querySelector('.counter-flags span')
    elFlag.innerText = gGame.markedCount
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

function hints(elHint) {
    if (isFirstClick) return
    if (gHintsCount > 0) {
        elHint.classList.toggle('use-hint')
        isHint = !isHint
    } else if (!gHintsCount) {
        elHint.classList.remove('use-hint')
        return
    }
}

function megaHintBtn(elBtnMegaHint) {
    if (isFirstClick || !gMegaHintCount) return
    gMegaHint = !gMegaHint
    elBtnMegaHint.classList.toggle('mega-click-btn-on')
}

function megaHint(rowIdxStart, rowIdxEnd, colIdxStart, colIdxEnd) {
    for (var i = rowIdxStart; i <= rowIdxEnd; i++) {
        for (var j = colIdxStart; j <= colIdxEnd; j++) {
            renderCell(i, j)
            setTimeout(deleteRenderCell, 2000, i, j)
        }
    }
}

function manuallyPositioned(elBtnManually) {
    if (isFirstClick) {
        if (isManually === false) isManually = true
        elBtnManually.classList.add('manually-positioned-btn-on')
    }
}

