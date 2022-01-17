var bal, bet, holdDraw;
var win = 0
var playerHand = new Array(5), botHand = new Array(5)
var ws = new WebSocket('ws' + document.location.origin.substring(4) + '/tables/picpoker/ws')
ws.binaryType = "arraybuffer";
const symbols = ['⭐', '🍎', '🥒', '🌻', '🍄', '☁️'];
Object.seal(symbols);

function addBet() {
    if (bet < 5 && bal > 0) {
        bal--
        bet++
        document.getElementById('bal').textContent = bal
        document.getElementById('bet display').textContent = '💰'.repeat(bet)
        ws.send(new Uint8Array([32]))
    }
}

function selectCard(e, i) {
    e.target.style.backgroundColor = holdDraw & i ? '' : 'black'
    holdDraw ^= i
    document.getElementById('next').textContent = holdDraw == 0 ? 'Hold' : 'Draw'
}

function unpack_hand(hand, symbolIDs) {
    for (let i = 0; i < 5; i++) {
        hand[i] = symbols[symbolIDs >> (12 - 3*i) & 7]
    }
}

function reset() {
    holdDraw = 0
    document.getElementById('next').textContent = 'Hold'
    document.getElementById('result').textContent = ''
    document.getElementById('win counter').textContent = win
    document.getElementById('hand sorted player').textContent = document.getElementById('hand sorted bot').textContent = ''
    document.getElementById('hand bot').textContent = '🃏 🃏 🃏 🃏 🃏'
    if (win >= 20) bet = 5
    else if (win >= 15) bet = 4
    else if (win >= 10) bet = 3
    else if (win >= 5) bet = 2
    else bet = 1
    document.getElementById('bet display').textContent = '💰'.repeat(bet)
}

function main() {
    reset()
    ws.onmessage = e => {
        bal = 0
        let a = new Uint8Array(e.data)
        unpack_hand(playerHand, (a[0] << 8) + a[1])
        for (let i = 2; i < a.length; i++) bal = (bal << 8) + a[i]
        bal -= bet
        document.getElementById('bal').textContent = bal
        document.getElementById('hand player').textContent = playerHand.join('')
    } 
}

function setResult(player, score) {
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
        let increment = score * bet
        result = `You win! (+${increment})`
        win++
        bal += increment
    }
    else if (score == 0) {
        result = 'Draw!'
        bal += bet
    }
    else {
        result = 'You lose!'
        if (win > 0) win--
    }
    document.getElementById('bal').textContent = bal
    document.getElementById('result').textContent = result
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

function proceed(event) {
    if (event.target.textContent == 'Proceed') {
        ws.send(new Uint8Array([64]))
        reset()
        document.getElementById("bet button").style.visibility = "visible"
        bal -= bet
        document.getElementById('bal').textContent = bal
        ws.onmessage = e => {
            let a = new Uint8Array(e.data)
            unpack_hand(playerHand, (a[0] << 8) + a[1])
            document.getElementById('hand player').textContent = playerHand.join('')
        }
        return
    }

    ws.send(new Uint8Array([holdDraw]))
    for (let button of document.getElementById('hold draw buttons').children) button.style.backgroundColor = ''
    event.target.textContent = 'Proceed'
    document.getElementById("bet button").style.visibility = "hidden"

    ws.onmessage = e => {
        let a = new Uint8Array(e.data)
        unpack_hand(playerHand, (a[0] << 8) + a[1])
        unpack_hand(botHand, (a[2] << 8) + a[3])
        console.log(playerHand)
        if (holdDraw != 0) document.getElementById('hand player').textContent = playerHand.join('')   
        document.getElementById('hand bot').textContent = botHand.join('')
        let playerPattern = getHandPattern(playerHand)
        for (let x of playerPattern) document.getElementById('hand sorted player').textContent += x[0].repeat(x[1])
        botPattern = getHandPattern(botHand)
        for (let x of botPattern) document.getElementById('hand sorted bot').textContent += x[0].repeat(x[1])
        let score = 0
        if (a[0] >> 7) score = 1
        else if (a[2] >> 7) score = -1
        setResult(playerPattern, score)
    }    
}

document.addEventListener("DOMContentLoaded", main);