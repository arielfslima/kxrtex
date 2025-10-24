// Socket.IO instance holder to avoid circular dependencies
let io;

export const setSocketInstance = (socketInstance) => {
  io = socketInstance;
};

export const getSocketInstance = () => {
  if (!io) {
    console.warn('Socket.IO not initialized yet');
  }
  return io;
};
