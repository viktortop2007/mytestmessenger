import http from 'http';
import app from './app';
import { initSocket } from './socket';
import logger from './config/logger';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
