
// === Collapse Codex :: Coinbase Auto Transfer Script ===
// Requires: npm install coinbase

const Client = require('coinbase').Client;

// 🔐 INSERT YOUR KEYS HERE
const client = new Client({
  apiKey: 'YOUR_COINBASE_API_KEY_HERE',
  apiSecret: 'YOUR_COINBASE_API_SECRET_HERE'
});

// === CONFIGURE YOUR RECIPIENT ADDRESSES ===
const config = {
  robinhoodBTC: 'YOUR_ROBINHOOD_BTC_ADDRESS',
  cashAppBTC: 'YOUR_CASHAPP_BTC_ADDRESS',
  thresholdBTC: 0.00005 // Minimum BTC to trigger transfer
};

function distributeBTC(totalBTC) {
  const robinhoodAmount = (totalBTC * 0.4).toFixed(8);
  const cashAppAmount = (totalBTC * 0.4).toFixed(8);
  const retainedAmount = (totalBTC * 0.2).toFixed(8);

  client.getAccounts({}, (err, accounts) => {
    if (err) return console.error("Account fetch error:", err);

    const btcWallet = accounts.find(acc => acc.currency === 'BTC');
    if (!btcWallet) return console.error("BTC wallet not found.");

    const transfers = [
      { to: config.robinhoodBTC, amount: robinhoodAmount },
      { to: config.cashAppBTC, amount: cashAppAmount }
    ];

    transfers.forEach(t => {
      btcWallet.sendMoney({
        to: t.to,
        amount: t.amount,
        currency: 'BTC',
        description: 'Collapse Codex Yield Transfer'
      }, (err, tx) => {
        if (err) {
          console.error("Transfer failed:", err);
        } else {
          console.log("✅ Sent", t.amount, "BTC to", t.to, "| TX:", tx.id);
        }
      });
    });

    console.log("🪙 Retained in Coinbase wallet:", retainedAmount, "BTC");
  });
}

const currentSymbolicYieldBTC = 0.000126;
if (currentSymbolicYieldBTC >= config.thresholdBTC) {
  distributeBTC(currentSymbolicYieldBTC);
} else {
  console.log("⏳ Yield too low to transfer yet:", currentSymbolicYieldBTC, "BTC");
}
