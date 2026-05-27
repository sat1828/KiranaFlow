const Joi = require('joi');
const { prisma } = require('../config/database');

const createInventorySchema = Joi.object({
  sku: Joi.string().max(50).optional(),
  name: Joi.string().max(200).required(),
  category: Joi.string().max(80).optional(),
  unit: Joi.string().valid('kg', 'litre', 'piece', 'packet', 'gram', 'ml', 'dozen').optional(),
  currentStock: Joi.number().min(0).default(0),
  reorderLevel: Joi.number().min(0).default(0),
  costPrice: Joi.number().positive().optional(),
  sellingPrice: Joi.number().positive().optional(),
});

const updateInventorySchema = Joi.object({
  sku: Joi.string().max(50),
  name: Joi.string().max(200),
  category: Joi.string().max(80),
  unit: Joi.string().valid('kg', 'litre', 'piece', 'packet', 'gram', 'ml', 'dozen'),
  currentStock: Joi.number().min(0),
  reorderLevel: Joi.number().min(0),
  costPrice: Joi.number().positive(),
  sellingPrice: Joi.number().positive(),
  isActive: Joi.boolean(),
});

const bulkUpdateSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    id: Joi.string().uuid().required(),
    currentStock: Joi.number().min(0).required(),
  })).min(1).required(),
});

async function listInventory(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { category, search, lowStock } = req.query;

    const where = { storeId, isActive: true };
    if (category) where.category = category;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    let inventory = await prisma.inventory.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    if (lowStock === 'true') {
      inventory = inventory.filter((item) => Number(item.currentStock) <= Number(item.reorderLevel));
    }

    const inventoryWithStatus = inventory.map((item) => {
      const stock = Number(item.currentStock);
      const reorder = Number(item.reorderLevel);
      let status = 'ok';
      if (stock === 0) status = 'out_of_stock';
      else if (stock <= reorder * 0.5) status = 'critical';
      else if (stock <= reorder) status = 'low';

      return { ...item, stockStatus: status };
    });

    res.json({ inventory: inventoryWithStatus });
  } catch (error) {
    next(error);
  }
}

async function createInventory(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const item = await prisma.inventory.create({
      data: { ...req.body, storeId },
    });

    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
}

async function updateInventory(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const item = await prisma.inventory.findUnique({ where: { id: req.params.id } });

    if (!item || item.storeId !== storeId) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const updated = await prisma.inventory.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ item: updated });
  } catch (error) {
    next(error);
  }
}

async function getLowStock(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const allItems = await prisma.inventory.findMany({
      where: { storeId, isActive: true },
    });

    const items = allItems.filter(
      (item) => Number(item.currentStock) <= Number(item.reorderLevel)
    ).sort((a, b) => Number(a.currentStock) - Number(b.currentStock));

    res.json({ items });
  } catch (error) {
    next(error);
  }
}

async function bulkUpdate(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { items } = req.body;

    const updates = [];
    for (const item of items) {
      const existing = await prisma.inventory.findUnique({ where: { id: item.id } });
      if (existing && existing.storeId === storeId) {
        const updated = await prisma.inventory.update({
          where: { id: item.id },
          data: {
            currentStock: item.currentStock,
            lastRestockedAt: new Date(),
          },
        });
        updates.push(updated);
      }
    }

    res.json({ items: updates, message: `${updates.length} items updated` });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createInventorySchema,
  updateInventorySchema,
  bulkUpdateSchema,
  listInventory,
  createInventory,
  updateInventory,
  getLowStock,
  bulkUpdate,
};
