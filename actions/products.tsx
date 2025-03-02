"use server";

import { IProduct, Product } from "@/types/types";
import axios from "axios";

export async function getAllProducts() {
  try {
    const res = await axios.get("https://dummyjson.com/products?limit=32");
    //  const res = await axios.get("https://www.ezymarket.site/products")
    const products = res.data.products;
    return products as IProduct[];
  } catch (error) {
    console.log(error);
    return null;
  }
}
