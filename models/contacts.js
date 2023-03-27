const fs = require('fs').promises;
// const nanoid = require('nanoid');
const path = require('path');

const contactsPath = path.join(__dirname, 'contacts.json');

async function listContacts() {
    try {
        const list = await fs.readFile(contactsPath, "utf8");
        const listJson = JSON.parse(list);
        return listJson;
    } catch (err) {
        console.error(err.message);
    }
}

async function getContactById(contactId) {
    try {
        const list = await listContacts();
        const contact = String(contactId);
        const contactFound = list.find((contactFound) => (contactFound.id === contact));
        console.log("Contact found:");
        return contactFound;
    } catch (err) {
        console.error(err.message);
    }
}

async function removeContact(contactId) {
    try {
        const list = await listContacts();
        const contact = String(contactId);
        const index = list.findIndex((contactFound) => (contactFound.id === contact));
        if (index === -1) {
            console.log("Contact not created");
            return null;
        }
        list.splice(index, 1);
        await fs.writeFile(contactsPath, JSON.stringify(list, null, 2));
        return `Contact with id=${contact} has been deleted *.*`;
        } catch (err) {
        console.error(err.message);
    }
}

async function addContact(name, email, phone) {
    try {
        const list = await listContacts();
        const contact = { id: String(Date.now()), name, email, phone };
        list.push(contact);
        await fs.writeFile(contactsPath, JSON.stringify(list));
        console.log("Contact added:");
        return contact;
    } catch (err) {
        console.error(err.message);
    }
}

async function updateContact(contactId, name, email, phone) {
    try {
        const list = await listContacts();
        const contact = String(contactId);
        const index = list.findIndex((contactFound) => (contactFound.id === contact));
        if (index === -1) {
            console.log("Contact not created");
            return null;
        }
        list[index] = { id: contactId, name, email, phone };
        await fs.writeFileSync(contactsPath, JSON.stringify(list[index]));
        return list[index];
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updateContact
}
