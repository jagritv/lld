class Document{
    protected data: string;
    constructor (data: string){
        this.data = data;
    }

    open(): void {
        console.log(`Document opened. Data: ${this.data.substring(0, Math.min(this.data.length, 20))}...`)
    }

    save(newData: string): void {
        this.data = newData;
        console.log(`Document saved`);
    }

    getData(): string{
        return this.data;
    }
}

class ReadOnlyDocument extends Document {
    constructor(data: string){
        super(data);
    }
   
    //overriding
    save(newData: string): void{
        throw new Error("Cannot save a read-pnly document!");
    }
}

class DocumentProcessor {
    processAndSave(doc: Document, additionalInfo: string): void {
        doc.open();
        const currentData = doc.getData();
        const newData = currentData + " | Processed: " + additionalInfo;
        doc.save(newData); // Critical assumption: all Documents are savable
        console.log("Document processing complete.");
    }

    static main(): void {
        const regularDoc = new Document("Initial project proposal content.");
        const confidentialReport = new ReadOnlyDocument("Top secret government data.");

        const processor = new DocumentProcessor();

        console.log("--- Processing Regular Document ---");
        processor.processAndSave(regularDoc, "Reviewed by Alice");

        console.log("\n--- Processing ReadOnly Document ---");
        try {
            processor.processAndSave(confidentialReport, "Reviewed by Bob");
        } catch (e) {
            console.error(`Error: ${(e as Error).message}`);
        }
    }
}

DocumentProcessor.main();