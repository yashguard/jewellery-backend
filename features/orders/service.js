import OrderModel from "./model.js";

class Service {
  /**
   * create
   */
  static create = async (id, doc) => {
    return OrderModel.findByIdAndUpdate(id, { $set: doc }, { new: true })
      .populate({
        path: "couponCode",
        select: "code description discountValue discountType savedAmount",
      })
      .populate({
        path: "items.product",
        select: "name files title purity metalColor slug",
      })
      .populate({
        path: "items.variant",
        populate: {
          path: "product",
          select: "slug",
        },
        select: "name files title purity metalColor slug",
      });
  };

  /**
   * get
   */
  static get = async (filter, pagination) => {
    return await OrderModel.find(filter)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate({
        path: "couponCode",
        select: "code description discountValue discountType savedAmount",
      })
      .populate({
        path: "items.product",
        select: "name files title purity metalColor slug sku",
      })
      .populate({ path: "user", select: "username url email customerId" })
      .populate({
        path: "items.variant",
        populate: {
          path: "product",
          select: "slug",
        },
        select: "name files title purity metalColor slug sku",
      })
      .sort({ createdAt: -1 })
      .exec();
  };

  /**
   * update status
   */
  static updateStatus = async (id, doc) => {
    return OrderModel.findByIdAndUpdate(id, { $set: doc }, { new: true });
  };

  /**
   * existing order
   */
  static existingOrder = async (id) => {
    return OrderModel.findById(id)
      .populate({
        path: "items.product",
        select: "title metalColor purity unitPrice taxValue slug",
      })
      .populate({
        path: "items.variant",
        populate: {
          path: "product",
          select: "slug",
        },
        select: "title metalColor purity unitPrice taxValue slug",
      });
  };
}

export default Service;
