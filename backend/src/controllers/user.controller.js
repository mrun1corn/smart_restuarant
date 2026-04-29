import bcrypt from 'bcrypt';
import prisma from '../prisma.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: role || 'receptionist',
      },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, isActive } = req.body;
  try {
    const updateData = { name, email, role, isActive: isActive !== undefined ? isActive : undefined };
    
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
