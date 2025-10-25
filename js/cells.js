'use strict'
//cells-----------------------------------------
function createCell() {
  var cell = {
    minesAroundCount: 0,
    isRevealed: false,
    isMine: false,
    isMarked: false,
  }
  return cell
}

function renderCell(location, value) {
  const cellSelector = '.' + getClassName(location)
  const elCell = document.querySelector(cellSelector)
  if (value === 0) elCell.innerHTML = ''
  else elCell.innerHTML = value
  addColorClass(elCell, value)
}

function coverAllCells() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      renderCell({ i, j }, COVER)
    }
  }
}

function revealCell(index, currCell) {
  if (currCell.isMarked) {
    gBoard[index.i][index.j].isMarked = false
    gGame.markedCount -= 1
    renderFlagsLeft()
  }
  if (currCell.isMine) {
    renderCell(index, MINE)
  } else {
    renderCell(index, currCell.minesAroundCount)
  }
}

//mines--------------------------------------
function createRandomMines(amount, index) {
  var minesLocations = []
  for (var i = 0; i < amount; i++) {
    var randomSpace = getRandomFreeSpace(index)
    //prevent duplicates locations
    while (isObjectinObjectArray(minesLocations, randomSpace)) {
      var randomSpace = getRandomFreeSpace(index)
    }
    minesLocations.push(randomSpace)
    gBoard[randomSpace.i][randomSpace.j].isMine = true
    console.log('mine in:', randomSpace)
  }
}

function revealAllMines(state) {
  var elMine = state === 'win' ? MINE : MINE_RED
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      if (currCell.isMine) renderCell({ i, j }, elMine)
    }
  }
}

function stepOnAMine(index) {
  gGame.isOn = false
  setTimeout(() => {
    renderCell(index, COVER)
    gGame.isOn = true
  }, 1000)
  renderHearts()
}

function getAllMines() {
  var mines = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (gBoard[i][j].isMine) mines.push({ i, j })
    }
  }
  return mines
}

function setMinePerDifficulty() {
  if (gLevel.SIZE === 4) gLevel.MINES = 2
  if (gLevel.SIZE === 8) gLevel.MINES = 14
  if (gLevel.SIZE === 12) gLevel.MINES = 32
}

//numbers--------------------------------------
function createNumbers(index) {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      var minesNearby = countNeighborsMines(i, j)
      //model
      if (!currCell.isMine) gBoard[i][j].minesAroundCount = minesNearby
      //DOM
      if (index.i === i && index.j === j) {
      } else renderCell({ i, j }, COVER)
    }
  }
}

function createNumbersforExterminator() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      var minesNearby = countNeighborsMines(i, j)
      //model
      if (!currCell.isMine) gBoard[i][j].minesAroundCount = minesNearby
      //DOM
      if (currCell.isRevealed) {
        renderCell({ i, j }, minesNearby)
      } else if (currCell.isMarked) renderCell({ i, j }, FLAG)
      else renderCell({ i, j }, COVER)
      //removes the last color the number had
      var elCell = document.querySelector(`.cell-${i}-${j}`)
      elCell.classList.remove(elCell.classList[2])
      //adds the new color
      addColorClass(elCell, minesNearby)
    }
  }
}

//neighbors--------------------------------------
function countNeighborsMines(iIndex, jIndex) {
  var count = 0
  for (var i = iIndex - 1; i <= iIndex + 1; i++) {
    if (i < 0 || i >= gLevel.SIZE) continue
    for (var j = jIndex - 1; j <= jIndex + 1; j++) {
      if (j < 0 || j >= gLevel.SIZE) continue
      if (i === iIndex && j === jIndex) continue
      if (gBoard[i][j].isMine) count++
    }
  }
  return count
}

function revealExpendedNeighbors(index) {
  for (var i = index.i - 1; i <= index.i + 1; i++) {
    if (i < 0 || i >= gLevel.SIZE) continue
    for (var j = index.j - 1; j <= index.j + 1; j++) {
      const currCell = gBoard[i][j]
      if (j < 0 || j >= gLevel.SIZE) continue
      if (i === index.i && j === index.j) continue
      //model
      if (!currCell.isRevealed) {
        gGame.revealedCount += 1
        gBoard[i][j].isRevealed = true
        if (gBoard[i][j].minesAroundCount === 0)
          revealExpendedNeighbors({ i, j })
      }
      //DOM
      renderCell({ i, j }, currCell.minesAroundCount)
    }
  }
}

function getArrayOfNeighbors(index) {
  var allNeighbors = []
  for (var i = index.i - 1; i <= index.i + 1; i++) {
    if (i < 0 || i >= gLevel.SIZE) continue
    for (var j = index.j - 1; j <= index.j + 1; j++) {
      if (j < 0 || j >= gLevel.SIZE) continue
      if (i === index.i && j === index.j) continue
      allNeighbors.push({ i, j })
    }
  }
  return allNeighbors
}
