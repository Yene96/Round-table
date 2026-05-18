const WebSocket = require('ws');

// Check if ws module is available, if not, provide helpful error
try {
    const wss = new WebSocket.Server({ port: 8080 });
    
    const providers = [];
    const rooms = {};

    console.log('🌐 Universal Router started on ws://localhost:8080');

    wss.on('connection', (ws) => {
        const providerId = `provider-${Math.random().toString(36).substr(2, 9)}`;
        console.log(`✅ New Provider connected: ${providerId}`);
        
        providers.push({ id: providerId, ws, busy: false });

        ws.on('message', (message) => {
            const data = JSON.parse(message);
            console.log(`📩 From ${providerId}:`, data.type, data.payload);

            if (data.type === 'READY') {
                assignToRoom(providerId, ws, 'deepseek-main', 'https://chat.deepseek.com/');
            } else if (data.type === 'TASK_COMPLETE') {
                sendNextCommand(data.roomId);
            }
        });

        ws.on('close', () => {
            console.log(`❌ Provider disconnected: ${providerId}`);
            const index = providers.findIndex(p => p.id === providerId);
            if (index > -1) providers.splice(index, 1);
        });
    });

    function assignToRoom(providerId, ws, roomId, url) {
        const provider = providers.find(p => p.id === providerId);
        if (!provider) return;

        provider.busy = true;
        rooms[roomId] = { providerId, ws, url, status: 'initializing' };
        
        console.log(`🔗 Assigning ${providerId} to Room: ${roomId} (${url})`);
        
        ws.send(JSON.stringify({
            type: 'NAVIGATE',
            roomId: roomId,
            payload: { url: url }
        }));
    }

    function sendNextCommand(roomId) {
        const room = rooms[roomId];
        if (!room) return;

        if (!room.step) room.step = 0;
        room.step++;

        let command = null;

        if (room.step === 1) {
            command = {
                type: 'WAIT_AND_SELECT',
                roomId: roomId,
                payload: { selector: 'textarea[placeholder*="Ask DeepSeek"], textarea[placeholder*="Message"]', timeout: 5000 }
            };
        } else if (room.step === 2) {
            command = {
                type: 'TYPE',
                roomId: roomId,
                payload: { 
                    selector: 'textarea[placeholder*="Ask DeepSeek"], textarea[placeholder*="Message"]', 
                    text: "Explain quantum computing simply." 
                }
            };
        } else if (room.step === 3) {
            command = {
                type: 'CLICK',
                roomId: roomId,
                payload: { selector: 'button[aria-label*="Send"], button:has-text("Send")' } 
            };
        } else if (room.step === 4) {
            command = {
                type: 'SCRAPE',
                roomId: roomId,
                payload: { selector: '.markdown-body, .response-content', wait: true } 
            };
        }

        if (command) {
            console.log(`🚀 Sending command to ${roomId}:`, command.type);
            room.ws.send(JSON.stringify(command));
        } else {
            console.log(`✅ Room ${roomId} flow completed.`);
            room.ws.send(JSON.stringify({ type: 'IDLE', roomId: roomId }));
        }
    }

} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('ws')) {
        console.error('❌ Error: The "ws" module is not installed.');
        console.error('');
        console.error('Please run this command in the router folder:');
        console.error('   npm init -y && npm install ws');
        console.error('');
        process.exit(1);
    } else {
        throw error;
    }
}
