import joi from "joi";

class validation {
  /**
   * create
   */
  static create = {
    body: joi.object().keys({
      title: joi.string().required(),
      html: joi.string().required(),
      description: joi.string(),
      file: joi.string(),
      video: joi.string(),
      commentCount: joi.number().default(0),
      slug: joi.string(),
    })
  };

  /**
   * update
   */
  static update = {
    body: joi.object().keys({
      slug: joi.string(),
      title: joi.string(),
      html: joi.string(),
      description: joi.string(),
      file: joi.string(),
      video: joi.string(),
    })
  };
}
export default validation;
