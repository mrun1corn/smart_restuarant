import prisma from '../prisma.js';

export const createOrder = async (req, res) => {
  const { table_id, note, items } = req.body;
  const io = req.app.get('io'); // Get Socket.io instance

  try {
    // Verify table exists
    const table = await prisma.restaurantTable.findUnique({ where: { id: table_id } });
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    let totalPrice = 0;
    const orderItemsData = [];

    // Calculate total and prepare items data
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menu_item_id } });
      if (!menuItem) {
        return res.status(404).json({ error: `Menu item not found: ${item.menu_item_id}` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ error: `Menu item unavailable: ${menuItem.name}` });
      }

      const itemTotal = parseFloat(menuItem.price) * item.quantity;
      totalPrice += itemTotal;

      orderItemsData.push({
        menuItemId: menuItem.id,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        note: item.note || null,
      });
    }

    // Create Order with Items
    const order = await prisma.order.create({
      data: {
        tableId: table_id,
        note: note || null,
        totalPrice,
        status: 'pending',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { menuItem: true }
        },
        table: true
      }
    });

    // Update Table status if it was available
    if (table.status === 'available') {
        await prisma.restaurantTable.update({
            where: { id: table_id },
            data: { status: 'occupied' }
        });
        io.to('dashboard-room').emit('table:status_changed', { table_id, status: 'occupied' });
    }

    // Emit Real-time event to Receptionist Dashboard
    if (io) {
      io.to('dashboard-room').emit('order:new', { order, table });
    }

    res.status(201).json({ success: true, order_id: order.id, message: 'Order placed successfully' });
  } catch (error) {
    console.error('CreateOrder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        table: true,
        items: { include: { menuItem: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        items: { include: { menuItem: true } }
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrdersByTable = async (req, res) => {
  const { tableId } = req.params;
  try {
    const orders = await prisma.order.findMany({
      where: { tableId },
      include: {
        items: { include: { menuItem: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const io = req.app.get('io');

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { table: true }
    });

    // If order is paid or cancelled, check if table should be freed
    if (status === 'paid' || status === 'cancelled') {
      const activeOrdersCount = await prisma.order.count({
        where: {
          tableId: order.tableId,
          status: { in: ['pending', 'confirmed', 'preparing', 'served'] }
        }
      });

      if (activeOrdersCount === 0) {
        await prisma.restaurantTable.update({
          where: { id: order.tableId },
          data: { status: 'available' }
        });
        if (io) {
          io.to('dashboard-room').emit('table:status_changed', { table_id: order.tableId, status: 'available' });
        }
      }
    }

    if (io) {
      io.to('dashboard-room').emit('order:updated', { order_id: id, status });
      // Emit globally for general updates
      io.emit('order:updated', { order_id: id, status });
      
      // Specifically notify the table if order is ready (served)
      if (status === 'served') {
        io.to(`table:${order.tableId}`).emit('order:ready', { order_id: id });
      }
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const io = req.app.get('io');

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: 'cancelled' },
      include: { table: true }
    });

    // Check if table should be freed
    const activeOrdersCount = await prisma.order.count({
      where: {
        tableId: order.tableId,
        status: { in: ['pending', 'confirmed', 'preparing', 'served'] }
      }
    });

    if (activeOrdersCount === 0) {
      await prisma.restaurantTable.update({
        where: { id: order.tableId },
        data: { status: 'available' }
      });
      if (io) {
        io.to('dashboard-room').emit('table:status_changed', { table_id: order.tableId, status: 'available' });
      }
    }

    if (io) {
      io.to('dashboard-room').emit('order:cancelled', { order_id: id });
      io.emit('order:cancelled', { order_id: id });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
