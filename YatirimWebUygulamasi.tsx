import { useState, useEffect } from "react";

const stockList = ["STK1", "STK2", "STK3", "STK4"];
const roboAvatar = "https://cdn-icons-png.flaticon.com/512/4712/4712100.png";

type StockSymbol = "STK1" | "STK2" | "STK3" | "STK4";

type StockMap = {
  [key in StockSymbol]: number;
};

export default function InvestmentApp() {
  const [userName, setUserName] = useState<string | null>(null);
  const [balance, setBalance] = useState(1000);
  const [stocks, setStocks] = useState<StockMap>({ STK1: 0, STK2: 0, STK3: 0, STK4: 0 });
  const [prices, setPrices] = useState<StockMap>({ STK1: 100, STK2: 150, STK3: 200, STK4: 250 });
  const [iterations, setIterations] = useState(0);
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: 'Merhaba! Ben RoboAdvisor. Nasılsın? Sana nasıl yardımcı olabilirim?' },
    { sender: 'bot', text: 'Hangi hisse senediyle ilgileniyorsun veya tavsiye mi istiyorsun?' }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<StockMap>({ STK1: 1, STK2: 1, STK3: 1, STK4: 1 });
  const [error, setError] = useState("");
  const maxIterations = 12;
  const [currentTab, setCurrentTab] = useState<'chatbot' | 'stocks'>('chatbot');

  useEffect(() => {
    const interval = setInterval(() => {
      const newPrices: StockMap = { ...prices };
      for (const symbol of stockList) {
        const typedSymbol = symbol as StockSymbol;
        const change = (Math.random() * 20 - 10).toFixed(2);
        newPrices[typedSymbol] = Math.max(1, parseFloat((newPrices[typedSymbol] + parseFloat(change)).toFixed(2)));
      }
      setPrices(newPrices);
    }, 5000);
    return () => clearInterval(interval);
  }, [prices]);

  const buyStock = (symbol: StockSymbol) => {
    const quantity = quantities[symbol];
    const totalCost = prices[symbol] * quantity;
    if (iterations >= maxIterations || quantity <= 0) return;
    if (balance >= totalCost) {
      setBalance((prev) => Math.max(0, prev - totalCost));
      setStocks((prev) => ({ ...prev, [symbol]: prev[symbol] + quantity }));
      setIterations((prev) => prev + 1);
      setHistory((prev) => [...prev, `🟢 ${symbol} hissesi alındı (${quantity} adet, toplam ${totalCost.toFixed(2)} TL)`]);
      setError("");
    } else {
      setError("Yetersiz bakiye.");
    }
  };

  const sellStock = (symbol: StockSymbol) => {
    const quantity = quantities[symbol];
    const totalGain = prices[symbol] * quantity;
    if (iterations >= maxIterations || quantity <= 0) return;
    if (stocks[symbol] >= quantity) {
      setBalance((prev) => prev + totalGain);
      setStocks((prev) => ({ ...prev, [symbol]: prev[symbol] - quantity }));
      setIterations((prev) => prev + 1);
      setHistory((prev) => [...prev, `🔴 ${symbol} hissesi satıldı (${quantity} adet, toplam ${totalGain.toFixed(2)} TL)`]);
      setError("");
    } else {
      setError(`${symbol} hissesinden elinizde yeterli miktarda yok.`);
    }
  };

  const handleChat = () => {
    if (!userName) {
      setUserName(inputMessage.trim());
      setChatHistory(prev => [...prev, { sender: "user", text: inputMessage }, { sender: "bot", text: `Memnun oldum ${inputMessage}! Artık yatırım tavsiyesi verebilirim.` }]);
      setInputMessage("");
      return;
    }
    if (inputMessage.trim() === "") return;
    const lower = inputMessage.toLowerCase();
    let botResponse = "Lütfen geçerli bir hisse senedi adı yazın veya ne yapmak istediğinizi belirtin.";

    if (lower.includes("selam") || lower.includes("merhaba")) {
      botResponse = "Merhaba! Sana nasıl yardımcı olabilirim?";
    } else if (lower.includes("hangi hisse") && lower.includes("al")) {
      const cheapest = Object.entries(prices).sort((a, b) => a[1] - b[1])[0];
      botResponse = `Şu anda en uygun fiyatlı hisse: ${cheapest[0]} (${cheapest[1]} TL)`;
    } else if (lower.includes("hangi") && lower.includes("sat")) {
      const mostOwned = Object.entries(stocks).sort((a, b) => b[1] - a[1])[0];
      botResponse = `Elinizde en çok olan hisse: ${mostOwned[0]} (${mostOwned[1]} adet)`;
    } else if (lower.includes("yatırım") || lower.includes("öneri") || lower.includes("ne yapmalıyım")) {
      const suggestion = stockList[Math.floor(Math.random() * stockList.length)];
      const risky = stockList[Math.floor(Math.random() * stockList.length)];
      botResponse = `Şu an ${suggestion} hissesi çok cazip, bunu alabilirsin. Ancak ${risky} hissesi piyasadaki dalgalanmalardan olumsuz etkileniyor, bunu satmanı tavsiye ederim.`;
    } else if (lower.includes("ne kadar") && lower.includes("al")) {
      const suggestions = stockList.map((symbol) => {
        const affordable = Math.floor(balance / prices[symbol as StockSymbol]);
        const random = Math.min(Math.max(1, Math.floor(Math.random() * affordable)), 10);
        return `${symbol}: ${random} adet`;
      });
      botResponse = `Şu an alabileceğin tahmini miktarlar:\n${suggestions.join(" | ")}`;
    } else if (lower.includes("ne kadar") && lower.includes("sat")) {
      const suggestions = stockList.map((symbol) => {
        const owned = stocks[symbol as StockSymbol];
        const random = Math.min(Math.max(1, Math.floor(Math.random() * (owned + 1))), owned);
        return `${symbol}: ${random} adet`;
      });
      botResponse = `Elindeki hisselerden satabileceğin tahmini miktarlar:\n${suggestions.join(" | ")}`;
    } else {
      for (const symbol of stockList) {
        const typedSymbol = symbol as StockSymbol;
        if (inputMessage.toUpperCase().includes(symbol)) {
          botResponse = `${symbol} fiyatı şu anda ${prices[typedSymbol]} TL. Elinizde ${stocks[typedSymbol]} adet var.`;
          break;
        }
      }
    }

    setChatHistory(prev => [...prev, { sender: "user", text: inputMessage }, { sender: "bot", text: `${userName ? `${userName}, ` : ''}${botResponse}` }]);
    setInputMessage("");
  };

  const handleQuantityChange = (symbol: StockSymbol, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      setQuantities({ ...quantities, [symbol]: num });
    }
  };

  return (
    <div className="p-2 md:p-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <button className={`px-4 py-2 rounded ${currentTab === 'chatbot' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setCurrentTab('chatbot')}>Chatbot</button>
        <button className={`px-4 py-2 rounded ${currentTab === 'stocks' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setCurrentTab('stocks')}>Yatırım Araçları</button>
      </div>

      {currentTab === 'stocks' && (
        <div id="stocks" className="mt-6 space-y-4">
          {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-2">{error}</div>}
          <div className="text-lg md:text-xl font-bold">Bakiye: {balance.toFixed(2)} TL</div>
          <div className="text-sm">Kalan İşlem Hakkı: {maxIterations - iterations}</div>

          {stockList.map((symbol) => {
            const typedSymbol = symbol as StockSymbol;
            return (
              <div key={symbol} className="bg-white shadow rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="text-base md:text-lg font-semibold">{symbol}</div>
                  <div>Fiyat: {prices[typedSymbol]} TL</div>
                  <div>Adet: {stocks[typedSymbol]}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={quantities[typedSymbol]}
                    onChange={(e) => handleQuantityChange(typedSymbol, e.target.value)}
                    className="border rounded p-1 w-16"
                  />
                  <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => buyStock(typedSymbol)}>Al</button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => sellStock(typedSymbol)}>Sat</button>
                </div>
              </div>
            );
          })}

          <div className="bg-white shadow rounded p-4">
            <div className="font-semibold mb-2">📜 İşlem Geçmişi</div>
            {history.length === 0 && <div>Henüz işlem yapılmadı.</div>}
            <ul className="list-disc pl-4 text-sm">
              {history.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {currentTab === 'chatbot' && (
        <div id="chatbot" className="mt-10">
          <div className="flex items-center gap-2 mb-2">
            <img src={roboAvatar} alt="roboadvisor" className="w-10 h-10 rounded-full" />
            <span className="font-bold">RoboAdvisor</span>
          </div>
          <div className="bg-white shadow rounded p-4 h-64 overflow-auto space-y-2 text-sm md:text-base">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`max-w-[70%] p-2 rounded-lg mb-1 ${msg.sender === 'user' ? 'bg-blue-100 ml-auto text-right' : 'bg-gray-100 mr-auto text-left'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row mt-2 space-y-2 md:space-y-0 md:space-x-2">
            <input
              className="border rounded p-2 w-full"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={userName ? "Hisse senedi sor, öneri iste, selamlaş..." : "Önce adını yazar mısın?"}
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleChat}>Gönder</button>
          </div>
        </div>
      )}
    </div>
  );

  {currentTab === 'chatbot' && (
    <div id="chatbot" className="mt-10">
      <div className="flex justify-center mb-4">
        <img src={roboAvatar} alt="RoboAdvisor" className="w-6 h-6 rounded-full object-contain" />
      </div>
      <div className="bg-white shadow rounded p-4 h-64 overflow-auto space-y-3 text-sm md:text-base">
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end`}
          >
            {msg.sender === 'bot' && (
              <img
                src={roboAvatar}
                alt="robo"
                className="w-6 h-6 rounded-full mr-2"
              />
            )}
            <div
              className={`relative max-w-[70%] px-4 py-2 rounded-xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }`}
            >
              {msg.text}
              <div
                className={`absolute w-3 h-3 rotate-45 ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 right-0 bottom-0 translate-x-1/2 translate-y-1/2'
                    : 'bg-gray-200 left-0 bottom-0 -translate-x-1/2 translate-y-1/2'
                }`}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row mt-2 space-y-2 md:space-y-0 md:space-x-2">
        <input
          className="border rounded p-2 w-full"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={userName ? "Hisse senedi sor, öneri iste, selamlaş..." : "Önce adını yazar mısın?"}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleChat}>Gönder</button>
      </div>
    </div>
  )}
  

// ... (geri kalan kodlar aynı kalıyor)

}