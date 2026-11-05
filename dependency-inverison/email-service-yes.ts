interface EmailClient {
    sendEmail(to: string, subject: string, body: string): void;
}

class GmailClient implements EmailClient {
   sendEmail(to: string, subject: string, body: string): void {
     console.log(`Connecting to Gmail SMTP SERVER`);
     console.log(`Sending email via gmail to ${to}`);
     console.log(`Subject : ${subject}`);
     console.log(`Body: ${body}`);        
    }
}

class OutlookClient implements EmailClient{
    sendEmail(to: string, subject: string, body: string): void {
     console.log(`Connecting to Outlook SMTP SERVER`);
     console.log(`Sending email via gmail to ${to}`);
     console.log(`Subject : ${subject}`);
     console.log(`Body: ${body}`);        
    }
}

class EmailService{
    private readonly emailClient: EmailClient;

    // dependency is injected via the constructor

    constructor(emailClient: EmailClient){
        this.emailClient = emailClient;
    }

    sendWelcomeEmail(userEmail: string, userName: string){
        const subject = `Welcome bro ${userName}`;
        const body = ` Hi what is up`;
        this.emailClient.sendEmail(userEmail, subject, body);
    }

    sendPasswordResetEmail(userEmail: string){
        const subject = `Reset the password.`;
        const body = 'Your pasword is compromised';
        this.emailClient.sendEmail(userEmail, body, subject);
    }
}

// now using the implementatiom in our application

class Main {
    static main() : void{
        console.log(`---using Gmail---`);
        const gmailService = new EmailService(new GmailClient());
        gmailService.sendWelcomeEmail("user@example.com", "welcome");

        console.log(`---using Outlook---`);
        const outlookService = new EmailService(new OutlookClient());
        outlookService.sendWelcomeEmail("user@example.com", "welcome");
    }
}