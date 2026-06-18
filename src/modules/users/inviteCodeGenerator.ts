import { UserModel } from "../models/user.js";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

let reservedList: Record<string, string> | undefined = undefined;
if (process.env.RESERVED_INVITE_CODE) {
    reservedList = JSON.parse(process.env.RESERVED_INVITE_CODE) as Record<string, string>;
}

function generateCode(username: string): string {
    const prefix = username
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 4);

    let code = prefix;

    while (code.length < 8) {
        code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }

    return code;
}

async function isReserved(code: string): Promise<boolean>{
    if (!reservedList) {
        return false;
    }

    for (const invCodes of Object.values(reservedList)) {
        if (invCodes == code) {
            return true;
        }
    }

    let user = await UserModel.findByInviteCode(code);
    if (user) {
        return true;
    }
    return false;
}


export async function generateInviteCode(username: string, phoneNumber: string | undefined): Promise<string> {
    let code: string;
    if (phoneNumber && reservedList) {
        let reservedCode = reservedList[phoneNumber]
        if(reservedCode) {
            return reservedCode;
        }
    }
    
    do {
        code = generateCode(username);
    } while (await isReserved(code));
    return code;
}