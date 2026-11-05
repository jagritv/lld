class GmailClient {
    sendGamil(email: string, subject: string, body: string): void {
        console.log(`Connectong to Gmail SMTP server...`);
        console.log(`Sending email via Gmail to: ${email},
             Subject: ${subject}, Body: ${body}`);
    }
}

class EmailService {
   private gmailClient: GmailClient;

   constructor(gmailClient: GmailClient) {
        this.gmailClient = gmailClient;
   }

   sendWelcomeEmail(userEmail: string, userName: string){
    const subject = `Welcome ${userName}`;
    const body = `Thanks for signing up on our platform`;
    this.gmailClient.sendGamil(userEmail, subject, body);
   }

   sendPasswordResetEmail(userEmail: string) {
    const subject = `Please reset your password`;
    const body = `Your password has been compromised`;
    this.gmailClient.sendGamil(userEmail, subject, body);
   }
}

const gmailClient = new GmailClient();
const service = new EmailService(gmailClient);

service.sendWelcomeEmail("jagrit@gmail.com", "jagritxeth");
service.sendPasswordResetEmail("jagrit@gmail.com");

// now this violates the dependency invesrion principle
// if we want to chnange womthing at the high levekl like
// from changing gmail to outlook our app requires to change the 
// parts of the gmail service and imagine if there are multiple clients
// like outlook, yahoo there will be alot of if-else