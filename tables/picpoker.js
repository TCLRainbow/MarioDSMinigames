var bal = 10;
var bet = 0;
var holdDraw = 0;
var win = 0
var playerHand = new Array(5)
var botHand = new Array(5);
const symbols = ['⭐', '🍎', '🥒', '🌻', '🍄', '☁️'];
Object.seal(symbols);


function newCard() {
    return symbols[Math.floor(Math.random()*symbols.length)];
} 

function newHand(hand) {
    [ ...Array(hand.length)].forEach((e, i) => hand[i] = newCard());
}

function addBet() {
    if (bet < 5 && bal > 0) {
        bal--
        bet++
        document.getElementById('bal').textContent = bal
        document.getElementById('bet display').textContent = '💰'.repeat(bet)
    }
}

function initBet() {
    if (win >= 20) bet = 5
    else if (win >= 15) bet = 4
    else if (win >= 10) bet = 3
    else if (win >= 5) bet = 2
    else bet = 1
    bal -= bet
    document.getElementById('bal').textContent = bal
    document.getElementById('bet display').textContent = '💰'.repeat(bet)
}

function selectCard(e, i) {
    let cmp = 1 << i
    e.target.style.backgroundColor = holdDraw & cmp ? '' : 'black'
    holdDraw ^= cmp
    document.getElementById('next').textContent = holdDraw == 0 ? 'Hold' : 'Draw'
}

function gameplay() {
    bet = holdDraw = 0
    initBet()
    newHand(playerHand)
    newHand(botHand)
    document.getElementById('next').textContent = 'Hold'
    document.getElementById('result').textContent = ''
    document.getElementById('win counter').textContent = win
    document.getElementById('hand sorted player').textContent = document.getElementById('hand sorted bot').textContent = ''
    document.getElementById('hand bot').textContent = '🃏 🃏 🃏 🃏 🃏'
    document.getElementById('hand player').textContent = playerHand.join('')
}

function getHandPattern(hand) {
    let m = new Map()
    hand.forEach(card => {
        let occurance = m.get(card)
        if (occurance === undefined) m.set(card, 1)
        else m.set(card, occurance+1)
    })
    m = new Map([...m.entries()].sort((a, b) => b[1] - a[1]));
    let r = []
    for (let pair of m.entries()) {
        if (pair[1] >= 4) return [pair]
        else if (pair[1] == 3) r.push(pair)
        else if (pair[1] == 2) {
            if (r.length == 0) r.push(pair) // 2
            else if (r[0][1] == 3) r.push(pair) // 3 2
            else if (symbols.indexOf(pair[0]) > symbols.indexOf(r[0][0])) r.push(pair)
            else r.unshift(pair)
        }
        else if (r.length == 0) return [pair]
    }
    return r
}

// 2 2: Max pair of me vs max pair of bot. Recursive.
// Streak 5: min bet 2. streak 10 min 3
function compare(player, bot) {
    let score = 0
    let playerSym = symbols.indexOf(player[0][0]), botSym = symbols.indexOf(bot[0][0])
    if (player.length == bot.length) {
        if (player[0][1] > bot[0][1]) score = 1
        else if (player[0][1] < bot[0][1]) score = -1
        else {
            if (playerSym > botSym) score = -1
            else if (playerSym < botSym) score = 1
        }
        if (player.length == 2) {
            playerSym = symbols.indexOf(player[1][0]), botSym = symbols.indexOf(bot[1][0])
            if (playerSym > botSym) score = -1
            else if (playerSym < botSym) score = 1
        }
    } else {
        if (player[0][1] > bot[0][1]) score = 1
        else if (player[0][1] < bot[0][1]) score = -1
        else {
            if (player.length == 2) score = 1
            else score = -1
        }
    }
    let result = ''
    if (score == 1) {
        if (player[0][1] == 5) score = 16
        else if (player[0][1] == 4) score = 8
        else if (player[0][1] == 3) {
            if (player.length == 2) score = 6
            else score = 4
        }
        else if (player.length == 2) score = 3
        else score = 2
        result = "You win!"
        win++
    }
    else if (score == 0) result = 'Draw!'
    else {
        result = 'You lose!'
        if (win > 0) win--
    }
    document.getElementById('result').textContent = result
    return score
}

function proceed(event) {
    if (event.target.textContent == 'Proceed') {
        gameplay()
        return
    }

    let botPattern = getHandPattern(botHand)
    if (botPattern[0][1] == 4) {
        botHand.fill(botPattern[0][0], 0, 4)
        botHand[4] = newCard()
    }
    else if (botPattern[0][1] == 3 && botPattern.length == 1) {
        botHand.fill(botPattern[0][0], 0, 3)
        botHand[3] = newCard()
        botHand[4] = newCard()
    }
    else if (botPattern[0][1] == 2) {
        if (botPattern.length == 2) {
            botHand.fill(botPattern[0][0], 0, 2)
            botHand.fill(botPattern[1][0], 2, 4)
            botHand[4] = newCard()
        } else {
            botHand.fill(botPattern[0][0], 0, 2)
            for (let i = 2; i < 5; i++) botHand[i] = newCard()
        }
    } else newHand(botHand)

    if (event.target.textContent == 'Draw') {
        for (let i = 0; i < playerHand.length; i++) {
            if (holdDraw & 1 << i) playerHand[i] = newCard()
        }
        document.getElementById('hand player').textContent = playerHand.join('')   
    }
    document.getElementById('hand bot').textContent = botHand.join('')
    let playerPattern = getHandPattern(playerHand)
    for (let x of playerPattern) document.getElementById('hand sorted player').textContent += x[0].repeat(x[1])
    botPattern = getHandPattern(botHand)
    for (let x of botPattern) document.getElementById('hand sorted bot').textContent += x[0].repeat(x[1])
    let score = compare(playerPattern, botPattern)
    let increment = 0
    if (score == 0) increment = bet
    else if (score > 0) {
        increment = score * bet
        document.getElementById('result').textContent += `(+$${increment})`
    }
    bal += increment
    for (let button of document.getElementById('hold draw buttons').children) button.style.backgroundColor = ''
    event.target.textContent = 'Proceed'
}

document.addEventListener("DOMContentLoaded", gameplay);