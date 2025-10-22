'use strict'

function renderBoard() {
  const elBoard = document.querySelector('.board')
  var strHTML = ''

  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += '<tr>\n'
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      var cellClass = getClassName({ i: i, j: j })
      var value = currCell.isMine ? MINE : ''
      var onClicks =
        'oncontextmenu="onRightClickCell(event,this)" onclick="onClickCell(this)"'
      strHTML += `\t<td ${onClicks} class="cell ${cellClass}">${value}`
      strHTML += '</td>\n'
    }
    strHTML += '</tr>\n'
  }
  elBoard.innerHTML = strHTML
}

function renderHearts() {
  var strHtml = ''
  var elHearts = document.querySelector('.hearts')
  for (var j = 0; j < gLevel.LIVES; j++) {
    strHtml += `<div class="heart">${HEART}</div>`
  }
  for (var i = 0; i < 3 - gLevel.LIVES; i++) {
    strHtml += `<div class="heart">${EMPTY_HEART}</div>`
  }

  elHearts.innerHTML = strHtml
}
