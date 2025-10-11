import { connectDB } from "../db/mongoDB";
import User from "@/models/users";
import type { IUser } from "@/models/users";

export async function getOwnerByBrand(brand: string): Promise<IUser | null> {
    await connectDB();

    const ownerDoc = await User.findOne({ brandName: brand }).lean<IUser>();

    if (!ownerDoc) return null;
    const owner: IUser = {
        _id: ownerDoc._id?.toString(),
        name: ownerDoc.name,
        brandName: ownerDoc.brandName,
        logo: ownerDoc.logo ,
        email: ownerDoc.email,
        phone: ownerDoc.phone,
        plan: ownerDoc.plan,
        role: ownerDoc.role,
    };

    return owner;
}
