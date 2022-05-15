module.exports = class User {
    constructor(id, name, lastname, city, swapsCount, rating, photoId, phoneNumber) {
        this.id = id;
        this.name = name;
        this.lastname = lastname;
        this.city = city;
        this.swapsCount = swapsCount;
        this.rating = rating;
        this.photoId = photoId;
        this.phoneNumber = phoneNumber;
    }
}