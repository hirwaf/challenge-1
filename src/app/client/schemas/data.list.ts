import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
//
export type DataListDocument = DataList & Document;
//
@Schema()
export class DataList {
  @Prop()
  names?: string;
  //
  @Prop()
  nid?: number;
  //
  @Prop()
  phoneNumber?: number;
  //
  @Prop()
  gender?: string;
  //
  @Prop()
  email?: string;
  //
  @Prop()
  hasError: boolean;
  //
  @Prop()
  allErrors?: string[];

  @Prop()
  processId: string;

  @Prop()
  batchId: number;

  @Prop()
  processedOn: number;

  constructor(args?: any) {
    if (args) {
      Object.assign(this, args);
    }
  }
}
//
export const DataListSchema = SchemaFactory.createForClass(DataList);
