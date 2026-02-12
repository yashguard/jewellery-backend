import AppointmentModel from "./model.js";

class Service {
    /**
     * create
     */
    static create = async (doc) => {
        return AppointmentModel.create(doc);
    };

    /**
     * get
     */
    static get = async (filter,pagination) => {
        return AppointmentModel.find(filter)
            .skip(pagination.skip)
            .limit(pagination.limit)
            .sort({createdAt: -1});
    };

    /**
     * count doc
     */
    static countDoc = async (filter) => {
        return AppointmentModel.countDocuments(filter);
    };

    /**
     * existing appointment
     */
    static existingApp = async (id) => {
        return AppointmentModel.findById(id);
    };

    /**
     * update
     */
    static update = async (id,doc) => {
        return AppointmentModel.findByIdAndUpdate(id,{$set: doc},{new: true});
    };
}

export default Service;
