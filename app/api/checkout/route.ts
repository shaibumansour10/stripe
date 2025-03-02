
import { url } from "inspector";
import { NextRequest, NextResponse } from "next/server";

 

 
export async function POST(request:NextRequest) {
    try {
        


        return NextResponse.json({url:""})
    } catch (error) {
        console.log(error)
    }
    
}