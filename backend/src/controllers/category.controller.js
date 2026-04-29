import prisma from '../prisma.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCategory = async (req, res) => {
  const { name, sortOrder } = req.body;
  try {
    const category = await prisma.category.create({
      data: { name, sortOrder: sortOrder ? parseInt(sortOrder) : 0 },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, sortOrder } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name, sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined },
    });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
