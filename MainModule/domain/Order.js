module.exports = class Order {
    constructor(id, userId, title, description, counterOffer, isFree, isHidden, photoData, date) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.counterOffer = counterOffer;
        this.isFree = isFree;
        this.isHidden = isHidden;
        this.photoData = photoData;
        this.date = date;
    }
}