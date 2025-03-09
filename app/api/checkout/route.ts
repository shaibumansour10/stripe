
import { CartItem } from "@/store/slices/cartSlice";
import { url } from "inspector";
import { NextRequest, NextResponse } from "next/server";

 
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
 async function getActiveStripeProducts() {
    const products = await stripe.products.list()
    const activeProducts = products.data.filter((item:any)=>item.active===true)
    return activeProducts;
 }
export async function POST(request:NextRequest) {
    try {
        // recieve the  checkout product from the client 
        const {products}= await request.json()
        const checkoutProducts:CartItem[] =products;

        // get a list of active stripe products

        let activeStripeProducts= await getActiveStripeProducts()
        console.log(activeStripeProducts)
        //create the items in stripe product if doenot extist
        for(const product of checkoutProducts){
            const stripeProduct= activeStripeProducts.find((item:any)=>item.name.toLowerCase()===product.name.toLowerCase())
            if(!stripeProduct){
                // create stripe product
                try {
                      const unitAmount = Math.round(product.price * 100);
                   const newStripeProduct = await stripe.products.create({
                       name:product.name,
                       default_price_data: {
              unit_amount: unitAmount,
              currency: "usd",
            },
             images: [product.image],
                    }
                   ) 
                } catch (error) {
                    console.log(error)
                }
            }
        }

        activeStripeProducts= await getActiveStripeProducts()
        let stripeCheckoutProducts:any=[]
        for(const product of checkoutProducts){
           const extistingStripeProduct= activeStripeProducts.find((item:any)=>item.name.toLowerCase()===product.name.toLowerCase()) 
           if(extistingStripeProduct){
            //add to the stripe checkout products
            stripeCheckoutProducts.push({
                price:extistingStripeProduct.default_price_data,
                quantity:product.qty
            })
           } 
        }

        // create the checkout session
         const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const session = await stripe.checkout.sessions.create({
    success_url: `${baseUrl}/succes`,
      cancel_url: `${baseUrl}/cancel`,
  line_items: stripeCheckoutProducts,
  mode: 'payment',
}); 
   console.log(session);
        return NextResponse.json({url:session?.url})
    } catch (error) {
        console.log(error)
    }
    
}