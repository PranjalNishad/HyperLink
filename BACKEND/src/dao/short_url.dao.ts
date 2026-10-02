import urlSchema from "@/models/shorturl.model";
import { generateNanoid } from "@/utils/helper";
import { ConflictError } from "@/utils/errorHandler";

export const saveShortUrl = async (
  longUrl: string,
  shortUrl: string,
  userId: any,
) => {
  try{
    const newUrl = new urlSchema({
      full_url: longUrl,
      short_url: shortUrl,
    });
    
    if (userId) {
      newUrl.user = userId;
    }
    await newUrl.save();
  }catch(err: any){
    if(err.code === 11000){
      throw new ConflictError("Short URL already exists");
    }
    throw new Error("Error saving short URL: " + err);
  }
};

// displaying url click count

export const getShortUrl = async (shortUrl: string) => {
  return await urlSchema.findOneAndUpdate(
    { short_url: shortUrl },
    { $inc: { clicks: 1 } },
    {new: true}
  );
};

export const getCustomShortUrl = async (slug: string) => {
 const exists = await urlSchema.findOne({ short_url: slug });
 return exists;
};