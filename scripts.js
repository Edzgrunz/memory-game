
const CARDS_FRONT = [
    ['🃡', '🃢', '🃣', '🃤', '🃥', '🃦', '🃧', '🃨', '🃩', '🃪', '🃫', '🃬', '🃭', '🃮'],
    ['🂡', '🂢', '🂣', '🂤', '🂥', '🂦', '🂧', '🂨', '🂩', '🂪', '🂫', '🂬', '🂭', '🂮'],
    ['🂱', '🂲', '🂳', '🂴', '🂵', '🂶', '🂷', '🂸', '🂹', '🂺', '🂻', '🂼', '🂽', '🂾'],
    ['🃁', '🃂', '🃃', '🃄', '🃅', '🃆', '🃇', '🃈', '🃉', '🃊', '🃋', '🃌', '🃍', '🃎'],
    ['🃑', '🃒', '🃓', '🃔', '🃕', '🃖', '🃗', '🃘', '🃙', '🃚', '🃛', '🃜', '🃝', '🃞'],
],
    CARD_BACKGROUNDS = ['🂠', '🃠', '🂿', '🃟'],
    GROUP_NUMBER = 'data-group',
    CARD_SIZE_UNIT = 'em',
    numberOfGroups = linkElement(document.getElementById('group-number')),
    numberOfCardsForGroup = linkElement(document.getElementById('card-group-number')),
    numberOfGroupsToFind = linkElement(document.getElementById('score')),
    numberOfTries = linkElement(document.getElementById('tries')),
    cardSize = linkElement(document.getElementById('card-size')),
    cardBackground = linkElement(document.getElementById('card-background'), true),
    cardFrontIndex = linkElement(document.getElementById('card-front')),
    redSliderValue = linkElement(document.getElementById('slider-value-red')),
    redSliderBar = document.getElementById('slider-bar-red'),
    redSliderButton = document.getElementById('slider-btn-red'),
    greenSliderValue = linkElement(document.getElementById('slider-value-green')),
    greenSliderBar = document.getElementById('slider-bar-green'),
    greenSliderButton = document.getElementById('slider-btn-green'),
    blueSliderValue = linkElement(document.getElementById('slider-value-blue')),
    blueSliderBar = document.getElementById('slider-bar-blue'),
    blueSliderButton = document.getElementById('slider-btn-blue'),
    gameContainer = document.getElementById('game'),
    winContainer = document.getElementById('win-container')

function linkElement(element, isString) {
    return {
        get: () => isString ? element.innerHTML : parseInt(element.innerHTML),
        set: (value) => element.innerHTML = value,
        add: (value) => element.innerHTML = parseInt(element.innerHTML) + value,
        element: () => element
    }
}

function getCardFront() {
    return CARDS_FRONT[cardFrontIndex.get()]
}

/* ---------------------------------------------------------------------------------------------------*/

let cards = [],
    selectedCards = [],
    foundCards = [],
    win = false,
    miss = false

/* ------- GRAPHIC MENU----------------------------------------------------------------------------*/

function addCardSize() {
    cardSize.add(1)
    resizeCards()
}

function removeCardSize() {
    cardSize.add(-1)
    resizeCards()
}

function resizeCards() {
    cards.forEach(card => card.style.fontSize = cardSize.get() + CARD_SIZE_UNIT)
}

function lastCardBackground() {
    const index = CARD_BACKGROUNDS.findIndex(v => v === cardBackground.get()) - 1

    if (index >= 0) {
        cardBackground.set(CARD_BACKGROUNDS[index])
        cards.forEach(card => {
            card.innerHTML = card.innerHTML === CARD_BACKGROUNDS[index + 1] ?
                CARD_BACKGROUNDS[index] : card.innerHTML
        })
    }
}

function nextCardBackground() {
    const index = CARD_BACKGROUNDS.findIndex(v => v === cardBackground.get()) + 1

    if (index < CARD_BACKGROUNDS.length) {
        cardBackground.set(CARD_BACKGROUNDS[index])
        cards.forEach(card => {
            card.innerHTML = card.innerHTML === CARD_BACKGROUNDS[index - 1] ?
                CARD_BACKGROUNDS[index] : card.innerHTML
        })
    }
}

function lastCardFront() {
    if (cardFrontIndex.get() > 0) {
        cardFrontIndex.add(-1)
        cards.forEach(card => {
            card.innerHTML = card.innerHTML !== cardBackground.get() ?
                getCardFront()[card[GROUP_NUMBER]] : card.innerHTML
        })
    }
}

function nextCardFront() {
    if (cardFrontIndex.get() < CARDS_FRONT.length) {
        cardFrontIndex.add(1)
        cards.forEach(card => {
            card.innerHTML = card.innerHTML !== cardBackground.get() ?
                getCardFront()[card[GROUP_NUMBER]] : card.innerHTML
        })
    }
}

/* ------- GAME MENU --------------------------------------------------------------------------------*/

function setGame(_numberOfGroups, _numberOfCardsForGroup) {
    numberOfGroups.set(Math.min(getCardFront().length, _numberOfGroups))
    numberOfCardsForGroup.set(Math.max(2, _numberOfCardsForGroup))

    cards = Array.from({ length: numberOfGroups.get() }).reduce((acc, _, groupNumber) => {
        Array.from({ length: numberOfCardsForGroup.get() }).forEach(() => {
            acc.push(createCard(groupNumber))
        })
        return acc;
    }, [])

    startGame(cards)
}

function setToEasy() {
    setGame(3, 2)
}

function setToMedium() {
    setGame(9, 3)
}

function setToHard() {
    setGame(18, 4)
}

function addGroup() {
    if (numberOfGroups.get() < getCardFront().length) {
        const emptyArray = Array.from({ length: numberOfCardsForGroup.get() })

        cards = [...cards, ...emptyArray.map(() => createCard(numberOfGroups.get()))]
        numberOfGroups.set(cards.length / numberOfCardsForGroup.get())
        startGame(cards)
    }
}

function removeGroup() {
    if (cards.length > 0) {
        cards = cards.filter(card => card[GROUP_NUMBER] !== numberOfGroups.get() - 1)
        numberOfGroups.set(cards.length / numberOfCardsForGroup.get())
        startGame(cards)
    }
}

function addCardToGroup() {
    const groupNumbers = Array.from({ length: numberOfGroups.get() }, (_, i) => i)

    cards = [...cards, ...groupNumbers.map(groupNumber => createCard(groupNumber))]
    numberOfCardsForGroup.add(1)
    startGame(cards)
}

function removeCardFromGroup() {
    if (numberOfCardsForGroup.get() > 2) {
        const groupsRemoveds = Array.from({ length: numberOfCardsForGroup.get() })

        cards = cards.filter(card => {
            const hasCardBeenRemovedFromGroup = groupsRemoveds.includes(card[GROUP_NUMBER])
            if (!hasCardBeenRemovedFromGroup) {
                groupsRemoveds.push(card[GROUP_NUMBER])
                return false
            }
            return true
        })

        numberOfCardsForGroup.add(-1)
        startGame(cards)
    }
}

function createCard(groupNumber) {
    const card = document.createElement('button'),
        cardWidth = Math.max(0, Math.min(100, cardSize.get()))

    card.innerHTML = cardBackground.get()
    card.classList = 'card flip'
    card[GROUP_NUMBER] = groupNumber
    card.style.fontSize = cardWidth + CARD_SIZE_UNIT;

    card.addEventListener('click', async () => {
        if (miss) {
            selectedCards.forEach((selectedCard) => {
                selectedCard.innerHTML = cardBackground.get()
                selectedCards = []
            })
            miss = false
        }

        if (card.innerHTML !== cardBackground.get()) { return }
        card.innerHTML = getCardFront()[card[GROUP_NUMBER]] || 'X'
        numberOfTries.add(1)

        if (selectedCards[0]) {
            if (card[GROUP_NUMBER] === selectedCards[0]?.[GROUP_NUMBER]) {
                if ((selectedCards.length + 1) === numberOfCardsForGroup.get()) {
                    foundCards = [...foundCards, ...selectedCards, card]
                    selectedCards = []
                    numberOfGroupsToFind.add(-1)

                    if (numberOfGroupsToFind.get() === 0) {
                        win = true
                        winContainer.style.visibility = 'visible'
                    }
                    return;
                }
            }
            else { miss = true }
        }
        selectedCards.push(card)
    })
    return card
}

function startGame(cards) {
    selectedCards = []
    foundCards = []
    win = false
    winContainer.style.visibility = 'hidden'
    numberOfGroupsToFind.set(numberOfGroups.get())
    numberOfTries.set(0)

    shuffle(cards)
    gameContainer.innerHTML = null
    cards.forEach(card => {
        card.innerHTML = cardBackground.get()
        gameContainer.appendChild(card)
    })
}

function restartGame() {
    setGame(numberOfGroups.get(), numberOfCardsForGroup.get())
}

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

/* --------- SLIDER -------------------------------------------------------------------------------*/

function startSlider(value, bar, button, min, max) {
    value.set(0)

    button.addEventListener('mousedown', () => {
        button['data-slider-press'] = true
    })

    document.addEventListener('mousemove', (e) => {
        const barBox = bar.getBoundingClientRect()
        buttonBox = button.getBoundingClientRect()
        if (button['data-slider-press']) {
            const _mouseX = (e.clientX - barBox.x) / barBox.width,
                mouseX = Math.max(0, Math.min(1, _mouseX)),
                buttonMov = mouseX * (barBox.width - buttonBox.width)

            button.style['margin-left'] = buttonMov + 'px'
            value.set(Math.floor((mouseX * max) - min))

            const colors = {
                r: redSliderValue.get(),
                g: greenSliderValue.get(),
                b: blueSliderValue.get()
            }
            cards.forEach(card => {
                card.style.color = `rgba(${colors.r}, ${colors.g}, ${colors.b})`
            })
        }
    })

    document.addEventListener('mouseup', () => {
        button['data-slider-press'] = false
    })
}

/* ---------- SETUP -------------------------------------------------------------------------------*/

startSlider(redSliderValue, redSliderBar, redSliderButton, 0, 255)
startSlider(greenSliderValue, greenSliderBar, greenSliderButton, 0, 255)
startSlider(blueSliderValue, blueSliderBar, blueSliderButton, 0, 255)
setGame(numberOfGroups.get(), numberOfCardsForGroup.get())
