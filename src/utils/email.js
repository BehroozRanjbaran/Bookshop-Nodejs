return {
    subject: 'بازیابی رمز عبور',
    html: `
        <div style="font-family: tahoma; direction: rtl;">
            <h2>درخواست بازیابی رمز عبور</h2>
            <p>کاربر گرامی ${username}</p>
            <p>برای بازیابی رمز عبور خود روی لینک زیر کلیک کنید:</p>
            <a href="${resetLink}" style="padding: 10px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                بازیابی رمز عبور
            </a>
            <p>این لینک تا 1 ساعت معتبر است.</p>
        </div>
    `
};


// قالب ایمیل تایید سفارش
const orderConfirmationTemplate = (orderDetails) => {
return {
    subject: 'تایید سفارش',
    html: `
        <div style="font-family: tahoma; direction: rtl;">
            <h2>سفارش شما با موفقیت ثبت شد</h2>
            <p>شماره سفارش: ${orderDetails.orderNumber}</p>
            <p>مبلغ کل: ${orderDetails.totalAmount} تومان</p>
            <p>وضعیت پرداخت: ${orderDetails.paymentStatus}</p>
            <h3>اقلام سفارش:</h3>
            <ul>
                ${orderDetails.items.map(item => `
                    <li>${item.title} - تعداد: ${item.quantity} - قیمت: ${item.price} تومان</li>
                `).join('')}
            </ul>
        </div>
    `
};
};

// تابع ارسال ایمیل
const sendEmail = async (to, template) => {
try {
    const mailOptions = {
        from: config.email.user,
        to: to,
        subject: template.subject,
        html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('ایمیل با موفقیت ارسال شد:', info.messageId);
    return true;
} catch (error) {
    console.error('خطا در ارسال ایمیل:', error);
    throw new Error('خطا در ارسال ایمیل');
}
};

module.exports = {
sendEmail,
welcomeEmailTemplate,
resetPasswordTemplate,
orderConfirmationTemplate
};
