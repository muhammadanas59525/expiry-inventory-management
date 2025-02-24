class Item {
    id: number;
    name: string;
    description: string;

    constructor(id: number, name: string, description: string) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    // Method to save the item to the database
    save() {
        // Logic to save the item to the MySQL database
    }

    // Method to update the item in the database
    update() {
        // Logic to update the item in the MySQL database
    }

    // Method to delete the item from the database
    delete() {
        // Logic to delete the item from the MySQL database
    }

    // Method to fetch the item from the database
    static fetchById(id: number) {
        // Logic to fetch the item from the MySQL database
    }
}

export default Item;