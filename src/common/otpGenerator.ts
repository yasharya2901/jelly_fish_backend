export function generateOtp(alphabets: boolean, numOfDigits: number): string {
    let seed = "0123456789"
    if (alphabets) {
        seed += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    }
    
    let otp = ""
    while (otp.length < numOfDigits) {
        otp += seed[Math.floor(Math.random() * seed.length)];
    }
    return otp;
}
