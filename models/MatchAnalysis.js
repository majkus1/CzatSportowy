import mongoose from 'mongoose';

const MatchAnalysisSchema = new mongoose.Schema({
  fixtureId: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  analysis: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MatchAnalysisSchema.index({ fixtureId: 1, language: 1 }, { unique: true });

export default mongoose.models.MatchAnalysis || mongoose.model('MatchAnalysis', MatchAnalysisSchema);
