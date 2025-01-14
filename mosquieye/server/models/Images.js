import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  imageId: {
    type: String,
    required: true,
    unique: true // Ensure imageId is unique
  },
  ovitrapId: String,
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
    scan_by: String, // Change to String to store Clerk user ID directly
    ovitrap_type: String,
    breteauIndex: Number,
    ovitrapIndex: Number,
    riskLevel: String
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
