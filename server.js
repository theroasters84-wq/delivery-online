<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Roasters Driver</title>
    <style>
        body { background: #000; color: #fff; font-family: sans-serif; text-align: center; margin: 0; display: flex; flex-direction: column; justify-content: center; height: 100vh; }
        .btn { background: #ffc107; color: #000; padding: 20px; border-radius: 12px; font-weight: 900; font-size: 1.5em; border: none; width: 85%; }
        input { width: 80%; padding: 15px; margin: 10px 0; border-radius: 10px; border: 2px solid #333; background: #111; color: #fff; text-align: center; font-size: 1.2em; }
        #login-ui, #active-ui { display: none; width: 100%; }
        .status-dot { color: #0f0; animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0.3; } }
        #accept-layer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ff0000; display: none; flex-direction: column; justify-content: center; align-items: center; z-index: 9999; animation: pulse-bg 0.5s infinite; }
        @keyframes pulse-bg { 0% { background:#ff0000; } 50% { background:#aa0000; } 100% { background:#ff0000; } }
    </style>
</head>
<body>

    <div id="login-ui">
        <h2>DRIVER LOGIN</h2>
        <input type="text" id="shopInput" placeholder="ΟΝΟΜΑ ΜΑΓΑΖΙΟΥ">
        <input type="text" id="nameInput" placeholder="ΤΟ ΟΝΟΜΑ ΣΟΥ">
        <br><br>
        <button class="btn" onclick="login()">ΕΝΑΡΞΗ ΒΑΡΔΙΑΣ</button>
    </div>

    <div id="active-ui">
        <h3 id="disp-shop" style="color:#ffc107; margin:0;"></h3>
        <h1 id="disp-name" style="margin:10px 0;"></h1>
        <p><span class="status-dot">●</span> ΣΕ ΣΥΝΔΕΣΗ</p>
        <br>
        <button onclick="logout()" style="background:none; border:none; color:#555; text-decoration:underline;">Logout / Αλλαγή Στοιχείων</button>
    </div>

    <div id="accept-layer" onclick="acceptOrder()">
        <h1 style="font-size:3em; margin:0;">NEA ΠΑΡΑΓΓΕΛΙΑ!</h1>
        <p style="font-size:1.5em;">ΠΑΤΑ ΓΙΑ ΑΠΟΔΟΧΗ</p>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const alarm = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

        function login() {
            const s = document.getElementById('shopInput').value.trim();
            const n = document.getElementById('nameInput').value.trim();
            if(!s || !n) return alert("Βάλε στοιχεία!");
            localStorage.setItem('driverShop', s);
            localStorage.setItem('driverName', n);
            location.reload();
        }

        function logout() {
            localStorage.clear();
            location.reload();
        }

        function checkAuth() {
            const s = localStorage.getItem('driverShop');
            const n = localStorage.getItem('driverName');

            if(s && n) {
                document.getElementById('active-ui').style.display = 'block';
                document.getElementById('disp-shop').innerText = s.toUpperCase();
                document.getElementById('disp-name').innerText = n;
                socket.emit('driver-login', { shop: s, name: n });
            } else {
                document.getElementById('login-ui').style.display = 'block';
            }
        }

        socket.on('new-order', () => {
            alarm.loop = true;
            alarm.play().catch(()=>{});
            document.getElementById('accept-layer').style.display = 'flex';
            if(navigator.vibrate) navigator.vibrate([500, 500, 500]);
        });

        function acceptOrder() {
            alarm.pause();
            alarm.currentTime = 0;
            document.getElementById('accept-layer').style.display = 'none';
            socket.emit('order-accepted', { 
                driverName: localStorage.getItem('driverName'),
                shopName: localStorage.getItem('driverShop')
            });
        }

        // Heartbeat για να μην κλείνει η σύνδεση
        setInterval(() => { socket.emit('heartbeat'); }, 20000);

        window.onload = checkAuth;
    </script>
</body>
</html>
