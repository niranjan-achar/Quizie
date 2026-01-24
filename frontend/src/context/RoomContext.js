import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const RoomContext = createContext(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }) => {
  const { axiosInstance } = useAuth();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [rooms, setRooms] = useState([]);

  const createRoom = async (roomData) => {
    try {
      const response = await axiosInstance.post('/rooms/create', roomData);
      const room = response.data.data;
      setCurrentRoom(room);
      return { success: true, room };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create room'
      };
    }
  };

  const joinRoom = async (roomCode) => {
    try {
      const response = await axiosInstance.post(`/rooms/join/${roomCode}`);
      const room = response.data.data;
      setCurrentRoom(room);
      return { success: true, room };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to join room'
      };
    }
  };

  const addMember = async (roomId, username) => {
    try {
      const response = await axiosInstance.post(`/rooms/${roomId}/add-member`, {
        username
      });
      setCurrentRoom(response.data.data);
      return { success: true, room: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add member'
      };
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      await axiosInstance.post(`/rooms/${roomId}/leave`);
      setCurrentRoom(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to leave room'
      };
    }
  };

  const startQuiz = async (roomId) => {
    try {
      const response = await axiosInstance.post(`/rooms/${roomId}/start-quiz`);
      setCurrentRoom(response.data.data);
      return { success: true, room: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to start quiz'
      };
    }
  };

  const getRoomDetails = async (roomId) => {
    try {
      const response = await axiosInstance.get(`/rooms/${roomId}`);
      setCurrentRoom(response.data.data);
      return { success: true, room: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch room'
      };
    }
  };

  const getLeaderboard = async (roomId) => {
    try {
      const response = await axiosInstance.get(`/rooms/${roomId}/leaderboard`);
      return { success: true, leaderboard: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch leaderboard'
      };
    }
  };

  const getMyRooms = async () => {
    try {
      const response = await axiosInstance.get('/rooms/my-rooms');
      setRooms(response.data.data);
      return { success: true, rooms: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch rooms'
      };
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await axiosInstance.delete(`/rooms/${roomId}`);
      setCurrentRoom(null);
      setRooms(rooms.filter(r => r._id !== roomId));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete room'
      };
    }
  };

  const value = {
    currentRoom,
    rooms,
    createRoom,
    joinRoom,
    addMember,
    leaveRoom,
    startQuiz,
    getRoomDetails,
    getLeaderboard,
    getMyRooms,
    deleteRoom
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};
