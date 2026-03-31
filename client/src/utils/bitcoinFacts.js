export const BITCOIN_FACTS = [
    "Bitcoin's genesis block was mined on January 3, 2009 by Satoshi Nakamoto.",
    "There will only ever be 21 million Bitcoin in existence.",
    "The first real-world Bitcoin transaction bought 2 pizzas for 10,000 BTC in 2010.",
    "Bitcoin halving occurs every 210,000 blocks, reducing the mining reward by half.",
    "Satoshi Nakamoto's true identity has never been revealed.",
    "Bitcoin operates 24/7 — it has never gone offline since its launch in 2009.",
    "Over 19.8 million Bitcoin have already been mined.",
    "The smallest unit of Bitcoin is called a Satoshi — one hundred millionth of a BTC.",
];

export const getRandomFact = () => {
    return BITCOIN_FACTS[Math.floor(Math.random() * BITCOIN_FACTS.length)];
};