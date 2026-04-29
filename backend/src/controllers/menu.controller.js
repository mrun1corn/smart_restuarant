import prisma from '../prisma.js';

export const getAllMenuItems = async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { name: 'asc' }
      ]
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMenuItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: { category: true }
    });
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMenuItem = async (req, res) => {
  const { name, description, price, categoryId, isAvailable, imageUrl } = req.body;
  try {
    const item = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        categoryId: categoryId || null,
        isAvailable: isAvailable ?? true,
        imageUrl: imageUrl || null,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('CreateMenuItem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, categoryId, isAvailable, imageUrl } = req.body;
  try {
    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price,
        categoryId: categoryId === null ? null : categoryId,
        isAvailable,
        imageUrl: imageUrl === null ? null : imageUrl,
      },
    });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.menuItem.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleAvailability = async (req, res) => {
  const { id } = req.params;
  try {
    const currentItem = await prisma.menuItem.findUnique({ where: { id } });
    if (!currentItem) return res.status(404).json({ error: 'Item not found' });

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !currentItem.isAvailable },
    });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
