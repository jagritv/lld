class PaymentProcessor{
    processCreditCardPayment(amount: number): void{
        console.log(`Process credit card payment of ${amount}`);
    }

    // now adding a paypal payment
    processPaypalPayment(amount: number): void{
        console.log(`Process paypal payment of ${amount}`);
    }
}

class CheckoutService{
    processPayment(): void {
        const processor = new PaymentProcessor();
        processor.processCreditCardPayment(100.00); 
    }
}

// now since we added paypal we need to update the checkout sercvice as well


class CheckoutService{
    processPayment(paymentType: string): void {
        const processor = new PaymentProcessor();

        if (paymentType == "CreditCard") {
            processor.processCreditCardPayment(100.00);
        }
        else if (paymentType == "PayPal") {
            processor.processPaypalPayment(100.00);
        }
    }
}