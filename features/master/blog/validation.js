import joi from "joi";
import {blogTypeEnum} from "../../../config/enum.js";

class validation {
  /**
   * create
   */
  static create = {
    body: joi.object().keys({
      title: joi.string().required(),
      html: joi.string(),
      description: joi.string(),
      file: joi.string(),
      video: joi.string(),
      commentCount: joi.number().default(0),
      slug: joi.string(),
      postBy: joi.string(),
      type: joi.string().valid(...Object.values(blogTypeEnum)).required()
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
      postBy: joi.string(),
      type: joi.string().valid(...Object.values(blogTypeEnum))
    })
  };
}
export default validation;
