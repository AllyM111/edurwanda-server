
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async ({
  name,
  email,
  password,
}) => {
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required.");
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    throw new Error("Name is required.");
  }

  if (!cleanEmail) {
    throw new Error("Email is required.");
  }

  if (password.length < 6) {
    throw new Error(
      "Password must be at least 6 characters."
    );
  }

  // Check existing user
  const existingUser = await prisma.user.findUnique({
    where: {
      email: cleanEmail,
    },
  });

  if (existingUser) {
    throw new Error("Email is already registered.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  // Create user
  const user = await prisma.user.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: "USER",
      status: "ACTIVE",
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar: true,
      phone: true,
      bio: true,
      createdAt: true,
    },
  });

  return user;
};

// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async ({
  email,
  password,
}) => {
  if (!email || !password) {
    throw new Error(
      "Email and password are required."
    );
  }

  const cleanEmail = email
    .trim()
    .toLowerCase();

  // Find user
  const user = await prisma.user.findUnique({
    where: {
      email: cleanEmail,
    },
  });

  if (!user) {
    throw new Error(
      "Invalid email or password."
    );
  }

  // Check account status
  if (user.status !== "ACTIVE") {
    throw new Error(
      "Your account is not active."
    );
  }

  // Check password
  const passwordMatches =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!passwordMatches) {
    throw new Error(
      "Invalid email or password."
    );
  }

  // JWT secret
  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured."
    );
  }

  // Create token
  const token = jwt.sign(
    {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "7d",
    }
  );

  // Update last login
  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      lastLogin: new Date(),
    },
  });

  // Never return password
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
    phone: user.phone,
    bio: user.bio,
    createdAt: user.createdAt,
  };

  return {
    token,
    user: safeUser,
  };
};

// ======================================================
// GET USER BY ID
// ======================================================

const getUserById = async (userId) => {
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar: true,
      phone: true,
      bio: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

// ======================================================
// VERIFY TOKEN
// ======================================================

const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is required.");
  }

  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured."
    );
  }

  return jwt.verify(
    token,
    secret
  );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  verifyToken,
};
