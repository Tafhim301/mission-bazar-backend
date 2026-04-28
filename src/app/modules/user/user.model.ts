import { model, Schema } from "mongoose";
import { IUser, Role } from "./user.interface";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: Number , required : true, unique : true},
    password:{ type: String, required : true, unique : true},
    Role : {type : String, enum : Object.values(Role), default : Role.USER},
    Wallet : {type : Schema.Types.ObjectId},
    Transaction : {type : Schema.Types.ObjectId},
    isDeleted : {type : Boolean , default : false},
    isActive : {type : Boolean , default : true},

    
  },
  {
    timestamps: true,
  }


);

export const User = model<IUser>("User", UserSchema)