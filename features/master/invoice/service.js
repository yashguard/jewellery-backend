import OrderModel from "../../orders/model.js";

class Service {
  /**
   * Get
   */
  static get = async (filter) => {
    return OrderModel.find(filter)
      .populate({
        path: "couponCode",
        select: "code description discountValue discountType savedAmount",
      })
      .populate({
        path: "items.product",
        select: "name files title taxValue purity metalColor",
      })
      .populate({
        path: "items.variant",
        populate: {
          path: "product",
          select: "slug",
        },
        select: "name files title taxValue purity metalColor",
      })
      .populate({ path: "user", select: "username email phone" })
      .sort({ createdAt: -1 });
  };

  /**
   * Get invoice list
   */
  static getInvoiceList = async (filter, pagination) => {
    return OrderModel.find(filter)
      .populate({ path: "user", select: "username email phone" })
      .select(
        "status isPaid totalAmount expectedDeliveryDate invoiceId orderId createdAt updatedAt"
      )
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort({ createdAt: -1 });
  };

  /**
   * Get Count
   */
  static getCount = async (filter) => {
    return OrderModel.countDocuments(filter);
  };
}

export default Service;
