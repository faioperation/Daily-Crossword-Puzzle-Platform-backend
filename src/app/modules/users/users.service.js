import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import DevBuildError from "../../lib/DevBuildError.js";

const signup = async (prisma, payload) => {
  const { name, username, email, password, role } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new DevBuildError(
      "User already exists with this email",
      StatusCodes.CONFLICT,
    );
  }

  if (username) {
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new DevBuildError(
        "Username is already taken",
        StatusCodes.CONFLICT,
      );
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      username: username || null,
      email,
      password: hashedPassword,
      role: role || "USER",
      isActive: true,
      isVerified: false,
    },
  });

  return { user };
};

const getProfile = async (prisma, userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      avatar: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new DevBuildError("User not found", StatusCodes.NOT_FOUND);
  }

  return user;
};

const updateProfile = async (prisma, userId, payload) => {
  const { name, username, avatar } = payload;

  if (username) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser.username !== username) {
      const taken = await prisma.user.findUnique({
        where: { username },
      });
      if (taken) {
        throw new DevBuildError(
          "Username is already taken",
          StatusCodes.CONFLICT,
        );
      }
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      username,
      avatar,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      avatar: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const deleteUser = async (prisma, userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new DevBuildError("User not found", StatusCodes.NOT_FOUND);
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return { id: userId };
};

export const UsersService = {
  signup,
  getProfile,
  updateProfile,
  deleteUser,
};
