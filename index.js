const args = discord.variables.__args[0]

if (args == "-h" || args == "--help")
    return console.log(".t slots (1-3) (-b || --balance)")
if (args == "-b" || args == "--balance")
    return console.log("$" + Number(discord.storage.user.slots_balance).toLocaleString())

function getRandomValue(min = 0, max = 100) {
  const rand = crypto.getRandomValues(new Uint32Array(1))
  const num = Number("0." + rand)
  return Math.floor(num * (max - min + 1)) + min
}

Array.prototype.equals = function(input) {
    for (let key in input)
        if (this[key] !== input[key])
            return false
    return true
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

let balance = Number(discord.storage.user.slots_balance) || 10000
let num = Number(args) || 1
let bet = clamp(Math.abs(num), 1, 3) * 500

const Symbols = {
    CHERRY: ":cherries:",
    ORANGE: ":tangerine:",
    GRAPE: ":grapes:",
    BELL: ":bell:",
    HORSESHOE: ":magnet:",
    BAR: "▃",
}
const slots = {
    [Symbols.CHERRY]: [5, 7, 3],
    [Symbols.ORANGE]: [4, 1, 10],
    [Symbols.GRAPE]: [6, 1, 4],
    [Symbols.BELL]: [1, 9, 1],
    [Symbols.HORSESHOE]: [2, 1, 1],
    [Symbols.BAR]: [2, 1, 1],
}
const payouts = [
    [[Symbols.CHERRY], 3],
    [[Symbols.CHERRY, Symbols.CHERRY], 5],
    [[Symbols.CHERRY, Symbols.CHERRY, Symbols.CHERRY], 11],
    [[Symbols.ORANGE, Symbols.ORANGE, Symbols.ORANGE], 11],
    [[Symbols.ORANGE, Symbols.ORANGE, Symbols.BAR], 11],
    [[Symbols.GRAPE, Symbols.GRAPE, Symbols.GRAPE], 13],
    [[Symbols.GRAPE, Symbols.GRAPE, Symbols.BAR], 13],
    [[Symbols.BELL, Symbols.BELL, Symbols.BELL], 18],
    [[Symbols.BELL, Symbols.BELL, Symbols.BAR], 18],
    [[Symbols.HORSESHOE, Symbols.HORSESHOE, Symbols.HORSESHOE], 13],
    [[Symbols.BAR, Symbols.BAR, Symbols.BAR], 100],
]

function getPayout(array) {
    let result = []
    let bars = []
    let cherries = 0

    for (let val of array) {
        if (val === Symbols.BAR) {
            bars.push(Symbols.BAR)
        } else if (val === Symbols.CHERRY) {
            cherries++
        } else {
            result.push(val)
        }
    }

    if (cherries > 0) {
        return payouts[cherries - 1][1]
    }

    for (let i = 0; i < bars.length; i++) {
        result.push(Symbols.BAR)
    }

    for (let payout of payouts) {
        if (result.equals(payout[0])) {
            return payout[1]
        }
    }
}

function spinSlots() {
    let pool = [[], [], []]
    let result = []

    for (let index = 0; index < 3; index++) {
        for (let key in slots) {
            const val = slots[key]
            for (let i = 0; i < val[index]; i++) {
                pool[index].push(key)
            }
        }
        const rand = getRandomValue(0, pool[index].length)
        result.push(pool[index][rand])
    }
    return result
}

function run() {
    const slots = spinSlots()
    const payout = getPayout(slots)
    const result = bet * (payout || 0)

    balance -= bet
    console.log("Bet:", "$" + bet.toLocaleString())
    console.log("Slots:", slots.join(" "))
    console.log("Payout:", "$" + result.toLocaleString())
    console.log("New Balance:", "$" + (balance + result).toLocaleString())
    discord.storage.user.slots_balance = balance + result
    getPayout(slots)
}
run()
