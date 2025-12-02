const express = require("express");
const router = express.Router();
const saleModel = require("../models/sale-model");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const { isLoggedIn } = require("../middlewares/auth");
const isSeller = require("../middlewares/isSeller");


router.get("/", isLoggedIn, isSeller, async (req, res) => {
    try {
        let saleError = req.flash('saleError')
        const user = await userModel.findOne({username: req.user.username})
        const sales = await saleModel.find().sort({ createdAt: -1 });
        const products = await productModel.find().sort({ title: 1 });
        console.log(saleError)

        res.render("sales", {
            sales,
            products,
            user,
            cart: user.cart,
            saleError
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});


router.post("/create", async (req, res) => {
    try {
        let { title, startDate, endDate, products, selectAll, percentage } = req.body;
        if (percentage > 90){
            req.flash('saleError', 'discount can not be more than 90 percent');
            return res.redirect("/sales")
        }

        if (selectAll === "on") {
            const allProducts = await productModel.find().select("_id");
            products = allProducts.map(p => p._id);
        }


        if (!Array.isArray(products) && products) {
            products = [products];
        }

        const newSale = new saleModel({
            title,
            startDate,
            endDate,
            percentage,
            productIds: products || []
        });

        await newSale.save();
        res.redirect("/sales");

    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to create sale");
    }
});

router.post("/update/:id", async (req, res) => {
    try {
        let saleError = req.flash('registerError')
        let { title, startDate, endDate, products, selectAll, percentage } = req.body;
        if (percentage > 90){
            req.flash('saleError', 'discount can not be more than 90 percent');
            return res.redirect("/sales")
        }
        let productIds = products; 

      
        if (selectAll === "on") {
            const allProducts = await productModel.find().select("_id");
            productIds = allProducts.map(p => p._id.toString());
        }


        if (!Array.isArray(productIds) && productIds) {
            productIds = [productIds];
        }

        await saleModel.findByIdAndUpdate(req.params.id, {
            title,
            startDate,
            endDate,
            percentage,
            productIds: productIds || []
        });

        res.redirect("/sales");

    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to update sale");
    }
});


router.delete("/:id", async (req, res) => {
    try {
        await saleModel.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Delete failed" });
    }
});

module.exports = router;
