'use strict'

var gBoard
var isVictory
var isHint

var gLIVE = 3
var gHint = 3
var checkFirstClick = 0
const MINE_IMG = '<img src="img/mine.jpg">'
// const FLAG_IMG = '<img src="img/flag.png">'

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame
var firstI
var firstJ
var gFirstRuc

function onInit() {
    stopTimer()
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    checkFirstClick = 0
    firstI = 0
    firstJ = 0
    gFirstRuc = 0
    closeModal()
    gBoard = emptyBoard()
    renderBoard(gBoard)
    gHint = 3
    gLIVE = 3
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
        startTimer()
        firstI = i
        firstJ = j
        gBoard = buildBoard()
    } if (gBoard[i][j].isShown) return // to not count isShown again
    
    if (isHint && gHint > 0) {
        openNeg(i,j)
        setTimeout(closeNeg,1000,i,j)
        gHint--
        updateHints()

    } 
    gGame.shownCount++
    gBoard[i][j].isShown = true

    if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) { // equal to 0 
        gFirstRuc = 0
        openNeg(i, j)
    } else if (gBoard[i][j].isMine) {
        gLIVE--
        updateLives()
    } 
    renderCell(i,j)
    
    console.log(gHint)
    console.log(gGame.shownCount)
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
    console.log(gGame.markedCount)
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
    console.log('hhh')
    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2 && gGame.shownCount > gGame.markedCount) {
        console.log('fff')
        isVictory = true
        gameOver()
    }
}

function gameOver() {
    stopTimer()
    gGame.isOn = false
    var msg = isVictory ? 'You Won!!!' : 'Game Over'
    var elBtnSmiley = document.querySelector('.smiley-btn')
    elBtnSmiley.innerHTML = isVictory ? '😎' : '🤯'
    openModal(msg)
}

function updateLives() {
    const elLive = document.querySelector('.lives span ')
    elLive.innerHTML = gLIVE
    checkGameOver()
}

function updateHints() {
    const elHint = document.querySelector('h2 .num-of-hints')
    elHint.innerHTML = gHint
}


function openNeg(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
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
            // if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            gBoard[i][j].isShown = false
            gGame.shownCount--
            deleteRenderCell(i, j)
        }
    }
}


function hints(elHint) {
    if (gHint<=0) {
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







// function onCellClicked(elCell, i, j) {
//     if (gBoard[i][j].isMarked) return
//     checkFirstClick++
//     if (checkFirstClick === 1) {
//         firstI = i
//         firstJ = j
//         gBoard = buildBoard()
//     } if (gBoard[i][j].isShown) return // to not count isShown again
//     if (isHint && gHint > 0) {
//         openNeg(i,j)
//         setTimeout(closeNeg,1000,i,j)
//         gHint--
//         updateHints()

//     } 
//         renderCell(i,j)
//         gGame.shownCount++
//         gBoard[i][j].isShown = true

//     if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) { // equal to 0 
//         gFirstRuc = 0
//         openNeg(i, j)
//     } else if (gBoard[i][j].isMine) {
//         elCell.innerHTML = MINE_IMG
//         gLIVE--
//         updateLives()
//     } 
    
//     console.log(gHint)
//     console.log(gGame.shownCount)
//     checkGameOver()


// }





// function numOfEmptyNeg(rowIdx, colIdx) {
//     var count = 0
//     for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//         if (i < 0 || i >= gBoard.length) continue
//         for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//             if (i === rowIdx && j === colIdx) continue
//             if (j < 0 || j >= gBoard[0].length) continue
//             if (gBoard[i][j].minesAroundCount === 0) {
//                 count++
//             }
//         }
//     }
//     return count
// }
// function expandShown(currI, currJ, prevI, prevJ) {
//     gFirstRuc++
//     if (numOfEmptyNeg(currI, currJ) === 0 || numOfEmptyNeg(currI, currJ) === 1 && gFirstRuc > 1)
//     {
//         openNeg(currI, currJ)
//         console.log("kk")
//         return
//     } 
//     console.log("ff")
    
//     for (var i = currI - 1; i <= currI + 1; i++) {
//         if (i < 0 || i >= gBoard.length) continue
//         for (var j = currJ - 1; j <= currJ + 1; j++) {
//             if (i === currI && j === currJ) continue
//             if (j < 0 || j >= gBoard[0].length) continue
//             if ( i == prevI && j == prevJ) continue
//             console.log("hh")
            
//             if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isShown) {
//                 console.log("expand", i, j)
//                 expandShown(i, j, currI, currJ)
//             }
//         }
//     }
//     openNeg(currI, currJ)
// }