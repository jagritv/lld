console.log("FILE IS EXECUTING");

interface Document {
    open(): void;
    getData(): string;
}

interface Editable extends Document {
    save (newData: string): void;
}

class EditableDoument implements Editable{
    private data: string;

    constructor(data: string) {
        this.data = data;
    }

    open(): void {
        console.log(`Editable document opened. Data. ${this.preview()}`);
    }

    save(newData: string): void {
       this.data = newData;
       console.log(`Doument saved.`);
    }

    getData(): string {
        return this.data;
    }

    private preview(): string {
        return this.data.substring(0, Math.min(this.data.length, 20)) + "...";
    }
}

class ReadOnlyDocument implements Document{
    private data: string;

    constructor(data: string){
        this.data = data;
    }

    open(): void{
        console.log(`Opening the document. Data. ${this.preview()}`);
    }


    // not applicable, since read only document
    // save(newData: string): void {
    // }

    getData(): string{
        return this.data;
    }

    private preview(): string{
        return this.data.substring(0, Math.min(this.data.length, 20)) + "....";
    }
}

// Client code

class DocumentParser {
    process(doc: Document) : void {
        doc.open();
        console.log("Document parsed...");
    }

    processAndSave(doc: Editable, additionalInfo: string) : void {
        doc.open();
        const currentData = doc.getData();
        const newData = currentData + " processed ..." + additionalInfo;
        doc.save(newData);
        console.log("editable data processed and saved");
    }
}

class Main {
    static main(): void{ 
        const editable = new EditableDoument("Draft proposal for Q3");
        const readOnly = new ReadOnlyDocument("Top secret strategy");

        const parser = new DocumentParser();

        console.log("parsing editable document");
        parser.processAndSave(editable, "Reviewed by Jagrit");

        console.log("parsing read only document");
        parser.process(readOnly);

    }
}

Main.main();