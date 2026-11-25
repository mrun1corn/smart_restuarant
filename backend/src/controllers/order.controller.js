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

    // Create Order and update table status atomically in a transaction
    const { order, tableWasAvailable } = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
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

      let wasAvailable = false;
      if (table.status === 'available') {
        await tx.restaurantTable.update({
          where: { id: table_id },
          data: { status: 'occupied' }
        });
        wasAvailable = true;
      }

      return { order: created, tableWasAvailable: wasAvailable };
    });

    if (tableWasAvailable && io) {
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
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { table: true }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Terminal state protection: once paid or cancelled, orders cannot transition
    if (existingOrder.status === 'paid' || existingOrder.status === 'cancelled') {
      return res.status(400).json({
        error: `Cannot change status of a finalized order (${existingOrder.status})`
      });
    }

    // Role boundary: only admin can mark orders as 'paid' or 'cancelled' directly
    if ((status === 'paid' || status === 'cancelled') && req.user?.role !== 'admin') {
      return res.status(403).json({
        error: `Forbidden: Only administrator can finalize an order as '${status}'`
      });
    }

    // State machine allowed transitions
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['served', 'cancelled'],
      served: ['paid'],
      paid: [],
      cancelled: []
    };

    if (!validTransitions[existingOrder.status]?.includes(status)) {
      return res.status(400).json({
        error: `Invalid status transition from '${existingOrder.status}' to '${status}'`
      });
    }

    // Execute order status update and table status check atomically
    const { order, tableFreed } = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status },
        include: { table: true }
      });

      let freed = false;
      if (status === 'paid' || status === 'cancelled') {
        const activeCount = await tx.order.count({
          where: {
            tableId: existingOrder.tableId,
            status: { in: ['pending', 'confirmed', 'preparing', 'served'] }
          }
        });

        if (activeCount === 0) {
          await tx.restaurantTable.update({
            where: { id: existingOrder.tableId },
            data: { status: 'available' }
          });
          freed = true;
        }
      }

      return { order: updated, tableFreed: freed };
    });

    if (tableFreed && io) {
      io.to('dashboard-room').emit('table:status_changed', { table_id: existingOrder.tableId, status: 'available' });
    }

    if (io) {
      io.to('dashboard-room').emit('order:updated', { order_id: id, status });
      io.to(`table:${order.tableId}`).emit('order:updated', { order_id: id, status });

      if (status === 'served') {
        io.to(`table:${order.tableId}`).emit('order:ready', { order_id: id });
      }
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const io = req.app.get('io');

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { table: true }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Terminal state protection
    if (existingOrder.status === 'paid' || existingOrder.status === 'cancelled') {
      return res.status(400).json({
        error: `Cannot cancel an already ${existingOrder.status} order`
      });
    }

    // Role check: Only admin can unilaterally void/cancel orders once placed
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden: Admin access required to cancel orders'
      });
    }

    const { order, tableFreed } = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status: 'cancelled' },
        include: { table: true }
      });

      const activeCount = await tx.order.count({
        where: {
          tableId: existingOrder.tableId,
          status: { in: ['pending', 'confirmed', 'preparing', 'served'] }
        }
      });

      let freed = false;
      if (activeCount === 0) {
        await tx.restaurantTable.update({
          where: { id: existingOrder.tableId },
          data: { status: 'available' }
        });
        freed = true;
      }

      return { order: updated, tableFreed: freed };
    });

    if (tableFreed && io) {
      io.to('dashboard-room').emit('table:status_changed', { table_id: existingOrder.tableId, status: 'available' });
    }

    if (io) {
      io.to('dashboard-room').emit('order:cancelled', { order_id: id });
      io.to(`table:${existingOrder.tableId}`).emit('order:cancelled', { order_id: id });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('CancelOrder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
