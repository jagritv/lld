interface PaymentMethod{
   processPayment(amount: number): void;
}

class CreditCardPayment implements PaymentMethod {
    processPayment(amount: number){
        console.log(`payment processed using credit card ${amount}`);
    }
}

class PayPalPayment implements PaymentMethod {
    processPayment(amount: number){
        console.log(`payment processed using paypal ${amount}`);
    }
}

class UpiPayment implements PaymentMethod {
    processPayment(amount: number){
        console.log(`payment processed using upi ${amount}`);
    }
}

class PaymentProcessor {
    process(paymentMethod: PaymentMethod, amount: number): void {
        paymentMethod.processPayment(amount);
    }
}

class CheckoutService {
    processPayment(paymentMethod: PaymentMethod, amount: number){
        const processor = new PaymentProcessor();
        processor.process(paymentMethod, amount);
    }
}

const checkout = new CheckoutService();

console.log("-----------");
checkout.processPayment(new CreditCardPayment(), 100);
checkout.processPayment(new UpiPayment(), 10);