let args = discord.variables.__args[0]
let userId = discord.user.id
let resetList = JSON.parse(discord.storage.server.reset_list3 || "{}")

if (userId == "345691161530466304") {
    if (args == "-r" || args == "--reset") {
        const target = discord.variables.__args[1]

        if (!target) {
            const json = JSON.stringify(resetList)
            console.log(json)
            return
        }
    
        const targetId = target.match(/<@(\d+)>/)[1]
        const amount = discord.variables.__args[2] || 10000
        resetList[targetId] = amount
        const json = JSON.stringify(resetList)
        discord.storage.server.reset_list3 = json
        console.log(json)
        return
    }
    if (args == "-c" || args == "--clear") {
        discord.storage.server.reset_list3 = "{}"
        console.log("Reset list has been cleared")
        return
    }
}

if (resetList[userId]) {
    const amount = resetList[userId]
    discord.storage.user.slots_balance = amount
    delete resetList[userId]
    discord.storage.server.reset_list3 = JSON.stringify(resetList)
    console.log("Your balance was reset to", amount)
}

if (args == "-h" || args == "--help") {
    console.log(`
.t slots [bet] [options]
    bet: $1 each, $10,000 max
    options:
        -h, --help: shows this help text
        -b, --balance: shows your balance
\`\`\`
(%) Cherries     3   7   3
(O) Oranges      7   1  10
(@) Grapes       6   1   5
(A) Bells        1  10   1
(U) Horseshoes   2   1   1
(=) Bars         3   1   1
--------------------------
%..             1
%%.             5
%%%            11
OOO, OO=       11
@@@, @@=       13
AAA, AA=       18
UUU            18
===           100
\`\`\`
    `)
}

if (args == "-b" || args == "--balance") {
    const bal = Number(discord.storage.user.slots_balance)
    return console.log("$" + bal.toLocaleString())
}

function getRandomValue(min = 0, max = 100) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
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

if (balance < 0) balance = 10000

let num = Number(args) || 1
let bet = clamp(Math.abs(num), 1, 10000)

let Symbols = {
    CHERRY: ":cherries:",
    ORANGE: ":tangerine:",
    GRAPE: ":grapes:",
    BELL: ":bell:",
    HORSESHOE: ":magnet:",
    BAR: "▃",
}
let slots = {
    [ Symbols.CHERRY ]:      [ 3, 7, 3  ],
    [ Symbols.ORANGE ]:      [ 7, 1, 10 ],
    [ Symbols.GRAPE ]:       [ 6, 1, 5  ],
    [ Symbols.BELL ]:        [ 1, 10, 1 ],
    [ Symbols.HORSESHOE ]:   [ 2, 1, 1  ],
    [ Symbols.BAR ]:         [ 3, 1, 1  ],
}
let payouts = [
    [ [ Symbols.CHERRY ],                                           1 ],
    [ [ Symbols.CHERRY, Symbols.CHERRY ],                           5 ],
    [ [ Symbols.CHERRY, Symbols.CHERRY, Symbols.CHERRY ],          11 ],
    [ [ Symbols.ORANGE, Symbols.ORANGE, Symbols.ORANGE ],          11 ],
    [ [ Symbols.ORANGE, Symbols.ORANGE, Symbols.BAR ],             11 ],
    [ [ Symbols.GRAPE, Symbols.GRAPE, Symbols.GRAPE ],             13 ],
    [ [ Symbols.GRAPE, Symbols.GRAPE, Symbols.BAR ],               13 ],
    [ [ Symbols.BELL, Symbols.BELL, Symbols.BELL ],                18 ],
    [ [ Symbols.BELL, Symbols.BELL, Symbols.BAR ],                 18 ],
    [ [ Symbols.HORSESHOE, Symbols.HORSESHOE, Symbols.HORSESHOE ], 13 ],
    [ [ Symbols.BAR, Symbols.BAR, Symbols.BAR ],                  100 ],
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
            for (let i = 0; i < val[index] * 3; i++) {
                pool[index].push(key)
            }
        }
        const rand = getRandomValue(0, pool[index].length)
        result.push(pool[index][rand])
    }
    return result
}

function warmup() {
    for (let i = 0; i < 100; i++)
        getRandomValue()
}

function run() {
    warmup()

    let slots = spinSlots()
    let payout = getPayout(slots)
    let result = bet * (payout || 0)

    balance -= bet
    discord.storage.user.slots_balance = balance + result

    let output = {
        embed: {
            title: "Slots",
            color: getRandomValue(0, 0xFFFFFF),
            fields: [
                {name: "Bet:", value: "$" + bet.toLocaleString(), inline: true},
                {name: "Slots:", value: slots.join(" "), inline: true},
                {name: "Payout:", value: "$" + result.toLocaleString(), inline: true},
                {name: "New Balance:", value: "$" + (balance + result).toLocaleString(), inline: true},
            ]
        }
    }

    console.log(JSON.stringify(output))
}
run()
