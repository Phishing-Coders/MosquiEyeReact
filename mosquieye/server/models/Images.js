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
    imageSize: String,
    scan_by: String,
    ovitrap_type: String
  },
  ovitrap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ovitrap'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }
}, { timestamps: true });

const Image = mongoose.model('Images', imageSchema);
export default Image;
