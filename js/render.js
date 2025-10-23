'use strict'

function renderCell(location, value) {
  const cellSelector = '.' + getClassName(location)
  const elCell = document.querySelector(cellSelector)
  if (value === 0) elCell.innerHTML = ''
  else elCell.innerHTML = value
  addClass(elCell, value)
}

function renderResetedTimer() {
  gTimerId = null
  var elTimer = document.querySelector('.curr-time')
  elTimer.innerText = '00:00:00'
}

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

function renderClickedEasyButton() {
  renderUnclickedDiffButtons()
  var elBtn = document.querySelector('.diff-4')
  elBtn.style.backgroundImage = EASY_BTN_CLICKED
}

function renderClickedMediumButton() {
  renderUnclickedDiffButtons()
  var elBtn = document.querySelector('.diff-8')
  elBtn.style.backgroundImage = MEDIUM_BTN_CLICKED
}

function renderClickedHardButton() {
  renderUnclickedDiffButtons()
  var elBtn = document.querySelector('.diff-12')
  elBtn.style.backgroundImage = HARD_BTN_CLICKED
}

function renderUnclickedDiffButtons() {
  var elBtn = document.querySelector('.diff-4')
  elBtn.style.backgroundImage = EASY_BTN
  elBtn = document.querySelector('.diff-8')
  elBtn.style.backgroundImage = MEDIUM_BTN
  elBtn = document.querySelector('.diff-12')
  elBtn.style.backgroundImage = HARD_BTN
}

function renderRestartButton(state) {
  var elRestart = document.querySelector('.restart')
  elRestart.style.backgroundImage = `url('../img/Restart Button - ${state}.png')`
}

function renderFlagsLeft() {
  var elFlg = document.querySelector('.flags-amount')
  elFlg.innerHTML = gLevel.MINES - gGame.markedCount
}

function renderDarkMoreBtn(elBtn) {
  var dashIndex = elBtn.innerHTML.indexOf('-') + 2
  var state = elBtn.innerHTML.substring(dashIndex)
  if (state[0] === 'L') elBtn.innerHTML = DARK_MODE
  else elBtn.innerHTML = LIGHT_MODE
}

// function renderClickedUndoButton(elBtn) {
//   renderUnclickedModesButtons()
//   elBtn.style.backgroundImage = "url('../img/Hard Button - Selected.png')"
// }

function renderHintsButtonToggle() {
  if (!gGame.isOn) return
  var elBtn = document.querySelector('.hints')
  if (gModes.hints.amount === 0) {
    elBtn.innerHTML = HINTS_USED
    gModes.hints.state = false
    return
  }
  //model
  gModes.hints.state = !gModes.hints.state
  //DOM
  if (gModes.hints.state) elBtn.innerHTML = HINTS_ON
  else elBtn.innerHTML = HINTS_OFF
}

function renderModeHeader(classBtn) {
  //DOM header
  var elBtnHeader = document.querySelector(`h2.${classBtn} span`)
  elBtnHeader.innerText = gModes.hints.amount
}
// function renderClickedSafeButton(elBtn) {
//   renderUnclickedModesButtons()
// }

// function renderClickedMegaButton(elBtn) {
//   renderUnclickedModesButtons()
// }

// function renderClickedExtButton(elBtn) {
//   renderUnclickedModesButtons()
// }

// function renderUnclickedModesButtons() {
//   var elBtn = document.querySelector('.undo')
//   elBtn.style.backgroundImage = "url('../img/Undo Button - Used.png')"
//   elBtn = document.querySelector('.hints')
//   elBtn.style.backgroundImage = "url('../img/Safe Click Button - Used.png')"
//   elBtn = document.querySelector('.mega')
//   elBtn.style.backgroundImage = "url('../img/Mega Hint Button - Used.png')"
//   elBtn = document.querySelector('.ext')
//   elBtn.style.backgroundImage =
//     "url('../img/Exterminator Button - Used - Used.png')"
// }
