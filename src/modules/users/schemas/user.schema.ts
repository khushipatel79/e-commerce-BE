import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document; //MongoDB ma jyare User store thase to e khali User nahi hoy, teni paase extra MongoDB properties pn hoy che like : _id , createdAt , updatedAt

@Schema({ timestamps: true })
export class User {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: 'user' })
    role: string;

    @Prop({ default: false })
    isBlocked: boolean;

    @Prop()
    resetPasswordToken?: string;

    @Prop()
    resetPasswordExpires?: Date;

    @Prop()
    refreshToken?: string;

    @Prop()
    refreshTokenExpires?: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);//built-in function je automatically
// user na class ne mongodb schema ma convert karva mate jethi ye mongodb ma data store kari sake 