// REDOX — টাইম-অ্যাডাপ্টিভ অটোমেটেড ট্রেডিং engine
(function() {
    console.log("⚡ REDOX অটো-টাইম ডিটেকশন বট অ্যাক্টিভেটেড...");

    const logoUrl = 'https://picsum.photos/200'; 
    let ticks = [];
    const TICK_LIMIT = 10;

    // ১. স্ক্রিন ওভারলে তৈরি
    function createREDOXOverlay() {
        if (document.getElementById('redox-floating-bot')) return;
        let botContainer = document.createElement('div');
        botContainer.id = 'redox-floating-bot';
        botContainer.style.position = 'fixed';
        botContainer.style.top = '40%';
        botContainer.style.left = '50%';
        botContainer.style.transform = 'translate(-50%, -50%)';
        botContainer.style.zIndex = '10000';
        botContainer.style.width = '120px';
        botContainer.style.height = '120px';
        botContainer.style.borderRadius = '50%';
        botContainer.style.border = '4px solid #00d2ff';
        botContainer.style.boxShadow = '0 0 25px #00d2ff';
        botContainer.style.backgroundImage = `url('${logoUrl}')`;
        botContainer.style.backgroundSize = 'cover';
        botContainer.style.backgroundPosition = 'center';
        botContainer.style.pointerEvents = 'none';
        botContainer.style.opacity = '0.95';
        botContainer.style.transition = 'all 0.15s ease';
        document.body.appendChild(botContainer);
    }
    createREDOXOverlay();

    // ২. পেজ থেকে ইউজারের সেট করা কারেন্ট টাইম/টাইমফ্রেম রিড করার ফাংশন
    function getUserSetTime() {
        // Quotex এর টাইম ইনপুট ফিল্ড বা টেক্সট এলিমেন্ট খোঁজা
        let timeElement = document.querySelector('input[name="time"], [class*="time"] input, [class*="time-value"]');
        if (timeElement) {
            return timeElement.value || timeElement.innerText; // ইউজারের সেট করা টাইম (যেমন: 00:05, 1 min)
        }
        return "Not Detected";
    }

    // ৩. লাইভ ডেটা প্রসেসিং ও অ্যানালাইসিস
    if (!window.originalWebSocket) {
        window.originalWebSocket = window.WebSocket;
        window.WebSocket = function(...args) {
            const ws = new window.originalWebSocket(...args);
            ws.addEventListener('message', function(event) {
                try {
                    let data = JSON.parse(event.data);
                    if (data && data.price) {
                        processREDOXTick(parseFloat(data.price));
                    }
                } catch (e) {}
            });
            return ws;
        };
    }

    function processREDOXTick(currentPrice) {
        ticks.push(currentPrice);
        if (ticks.length > TICK_LIMIT) ticks.shift();
        if (ticks.length < 5) return;

        // ইউজার বর্তমানে কত টাইম সেট করে রেখেছে তা অ্যানালাইসিসের সময় রিড করা
        let activeTimeFrame = getUserSetTime();
        console.log(`[REDOX] স্ক্যানড টাইমফ্রে্ম: ${activeTimeFrame} | Price: ${currentPrice}`);

        let lastPrice = ticks[ticks.length - 2];
        let priceChange = currentPrice - lastPrice;
        
        let sumChanges = 0;
        for(let i = 1; i < ticks.length; i++) {
            sumChanges += (ticks[i] - ticks[i-1]);
        }
        let velocity = sumChanges / (ticks.length - 1);

        let redoxLogo = document.getElementById('redox-floating-bot');

        // অ্যানালাইসিস অনুযায়ী সিদ্ধান্ত ও ট্রেড এক্সিকিউশন
        if (velocity > 0.00002 && priceChange > 0) {
            if (redoxLogo) {
                redoxLogo.style.border = '4px solid #00ff00';
                redoxLogo.style.boxShadow = '0 0 35px #00ff00';
            }
            // টাইমফ্রেম অনুযায়ী চাইলে এখানে আলাদা লজিক কন্ডিশন দেওয়া যায়
            executeREDOXTrade('UP');
        } else if (velocity < -0.00002 && priceChange < 0) {
            if (redoxLogo) {
                redoxLogo.style.border = '4px solid #ff0000';
                redoxLogo.style.boxShadow = '0 0 35px #ff0000';
            }
            executeREDOXTrade('DOWN');
        } else {
            if (redoxLogo) {
                redoxLogo.style.border = '4px solid #00d2ff';
                redoxLogo.style.boxShadow = '0 0 25px #00d2ff';
            }
        }
    }

    function executeREDOXTrade(direction) {
        let btnClass = direction === 'UP' ? '.button-call' : '.button-put';
        let button = document.querySelector(btnClass) || 
                     document.querySelector(`[class*="${direction.toLowerCase()}"], [id*="${direction.toLowerCase()}"]`);
        
        if (button) {
            const clickEvent = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
            button.dispatchEvent(clickEvent);
            console.log(`🚀 [REDOX]: ${direction} Trade Executed!`);
        }
    }
})();
