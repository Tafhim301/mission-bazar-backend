import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { Carousel } from "./carousel.model";
import { ICarouselDocument } from "./carousel.interface";
import { deleteFromCloudinary } from "../../config/cloudinary";

const createCarousel = async (
  adminId: string,
  payload: Partial<ICarouselDocument>,
  imageUrl: string
): Promise<ICarouselDocument> => {
  return Carousel.create({ ...payload, image: imageUrl, createdBy: adminId });
};

const getActiveCarousels = async () => {
  return Carousel.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
};

const getAllCarousels = async () => {
  return Carousel.find().populate("createdBy", "name email").sort({ order: 1 });
};

const updateCarousel = async (
  id: string,
  payload: Partial<ICarouselDocument>,
  imageUrl?: string
): Promise<ICarouselDocument> => {
  const carousel = await Carousel.findById(id);
  if (!carousel) throw new AppError(StatusCodes.NOT_FOUND, "Carousel item not found");

  if (imageUrl && carousel.image) {
    await deleteFromCloudinary(carousel.image).catch(console.error);
  }

  const updated = await Carousel.findByIdAndUpdate(
    id,
    { ...payload, ...(imageUrl ? { image: imageUrl } : {}) },
    { new: true, runValidators: true }
  );
  return updated!;
};

const deleteCarousel = async (id: string): Promise<void> => {
  const carousel = await Carousel.findByIdAndDelete(id);
  if (!carousel) throw new AppError(StatusCodes.NOT_FOUND, "Carousel item not found");
  if (carousel.image) await deleteFromCloudinary(carousel.image).catch(console.error);
};

export const CarouselService = {
  createCarousel, getActiveCarousels, getAllCarousels, updateCarousel, deleteCarousel,
};
