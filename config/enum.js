export const serverEnums = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
};

export const userRoleEnum = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  SELLER: "seller",
  MANAGER: "manager",
  PRODUCTMANAGER: "productmanager",
  CONTENTEDITOR: "contenteditor",
  CUSTOMERSERVICE: "customerservice",
};

export const appointmentStatusEnum = {
  PENDING: "pending",
  CONFIRM: "confirm",
  CANCEL: "cancel",
  COMPLETED: "completed"
};

export const addressTypeEnum = {
  SHIPPING: "shipping",
  BILLING: "billing"
};

export const taxTypeEnum = {
  AMOUNT: "amount",
  PERCENTAGE: "percentage",
};

export const authProviderEnum = {
  LOCAL: "local",
  GOOGLE: "google",
};

export const paymentStatusEnum = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELED: "canceled",
  FAILED: "failed",
  REFUNDED: "refunded",
  TIMEOUT: "timeout",
};

export const discountTypeEnum = {
  AMOUNT: "amount",
  PERCENTAGE: "percentage"
};

export const discountAppliesOnEnumType = {
  SUB_TOTAL: "subTotal",
  TAX_VALUE: "taxValue"
};

export const costTypeEnum = {
  GOLD: "gold",
  DIAMOND: "diamond",
  GEMSTONE: "gemstone"
};

export const videoCallStatusEnum = {
  PENDING: "pending",
  CONFIRM: "confirm",
  CANCEL: "cancel",
  COMPLETED: "completed"
};

export const orderStatusEnum = {
  PENDING: "pending",
  PROCESSING: "processing",
  CANCEL: "cancel",
  PICKED: "picked",
  PLACED: "placed",
  SHIPPING: "shipping",
  DELIVERED: "delivered",
  RETURNED: "returned",
  REFUNDED: "refunded"
};

export const aboutUsTypeEnum = {
  TEAM: "team",
  SCORE: "score"
};

export const mediaTypeEnum = {
  FACEBOOK: "facebook",
  LINKEDIN: "linkedIn",
  TWITTER_X: "twitter-x",
  INSTAGRAM: "instagram"
};

export const returnOrderStatusEnum = {
  REQUESTED: "requested",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
};
