module.exports = class Deal {
    constructor(id, userId, orderId, comment, status) {
        this.id = id;
        this.userId = userId;
        this.orderId = orderId;
        this.comment = comment;
        this.status = status;
    }
}