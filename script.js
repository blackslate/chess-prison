/**
 * script.js
 */


const rules   = document.getElementById("rules")
const play    = document.getElementById("play")
const show    = document.getElementById("show")
const buttons = document.getElementById("buttons")
const find    = document.querySelector("label:has(#find)")
const board   = document.getElementById("board")
const value   = document.getElementById("value")
const coins   = Array.from(board.querySelectorAll("img"))
const heads   = "images/heads.png"
const tails   = "images/tails.png"
const faces   = [ heads, tails ]
let state     = document.querySelector(':checked').id;
let hidden    = -1


// Look up code for which coin to flip to mod the
// current display by a given value
const LUT = {
   0:  3,
   1:  7,
   2: 11,
   3: 15,
   4:  2,
   5:  6,
   6: 10,
   7: 14,
   8:  1,
   9:  5,
  10:  9,
  11: 13,
  12:  0,
  13:  4,
  14:  8,
  15: 12
}


coins.forEach( coin => (
  coin.src = faces[ (Math.random() < 0.5) + 0 ]
))


play.addEventListener("click", startGame)
show.addEventListener("click", showRules)
buttons.addEventListener("change", setState)
board.addEventListener("click", treatCoinClick)
board.addEventListener("transitionend", nextState)


function startGame() {
  rules.classList.add("hide")
}

function showRules() {
  rules.classList.remove("hide")
}


function setState({ target }) {
  state = target.id

  switch (state) {
    case "find":
      return flipCoin()
  }
}


const isHeads = img => (img.src.indexOf(heads) > 0)



function flipCoin() {
  const hex = getHex()
  const mod = hex ^ hidden
  const flip = LUT[mod]
  console.log("mod:", mod, ", flip:", flip)
  turnCoin(coins[flip])
}


function getHex() {
  const headCoins = coins.map(isHeads)

  const c1c2 = headCoins.filter(( _, index ) => (
    (index % 4) < 2)
  ).reduce(( even, heads ) => even + (heads + 0))
    % 2

  const c1c3 = headCoins.filter(( _, index ) => (
    (index + 1) % 2
  )).reduce(( even, heads ) => even + (heads + 0))
    % 2

  const r4r3 = headCoins.filter(( _, index ) => index > 7)
    .reduce(( even, heads ) => even + (heads + 0))
    % 2

  // Choose 4567 CDEF
  const r4r2 = headCoins.filter(( _, index ) => (
    Math.floor(index / 4) % 2)
  ).reduce(( even, heads ) => even + (heads + 0))
    % 2

  const hex = c1c2 * 8 + c1c3 * 4 + r4r3 * 2 + r4r2
  value.textContent = hex
  return hex
}


function treatCoinClick({ target }) {
  if (target.tagName !== "IMG") { return }

  switch (state) {
    case "turn":
      return turnCoin(target)

    case "hide":
      return hideToken(target)

    case "find":
      return liftCoin(target)
  }
}


function turnCoin(target) {
  target.src = faces[isHeads(target) + 0]
  getHex()
}


function nextState({ target, type }) {
  // function body
  const index = coins.indexOf(target)
  value.innerText = `${index} ${type}`
  console.log("nextState:", state)

  switch (state) {
    case "hiding":
      return showToken(target)
    case "hidden":
      return replaceCoin(target)
  }
}


function hideToken(target) {
  state = "hiding"
  hidden = coins.indexOf(target)

  // Temporarily remove the coin
  target.classList.add("remove")
}


function showToken(target) {
  state = "hidden"
  // Create or move the img.token
  const token = document.querySelector(".token")
             || document.createElement("img")
  token.className = "token"
  token.src = "images/exit.webp"
  token.alt = "exit"
  target.parentNode.prepend(token)

  setTimeout(() =>  token.classList.add("vanish"), 1)
}


function replaceCoin(target) {
  console.log("target.src:", target.src)
  const sibling = target.nextSibling
  console.log("target.nextSibling:", sibling)
  console.log("replaceCoin", coins.indexOf(sibling))
  state = "hide"
  sibling.classList.remove("remove")
  sibling.classList.add("replace")

  find.removeAttribute("disabled")
}


function liftCoin(target) {
  const coin = target.nextSibling || target
  console.log("coin:", coin, coins.indexOf(coin))
  coin.classList.remove("replace")
  coin.classList.add("remove")
  target.classList.remove("vanish")
}


getHex()