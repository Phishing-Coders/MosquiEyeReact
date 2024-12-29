import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  imageId: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    data: Buffer,
    contentType: String
  },
  analysisData: {
    singleEggs: Number,
    clusteredEggs: Number,
    totalEggs: Number,
    singlesTotalArea: Number,
    singlesAvg: Number,
    clustersCount: Number,
    clustersTotalArea: Number,
    avgClusterArea: Number,
    avgEggsPerCluster: Number,
    imageSize: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }
}, { timestamps: true });

const Image = mongoose.model('Images', imageSchema);
export default Image;
