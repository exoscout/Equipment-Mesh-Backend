const { Item } = require('../models/items.js');
const { AppError } = require('../utils/appError.js');

const listUserItems = async (req, res) => {
    const userId = req.user.id;
    const items = await Item.find({ lister: userId }).sort({ createdAt: -1 });
    res.status(200).json({ items });
}


const getItemPage = async (req, res) => {
    const itemId = req.params.itemId || req.query.itemId;
    const item = await Item.findById(itemId).populate('lister', 'name');
    if(!item) {
        throw new AppError('Item not found', 404);
    }    
    res.status(200).json({ item });
}

const createItem = async (req, res) => {
    const {
        name,
        description,
        category,
        condition,
        rentalPrice,
        pricingUnit,
        location,
        securityDeposit,
        lateReturnPenalty,
    } = req.body;

    if(!name || !description || !category || !condition || rentalPrice === undefined) {
        throw new AppError('Missing required fields', 400);
    }

    if (Number(rentalPrice) < 0) {
        throw new AppError('rentalPrice must be a non-negative number', 400);
    }

    const lister = req.user.id;
    const item = new Item({
        name,
        description,
        category,
        condition,
        rentalPrice,
        pricingUnit,
        location,
        securityDeposit,
        lateReturnPenalty,
        lister,
    });

    await item.save();
    res.status(201).json({ item });
}

const updateItem = async (req, res) => {
    const itemId = req.params.itemId;
    const {
        name,
        description,
        category,
        condition,
        rentalPrice,
        pricingUnit,
        location,
        securityDeposit,
        lateReturnPenalty,
    } = req.body;

    const item = await Item.findById(itemId);

    if(!item) {
        throw new AppError('Item not found', 404);
    }

    if(item.lister.toString() !== req.user.id) {
        throw new AppError('You are not authorized to update this item', 403);
    }

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (condition !== undefined) updates.condition = condition;
    if (rentalPrice !== undefined) updates.rentalPrice = rentalPrice;
    if (pricingUnit !== undefined) updates.pricingUnit = pricingUnit;
    if (location !== undefined) updates.location = location;
    if (securityDeposit !== undefined) updates.securityDeposit = securityDeposit;
    if (lateReturnPenalty !== undefined) updates.lateReturnPenalty = lateReturnPenalty;

    if (updates.rentalPrice !== undefined && Number(updates.rentalPrice) < 0) {
        throw new AppError('rentalPrice must be a non-negative number', 400);
    }

    const updatedItem = await Item.findByIdAndUpdate(
        itemId,
        updates,
        { new: true, runValidators: true }
    );

    res.status(200).json({ item: updatedItem });
}

const unlistItem = async (req, res) => {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);

    if(!item) {
        throw new AppError('Item not found', 404);
    }

    if(item.lister.toString() !== req.user.id) {
        throw new AppError('You are not authorized to unlist this item', 403);
    }

    item.status = 'unavailable';
    await item.save();

    res.status(200).json({ message: 'Item unlisted successfully', item });
}

const relistItem = async (req, res) => {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);

    if(!item) {
        throw new AppError('Item not found', 404);
    }

    if(item.lister.toString() !== req.user.id) {
        throw new AppError('You are not authorized to relist this item', 403);
    }

    item.status = 'available';
    await item.save();

    res.status(200).json({ message: 'Item relisted successfully', item });
}


module.exports = {
    listUserItems,
    getItemPage,
    createItem,
    updateItem,
    unlistItem,
    relistItem,
}