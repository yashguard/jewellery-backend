import { config } from "../../../config/config.js";
import { errorResponse, successResponse } from "../../../helper/apiResponse.js";
import { deleteFile } from "../../../helper/cloudinary.js";
import Service from "../aboutUs/service.js";
import AboutUsModel from "./model.js";
import { updateFile, uploadSingleFile } from "../../cloudinary/controller.js";
import mongoose from "mongoose";
const folderName = "aboutUs";

class controller {
  /**
   * create team
   */
  static createTeam = async (req, res) => {
    try {
      const userId = req.user._id;
      const { type, name, designation, media, link, mediaType } = req.body;
      let url = await uploadSingleFile(req, folderName);

      const doc = {
        type,
        name,
        designation,
        media,
        link,
        mediaType,
        url,
        createdBy: userId,
      };
      const result = await Service.createTeam(doc);
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Team is created successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "aboutUs.create",
      });
    }
  };

  /**
   * create percentage
   */
  static createPercentage = async (req, res) => {
    try {
      const userId = req.user._id;
      const {
        type,
        description,
        scoreTitle,
        scores,
        isProgress,
        symbol,
        number,
        headTitle,
      } = req.body;
      let url = await uploadSingleFile(req, folderName);

      const doc = {
        type,
        description,
        scoreTitle,
        symbol,
        number,
        scores,
        isProgress,
        headTitle,
        url,
        createdBy: userId,
      };
      const result = await Service.createPercentage(doc);
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Score created successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "aboutUs.createScore",
      });
    }
  };

  /**
   * upload video
   */
  static uploadVideo = async (req, res) => {
    try {
      const userId = req.user._id;
      let url = await uploadSingleFile(req, folderName);
      const result = await AboutUsModel.create({ url, createdBy: userId });
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Video uploaded successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "aboutUs.uploadVideo" });
    }
  };

  /**
   * get
   */
  static get = async (req, res) => {
    try {
      const { id } = req.params;
      const { type, createdBy } = req.query;

      const filter = {};
      if (id) filter.id = id;
      if (type) filter.type = { $regex: type, $options: "i" };
      if (createdBy) filter.createdBy = new mongoose.Types.ObjectId(createdBy);

      const result = await Service.get(filter);
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "About us list retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "aboutUs.get",
      });
    }
  };

  /**
   * update
   */
  static update = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const {
        scores,
        scoreTitle,
        isProgress,
        symbol,
        number,
        media,
        link,
        mediaType,
        description,
        name,
        designation,
        headTitle,
      } = req.body;

      const findDoc = await Service.findDoc(id);
      if (!findDoc) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Document not found."),
        });
      }

      let newUrl = await updateFile(req, findDoc, folderName);
      const doc = {
        description,
        scoreTitle,
        url: newUrl,
        name,
        designation,
        media,
        link,
        mediaType,
        isProgress,
        symbol,
        number,
        scores: scores ? [...findDoc.scores, ...scores] : findDoc.scores,
        headTitle,
        media: media ? [...findDoc.media, ...media] : findDoc.media,
        createdBy: userId,
      };
      const result = await Service.update(id, doc);
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "About us is updated successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "aboutUs.update",
      });
    }
  };

  /**
   * update social scores
   */
  static updateKey = async (req, res) => {
    try {
      const { id, keyId } = req.params;
      const { scoreTitle, isProgress, symbol, number, link, mediaType } =
        req.body;

      const findDoc = await AboutUsModel.findById(id);
      if (!findDoc) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Document not found"),
        });
      }

      let updated = false;

      if (findDoc.scores) {
        const attIndex = findDoc.scores.findIndex(
          (scores) => scores._id.toString() === keyId,
        );
        if (attIndex !== -1) {
          if (scoreTitle) findDoc.scores[attIndex].scoreTitle = scoreTitle;
          if (symbol) findDoc.scores[attIndex].symbol = symbol;
          if (number) findDoc.scores[attIndex].number = number;
          if (isProgress) findDoc.scores[attIndex].isProgress = isProgress;
          updated = true;
        }
      }

      if (findDoc.media) {
        const mediaIndex = findDoc.media.findIndex(
          (media) => media._id.toString() === keyId,
        );
        if (mediaIndex !== -1) {
          if (link) findDoc.media[mediaIndex].link = link;
          if (mediaType) findDoc.media[mediaIndex].mediaType = mediaType;
          updated = true;
        }
      }

      if (!updated) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Attribute or Media not found"),
        });
      }

      await findDoc.save();
      return successResponse({
        res,
        statusCode: 200,
        data: findDoc,
        message: "Document is updated successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "aboutUs.updateKey" });
    }
  };

  /**
   * remove social scores
   */
  static remove = async (req, res) => {
    try {
      const { id, keyId } = req.params;

      const findDoc = await AboutUsModel.findById(id);
      if (!findDoc) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Document not found"),
        });
      }
      let removed = false;

      const attIndex = findDoc.scores.findIndex(
        (scores) => scores._id.toString() === keyId,
      );
      if (attIndex !== -1) {
        findDoc.scores.splice(attIndex, 1);
        removed = true;
      }

      const mediaIndex = findDoc.media.findIndex(
        (media) => media._id.toString() === keyId,
      );
      if (mediaIndex !== -1) {
        findDoc.media.splice(mediaIndex, 1);
        removed = true;
      }

      if (!removed) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Attribute or Media not found"),
        });
      }

      await findDoc.save();
      return successResponse({
        res,
        statusCode: 200,
        message: "Attribute or Media removed successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "aboutUs.remove" });
    }
  };

  /**
   * delete
   */
  static delete = async (req, res) => {
    try {
      const { id } = req.params;
      const findDoc = await Service.findDoc(id);
      if (!findDoc) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Document not found."),
        });
      }

      await deleteFile({
        filename: `${config.cloud.digitalocean.foldername}/${folderName}/${findDoc.url}`,
      });

      await Service.delete(id);
      return successResponse({
        res,
        statusCode: 200,
        message: "About us deleted successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "aboutUs.delete",
      });
    }
  };
}

export default controller;
