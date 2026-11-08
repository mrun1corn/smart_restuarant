import prisma from '../prisma.js';
import { generateTableQRCode } from '../services/qr.service.js';

export const getAllTables = async (req, res) => {
  try {
    const tables = await prisma.restaurantTable.findMany({
      orderBy: { tableNumber: 'asc' }
    });
    res.status(200).json(tables);
  } catch (error) {
    console.error('GetAllTables error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTableById = async (req, res) => {
  const { id } = req.params;
  try {
    const table = await prisma.restaurantTable.findUnique({
      where: { id }
    });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.status(200).json(table);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTable = async (req, res) => {
  const { tableNumber } = req.body;
  try {
    // 1. Create the table record first
    const table = await prisma.restaurantTable.create({
      data: { tableNumber: parseInt(tableNumber) }
    });

    // 2. Generate QR code using the assigned ID
    const qrCodeUrl = await generateTableQRCode(table.id);

    // 3. Update table with QR code
    const updatedTable = await prisma.restaurantTable.update({
      where: { id: table.id },
      data: { qrCodeUrl }
    });

    res.status(201).json(updatedTable);
  } catch (error) {
    console.error('CreateTable error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Table number already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTable = async (req, res) => {
  const { id } = req.params;
  const { tableNumber, status } = req.body;
  const io = req.app.get('io');
  try {
    const updatedTable = await prisma.restaurantTable.update({
      where: { id },
      data: {
        tableNumber: tableNumber ? parseInt(tableNumber) : undefined,
        status
      }
    });

    if (io && status) {
      io.to('dashboard-room').emit('table:status_changed', { table_id: id, status });
    }

    res.status(200).json(updatedTable);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTable = async (req, res) => {
  const { id } = req.params;
  try {
    // Audit protection: Check if active or historical orders exist for this table
    const orderCount = await prisma.order.count({
      where: { tableId: id }
    });

    if (orderCount > 0) {
      return res.status(409).json({
        error: 'Cannot delete table with existing order history. Existing records are protected for audit integrity.'
      });
    }

    await prisma.restaurantTable.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('DeleteTable error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const regenerateQR = async (req, res) => {
  const { id } = req.params;
  try {
    const qrCodeUrl = await generateTableQRCode(id);
    const updatedTable = await prisma.restaurantTable.update({
      where: { id },
      data: { qrCodeUrl }
    });
    res.status(200).json(updatedTable);
  } catch (error) {
    res.status(500).json({ error: 'Failed to regenerate QR code' });
  }
};
