'use strict'
//cells
function coverAllCells() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      renderCell({ i, j }, COVER)
    }
  }
}

function renderCell(location, value) {
  const cellSelector = '.' + getClassName(location)
  const elCell = document.querySelector(cellSelector)
  if (value === 0) elCell.innerHTML = ''
  else elCell.innerHTML = value
  addClass(elCell, value)
}
//mines--------------------------------------
function createRandomMines(amount, index) {
  var minesLocations = []
  for (var i = 0; i < amount; i++) {
    var randomSpace = getRandomFreeSpace(index)
    //prevent duplicates locations
    while (isObjectinObjectArr(minesLocations, randomSpace)) {
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

function unRevealMine(index) {
  setTimeout(() => {
    renderCell(index, COVER)
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

function setMinePerDiff() {
  if (gLevel.SIZE === 4) gLevel.MINES = 2
  if (gLevel.SIZE === 8) gLevel.MINES = 14
  if (gLevel.SIZE === 12) gLevel.MINES = 32
}
//numbers--------------------------------------
function createNumbers(index) {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      var minesNearby = countNearbyMines(i, j)
      //model
      if (!currCell.isMine) gBoard[i][j].minesAroundCount = minesNearby
      //DOM
      if (index.i === i && index.j === j) {
      } else renderCell({ i, j }, COVER)
    }
  }
}

function createNumbersforExter() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      var minesNearby = countNearbyMines(i, j)
      //model

      if (!currCell.isMine) gBoard[i][j].minesAroundCount = minesNearby
      //DOM
      if (currCell.isRevealed || currCell.isMarked) {
      } else renderCell({ i, j }, COVER)
    }
  }
}
//neighbors--------------------------------------
function countNearbyMines(iIndex, jIndex) {
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
      //   model
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

function getAllNeighbors(index) {
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

// function areAllMineAreFlagged() {
//   for (var i = 0; i < gLevel.SIZE; i++) {
//     for (var j = 0; j < gLevel.SIZE; j++) {
//       const currCell = gBoard[i][j]
//       if (currCell.isMine && !currCell.isMarked) return false
//     }
//   }
//   return true
// }
