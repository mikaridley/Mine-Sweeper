'use strics'
const MINE = '*'
const COVER = '<img src="img/unrevealed.png" alt="unreveal" />'
const FLAG = '<img src="img/flag.png" alt="unreveal" />'

function createRandomMines(amount, index) {
  for (var i = 0; i < amount; i++) {
    var randomSpace = getRandomFreeSpace(index)
    gBoard[randomSpace.i][randomSpace.j].isMine = true
    console.log('mine in:', randomSpace)
  }
}

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

function createMinesAndNumbers(index) {
  createRandomMines(gLevel.MINES, index)
  createNumbers(index)
}

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

function revealAllMines() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      if (currCell.isMine) renderCell({ i, j }, MINE)
    }
  }
}

function revealAllNeighbors(index) {
  var allNeighbors = []
  for (var i = index.i - 1; i <= index.i + 1; i++) {
    if (i < 0 || i >= gLevel.SIZE) continue
    for (var j = index.j - 1; j <= index.j + 1; j++) {
      const currCell = gBoard[i][j]
      if (j < 0 || j >= gLevel.SIZE) continue
      if (i === index.i && j === index.j) continue
      allNeighbors.push({ i, j })
      //   model
      if (!currCell.isRevealed) {
        gGame.revealedCount += 1
        gBoard[i][j].isRevealed = true
      }

      //DOM
      renderCell({ i, j }, currCell.minesAroundCount)
    }
  }
  return allNeighbors
}

function areAllMineAreFlagged() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      if (currCell.isMine && !currCell.isMarked) return false
    }
  }
  return true
}
