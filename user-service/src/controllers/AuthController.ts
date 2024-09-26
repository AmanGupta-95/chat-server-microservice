import { Request, Response } from 'express';
import config from '../config/config';
import { IUser, User } from '../database';
import { ApiError, encryptPassword, isPasswordMatch } from '../utils';
import jwt from 'jsonwebtoken';

const jwtSecret = config.JWT_SECRET as string;
const COOKIE_EXPIRATION_DAYS = 90; // cookie expiration in days
const expirationDate = new Date(
  Date.now() + COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
);
const cookieOptions = {
  expires: expirationDate,
  secure: false,
  httpOnly: true,
};

const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Some values are missing');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(400, 'User already exists');
    }

    const encryptedPassword = await encryptPassword(password);

    const user = await User.create({
      name,
      email,
      password: encryptPassword,
    });

    return res.status(201).json({
      status: 201,
      message: 'User registered successfully!',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 500,
      message: err?.message || 'Internal server error',
    });
  }
};

const createSendToken = async (user: IUser, res: Response) => {
  const { name, email, id } = user;
  const token = jwt.sign({ id, name, email }, jwtSecret, { expiresIn: '1d' });

  if (config.env === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  return token;
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await isPasswordMatch(password, user.password as string))) {
      throw new ApiError(400, 'Invalid credentials');
    }
    const token = await createSendToken(user, res);

    return res.status(200).json({
      status: 200,
      message: 'User logged in successfully!',
      token,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 500,
      message: err?.message || 'Internal server error',
    });
  }
};

export default { register, login };
