// REDOX — টাইম-অ্যাডাপ্টিভ অটোমেটেড ট্রেডিং ইঞ্জিন (মুভেবল লোগোসহ)
(function() {
    console.log("⚡ REDOX অটো-টাইম ডিটেকশন ও ড্র্যাগেবল বট অ্যাক্টিভেটেড...");

    // আপনার দেওয়া REDOX OFFICIAL লোগোর ইমেজ সোর্স
    const logoUrl = 'https://raw.githubusercontent.com/cryptoworld2655-cloud/redox-bot/main/watermarked_img_15644514880839401954.png'; 
    let ticks = [];
    const TICK_LIMIT = 10;

    // ১. স্ক্রিন ওভারলে (মুভেবল লোগো) তৈরি
    function createREDOXOverlay() {
        if (document.getElementById('redox-floating-bot')) return;
        
        let botContainer = document.createElement('div');
        botContainer.id = 'redox-floating-bot';
        
        // প্রাথমিক সিএসএস স্টাইল (লোগো সাইজ ও গ্লো ইফেক্ট)
        botContainer.style.position = 'fixed';
        botContainer.style.top = '30%';
        botContainer.style.left = '40%';
        botContainer.style.zIndex = '10000';
        botContainer.style.width = '120px';
        botContainer.style.height = '120px';
        botContainer.style.borderRadius = '50%';
        botContainer.style.border = '4px solid #00d2ff';
        botContainer.style.boxShadow = '0 0 25px #00d2ff';
        botContainer.style.backgroundImage = `url('${logoUrl}')`;
        botContainer.style.backgroundSize = 'cover';
        botContainer.style.backgroundPosition = 'center';
        botContainer.style.cursor = 'move';
        botContainer.style.touchAction = 'none'; // মোবাইল স্ক্রলিং আটকানোর জন্য
        botContainer.style.opacity = '0.95';
        botContainer.style.transition = 'border 0.15s ease, box-shadow 0.15s ease';

        document.body.appendChild(botContainer);

        // ২. মোবাইল ও পিসিতে লোগো নড়াচড়া (Drag/Move) করার লজিক
        let isDragging = false;
        let offsetX, offsetY;

        // টাচ বা মাউস স্টার্ট
        function startDrag(e) {
            isDragging = true;
            let clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let clientY = e.touches ? e.touches[0].clientY : e.clientY;
            offsetX = clientX - botContainer.getBoundingClientRect().left;
            offsetY = clientY - botContainer.getBoundingClientRect().top;
        }

        // টাচ বা মাউস মুভ
        function doDrag(e) {
            if (!isDragging) return;
            e.preventDefault();
            let clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            let x = clientX - offsetX;
            let y = clientY - offsetY;
            
            botContainer.style.left = x + 'px';
            botContainer.style.top = y + 'px';
        }

        // টাচ বা মাউস এন্ড
        function stopDrag() {
            isDragging = false;
        }

        // মাউস ইভেন্ট (পিসির জন্য)
        botContainer.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);

        // টাচ ইভেন্ট (মোবাইলের জন্য)
        botContainer.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', doDrag, { passive: false });
        document.addEventListener('touchend', stopDrag);
    }
    
    createREDOXOverlay();

    // ৩. পেজ থেকে ইউজারের সেট করা কারেন্ট টাইম/টাইমফ্রেম রিড করার ফাংশন
    function getUserSetTime() {
        let timeElement = document.querySelector('input[name="time"], [class*="time"] input, [class*="time-value"]');
        if (timeElement) {
            return timeElement.value || timeElement.innerText;
        }
        return "Not Detected";
    }

    // ৪. লাইভ ডেটা প্রসেসিং ও অ্যানালাইসিস
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

        // অ্যানালাইসিস অনুযায়ী সিদ্ধান্ত ও লোগোর বর্ডার কালার চেঞ্জ
        if (velocity > 0.00002 && priceChange > 0) {
            if (redoxLogo) {
                redoxLogo.style.border = '4px solid #00ff00';
                redoxLogo.style.boxShadow = '0 0 35px #00ff00';
            }
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
