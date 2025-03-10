
// import { CartItem } from "@/store/slices/cartSlice";
// import { url } from "inspector";
// import { NextRequest, NextResponse } from "next/server";

 
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
//  async function getActiveStripeProducts() {
//     const products = await stripe.products.list()
//     const activeProducts = products.data.filter((item:any)=>item.active===true)
//     return activeProducts;
//  }
// export async function POST(request:NextRequest) {
//     try {
//         // recieve the  checkout product from the client 
//         const {products}= await request.json()
//         const checkoutProducts:CartItem[] =products;

//         // get a list of active stripe products

//         let activeStripeProducts= await getActiveStripeProducts()
//         console.log(activeStripeProducts)
//         //create the items in stripe product if doenot extist
//         for(const product of checkoutProducts){
//             const stripeProduct= activeStripeProducts.find((item:any)=>item.name.toLowerCase()===product.name.toLowerCase())
//             if(!stripeProduct){
//                 // create stripe product
//                 try {
//                       const unitAmount = Math.round(product.price * 100);
//                    const newStripeProduct = await stripe.products.create({
//                        name:product.name,
//                        default_price_data: {
//               unit_amount: unitAmount,
//               currency: "usd",
//             },
//              images: [product.image],
//                     }
//                    ) 
//                 } catch (error) {
//                     console.log(error)
//                 }
//             }
//         }

//         activeStripeProducts= await getActiveStripeProducts()
//         let stripeCheckoutProducts:any=[]
//         for(const product of checkoutProducts){
//            const extistingStripeProduct= activeStripeProducts.find((item:any)=>item.name.toLowerCase()===product.name.toLowerCase()) 
//            if(extistingStripeProduct){
//             //add to the stripe checkout products
//             stripeCheckoutProducts.push({
//                 price:extistingStripeProduct.default_price_data,
//                 quantity:product.qty
//             })
//            } 
//         }

//         // create the checkout session
//          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
//         const session = await stripe.checkout.sessions.create({
//     success_url: `${baseUrl}/succes`,
//       cancel_url: `${baseUrl}/cancel`,
//   line_items: stripeCheckoutProducts,
//   mode: 'payment',
// }); 
//    console.log(session);
//         return NextResponse.json({url:session?.url})
//     } catch (error) {
//         console.log(error)
//     }
    
// }

import { CartItem } from "@/store/slices/cartSlice";
import { NextRequest, NextResponse } from "next/server";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function getActiveStripeProducts() {
    const products = await stripe.products.list();
    const activeProducts = products.data.filter((item: any) => item.active === true);
    return activeProducts;
}

export async function POST(request: NextRequest) {
    try {
        // Receive the checkout products from the client
        const { products } = await request.json();
        const checkoutProducts: CartItem[] = products;

        // Get a list of active Stripe products
        let activeStripeProducts = await getActiveStripeProducts();
        console.log("Active Stripe Products:", activeStripeProducts);

        // Create the items in Stripe products if they do not exist
        for (const product of checkoutProducts) {
            if (!product.name) {
                console.error("Product name is undefined:", product);
                continue; // Skip this product if the name is undefined
            }

            const stripeProduct = activeStripeProducts.find((item: any) => {
                if (!item.name) {
                    console.error("Stripe product name is undefined:", item);
                    return false; // Skip this item if the name is undefined
                }
                return item.name.toLowerCase() === product.name.toLowerCase();
            });

            if (!stripeProduct) {
                // Create Stripe product
                try {
                    const unitAmount = Math.round(product.price * 100);
                    await stripe.products.create({
                        name: product.name,
                        default_price_data: {
                            unit_amount: unitAmount,
                            currency: "usd",
                        },
                        images: [product.image],
                    });
                } catch (error) {
                    console.error("Failed to create Stripe product:", error);
                    return NextResponse.json({ error: "Failed to create Stripe product" }, { status: 500 });
                }
            }
        }

        // Refresh the list of active Stripe products
        activeStripeProducts = await getActiveStripeProducts();

        // Prepare the Stripe checkout products
        let stripeCheckoutProducts: any = [];
        for (const product of checkoutProducts) {
            if (!product.name) {
                console.error("Product name is undefined:", product);
                continue; // Skip this product if the name is undefined
            }

            const existingStripeProduct = activeStripeProducts.find((item: any) => {
                if (!item.name) {
                    console.error("Stripe product name is undefined:", item);
                    return false; // Skip this item if the name is undefined
                }
                return item.name.toLowerCase() === product.name.toLowerCase();
            });

            if (existingStripeProduct) {
                // Add to the Stripe checkout products
                stripeCheckoutProducts.push({
                    price: existingStripeProduct.default_price,
                    quantity: product.qty,
                });
            }
        }

        // Create the checkout session
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const session = await stripe.checkout.sessions.create({
            success_url: `${baseUrl}/success`,
            cancel_url: `${baseUrl}/cancel`,
            line_items: stripeCheckoutProducts,
            mode: 'payment',
        });

        console.log("Checkout Session:", session);
        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}