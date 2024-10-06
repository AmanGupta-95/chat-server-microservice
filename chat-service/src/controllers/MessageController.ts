import { Response } from 'express';
import { AuthRequest } from '../middleware';
import { Message } from '../database';
import { ApiError, handleMessageReceived } from '../utils';

const send = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, message } = req.body;
    const { _id, email, name } = req.user;

    validateReceiver(_id, receiverId);

    const newMessage = await Message.create({
      senderId: _id,
      receiverId,
      message,
    });

    handleMessageReceived(name, email, receiverId, newMessage.message);

    return res.json({
      status: 201,
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

const validateReceiver = (senderId: string, receiverId: string) => {
  if (!receiverId) {
    throw new ApiError(404, 'Receiver ID is required.');
  }

  if (senderId == receiverId) {
    throw new ApiError(400, 'Sender and receiver cannot be the same.');
  }
};

const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    const message = await Message.find({
      or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    return res.json({
      status: 200,
      message: 'Message fetched successfully',
      data: message,
    });
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

export default {
  send,
  getConversation,
};
