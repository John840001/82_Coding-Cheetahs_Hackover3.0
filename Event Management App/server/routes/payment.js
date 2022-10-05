const router = require('express').Router();
const razorpay = require('razorpay');
const crypto = require('crypto');

router.post('/orders', async (req, res) => {
    try {
        const instance = new razorpay({
            key_id: process.env.RAZORPAY_API_KEY,
            key_secret: process.env.RAZORPAY_API_SECRET,
        });

        const options = {
            amount: req.body.amount*100,  // amount in the smallest currency unit
            currency: "INR",
        };

        instance.orders.create(options, (err, order) => {
            if (err) {
                return res.status(500).json({
                    message: "Something Went Wrong"
                })
            }
            return res.status(200).json({data: order});
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something Went Wrong" });
    }
});

router.post('/verify', (req, res) => {
    try {
        const{
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature} = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
            .update(sign.toString())
            .digest("hex");
        
        if(expectedSign === razorpay_signature){
            return res.status(200).json({message: "Payment Successful"});
        }else{
            return res.status(400).json({message: "Payment Failed"});
        }

    } catch (error) {

    }
});

module.exports = router;