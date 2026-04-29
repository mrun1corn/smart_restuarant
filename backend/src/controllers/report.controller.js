import prisma from '../prisma.js';

export const getSalesReport = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: 'paid',
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Summary calculations
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice || 0), 0);
    const totalOrders = orders.length;

    // Daily Sales Calculation (JS grouping)
    const dailySales = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + parseFloat(order.totalPrice || 0);
    });

    const salesTrend = Object.keys(dailySales).map(date => ({
      date,
      amount: parseFloat(dailySales[date].toFixed(2)),
    }));

    // Monthly aggregation
    const monthlySales = {};
    orders.forEach(order => {
      const month = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlySales[month] = (monthlySales[month] || 0) + parseFloat(order.totalPrice || 0);
    });

    const monthlyTrend = Object.keys(monthlySales).map(month => ({
      month,
      amount: parseFloat(monthlySales[month].toFixed(2)),
    }));

    res.status(200).json({
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        averageOrderValue: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0,
      },
      trends: {
        daily: salesTrend.slice(-30), // Last 30 days
        monthly: monthlyTrend,
      },
    });
  } catch (error) {
    console.error('SalesReport error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryReport = async (req, res) => {
  try {
    const topItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          status: 'paid',
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // Resolve item names
    const itemDetails = await Promise.all(
      topItems.map(async (item) => {
        const detail = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: { name: true },
        });
        return {
          name: detail ? detail.name : 'Unknown Item',
          quantity: item._sum.quantity,
        };
      })
    );

    res.status(200).json(itemDetails);
  } catch (error) {
    console.error('InventoryReport error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
