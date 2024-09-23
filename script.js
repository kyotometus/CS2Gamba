const PriceKey = {
    EUR: 2.35,
    USD: 2.50
};

const currencyMap = {
    0: 'EUR',
    1: 'USD'
};

const RarityDropRates = {
    ExceedinglyRare: 0.26,
    Covert: 0.64,
    Classified: 3.2,
    Restricted: 15.98,
    MilSpec: 79.92
};

const RarityColors = {
    ExceedinglyRare: '#ff4500',  // Orange Red
    Covert: '#d32f2f',           // Dark Red
    Classified: '#9c27b0',       // Purple
    Restricted: '#1976d2',       // Blue
    MilSpec: '#757575'           // Grey
};

let fullLog = [];
let itemCounts = {};

// Fetch case content from the JSON file
async function getCaseContent() {
    try {
        const response = await fetch('./assets/cases.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        initializeItemCounts(data.case.skins);
        return data.case.skins;
    } catch (error) {
        console.error("Error fetching case content:", error);
        return [];
    }
}

// Initialize item counts to 0 for each skin
function initializeItemCounts(skins) {
    skins.forEach(skin => {
        itemCounts[skin.name] = 0;
    });
}

// Generate a random rarity based on drop rates
function getRandomRarity() {
    const random = Math.random() * 100;
    let cumulativeProbability = 0;

    for (const rarity in RarityDropRates) {
        cumulativeProbability += RarityDropRates[rarity];
        if (random <= cumulativeProbability) {
            return rarity;
        }
    }
}

// Get a random item from the selected rarity pool
function getRandomItemFromRarity(rarity, skins) {
    // Filter skins that match the rarity
    const itemsOfRarity = skins.filter(skin => skin.rarity === rarity);

    if (itemsOfRarity.length === 0) {
        console.error(`No items found for rarity: ${rarity}`);
        return null;
    }

    const randomIndex = Math.floor(Math.random() * itemsOfRarity.length);
    return itemsOfRarity[randomIndex];
}

// Generate rarity counts dynamically based on the drop rates and select items
function generateRarityAndItemCounts(numOfTimes, skins) {
    const rarityCounts = Object.fromEntries(
        Object.keys(RarityDropRates).map(rarity => [rarity, 0])
    );

    for (let i = 0; i < numOfTimes; i++) {
        const rarity = getRandomRarity();
        rarityCounts[rarity] += 1;

        const selectedItem = getRandomItemFromRarity(rarity, skins);

        if (selectedItem) {
            itemCounts[selectedItem.name] += 1;
            fullLog.push({ caseNumber: i + 1, rarity, item: selectedItem.name });
        } else {
            console.error(`Failed to select item for case ${i + 1}`);
        }
    }

    return rarityCounts;
}

// Calculate the price based on the number of openings and selected currency
function calculateFinalPrice(numOfOpening, currency) {
    if (currency && PriceKey.hasOwnProperty(currency)) {
        return PriceKey[currency] * numOfOpening;
    } else {
        console.error("Currency not supported or invalid selection.");
        return 0;
    }
}

// Main function to calculate case openings and render the result with colors
async function calculateCaseOpening() {
    const currencySelector = document.getElementById("currencySelector");
    const selectedValue = currencySelector.value;
    const numOfOpening = parseInt(document.getElementById("numOfOpeningInput").value, 10);
    const currency = currencyMap[selectedValue];

    if (isNaN(numOfOpening) || numOfOpening <= 0) {
        console.error("Invalid number of openings.");
        return;
    }

    const finalPrice = calculateFinalPrice(numOfOpening, currency);
    const skins = await getCaseContent();
    const rarityCounts = generateRarityAndItemCounts(numOfOpening, skins);

    let responseBody = document.getElementById("responseContainer");
    responseBody.innerHTML = ""; // Clear previous content

    for (const rarity in rarityCounts) {
        if (rarityCounts[rarity] > 0) {
            let rarityElement = document.createElement('p');
            rarityElement.innerHTML = `${rarity}: ${rarityCounts[rarity]}`;
            rarityElement.style.color = RarityColors[rarity];
            responseBody.appendChild(rarityElement);
        }
    }

    // Display the final price
    let priceElement = document.createElement('p');
    priceElement.innerHTML = `Total Price: ${currency} ${finalPrice.toFixed(2)}`;
    responseBody.appendChild(priceElement);

    // Display item counts
    for (const item in itemCounts) {
        if (itemCounts[item] > 0) {
            let itemElement = document.createElement('p');
            itemElement.innerHTML = `${item}: ${itemCounts[item]}`;
            responseBody.appendChild(itemElement);
        }
    }

    renderFullLog();
}

// Function to toggle the visibility of the full log container
function toggleLogVisibility() {
    let fullLogContainer = document.getElementById("fullLogContainer");

    if (fullLogContainer.style.display === "none" || fullLogContainer.style.display === "") {
        fullLogContainer.style.display = "block"; // Show the log
    } else {
        fullLogContainer.style.display = "none"; // Hide the log
    }
}

// Sample function to render the log (for testing purposes)
// WE NEED TO FIX THISSSSSSSSSSSSSSSSSSSSSSOIDHA OIDHAW OD
function renderFullLog() {
    let fullLogContainer = document.getElementById("fullLogContainer");

    fullLogContainer.innerHTML = "";

    fullLog.forEach((logEntry) => {
        let logElement = document.createElement('p');
        logElement.innerHTML = `Case ${logEntry.caseNumber}: ${logEntry.rarity} - ${logEntry.item}`;
        logElement.style.color = RarityColors[logEntry.rarity]; // Set the color based on rarity
        fullLogContainer.appendChild(logElement);
    });
}

