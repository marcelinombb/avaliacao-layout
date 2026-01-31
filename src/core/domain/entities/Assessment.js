export class Assessment {
    constructor({ id, title, questions = [], attachments = [], layout = {} }) {
        this.id = id;
        this.title = title;
        this.questions = questions;
        this.attachments = attachments;
        this.layout = layout;
    }
}
