import { hash, compare } from "bcryptjs";

export async function hashPassword(password) {
    const hashedPassword = await hash(password, 12);
    return hashedPassword;
}

export async function verifyPassword(password, hashedPassword) {
    const isValid = await compare(password, hashedPassword);
    return isValid;
}

export async function comparePassword(password, hashedPassword) {
    return await verifyPassword(password, hashedPassword);
}