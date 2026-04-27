import User from "../models/User.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

export const getStatsCardData = async ()=>{
    const products = await Product.find({});
    const productCount = products.length;

    const users = await User.find({});
    const userCount = users.length;

    const orders = await Order.find({});
    const orderCount = orders.length;

    const categories = await Category.find({level : 1});
    console.log(categories)
    const categoriesCount = categories.length;

    return {
        data : {
            productCount,
            userCount,
            orderCount,
            categoriesCount
        }
    }
}