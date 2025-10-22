'use strict'

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

function getRandomIntEx(min, exMax) {
  min = Math.ceil(min)
  max = Math.floor(exMax)
  return Math.floor(Math.random() * (exMax - min + 1) + min)
}

function getRandomFreeSpace(index) {
  //arr with the index and its neighbores
  var notFreeCells = revealAllNeighbors(index)
  notFreeCells.push(index)

  var freeSpaces = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      var currObj = { i, j }
      if (!isObjinObjArr(notFreeCells, currObj)) freeSpaces.push(currObj)
    }
  }
  var randomIndex = getRandomInt(0, freeSpaces.length)
  return freeSpaces[randomIndex]
}

function getClassName(position) {
  const cellClass = `cell-${position.i}-${position.j}`
  return cellClass
}

function renderCell(location, value) {
  const cellSelector = '.' + getClassName(location)
  const elCell = document.querySelector(cellSelector)
  elCell.innerHTML = value
  addClass(elCell, value)
}

function addClass(elCell, value) {
  if (isNaN(value)) return
  var className
  if (+value === 1) className = 'blue'
  if (+value === 2) className = 'green'
  if (+value === 3) className = 'red'
  if (+value === 4) className = 'dark-blue'
  if (+value === 5) className = 'dark-red'
  if (+value === 6) className = 'turkiz'
  if (+value === 7) className = 'black'
  if (+value === 8) className = 'grey'
  elCell.classList.add(className)
}

function getIndexFromClass(elCell) {
  var classes = elCell.className.split(' ')
  for (var i = 0; i < classes.length; i++) {
    if (classes[i].startsWith('cell-')) {
      var indexes = classes[i].substring(5).split('-')
      return { i: +indexes[0], j: +indexes[1] }
    }
  }
}

function isObjinObjArr(arr, obj) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].i === obj.i && arr[i].j === obj.j) return true
  }
  return false
}
