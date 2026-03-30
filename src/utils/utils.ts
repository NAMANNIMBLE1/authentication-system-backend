function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function GetOtpHtml(otp: string) {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; text-align: center;">
            
            <h2 style="color: #333;">🔐 OTP Verification</h2>
            
            <p style="color: #555; font-size: 16px;">
                Use the OTP below to complete your verification process.
            </p>

            <div style="margin: 20px 0;">
                <span style="
                    display: inline-block;
                    font-size: 28px;
                    letter-spacing: 6px;
                    font-weight: bold;
                    color: #2c3e50;
                    background: #ecf0f1;
                    padding: 12px 20px;
                    border-radius: 8px;
                ">
                    ${otp}
                </span>
            </div>

            <p style="color: #888; font-size: 14px;">
                This OTP is valid for 5 minutes. Do not share it with anyone.
            </p>

            <hr style="margin: 20px 0;" />

            <p style="font-size: 12px; color: #aaa;">
                If you did not request this, you can safely ignore this email.
            </p>

        </div>
    </div>
    `;
}

export {generateOTP,GetOtpHtml}