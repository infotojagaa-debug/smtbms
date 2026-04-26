const { io: Client } = require('socket.io-client');
const { server } = require('../server');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Real-time Nervous System (Socket.io) Tests', () => {
    let clientSocket, adminToken, adminUser;
    const port = process.env.PORT || 5001;

    beforeAll((done) => {
        server.listen(port, async () => {
            adminUser = await User.create({
                name: 'Admin Node',
                email: 'admin@socket.com',
                password: 'password',
                role: 'Admin'
            });
            adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET);
            done();
        });
    });

    afterAll((done) => {
        server.close(done);
    });

    beforeEach((done) => {
        clientSocket = new Client(`http://localhost:${port}`, {
            auth: { token: adminToken }
        });
        clientSocket.on('connect', done);
    });

    afterEach(() => {
        if (clientSocket.connected) {
            clientSocket.disconnect();
        }
    });

    it('should establish a JWT-secured real-time synchronization link', (done) => {
        expect(clientSocket.connected).toBe(true);
        done();
    });

    it('should multicasts organizational notifications to the authorized room', (done) => {
        const mockNotif = {
            title: 'Low Stock Alert',
            message: 'Material CR-001 magnitude depleted',
            module: 'material'
        };

        clientSocket.on('notification', (data) => {
            expect(data.title).toBe(mockNotif.title);
            done();
        });

        // Trigger notification from "server side" (simulated via import)
        const { io } = require('../server');
        io.to(`role:Admin`).emit('notification', mockNotif);
    });

    it('should track stakeholder ingress magnitude (Online Count)', (done) => {
        clientSocket.on('system:online_count', (count) => {
            expect(count).toBeGreaterThanOrEqual(1);
            done();
        });
        
        // The server should emit this once a user connects
    });
});
