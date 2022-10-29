var db = require('../config/connection')
var collection = require('../config/collection')
let objectid = require('mongodb').ObjectId

module.exports = {

    placeOrder: (order, products, total, userId) => {


        return new Promise(async (resolve, reject) => {
            try {
                console.log(order, products, total, 'this is total in order');

                let status = await order['payment-method'] === 'COD' ? 'placed' : 'pending'
                let orderObj = {
                    deliveryDetails: {
                        email: order.email,
                        mobile: order.phone,
                        address: order.address,
                        pincode: order.pin,
                        name: order.name,
                        distirct: order.district,
                        town: order.city,
                        state: order.state,

                    },
                    userId: objectid(userId),
                    paymentMethod: order['payment-method'],
                    products: products,
                    totalAmount: order.Grandtotal,



                    status: status,
                    date: new Date()
                    // date: new Date().toDateString()
                }

                let users = [objectid(userId)];

                await db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectid(userId) })
                    console.log("orderID:", response.insertedId);
                    resolve(response.insertedId)
                })
            } catch (error) {
                reject(error)
            }

        })


    },
    getOrderDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                orderDetails = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectid(userId) }).sort({ date:-1 }).toArray();
                resolve(orderDetails);



            } catch (error) {
                reject(error)
            }
        })


    },

    getSingleOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {

                orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectid(orderId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.products.item',
                            quantity: '$products.products.quantity',
                            status: '$status',
                            date: '$date',
                            totalAmount: '$totalAmount',
                            value: '$value'

                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            totalAmount: 1, status: 1, data: 1, value: 1, item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }

                ]).toArray()

                resolve(orderItems)



            } catch (error) {
                reject(error)
            }
        })

    },

    value: (orderId) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {

                let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectid(orderId) })
                console.log(order);
                console.log(order._id);
                if (order) {
                    if (order.value) {
                        response.status = true
                        response.id = order._id

                        resolve(response)
                    } else {
                        if (order.cancel) {

                        } else {
                            response.status = false
                            response.id = order._id
                            resolve(response)

                        }


                    }

                } else {
                    response.status = false
                    response.id = order._id
                    resolve(response)

                }



            } catch (error) {
                reject(error)
            }
        })
    },

    changeStatusCancelled: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let changeOrderStatus = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectid(orderId) }, { $set: { status: 'Cancelled', value: false } })
                resolve()


            } catch (error) {
                reject(error)
            }
        })

    },

}
