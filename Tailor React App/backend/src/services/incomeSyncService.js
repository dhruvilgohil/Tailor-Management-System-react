const Order = require('../models/Order');
const IncomeTransaction = require('../models/IncomeTransaction');
const Customer = require('../models/Customer');

const getOrderIncomeAmount = (order) => {
    const amount = Number(
        order.userDefinedTotal || order.calculatedTotal || order.totalAmount || 0
    );
    return Number.isFinite(amount) ? amount : 0;
};

const resolveCustomerName = async (order) => {
    if (order.customerId && typeof order.customerId === 'object') {
        return order.customerId.name || order.customerId.customerName || 'Unknown Customer';
    }

    if (!order.customerId) {
        return 'Unknown Customer';
    }

    const customer = await Customer.findById(order.customerId).select('name').lean();
    return customer?.name || 'Unknown Customer';
};

const shouldCreateIncomeForOrder = (order) => {
    return (
        order?.status === 'Completed' &&
        ['Cash', 'Online'].includes(order?.paymentMethod) &&
        getOrderIncomeAmount(order) > 0
    );
};

const buildIncomePayloadFromOrder = async (order) => ({
    customerName: await resolveCustomerName(order),
    customerId: order.customerId?._id || order.customerId || undefined,
    orderId: order._id,
    source: 'order-completion',
    date: order.updatedAt || order.createdAt || new Date(),
    amount: getOrderIncomeAmount(order),
    paymentMethod: order.paymentMethod
});

const syncIncomeForOrder = async (orderInput) => {
    const order =
        typeof orderInput === 'string'
            ? await Order.findById(orderInput).populate('customerId', 'name').lean()
            : orderInput;

    if (!order?._id) {
        return null;
    }

    const existingTransaction = await IncomeTransaction.findOne({ orderId: order._id });

    if (!shouldCreateIncomeForOrder(order)) {
        if (existingTransaction) {
            await IncomeTransaction.findByIdAndDelete(existingTransaction._id);
        }
        return null;
    }

    const payload = await buildIncomePayloadFromOrder(order);

    if (existingTransaction) {
        return IncomeTransaction.findByIdAndUpdate(existingTransaction._id, payload, {
            new: true,
            runValidators: true
        });
    }

    return IncomeTransaction.create(payload);
};

const syncIncomeForAllEligibleOrders = async () => {
    const orders = await Order.find({})
        .populate('customerId', 'name')
        .sort({ updatedAt: -1 })
        .lean();

    for (const order of orders) {
        await syncIncomeForOrder(order);
    }
};

module.exports = {
    syncIncomeForOrder,
    syncIncomeForAllEligibleOrders
};
