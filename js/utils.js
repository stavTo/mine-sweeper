'use strict'

function getClassName(location) {
  const cellClass = 'cell-' + location.i + '-' + location.j
  return cellClass
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

function renderCell(i , j) {
  const elCell = document.querySelector(`.cell-${i}-${j}`)
  elCell.classList.add('shown')
  if (gBoard[i][j].minesAroundCount === 0) return
  elCell.innerHTML = gBoard[i][j].minesAroundCount
}

function openModal(msg) {
  const elModal = document.querySelector('.modal')
  const elSpan = elModal.querySelector('.msg')
  elSpan.innerText = msg
  elModal.style.display = 'block'
}

function closeModal() {
  const elModal = document.querySelector('.modal')
  elModal.style.display = 'none'
}

function changeSize(elLevel) {
  if (elLevel.className === 'beginner') {
      gLevel.SIZE = 4
      gLevel.MINES = 2
      onInit()
  } else if (elLevel.className === 'medium') {
      gLevel.SIZE = 8
      gLevel.MINES = 14
      onInit()
  } else if (elLevel.className === 'expert') {
      gLevel.SIZE = 12
      gLevel.MINES = 32
      onInit()
  }
}